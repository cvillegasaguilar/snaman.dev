import styles from "../GeographyGame.module.css";

type ResultsScreenProps = {
  totalCountries: number;
  correct: number;
  errors: number;
  skips: number;
  onRestart: () => void;
  onGoToIntro: () => void;
};

const PERCENT_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "percent",
  maximumFractionDigits: 0,
});

export default function ResultsScreen({
  totalCountries,
  correct,
  errors,
  skips,
  onRestart,
  onGoToIntro,
}: ResultsScreenProps) {
  const accuracy = PERCENT_FORMATTER.format(correct / totalCountries);

  return (
    <section className={styles.centeredPanel} aria-labelledby="results-title">
      <p className={styles.eyebrow}>Partida terminada</p>
      <h1 id="results-title" className={styles.displayTitle}>
        Resultados
      </h1>
      <p className={styles.introText}>
        Completaste los {totalCountries} países del mapa.
      </p>

      <dl className={styles.resultsGrid}>
        <div>
          <dt>Países jugados</dt>
          <dd>{totalCountries}</dd>
        </div>
        <div>
          <dt>Aciertos</dt>
          <dd>{correct}</dd>
        </div>
        <div>
          <dt>Errores</dt>
          <dd>{errors}</dd>
        </div>
        <div>
          <dt>Saltados</dt>
          <dd>{skips}</dd>
        </div>
        <div className={styles.accuracyResult}>
          <dt>Países acertados</dt>
          <dd>{accuracy}</dd>
        </div>
      </dl>

      <div className={styles.resultActions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onRestart}
        >
          Jugar de nuevo
        </button>
        <button
          type="button"
          className={styles.tertiaryButton}
          onClick={onGoToIntro}
        >
          Volver a la introducción
        </button>
      </div>
    </section>
  );
}

