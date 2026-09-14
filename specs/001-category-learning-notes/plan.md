# Implementation Plan: Categorías y rutas de aprendizaje

**Branch**: `001-category-learning-notes` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-category-learning-notes/spec.md`

## Summary

Construir un sitio Astro estático que exponga un acceso permanente a categorías, permita filtrarlas por nivel y convierta cada categoría en una ruta ordenada de notas. Las categorías vivirán como datos JSON versionados y todas las notas —escritas o de video— como entradas Markdown de Astro Content Collections. Un esquema estricto y una validación relacional previa al build bloquearán contenido incompleto, duplicado o incoherente. Las páginas se prerenderizarán con rutas que siempre incluyen categoría y nota; Astro renderizará Markdown o un iframe de YouTube según una unión discriminada, con navegación lateral en escritorio y un control compacto en móvil.

## Technical Context

**Language/Version**: TypeScript 5.x en modo `strict`; Astro 7.x compatible con Node.js LTS 22+

**Primary Dependencies**: Astro Content Collections (`astro:content`, `astro/loaders`, `astro/zod`), Tailwind CSS 4 mediante `@tailwindcss/vite`; sin framework cliente

**Storage**: Archivos JSON para categorías, Markdown y frontmatter para notas, e imágenes locales en `public/images/categories/` o URLs HTTPS remotas; sin base de datos

**Testing**: `astro check`, Vitest para validadores y ordenamiento, Playwright para flujos responsive y navegación, más `astro build` como gate de publicación

**Target Platform**: Navegadores modernos con HTML estático prerenderizado; despliegue en hosting estático

**Project Type**: Aplicación web estática de contenido

**Performance Goals**: HTML prerenderizado para todas las rutas; filtrado local perceptiblemente inmediato (objetivo menor a 100 ms con el volumen previsto); JavaScript cliente limitado al filtro y al control móvil

**Constraints**: Sin autenticación, CMS, base de datos ni backend; publicación bloqueada ante cualquier error de contenido; navegación operable por teclado; mensajes de error no técnicos; cada nota debe tener exactamente un formato

**Scale/Scope**: Una web pública, cuatro niveles iniciales, decenas de categorías y hasta cientos de notas, tres vistas principales (`/`, `/categorias/`, ruta de categoría/nota)

## Constitution Check

*GATE: Passed before Phase 0 research; passed again after Phase 1 design.*

| Gate constitucional | Evaluación previa | Reevaluación posterior al diseño |
|---|---|---|
| I. El contenido contribuye a descubrir, estudiar o repasar notas | PASS — categorías, filtros y rutas sirven directamente a esos fines | PASS — no se agregaron flujos ajenos al aprendizaje |
| II. Navegación por categorías y secuencia tipo curso | PASS — es el flujo central del plan | PASS — los contratos fijan menú, listado filtrable, orden y nota activa |
| III. Contrato mínimo de notas y Markdown versionado | PASS — título, categoría, duración y formato se validan antes del build | PASS — toda nota es un `.md`; las escritas exigen cuerpo y las de video un `youtubeVideoId` |
| IV. Astro, Tailwind CSS y TypeScript; sin backend ni BD | PASS — se usa exactamente el stack requerido con salida estática | PASS — el modelo, contratos y validación no introducen servicios externos |
| V. Estructura simple, funcional y nomenclatura indicada | PASS — proyecto único y utilidades funcionales | PASS — estructura plana, tipos `PascalCase` y funciones/datos `camelCase` |
| Interfaz inspirada en claridad/contraste de Vercel y errores comprensibles | PASS — se planifican componentes accesibles, estados vacíos y fallback | PASS — quickstart cubre escritorio, móvil, teclado y fallos visibles |
| Desarrollo limitado a `spec.md` | PASS — no hay administración, perfiles ni capacidades preventivas | PASS — los artefactos de diseño trazan exclusivamente FR-001 a FR-019 |

No existen violaciones ni excepciones que requieran Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-category-learning-notes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content-schema.md
│   └── routes-and-ui.md
└── tasks.md                 # Se generará con $speckit-tasks
```

### Source Code (repository root)

```text
public/
├── category-fallback.svg
└── images/
    └── categories/

src/
├── components/
│   ├── CategoryCard.astro
│   ├── CategoryFilters.astro
│   ├── CourseNavigation.astro
│   ├── EmptyState.astro
│   ├── NoteContent.astro
│   └── SiteHeader.astro
├── content/
│   ├── categories/
│   │   └── *.json
│   └── notes/
│       └── *.md
├── layouts/
│   └── BaseLayout.astro
├── lib/
│   ├── content.ts
│   ├── routes.ts
│   └── validation.ts
├── pages/
│   ├── 404.astro
│   ├── index.astro
│   └── categorias/
│       ├── index.astro
│       └── [categoryId]/
│           ├── index.astro
│           └── [noteId].astro
├── styles/
│   └── global.css
└── content.config.ts

tests/
├── e2e/
│   ├── categories.spec.ts
│   └── learning-route.spec.ts
├── fixtures/
│   └── invalid-content/
└── unit/
    ├── content-ordering.test.ts
    └── validation.test.ts

astro.config.ts
package.json
playwright.config.ts
tsconfig.json
vitest.config.ts
```

**Structure Decision**: Proyecto web estático único en la raíz. La estructura evita `/backend` y `/db` porque toda la información se valida y prerenderiza desde archivos del repositorio. Las responsabilidades compartidas se mantienen en componentes y tres utilidades funcionales pequeñas; no se introducen capas ni clases.

## Phase 0: Research Summary

Las decisiones completas y sus alternativas están en [research.md](./research.md). El diseño adopta Content Collections de build-time, salida SSG, una unión discriminada para el formato de nota, validación relacional previa al build, rutas jerárquicas y mejoras progresivas con JavaScript mínimo.

## Phase 1: Design Summary

- [data-model.md](./data-model.md) define entidades, campos, invariantes, relaciones y estado de navegación.
- [contracts/content-schema.md](./contracts/content-schema.md) fija el contrato versionado que deben cumplir autores de contenido y el comportamiento del gate de publicación.
- [contracts/routes-and-ui.md](./contracts/routes-and-ui.md) fija URLs, redirecciones, estados de UI, accesibilidad y comportamiento responsive.
- [quickstart.md](./quickstart.md) describe escenarios ejecutables que validan los tres user stories y los casos límite.

## Complexity Tracking

No aplica: el diseño no viola la constitución.
