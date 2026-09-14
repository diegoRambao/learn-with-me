# Implementation Plan: Categorías y rutas de aprendizaje

**Branch**: `001-category-learning-notes` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-category-learning-notes/spec.md`

## Summary

Construir un sitio Astro estático cuya portada explique el propósito educativo, la forma de uso y los beneficios, y permita comenzar desde un índice responsive de categorías y enlaces sociales válidos del autor. El catálogo permitirá filtrar por nivel y cada categoría se convertirá en una ruta ordenada de notas. Las categorías vivirán como JSON versionado, la configuración pública del sitio como datos TypeScript inmutables y todas las notas —escritas o de video— como entradas Markdown de Astro Content Collections. Un esquema estricto y una validación relacional previa al build bloquearán contenido incompleto, duplicado o incoherente. Las páginas se prerenderizarán; el diseño usará una base oscura inspirada en los principios visuales de Vercel, identidad propia, acentos accesibles y movimiento CSS discreto que respete `prefers-reduced-motion`.

## Technical Context

**Language/Version**: TypeScript 5.x en modo `strict`; Astro 7.x compatible con Node.js LTS 22+

**Primary Dependencies**: Astro Content Collections (`astro:content`, `astro/loaders`, `astro/zod`), Tailwind CSS 4 mediante `@tailwindcss/vite`; scripts TypeScript procesados por Astro y sin framework cliente

**Storage**: Archivos JSON para categorías, Markdown y frontmatter para notas, configuración versionada del sitio y redes en `src/data/site.ts`, e imágenes locales en `public/images/categories/` o URLs HTTPS remotas; sin base de datos

**Testing**: `astro check`, Vitest para validadores y ordenamiento, Playwright para portada, navegación, filtros, formatos, responsive, contraste verificable y emulación de movimiento reducido, más `astro build` como gate de publicación

**Target Platform**: Navegadores modernos con HTML estático prerenderizado; despliegue en hosting estático

**Project Type**: Aplicación web estática de contenido

**Performance Goals**: HTML prerenderizado para todas las rutas; filtrado local con p95 menor a 100 ms sobre un fixture de 100 tarjetas y 20 interacciones; JavaScript cliente limitado al filtro y a controles compactos, sin retrasar contenido ni navegación

**Constraints**: Sin autenticación, CMS, base de datos ni backend; publicación bloqueada ante cualquier error de contenido o configuración; navegación operable por teclado; mensajes de error no técnicos; cada nota debe tener exactamente un formato; redes únicamente HTTPS, reales y aportadas por el autor; sin copiar marca, textos ni activos de Vercel; movimiento no esencial desactivado o reducido cuando el sistema lo solicite

**Scale/Scope**: Una web pública, cuatro niveles iniciales, decenas de categorías, hasta cientos de notas, una portada informativa con índice de categorías y redes, un catálogo y rutas de categoría/nota

## Constitution Check

*GATE: Passed before Phase 0 research; passed again after Phase 1 design.*

| Gate constitucional | Evaluación previa | Reevaluación posterior al diseño |
|---|---|---|
| I. El contenido contribuye a descubrir, estudiar o repasar notas | PASS — la portada explica propósito, uso y beneficios; categorías, filtros y rutas sirven directamente a aprender | PASS — índice, redes del autor y contenido introductorio apoyan el descubrimiento sin agregar flujos ajenos |
| II. Navegación por categorías y secuencia tipo curso | PASS — es el flujo central del plan | PASS — los contratos fijan menú, listado filtrable, orden y nota activa |
| III. Contrato mínimo de notas y Markdown versionado | PASS — título, categoría, duración y formato se validan antes del build | PASS — toda nota es un `.md`; las escritas exigen cuerpo y las de video un `youtubeVideoId` |
| IV. Astro, Tailwind CSS y TypeScript; sin backend ni BD | PASS — se usa exactamente el stack requerido con salida estática | PASS — el modelo, contratos y validación no introducen servicios externos |
| V. Estructura simple, funcional y nomenclatura indicada | PASS — proyecto único, datos inmutables, componentes presentacionales y utilidades funcionales | PASS — estructura plana, tipos `PascalCase`, funciones/datos `camelCase` y sin clases ni capas innecesarias |
| Interfaz inspirada en claridad/contraste de Vercel y errores comprensibles | PASS — tema oscuro propio, acentos accesibles, fallbacks y movimiento reducido están planificados | PASS — contratos y quickstart cubren contraste, identidad propia, escritorio, móvil, teclado, movimiento y fallos visibles |
| Desarrollo limitado a `spec.md` | PASS — las redes sociales y la portada están solicitadas explícitamente; no hay administración ni capacidades preventivas | PASS — los artefactos de diseño trazan FR-001 a FR-026 y SC-001 a SC-012 |

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
│   ├── homepage-ui.md
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
│   ├── HomeCategoryIndex.astro
│   ├── HomeIntroduction.astro
│   ├── NoteContent.astro
│   ├── SocialLinks.astro
│   └── SiteHeader.astro
├── content/
│   ├── categories/
│   │   └── *.json
│   └── notes/
│       └── *.md
├── data/
│   └── site.ts
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

scripts/
└── validate-content.ts

tests/
├── e2e/
│   ├── categories.spec.ts
│   ├── homepage.spec.ts
│   ├── learning-route.spec.ts
│   └── note-content.spec.ts
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

**Structure Decision**: Proyecto web estático único en la raíz. La estructura evita `/backend` y `/db` porque toda la información se valida y prerenderiza desde archivos del repositorio. La portada se divide en tres componentes presentacionales para mantener legibles su introducción, índice y redes; la configuración social permanece en un único módulo inmutable. `scripts/validate-content.ts` explicita el gate previsto por el contrato. No se introducen capas, clases ni estado cliente global.

## Phase 0: Research Summary

Las decisiones completas y sus alternativas están en [research.md](./research.md). El diseño adopta Content Collections de build-time, salida SSG, una unión discriminada para notas, validación relacional previa al build, rutas jerárquicas, portada semántica, configuración social versionada, tokens oscuros accesibles, movimiento estático-first y mejoras progresivas con JavaScript mínimo.

## Phase 1: Design Summary

- [data-model.md](./data-model.md) define entidades, configuración social, modelos derivados, invariantes, relaciones y estados de navegación.
- [contracts/content-schema.md](./contracts/content-schema.md) fija el contrato versionado que deben cumplir autores de contenido y el comportamiento del gate de publicación.
- [contracts/routes-and-ui.md](./contracts/routes-and-ui.md) fija URLs, redirecciones, detalle de nota y navegación de aprendizaje.
- [contracts/homepage-ui.md](./contracts/homepage-ui.md) fija contenido de portada, índice responsive, redes, tema oscuro, contraste y movimiento.
- [quickstart.md](./quickstart.md) describe escenarios ejecutables que validan las tres historias, la portada y los casos límite.

## Complexity Tracking

No aplica: el diseño no viola la constitución.
