import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COUNTRIES,
  COUNTRY_BY_CODE,
  COUNTRY_CODES,
  type CountryCode,
} from "../data/countries";
import type {
  CountryStatus,
  GamePhase,
  WrongAttempt,
} from "../types";

const FEEDBACK_DELAY_MS = 180;

function createInitialStatuses(): Record<CountryCode, CountryStatus> {
  return Object.fromEntries(
    COUNTRY_CODES.map((code) => [code, "pending"]),
  ) as Record<CountryCode, CountryStatus>;
}

function shuffleCountries(): CountryCode[] {
  const shuffled = [...COUNTRY_CODES];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function useGeographyGame() {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [order, setOrder] = useState<CountryCode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statuses, setStatuses] = useState(createInitialStatuses);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [skips, setSkips] = useState(0);
  const [locked, setLocked] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState<WrongAttempt | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTransition = useCallback(() => {
    if (transitionTimer.current !== null) {
      clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  }, []);

  useEffect(() => clearTransition, [clearTransition]);

  const resetGame = useCallback(() => {
    clearTransition();
    setOrder(shuffleCountries());
    setCurrentIndex(0);
    setStatuses(createInitialStatuses());
    setCorrect(0);
    setErrors(0);
    setSkips(0);
    setWrongAttempt(null);
    setLocked(false);
    setPhase("playing");
  }, [clearTransition]);

  const goToIntro = useCallback(() => {
    clearTransition();
    setPhase("idle");
    setOrder([]);
    setCurrentIndex(0);
    setStatuses(createInitialStatuses());
    setCorrect(0);
    setErrors(0);
    setSkips(0);
    setWrongAttempt(null);
    setLocked(false);
  }, [clearTransition]);

  const completeCurrent = useCallback(
    (status: Extract<CountryStatus, "correct" | "skipped">) => {
      if (phase !== "playing" || locked) return;

      const currentCode = order[currentIndex];
      if (!currentCode) return;

      setLocked(true);
      setWrongAttempt(null);
      setStatuses((current) => ({ ...current, [currentCode]: status }));

      if (status === "correct") {
        setCorrect((value) => value + 1);
      } else {
        setSkips((value) => value + 1);
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      transitionTimer.current = setTimeout(
        () => {
          transitionTimer.current = null;

          if (currentIndex + 1 >= COUNTRIES.length) {
            setPhase("finished");
            setLocked(false);
            return;
          }

          setCurrentIndex((value) => value + 1);
          setLocked(false);
        },
        reduceMotion ? 0 : FEEDBACK_DELAY_MS,
      );
    },
    [currentIndex, locked, order, phase],
  );

  const selectCountry = useCallback(
    (selectedCode: CountryCode) => {
      if (phase !== "playing" || locked) return;
      if (statuses[selectedCode] !== "pending") return;

      const currentCode = order[currentIndex];
      if (!currentCode) return;

      if (selectedCode === currentCode) {
        completeCurrent("correct");
        return;
      }

      setErrors((value) => value + 1);
      setWrongAttempt((current) => ({
        code: selectedCode,
        sequence: (current?.sequence ?? 0) + 1,
      }));
    },
    [completeCurrent, currentIndex, locked, order, phase, statuses],
  );

  const skipCountry = useCallback(() => {
    completeCurrent("skipped");
  }, [completeCurrent]);

  const currentCountry = useMemo(() => {
    const currentCode = order[currentIndex];
    return currentCode ? COUNTRY_BY_CODE.get(currentCode) ?? null : null;
  }, [currentIndex, order]);

  return {
    phase,
    totalCountries: COUNTRIES.length,
    currentCountry,
    currentPosition: phase === "playing" ? currentIndex + 1 : currentIndex,
    statuses,
    correct,
    errors,
    skips,
    completed: correct + skips,
    locked,
    wrongAttempt,
    startGame: resetGame,
    restartGame: resetGame,
    goToIntro,
    selectCountry,
    skipCountry,
  };
}

