# Implementation Plan: Lectura mejorada y navegación entre notas

**Branch**: `003-improve-note-reading` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-improve-note-reading/spec.md`

**Note**: El plan termina en el diseño de Fase 1. La descomposición ejecutable se generará mediante `$speckit-tasks`.

## Summary

Mejorar la página estática de detalle de nota mediante estilos editoriales específicos para el HTML generado desde Markdown, controles de copia añadidos con JavaScript TypeScript mínimo a cada bloque de código y navegación anterior/siguiente derivada del mismo recorrido ordenado que alimenta el índice lateral. La solución conserva el contenido y su esquema, reutiliza los tokens visuales existentes, amplía el modelo derivado `LearningRoute` con vecinos inmutables y valida jerarquía, overflow, estados de copia, enlaces, navegación, teclado y temas con Vitest y Playwright.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Astro components and browser APIs; Node.js 22.12+

**Primary Dependencies**: Astro 7.3.2, Tailwind CSS 4.3.3, Astro Content Collections and the built-in unified Markdown/Shiki pipeline; no new runtime dependency

**Storage**: Versioned Markdown files under `src/content/notes/`; no database or new persistent state

**Testing**: Astro Check 0.9.x, Vitest 3.2.7 for derived route logic, Playwright 1.63.0 for static-page behavior, accessibility and responsive checks

**Target Platform**: Statically generated web pages in modern evergreen browsers, with a supported minimum viewport width of 320 CSS px

**Project Type**: Single Astro static web application

**Performance Goals**: Preserve static rendering for all note content and navigation; ship only one deduplicated, framework-free enhancement script for code-copy controls; avoid page-level horizontal overflow at 320 px

**Constraints**: Preserve the current design system, themes, content files, metadata, ordering, sidebar and link destinations; retain exact code text; expose friendly copy failure feedback; support keyboard and assistive technology; no backend, database, UI framework or new content fields

**Scale/Scope**: One note-detail route, the shared Markdown presentation, four derived/presentation models, one new navigation component, and focused unit/E2E coverage over the existing category collection (currently nine notes across five categories)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Pre-research gate

| Constitutional obligation | Evaluation |
|---|---|
| I. Learning value | PASS — clearer Markdown, reusable code and sequential navigation directly improve studying and reviewing notes. |
| II. Category discovery | PASS — previous/next destinations are derived only from the active category's canonical learning route. |
| III. Note contract | PASS — the existing title, category, duration, format and Markdown body remain unchanged; written and video notes participate in navigation. |
| IV. TypeScript content stack | PASS — the design uses Astro, Tailwind CSS, TypeScript, repository Markdown and static output; no backend or database is introduced. |
| V. Simplicity and functional code | PASS — neighbor calculation is a pure immutable derivation and browser behavior uses a small native script; no classes or architecture layers are added. |
| Interface, errors and validation | PASS — existing tokens and themes are reused; copy failures become contextual user messages while technical details remain hidden. |
| Spec-driven scope | PASS — the design is limited to presentation, copy and sequential navigation and does not add editing, search, comments or code execution. |

No gate violations require a complexity exception.

### Post-design gate

PASS. The data model adds only derived and ephemeral state, the UI contract exposes no external service, and the quickstart validates static output, keyboard access, responsive behavior, themes and friendly failure handling. The design introduces no new content metadata, persistence, backend, database, framework island or preventive capability.

## Project Structure

### Documentation (this feature)

```text
specs/003-improve-note-reading/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── note-detail-ui.md
└── tasks.md                 # Generated later by $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── CourseNavigation.astro
│   ├── NoteContent.astro
│   └── NoteNavigation.astro       # New previous/next presentation
├── content/
│   └── notes/                     # Unchanged Markdown sources
├── lib/
│   ├── content.ts                 # LearningRoute neighbor derivation
│   └── routes.ts                  # Existing canonical noteUrl helper
├── pages/
│   └── categorias/[categoryId]/[noteId].astro
└── styles/
    └── global.css                 # Token-based Markdown presentation

tests/
├── e2e/
│   ├── learning-route.spec.ts
│   └── note-content.spec.ts
└── unit/
    ├── content-ordering.test.ts
    └── note-navigation.test.ts      # Astro Container component contract

package.json                         # Align Node engine with Astro's executable floor
vitest.config.ts                     # Load Astro config for component rendering
```

**Structure Decision**: Retain the existing single Astro project. Domain derivation remains in `src/lib/content.ts`, canonical URLs remain in `src/lib/routes.ts`, `NoteContent.astro` owns article rendering and code-block enhancement, and a focused `NoteNavigation.astro` owns only previous/next presentation. Generated Markdown descendants are styled through the existing global stylesheet under a feature-specific prose class. Vitest loads the Astro Vite configuration so the built-in Container API can verify the component's zero-, one- and two-link HTML contracts without publishing fixture routes.

## Complexity Tracking

No constitutional violations or justified complexity exceptions.
