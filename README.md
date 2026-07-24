# Personal Website — snaman.dev

Sitio personal y archivo digital donde reúno proyectos, ideas y notas.
Single-page application construida con React, TypeScript y Vite.

## Stack

- React 18 + TypeScript
- Vite (bundler y servidor de desarrollo)
- CSS Modules
- react-icons
- Despliegue en Vercel

## Requisitos

- Node.js 18 o superior
- npm

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:5173` por defecto.

## Scripts

| Comando           | Descripción                                 |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con hot reload       |
| `npm run build`   | Compila la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente el build de producción     |

## Estructura

```
src/
├─ components/   Componentes de UI (Navbar, LogoLoop, ThemeToggle, ...)
├─ App.tsx       Composición de la página
├─ main.tsx      Punto de entrada de la aplicación
└─ index.css     Estilos globales y variables de tema
```

## Juego de geografía

La ruta `/geografia` contiene una partida frontend de 195 países: los 193
Estados miembros de la ONU más Palestina y Ciudad del Vaticano. Los territorios
dependientes, Kosovo, Taiwán y el Sáhara Occidental aparecen únicamente como
contexto cartográfico y no forman parte de las preguntas.

Las fronteras proceden de `@svg-maps/world` 2.0.0, publicado con licencia
CC BY 4.0 y basado en el mapa de MapSVG. El dataset se carga en un chunk
independiente al comenzar la partida. Los Estados de superficie muy reducida
mantienen su posición geográfica y reciben un área de interacción transparente
de 16 px; el mapa también permite ampliar hasta 300 %.

## Licencia

Uso personal. Todos los derechos reservados.
