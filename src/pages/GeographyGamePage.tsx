import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import GameIntro from "../features/geography-game/components/GameIntro";
import GameScreen from "../features/geography-game/components/GameScreen";
import ResultsScreen from "../features/geography-game/components/ResultsScreen";
import { useGeographyGame } from "../features/geography-game/hooks/useGeographyGame";
import styles from "../features/geography-game/GeographyGame.module.css";

export default function GeographyGamePage() {
  const game = useGeographyGame();
  const isPlaying = game.phase === "playing";

  return (
    <div
      className={`${styles.page} ${isPlaying ? styles.pagePlaying : ""}`}
    >
      <a className={styles.skipLink} href="#geography-game">
        Saltar al juego
      </a>
      <Navbar />

      <main
        id="geography-game"
        className={`${styles.main} ${isPlaying ? styles.mainPlaying : ""}`}
        tabIndex={-1}
      >
        <Link to="/" className={styles.backLink}>
          ← Volver al inicio
        </Link>

        {game.phase === "idle" ? (
          <GameIntro
            totalCountries={game.totalCountries}
            onStart={game.startGame}
          />
        ) : null}

        {game.phase === "playing" && game.currentCountry ? (
          <GameScreen
            currentCountry={game.currentCountry}
            currentPosition={game.currentPosition}
            totalCountries={game.totalCountries}
            statuses={game.statuses}
            correct={game.correct}
            errors={game.errors}
            skips={game.skips}
            locked={game.locked}
            wrongAttempt={game.wrongAttempt}
            onSelectCountry={game.selectCountry}
            onSkip={game.skipCountry}
          />
        ) : null}

        {game.phase === "finished" ? (
          <ResultsScreen
            totalCountries={game.totalCountries}
            correct={game.correct}
            errors={game.errors}
            skips={game.skips}
            onRestart={game.restartGame}
            onGoToIntro={game.goToIntro}
          />
        ) : null}
      </main>
    </div>
  );
}
