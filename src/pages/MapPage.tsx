import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./MapPage.module.css";

// Mapa personalizado en Google My Maps.
// Debe estar compartido como "Cualquier persona con el enlace" para que
// el iframe cargue en el sitio.
const MY_MAPS_MID = "1ZsEE7iS8Y1F3XN_mZ3z8xe2lBTu-Ubg";

export default function MapPage() {
  useEffect(() => {
    const previousTitle = document.title;
    const existingDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const description = existingDescription ?? document.createElement("meta");
    const previousDescription = description.getAttribute("content");

    if (!existingDescription) {
      description.name = "description";
      document.head.appendChild(description);
    }

    document.title =
      "Mapa del Pasaporte del Café de Especialidad CDMX 2026 | snaman.dev";
    description.content =
      "Consulta el mapa del Pasaporte del Café de Especialidad CDMX 2026. Ubica las cafeterías participantes y planea tu recorrido por la Ciudad de México.";

    return () => {
      document.title = previousTitle;
      if (!existingDescription) {
        description.remove();
      } else if (previousDescription === null) {
        description.removeAttribute("content");
      } else {
        description.content = previousDescription;
      }
    };
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />
      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          ← Volver al inicio
        </Link>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>
            Mapa del Pasaporte del Café de Especialidad CDMX 2026
          </h1>
          <p className={styles.subtitle}>
            Como el pasaporte no está organizado por zonas y no encontré ningún
            mapa disponible en internet, decidí crear uno. Lo comparto para que
            cualquiera que quiera usarlo —o se haya encontrado con el mismo
            problema— pueda consultarlo.
          </p>
        </div>
      </header>

      <div className={styles.mapWrap}>
        <iframe
          className={styles.map}
          title="Mapa del Pasaporte del Café de Especialidad CDMX 2026"
          src={`https://www.google.com/maps/d/u/0/embed?mid=${MY_MAPS_MID}&ehbc=2E312F&noprof=1`}
          loading="lazy"
        />
      </div>
    </div>
  );
}
