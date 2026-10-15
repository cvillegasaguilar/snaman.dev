import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiAngular,
  SiTailwindcss,
  SiHtml5,
  SiCss,
  SiSpringboot,
  SiNodedotjs,
  SiPython,
  SiPostgresql,
  SiGooglecloud,
  SiTekton,
  SiGit,
  SiGithub,
  SiVercel,
} from "react-icons/si";
import { FaJava, FaDatabase } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import LogoLoop, { type LogoItem } from "./components/LogoLoop";
import styles from "./App.module.css";

const techLogos: LogoItem[] = [
  { node: <SiReact />, title: "React", ariaLabel: "React" },
  { node: <SiTypescript />, title: "TypeScript", ariaLabel: "TypeScript" },
  { node: <SiJavascript />, title: "JavaScript", ariaLabel: "JavaScript" },
  { node: <SiAngular />, title: "Angular", ariaLabel: "Angular" },
  { node: <SiTailwindcss />, title: "Tailwind", ariaLabel: "Tailwind CSS" },
  { node: <SiHtml5 />, title: "HTML5", ariaLabel: "HTML5" },
  { node: <SiCss />, title: "CSS3", ariaLabel: "CSS3" },
  { node: <SiSpringboot />, title: "Spring Boot", ariaLabel: "Spring Boot" },
  { node: <SiNodedotjs />, title: "Node.js", ariaLabel: "Node.js" },
  { node: <FaJava />, title: "Java", ariaLabel: "Java" },
  { node: <SiPython />, title: "Python", ariaLabel: "Python" },
  { node: <FaDatabase />, title: "SQL", ariaLabel: "SQL" },
  { node: <SiPostgresql />, title: "PostgreSQL", ariaLabel: "PostgreSQL" },
  { node: <SiGooglecloud />, title: "Google Cloud", ariaLabel: "Google Cloud" },
  { node: <SiTekton />, title: "Tekton", ariaLabel: "Tekton" },
  { node: <SiGit />, title: "Git", ariaLabel: "Git" },
];

const projects = [
  {
    title: "Mapa del Pasaporte del Café de Especialidad CDMX 2026",
    desc: "Consulta el mapa de cafeterías participantes en el pasaporte 2026.",
    tag: "Web",
    to: "/pasaporte-cafe-cdmx-2026",
  },
  {
    title: "Encuentra el país",
    desc: "Un mini juego para poner a prueba tu geografía en el mapa mundial.",
    tag: "Juego",
    to: "/geografia",
  },
  {
    title: "Lorem ipsum",
    desc: "Sed do eiusmod tempor incididunt ut labore et dolore magna.",
    tag: "Próximamente",
    soon: true,
  },
];

export default function App() {
  return (
    <div className={styles.app}>
      <Navbar />

      <main>
        <section id="inicio" className={styles.hero}>
          <div className={styles.heroGrid}>
            <div className={styles.heroLeft}>
              <p className={styles.kicker}>Hola, soy Carlos Villegas</p>
              <h1 className={styles.heroTitle}>
                Fullstack
                <br />
                <span className={styles.heroAccent}>developer</span>
              </h1>
            </div>
            <div className={styles.heroRight}>
              <p className={styles.heroLead}>
                Desarrollo software, herramientas digitales y experiencias web.
              </p>
              <p className={styles.heroSub}>
                Este es mi espacio para reunir proyectos, ideas, experimentos y cosas que me gustan.
              </p>
              <p className={styles.heroSub}>
                Algunas cosas son serias. Otras solo existen porque me dio
                curiosidad hacerlas.
              </p>
              <a
                className={styles.heroButton}
                href="https://github.com/cvillegasaguilar"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver mi GitHub"
              >
                <SiGithub aria-hidden="true" />
                GitHub
              </a>
            </div>
          </div>

          <div className={styles.techWrap}>
            <LogoLoop
              logos={techLogos}
              speed={70}
              logoHeight={30}
              gap={48}
              pauseOnHover
              scaleOnHover
              fadeOut
              ariaLabel="Tecnologías que uso"
            />
          </div>
        </section>

        <section id="proyectos" className={styles.section}>
          <h2 className={styles.sectionTitle}>Proyectos</h2>
          <ul className={styles.projectList}>
            {projects.map((project, index) => {
              const inner = (
                <>
                  <div className={styles.projectMain}>
                    <h3 className={styles.projectName}>{project.title}</h3>
                    <p className={styles.projectDesc}>{project.desc}</p>
                  </div>
                  <div className={styles.projectMeta}>
                    <span className={styles.projectTag}>{project.tag}</span>
                    {!project.soon && (
                      <span className={styles.projectArrow} aria-hidden="true">
                        ↗
                      </span>
                    )}
                  </div>
                </>
              );
              return (
                <li key={index}>
                  {project.soon ? (
                    <div
                      className={`${styles.projectRow} ${styles.projectRowSoon}`}
                    >
                      {inner}
                    </div>
                  ) : project.to ? (
                    <Link className={styles.projectRow} to={project.to}>
                      {inner}
                    </Link>
                  ) : (
                    <a className={styles.projectRow} href="#">
                      {inner}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          <p className={styles.projectsNote}>
            Voy agregando más conforme se me ocurren.
          </p>
        </section>

        <section id="contacto" className={styles.section}>
          <h2 className={styles.sectionTitle}>Hablemos</h2>
          <p className={styles.contactText}>
            ¿Quieres saber más sobre algún proyecto o dejarme un mensaje?
            Escríbeme.
          </p>
          <div className={styles.contactAction}>
            <a
              className={styles.contactButton}
              href="mailto:carlosvillegasaguilar00@gmail.com"
            >
              Enviar correo
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <ul className={styles.footerStack}>
              <li>
                <span className={styles.footerStackLabel}>Built with</span>
                <span className={styles.footerStackValue}>
                  <SiReact aria-hidden="true" /> React
                </span>
              </li>
              <li>
                <span className={styles.footerStackLabel}>Deployed on</span>
                <span className={styles.footerStackValue}>
                  <SiVercel aria-hidden="true" /> Vercel
                </span>
              </li>
            </ul>
          </div>

          <div className={`${styles.footerCol} ${styles.footerColRight}`}>
            <iframe
              className={styles.spotify}
              title="Playlist de Spotify"
              src="https://open.spotify.com/embed/playlist/0bssSbZh8GDXlKy0xTUfC5?utm_source=generator&theme=0"
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Carlos Villegas</span>
          <span>Made with ☕</span>
        </div>
      </footer>
    </div>
  );
}
