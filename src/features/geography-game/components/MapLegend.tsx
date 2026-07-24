import styles from "../GeographyGame.module.css";

const LEGEND_ITEMS = [
  { label: "Pendiente", className: styles.legendPending },
  { label: "Acertado", className: styles.legendCorrect },
  { label: "Saltado", className: styles.legendSkipped },
  { label: "Intento incorrecto", className: styles.legendWrong },
] as const;

export default function MapLegend() {
  return (
    <ul className={styles.legend} aria-label="Leyenda de estados del mapa">
      {LEGEND_ITEMS.map((item) => (
        <li key={item.label}>
          <span
            className={`${styles.legendSwatch} ${item.className}`}
            aria-hidden="true"
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

