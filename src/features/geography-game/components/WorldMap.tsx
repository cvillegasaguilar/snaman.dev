import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent,
} from "react";
import worldMap from "@svg-maps/world";
import {
  COUNTRY_BY_CODE,
  SMALL_COUNTRY_CODES,
  type CountryCode,
} from "../data/countries";
import type { CountryStatus, WrongAttempt } from "../types";
import styles from "../GeographyGame.module.css";

type WorldMapProps = {
  statuses: Record<CountryCode, CountryStatus>;
  wrongAttempt: WrongAttempt | null;
  onSelectCountry: (code: CountryCode) => void;
};

type MapLocation = {
  id: string;
  name: string;
  path: string;
};

type NormalizedLocation = MapLocation & {
  code: string;
};

type GameMapLocation = MapLocation & {
  code: CountryCode;
};

type Transform = {
  x: number;
  y: number;
  zoom: number;
};

type PointerPoint = {
  x: number;
  y: number;
};

type PinchGesture = {
  startDistance: number;
  startZoom: number;
  contentX: number;
  contentY: number;
};

type Gesture = {
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
  dragging: boolean;
  pinch: PinchGesture | null;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 16;
const DRAG_THRESHOLD_PX = 6;
const KEYBOARD_PAN_PX = 48;
const KEYBOARD_ZOOM_FACTOR = 1.2;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;
const MOBILE_INITIAL_ZOOM = 1.15;
const MOBILE_LAYOUT_MAX_WIDTH_PX = 760;

const TYPED_WORLD_MAP = worldMap as unknown as {
  viewBox: string;
  locations: MapLocation[];
};

const [, , MAP_WIDTH, MAP_HEIGHT] = TYPED_WORLD_MAP.viewBox
  .split(/\s+/)
  .map(Number);

const MAP_LOCATIONS: NormalizedLocation[] = TYPED_WORLD_MAP.locations.map(
  (location) => ({
    ...location,
    code: location.id.toUpperCase(),
  }),
);

function isCountryCode(code: string): code is CountryCode {
  return COUNTRY_BY_CODE.has(code as CountryCode);
}

function isGameLocation(
  location: NormalizedLocation,
): location is GameMapLocation {
  return isCountryCode(location.code);
}

const CONTEXT_LOCATIONS = MAP_LOCATIONS.filter(
  (location) => !isGameLocation(location),
);
const GAME_LOCATIONS = MAP_LOCATIONS.filter(isGameLocation);
const REGULAR_GAME_LOCATIONS = GAME_LOCATIONS.filter(
  (location) => !SMALL_COUNTRY_CODES.has(location.code),
);
const SMALL_GAME_LOCATIONS = GAME_LOCATIONS.filter((location) =>
  SMALL_COUNTRY_CODES.has(location.code),
);

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function clampTransform(
  transform: Transform,
): Transform {
  const zoom = clamp(transform.zoom, MIN_ZOOM, MAX_ZOOM);
  const minimumX = MAP_WIDTH * (1 - zoom);
  const minimumY = MAP_HEIGHT * (1 - zoom);

  return {
    zoom,
    x: clamp(transform.x, minimumX, 0),
    y: clamp(transform.y, minimumY, 0),
  };
}

function getSvgPoint(
  map: SVGSVGElement,
  clientX: number,
  clientY: number,
) {
  const screenMatrix = map.getScreenCTM();
  if (!screenMatrix) return null;

  return new DOMPoint(clientX, clientY).matrixTransform(
    screenMatrix.inverse(),
  );
}

function getSvgDelta(map: SVGSVGElement, deltaX: number, deltaY: number) {
  const screenMatrix = map.getScreenCTM();
  if (!screenMatrix) return null;

  const inverse = screenMatrix.inverse();
  const origin = new DOMPoint(0, 0).matrixTransform(inverse);
  const destination = new DOMPoint(deltaX, deltaY).matrixTransform(inverse);

  return {
    x: destination.x - origin.x,
    y: destination.y - origin.y,
  };
}

function getDistance(first: PointerPoint, second: PointerPoint) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function getMidpoint(first: PointerPoint, second: PointerPoint) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

type CountryShapeProps = {
  code: CountryCode;
  name: string;
  path: string;
  status: CountryStatus;
  wrongSequence: number | null;
  hasLargeHitArea: boolean;
  onSelectCountry: (code: CountryCode) => void;
};

const CountryShape = memo(function CountryShape({
  code,
  name,
  path,
  status,
  wrongSequence,
  hasLargeHitArea,
  onSelectCountry,
}: CountryShapeProps) {
  const isComplete = status !== "pending";
  const statusLabel =
    status === "correct"
      ? "acertado"
      : status === "skipped"
        ? "saltado"
        : "pendiente";
  const shapeClassName = [
    styles.country,
    styles[`country${status[0].toUpperCase()}${status.slice(1)}`],
  ]
    .filter(Boolean)
    .join(" ");

  const activate = () => onSelectCountry(code);

  return (
    <g
      className={styles.countryGroup}
      role="button"
      tabIndex={isComplete ? -1 : 0}
      aria-disabled={isComplete}
      aria-label={`${name}, ${statusLabel}`}
      onClick={activate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      }}
    >
      <path
        className={shapeClassName}
        d={path}
        vectorEffect="non-scaling-stroke"
      />
      {wrongSequence !== null ? (
        <path
          key={wrongSequence}
          className={styles.wrongOverlay}
          d={path}
          vectorEffect="non-scaling-stroke"
          aria-hidden="true"
        />
      ) : null}
      {hasLargeHitArea ? (
        <path
          className={styles.smallCountryHitArea}
          d={path}
          vectorEffect="non-scaling-stroke"
          aria-hidden="true"
        />
      ) : null}
    </g>
  );
});

function ContextShape({ location }: { location: MapLocation }) {
  return (
    <path
      className={styles.contextCountry}
      d={location.path}
      vectorEffect="non-scaling-stroke"
      aria-hidden="true"
    />
  );
}

function WorldMap({
  statuses,
  wrongAttempt,
  onSelectCountry,
}: WorldMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<SVGGElement>(null);
  const transformRef = useRef<Transform>({ x: 0, y: 0, zoom: 1 });
  const pointersRef = useRef(new Map<number, PointerPoint>());
  const gestureRef = useRef<Gesture>({
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    dragging: false,
    pinch: null,
  });
  const frameRef = useRef<number | null>(null);
  const clickResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickRef = useRef(false);
  const pointerDownCountryRef = useRef<SVGGElement | null>(null);

  const renderTransform = useCallback(() => {
    frameRef.current = null;
    const content = contentRef.current;
    if (!content) return;

    const { x, y, zoom } = transformRef.current;
    content.setAttribute(
      "transform",
      `translate(${x} ${y}) scale(${zoom})`,
    );
  }, []);

  const scheduleTransform = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(renderTransform);
  }, [renderTransform]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth > MOBILE_LAYOUT_MAX_WIDTH_PX) {
      return;
    }

    transformRef.current = clampTransform({
      zoom: MOBILE_INITIAL_ZOOM,
      x: (MAP_WIDTH * (1 - MOBILE_INITIAL_ZOOM)) / 2,
      y: (MAP_HEIGHT * (1 - MOBILE_INITIAL_ZOOM)) / 2,
    });
    renderTransform();
  }, [renderTransform]);

  const updateTransform = useCallback(
    (nextTransform: Transform) => {
      transformRef.current = clampTransform(nextTransform);
      scheduleTransform();
    },
    [scheduleTransform],
  );

  const zoomAtPoint = useCallback(
    (
      requestedZoom: number,
      pointX: number,
      pointY: number,
    ) => {
      const current = transformRef.current;
      const nextZoom = clamp(requestedZoom, MIN_ZOOM, MAX_ZOOM);
      const zoomRatio = nextZoom / current.zoom;

      updateTransform(
        {
          zoom: nextZoom,
          x: pointX - (pointX - current.x) * zoomRatio,
          y: pointY - (pointY - current.y) * zoomRatio,
        },
      );
    },
    [updateTransform],
  );

  const setDraggingCursor = useCallback((dragging: boolean) => {
    viewportRef.current?.classList.toggle(styles.mapViewportDragging, dragging);
  }, []);

  const beginPinch = useCallback(
    (viewport: HTMLDivElement) => {
      const points = Array.from(pointersRef.current.values());
      if (points.length < 2) return;

      const map = mapRef.current;
      if (!map) return;

      const midpoint = getMidpoint(points[0], points[1]);
      const localMidpoint = getSvgPoint(map, midpoint.x, midpoint.y);
      if (!localMidpoint) return;
      const current = transformRef.current;

      gestureRef.current.dragging = true;
      gestureRef.current.pinch = {
        startDistance: Math.max(getDistance(points[0], points[1]), 1),
        startZoom: current.zoom,
        contentX: (localMidpoint.x - current.x) / current.zoom,
        contentY: (localMidpoint.y - current.y) / current.zoom,
      };
      suppressClickRef.current = true;
      setDraggingCursor(true);
      pointerDownCountryRef.current?.blur();

      for (const pointerId of pointersRef.current.keys()) {
        if (!viewport.hasPointerCapture(pointerId)) {
          viewport.setPointerCapture(pointerId);
        }
      }
    },
    [setDraggingCursor],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const map = mapRef.current;
      if (!map) return;

      const deltaMultiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? viewport.clientHeight
            : 1;
      const normalizedDelta = event.deltaY * deltaMultiplier;
      const point = getSvgPoint(map, event.clientX, event.clientY);
      if (!point) return;
      const requestedZoom =
        transformRef.current.zoom *
        Math.exp(-normalizedDelta * WHEEL_ZOOM_SENSITIVITY);

      zoomAtPoint(
        requestedZoom,
        point.x,
        point.y,
      );
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [zoomAtPoint]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      if (clickResetTimerRef.current !== null) {
        clearTimeout(clickResetTimerRef.current);
      }
    },
    [],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      if (clickResetTimerRef.current !== null) {
        clearTimeout(clickResetTimerRef.current);
        clickResetTimerRef.current = null;
      }

      suppressClickRef.current = false;
      if (pointersRef.current.size === 0) {
        const pointerTarget = event.target as Element;
        pointerDownCountryRef.current = pointerTarget.closest(
          `g.${styles.countryGroup}`,
        ) as SVGGElement | null;
      }
      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      if (pointersRef.current.size === 1) {
        const current = transformRef.current;
        gestureRef.current = {
          startX: event.clientX,
          startY: event.clientY,
          startPanX: current.x,
          startPanY: current.y,
          dragging: false,
          pinch: null,
        };
        return;
      }

      beginPinch(event.currentTarget);
    },
    [beginPinch],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!pointersRef.current.has(event.pointerId)) return;

      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      const viewport = event.currentTarget;
      const gesture = gestureRef.current;

      if (pointersRef.current.size >= 2) {
        if (!gesture.pinch) {
          beginPinch(viewport);
          return;
        }

        event.preventDefault();
        const points = Array.from(pointersRef.current.values());
        const map = mapRef.current;
        if (!map) return;
        const midpoint = getMidpoint(points[0], points[1]);
        const localMidpoint = getSvgPoint(map, midpoint.x, midpoint.y);
        if (!localMidpoint) return;
        const nextZoom =
          gesture.pinch.startZoom *
          (getDistance(points[0], points[1]) /
            gesture.pinch.startDistance);
        const boundedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

        updateTransform(
          {
            zoom: boundedZoom,
            x: localMidpoint.x - gesture.pinch.contentX * boundedZoom,
            y: localMidpoint.y - gesture.pinch.contentY * boundedZoom,
          },
        );
        return;
      }

      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;

      if (
        !gesture.dragging &&
        Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX
      ) {
        return;
      }

      if (!gesture.dragging) {
        gesture.dragging = true;
        suppressClickRef.current = true;
        setDraggingCursor(true);
        pointerDownCountryRef.current?.blur();
        viewport.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
      const map = mapRef.current;
      if (!map) return;
      const svgDelta = getSvgDelta(map, deltaX, deltaY);
      if (!svgDelta) return;

      updateTransform(
        {
          ...transformRef.current,
          x: gesture.startPanX + svgDelta.x,
          y: gesture.startPanY + svgDelta.y,
        },
      );
    },
    [beginPinch, setDraggingCursor, updateTransform],
  );

  const finishPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const viewport = event.currentTarget;
      const wasDragging = gestureRef.current.dragging;

      pointersRef.current.delete(event.pointerId);
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }

      if (pointersRef.current.size === 1) {
        const remainingPoint = Array.from(pointersRef.current.values())[0];
        const current = transformRef.current;

        gestureRef.current = {
          startX: remainingPoint.x,
          startY: remainingPoint.y,
          startPanX: current.x,
          startPanY: current.y,
          dragging: true,
          pinch: null,
        };
        return;
      }

      if (pointersRef.current.size === 0) {
        gestureRef.current.dragging = false;
        gestureRef.current.pinch = null;
        setDraggingCursor(false);

        if (wasDragging) {
          pointerDownCountryRef.current?.blur();
          clickResetTimerRef.current = setTimeout(() => {
            suppressClickRef.current = false;
            clickResetTimerRef.current = null;
          }, 0);
        }

        pointerDownCountryRef.current = null;
      }
    },
    [setDraggingCursor],
  );

  const handleClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!suppressClickRef.current) return;

      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;

      if (clickResetTimerRef.current !== null) {
        clearTimeout(clickResetTimerRef.current);
        clickResetTimerRef.current = null;
      }
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const current = transformRef.current;
      const map = mapRef.current;
      if (!map) return;
      let handled = true;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown": {
          const screenDeltaX =
            event.key === "ArrowLeft"
              ? KEYBOARD_PAN_PX
              : event.key === "ArrowRight"
                ? -KEYBOARD_PAN_PX
                : 0;
          const screenDeltaY =
            event.key === "ArrowUp"
              ? KEYBOARD_PAN_PX
              : event.key === "ArrowDown"
                ? -KEYBOARD_PAN_PX
                : 0;
          const svgDelta = getSvgDelta(map, screenDeltaX, screenDeltaY);
          if (svgDelta) {
            updateTransform({
              ...current,
              x: current.x + svgDelta.x,
              y: current.y + svgDelta.y,
            });
          }
          break;
        }
        case "+":
        case "=": {
          const rect = map.getBoundingClientRect();
          const center = getSvgPoint(
            map,
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
          );
          if (center) {
            zoomAtPoint(
              current.zoom * KEYBOARD_ZOOM_FACTOR,
              center.x,
              center.y,
            );
          }
          break;
        }
        case "-":
        case "_": {
          const rect = map.getBoundingClientRect();
          const center = getSvgPoint(
            map,
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
          );
          if (center) {
            zoomAtPoint(
              current.zoom / KEYBOARD_ZOOM_FACTOR,
              center.x,
              center.y,
            );
          }
          break;
        }
        default:
          handled = false;
      }

      if (handled) event.preventDefault();
    },
    [updateTransform, zoomAtPoint],
  );

  return (
    <section className={styles.mapSection} aria-labelledby="map-heading">
      <div className={styles.mapToolbar}>
        <h2 id="map-heading" className={styles.mapHeading}>
          Mapa mundial
        </h2>
        <p className={styles.mapHint}>
          Arrastra para mover · Usa la rueda para hacer zoom
        </p>
      </div>

      <div
        ref={viewportRef}
        className={styles.mapViewport}
        tabIndex={0}
        aria-label="Mapa interactivo. Arrastra para mover, usa la rueda o las teclas más y menos para hacer zoom, y las flechas para desplazarte."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onClickCapture={handleClickCapture}
        onKeyDown={handleKeyDown}
      >
        <svg
          ref={mapRef}
          className={styles.worldMap}
          viewBox={TYPED_WORLD_MAP.viewBox}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Países del mundo"
        >
          <defs>
            <pattern
              id="skipped-pattern"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="8" height="8" className={styles.skippedPatternBase} />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                className={styles.skippedPatternLine}
              />
            </pattern>
          </defs>

          <g ref={contentRef}>
            {CONTEXT_LOCATIONS.map((location) => (
              <ContextShape key={location.id} location={location} />
            ))}

            {REGULAR_GAME_LOCATIONS.map((location) => {
              const country = COUNTRY_BY_CODE.get(location.code);
              if (!country) return null;

              return (
                <CountryShape
                  key={location.code}
                  code={location.code}
                  name={country.name}
                  path={location.path}
                  status={statuses[location.code]}
                  wrongSequence={
                    wrongAttempt && wrongAttempt.code === location.code
                      ? wrongAttempt.sequence
                      : null
                  }
                  hasLargeHitArea={false}
                  onSelectCountry={onSelectCountry}
                />
              );
            })}

            {SMALL_GAME_LOCATIONS.map((location) => {
              const country = COUNTRY_BY_CODE.get(location.code);
              if (!country) return null;

              return (
                <CountryShape
                  key={location.code}
                  code={location.code}
                  name={country.name}
                  path={location.path}
                  status={statuses[location.code]}
                  wrongSequence={
                    wrongAttempt && wrongAttempt.code === location.code
                      ? wrongAttempt.sequence
                      : null
                  }
                  hasLargeHitArea
                  onSelectCountry={onSelectCountry}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}

export default memo(WorldMap);
