import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import App from "./App";
import MapPage from "./pages/MapPage";
import "./index.css";

const GeographyGamePage = lazy(() => import("./pages/GeographyGamePage"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense
        fallback={
          <p className="route-loading" role="status" aria-live="polite">
            Cargando juego…
          </p>
        }
      >
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/pasaporte-cafe-cdmx-2026" element={<MapPage />} />
          <Route
            path="/mapa"
            element={<Navigate to="/pasaporte-cafe-cdmx-2026" replace />}
          />
          <Route path="/geografia" element={<GeographyGamePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
