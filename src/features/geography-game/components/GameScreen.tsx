import { lazy, Suspense } from "react";
import type { Country, CountryCode } from "../data/countries";
import type { CountryStatus, WrongAttempt } from "../types";
import styles from "../GeographyGame.module.css";
import MapLegend from "./MapLegend";
import StatsPanel from "./StatsPanel";

const WorldMap = lazy(() => import("./WorldMap"));

type GameScreenProps = {
  currentCountry: Country;
  currentPosition: number;
  totalCountries: number;
  statuses: Record<CountryCode, CountryStatus>;
  correct: number;
  errors: number;
  skips: number;
  locked: boolean;
  wrongAttempt: WrongAttempt | null;
  onSelectCountry: (code: CountryCode) => void;
  onSkip: () => void;
};

export default function GameScreen({
  currentCountry,
  currentPosition,
  totalCountries,
  statuses,
  correct,
  errors,
  skips,
  locked,
  wrongAttempt,
  onSelectCountry,
  onSkip,
}: GameScreenProps) {
  return (
    <div className={styles.gameLayout}>
      <header className={styles.gameTopbar}>
        <div className={styles.questionHeader}>
          <p className={styles.eyebrow}>Encuentra este país</p>
          <h1 className={styles.countryQuestion}>{currentCountry.name}</h1>
          <p
            className={styles.feedback}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {wrongAttempt
              ? "Ese país no es. Sigue intentando."
              : "Selecciona una región del mapa."}
          </p>
        </div>

        <StatsPanel
          current={currentPosition}
          total={totalCountries}
          correct={correct}
          errors={errors}
          skips={skips}
        />

        <button
          type="button"
          className={styles.secondaryButton}
          disabled={locked}
          onClick={onSkip}
        >
          Saltar país
        </button>
      </header>

      <Suspense
        fallback={
          <div className={styles.mapLoading} role="status" aria-live="polite">
            Preparando mapa…
          </div>
        }
      >
        <WorldMap
          statuses={statuses}
          wrongAttempt={wrongAttempt}
          onSelectCountry={onSelectCountry}
        />
      </Suspense>

      <div className={styles.mapFooter}>
        <MapLegend />
      </div>
    </div>
  );
}
