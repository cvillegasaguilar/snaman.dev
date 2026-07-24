import { memo } from "react";
import styles from "../GeographyGame.module.css";

type StatsPanelProps = {
  current: number;
  total: number;
  correct: number;
  errors: number;
  skips: number;
};

function StatsPanel({
  current,
  total,
  correct,
  errors,
  skips,
}: StatsPanelProps) {
  return (
    <dl className={styles.stats} aria-label="Estadísticas de la partida">
      <div className={styles.progressStat}>
        <dt>Progreso</dt>
        <dd>
          País {current} de {total}
        </dd>
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
    </dl>
  );
}

export default memo(StatsPanel);

