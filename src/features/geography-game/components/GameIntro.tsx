import styles from "../GeographyGame.module.css";

type GameIntroProps = {
  totalCountries: number;
  onStart: () => void;
};

export default function GameIntro({
  totalCountries,
  onStart,
}: GameIntroProps) {
  return (
    <section className={styles.centeredPanel} aria-labelledby="game-title">
      <p className={styles.eyebrow}>Mini juego de geografía</p>
      <h1 id="game-title" className={styles.displayTitle}>
        Encuentra el país
      </h1>
      <p className={styles.introText}>
        Aparecerá el nombre de un país. Encuéntralo en el mapa y selecciónalo.
        Puedes intentarlo cuantas veces necesites o saltarlo si no lo ubicas.
      </p>

      <dl className={styles.introFact}>
        <div>
          <dt>Países en la partida</dt>
          <dd>{totalCountries}</dd>
        </div>
      </dl>

      <button type="button" className={styles.primaryButton} onClick={onStart}>
        Comenzar
      </button>

      <p className={styles.datasetNote}>
        Incluye 193 Estados miembros de la ONU, Palestina y Ciudad del Vaticano.
      </p>
    </section>
  );
}

