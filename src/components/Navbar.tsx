import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Inicio", hash: "#inicio" },
  { label: "Proyectos", hash: "#proyectos" },
  { label: "Contacto", hash: "#contacto" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";

  // Desde la home usamos anclas (scroll suave); desde otras rutas
  // enlazamos a la home con el ancla para volver y desplazarnos.
  const linkTo = (hash: string) => (onHome ? hash : `/${hash}`);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={styles.wrapper}>
      <nav className={styles.glass} aria-label="Navegación principal">
        <Link className={styles.brand} to="/" onClick={() => setOpen(false)}>
          snaman.dev
        </Link>

        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.label}>
              <a className={styles.link} href={linkTo(link.hash)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.menuButton}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`${styles.burger} ${open ? styles.burgerOpen : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </nav>

      <div
        className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ""}`}
      >
        <ul className={styles.mobileLinks}>
          {links.map((link) => (
            <li key={link.label}>
              <a
                className={styles.mobileLink}
                href={linkTo(link.hash)}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
