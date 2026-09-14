# Implementation Plan: Portada de notas y selector de tema

**Branch**: `002-notes-homepage` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-notes-homepage/spec.md`

**Note**: Este plan cubre únicamente la portada, la navegación compartida y la preferencia de tema; no altera el catálogo ni el detalle de notas.

## Summary

Recomponer la portada estática para presentar el sitio como una colección personal de apuntes reutilizables, sustituir el índice lateral por una llamada central y una muestra responsive de hasta seis categorías, y añadir al encabezado un selector accesible de tema Sistema/Claro/Oscuro. La solución reutiliza el orden y las tarjetas actuales, deriva mediante una función pura los grupos de tres rutas principales y hasta tres atenuadas, y aplica el tema con tokens semánticos, preferencia local y un arranque temprano que evita mostrar una apariencia incorrecta. Todo permanece en Astro, Tailwind CSS y TypeScript, sin backend, framework cliente ni dependencias nuevas.

## Technical Context

**Language/Version**: TypeScript 5.9 en modo `strict`; Astro 7 compatible con Node.js 22+

**Primary Dependencies**: Astro 7, Astro Content Collections, Tailwind CSS 4 mediante `@tailwindcss/vite`; JavaScript cliente nativo y sin framework de UI

**Storage**: Categorías JSON existentes y notas Markdown versionadas; una preferencia anónima de tema en almacenamiento local del navegador, con fallback a Sistema; sin base de datos

**Testing**: `astro check`, Vitest 3 para la proyección pura de categorías y Playwright 1.55 para portada, navegación, tema, persistencia, teclado, responsive, contraste y movimiento reducido; `astro build` como gate final

**Target Platform**: Navegadores modernos en escritorio y móvil con HTML estático prerenderizado y soporte de `prefers-color-scheme`

**Project Type**: Aplicación web estática de contenido

**Performance Goals**: Contenido y enlaces disponibles en el HTML inicial; preferencia de tema aplicada antes del contenido visual; cambio de tema y proyección de hasta seis rutas perceptibles en menos de 100 ms en pruebas locales

**Constraints**: Sin backend, cuenta, sincronización entre dispositivos, CMS, librería de temas ni framework cliente; ninguna tarjeta ficticia; máximo seis categorías en la portada; navegación operable sin JavaScript salvo la elección persistente de tema; temas y desvanecimiento con contraste y foco perceptibles; no copiar textos, marca ni activos de terceros

**Scale/Scope**: Una portada, un encabezado y estilos compartidos; tres estados de tema; de cero a decenas de categorías publicadas, de las cuales la portada muestra como máximo seis; catálogo y páginas de nota fuera de cambios funcionales

## Constitution Check

*GATE: Passed before Phase 0 research; passed again after Phase 1 design.*

| Gate constitucional | Evaluación previa | Reevaluación posterior al diseño |
|---|---|---|
| I. Aprendizaje abierto y reutilizable | PASS — el nuevo mensaje explica que son apuntes personales compartidos para estudiar y repasar | PASS — el contrato conserva propósito, forma de uso, beneficios y acceso directo al contenido |
| II. Descubrimiento por categorías | PASS — el menú mantiene Categorías y la portada añade dos accesos al catálogo | PASS — la proyección conserva categorías y URLs canónicas sin alterar sus rutas internas |
| III. Contrato de las notas | PASS — no cambia campos, formatos, almacenamiento ni renderizado de notas | PASS — el diseño solo consume categorías existentes y no modifica el contrato editorial |
| IV. Astro, Tailwind CSS y TypeScript; sin backend ni BD | PASS — se mantiene el stack y la salida estática | PASS — tema y muestra usan CSS, HTML y TypeScript local, sin servicios ni dependencias adicionales |
| V. Simplicidad y código funcional | PASS — una proyección pura y componentes presentacionales cubren el cambio | PASS — no se introducen clases, estado global, capas ni patrones complejos |
| Interfaz clara, contrastada y con identidad propia | PASS — se planifican tokens semánticos, dos temas y un fade no bloqueante | PASS — los contratos fijan contraste, foco, responsive, movimiento reducido y ausencia de copia de marca |
| Desarrollo limitado a `spec.md` | PASS — el alcance se limita a portada, navegación y preferencia visual | PASS — el modelo, contratos y quickstart trazan FR-001 a FR-020 sin ampliar el dominio |

No existen violaciones ni excepciones que requieran Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-notes-homepage/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── homepage-ui.md
│   └── theme-ui.md
└── tasks.md                 # Se generará con $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── CategoryCard.astro           # Añadir nivel semántico reutilizable
│   ├── HomeIntroduction.astro       # Reescribir propósito, uso y beneficios
│   ├── HomeRoutePreview.astro       # Nuevo: grupos principal/atenuado y CTA
│   ├── SiteHeader.astro             # Integrar acceso a categorías y selector
│   └── ThemeSelector.astro          # Nuevo: control y preferencia local
├── layouts/
│   └── BaseLayout.astro             # Inicialización temprana del tema
├── lib/
│   └── content.ts                   # Proyección pura HomeCategoryPreview
├── pages/
│   └── index.astro                  # Composición de portada sin sidebar
└── styles/
    └── global.css                   # Tokens semánticos claro/oscuro y fade

tests/
├── e2e/
│   └── homepage.spec.ts             # Copy, muestra, tema y accesibilidad
└── unit/
    └── home-category-preview.test.ts # Matriz de conteos 0–7
```

`src/components/HomeCategoryIndex.astro` deja de tener consumidores y se elimina tras confirmar que no existen imports. Los componentes y páginas del catálogo o detalle solo se revisan visualmente para comprobar que los tokens compartidos soportan ambos temas; no cambian su comportamiento.

**Structure Decision**: Mantener un único proyecto Astro estático. `HomeRoutePreview` encapsula la semántica de la muestra, mientras una función inmutable en `content.ts` limita y separa las categorías para poder probar todos los conteos sin alterar contenido publicado. `ThemeSelector` aísla un control compartido pequeño; `BaseLayout` conserva únicamente la inicialización que debe ejecutarse antes del primer render. No se crean servicios, almacenes globales ni directorios de backend.

## Phase 0: Research Summary

Las decisiones y alternativas completas están en [research.md](./research.md). Se adopta una proyección pura 3+3, tarjetas compartidas, un fade decorativo que no bloquea interacción, un selector nativo de tres estados, tokens semánticos y resolución de Sistema por CSS. La persistencia es local, tolera fallos y no requiere cuenta ni servicio.

## Phase 1: Design Summary

- [data-model.md](./data-model.md) define la proyección de rutas, la preferencia de tema, sus invariantes y transiciones.
- [contracts/homepage-ui.md](./contracts/homepage-ui.md) fija copy, composición, conteos, rutas, estados vacíos, responsive y accesibilidad del fade.
- [contracts/theme-ui.md](./contracts/theme-ui.md) fija el control, precedencia, persistencia, arranque temprano, fallbacks y alcance visual.
- [quickstart.md](./quickstart.md) describe validación automatizada y manual para las tres historias y sus casos límite.

## Complexity Tracking

No aplica: el diseño no viola la constitución.

