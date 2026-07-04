import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./MapPage.module.css";

// Mapa personalizado en Google My Maps.
// Debe estar compartido como "Cualquier persona con el enlace" para que
// el iframe cargue en el sitio.
const MY_MAPS_MID = "1GGMBSDTiB2X42CvOJJxAvr9wLN44FSk";

export default function MapPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          ← Volver al inicio
        </Link>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Cafés de la CDMX</h1>
          <p className={styles.subtitle}>
            Un mapa personal de cafeterías en la ciudad: lugares que ya visité, 
            quiero conocer o tengo guardados para después. 
            (Aún está medio en construcción xd)
          </p>
        </div>
      </header>

      <div className={styles.mapWrap}>
        <iframe
          className={styles.map}
          title="Mapa de cafés de la CDMX"
          src={`https://www.google.com/maps/d/embed?mid=${MY_MAPS_MID}`}
          loading="lazy"
        />
      </div>
    </div>
  );
}
