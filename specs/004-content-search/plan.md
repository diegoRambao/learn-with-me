# Implementation Plan: Búsqueda transversal de contenido

**Branch**: `004-content-search` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-content-search/spec.md`

**Note**: El plan termina en el diseño de Fase 1. La descomposición ejecutable se generará mediante `$speckit-tasks`.

## Summary

Añadir al encabezado compartido un formulario GET que navegue a `/buscar/?q=...` y una página estática dedicada que evalúe la consulta en el navegador contra registros de categorías y notas prerenderizados durante el build. Funciones TypeScript puras normalizarán mayúsculas, tildes y espacios, aplicarán coincidencia parcial AND entre tokens y conservarán el orden canónico sin duplicados; el navegador solo alternará su visibilidad y los estados asociados. El esquema y la validación editorial incorporarán descripción obligatoria para categorías y etiquetas no vacías para notas; el contenido existente se migrará antes de que los comandos de validación, prueba y build puedan aprobarse. La interfaz reutilizará imágenes, rutas, tokens y fallback existentes, con estados explícitos para consulta inicial, inválida, resultados parciales y cero coincidencias.

## Technical Context

**Language/Version**: TypeScript 5.9.x, Astro components and browser APIs; Node.js 22.12+ según `package.json`

**Primary Dependencies**: Astro 7.x, Tailwind CSS 4.x, Astro Content Collections y Zod incluido por Astro; sin nuevas dependencias de runtime

**Storage**: JSON versionado bajo `src/content/categories/` y Markdown con frontmatter bajo `src/content/notes/`; registros de búsqueda inmutables prerenderizados en el build, sin base de datos

**Testing**: Astro Check 0.9.x, Vitest 3.2.x para normalización, coincidencia, deduplicación y validación; Playwright 1.55+ para navegación, URL, presentación, teclado, accesibilidad y responsive

**Target Platform**: Sitio web generado de forma estática para navegadores evergreen modernos, con viewport mínimo soportado de 320 CSS px

**Project Type**: Aplicación web estática Astro de un solo proyecto

**Performance Goals**: Mostrar el 95% o más de una muestra de 50 consultas en menos de 2 segundos desde su confirmación; filtrar el corpus actual en una sola pasada por tipo; no solicitar contenido ni servicios después de cargar `/buscar/`

**Constraints**: URL compartible con parámetro `q`; coincidencia parcial AND, insensible a mayúsculas y tildes; solo metadatos publicados, no cuerpo Markdown; orden estable vigente; una aparición por entidad; HTML y mensajes seguros; teclado y tecnologías de asistencia; sin backend, base de datos, autocompletado, filtros ni orden de relevancia

**Scale/Scope**: Un formulario en el header transversal, una ruta de resultados, dos componentes de resultado, un módulo funcional de búsqueda, extensión de dos esquemas/tipos y de la validación, migración de cinco categorías y nueve notas existentes, más pruebas unitarias y E2E enfocadas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Pre-research gate

| Obligación constitucional | Evaluación |
|---|---|
| I. Aprendizaje abierto y reutilizable | PASS — la búsqueda mejora directamente el descubrimiento y repaso de notas publicadas. |
| II. Descubrimiento por categorías | PASS — las categorías siguen siendo destinos principales y cada nota conserva su categoría y secuencia; la búsqueda añade una entrada transversal sin sustituir la navegación vigente. |
| III. Contrato de las notas | PASS — título, categoría, duración, formato y Markdown permanecen; descripción y etiquetas son campos adicionales cuya necesidad está demostrada por FR-004, FR-008 y FR-014. |
| IV. Stack TypeScript basado en contenido | PASS — Astro, Tailwind, TypeScript, JSON y Markdown resuelven la feature con salida estática; no se introduce backend ni almacenamiento externo. |
| V. Simplicidad y código funcional | PASS — normalización y matching serán funciones puras sobre datos inmutables; la hidratación usa JavaScript nativo y componentes Astro planos, sin clases ni capas preventivas. |
| Interfaz, errores y validación | PASS — se reutilizan tokens visuales, foco y fallback; las entradas se validan al enviar y los metadatos al construir, con mensajes comprensibles y sin errores técnicos visibles. |
| Flujo dirigido por especificaciones | PASS — el diseño se limita a categorías, notas, metadatos y estados expresamente incluidos; no añade búsqueda del cuerpo, servicios externos ni capacidades futuras. |

No hay violaciones de gate que requieran excepción de complejidad.

### Post-design gate

PASS. El modelo de datos amplía únicamente las fuentes de contenido exigidas y crea modelos derivados efímeros; el contrato mantiene rutas canónicas y búsqueda estática; y el quickstart verifica validación editorial, semántica AND, normalización, URL reproducible, estados accesibles, fallback, teclado, responsive y presupuesto de tiempo. No se introduce backend, base de datos, framework cliente, telemetría ni comportamiento fuera de alcance.

## Project Structure

### Documentation (this feature)

```text
specs/004-content-search/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── search-ui.md
└── tasks.md                 # Generado después por $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── SiteHeader.astro             # Formulario GET transversal y validación de espacios
│   ├── SearchCategoryResult.astro   # Presentación de categoría
│   └── SearchNoteResult.astro       # Presentación de nota y etiquetas
├── content/
│   ├── categories/*.json            # Añade description a cada categoría
│   └── notes/*.md                    # Añade tags al frontmatter de cada nota
├── content.config.ts                # Esquemas estrictos de description y tags
├── lib/
│   ├── content.ts                   # Tipos/mapeos ampliados y orden canónico reutilizado
│   ├── routes.ts                    # Rutas canónicas existentes
│   ├── search.ts                    # Normalización, tokenización, índice y matching puros
│   └── validation.ts                # Errores editoriales accionables para nuevos campos
├── pages/
│   └── buscar/index.astro           # Índice build-time, estados y ejecución desde ?q=
└── styles/
    └── global.css                   # Ajustes responsivos basados en tokens existentes

scripts/
└── validate-content.ts              # Carga description/tags para validación prebuild

tests/
├── fixtures/invalid-content/        # Casos de description/tags ausentes o vacíos
├── unit/
│   ├── search.test.ts               # Semántica de consulta y orden/deduplicación
│   └── validation.test.ts           # Contrato editorial ampliado
└── e2e/
    └── search.spec.ts               # Header, URL, resultados, estados y accesibilidad
```

**Structure Decision**: Conservar el proyecto Astro único y plano. `src/lib/search.ts` concentra toda decisión determinista y testeable; `buscar/index.astro` obtiene ambas colecciones durante el build, prerenderiza cada componente de resultado una sola vez con sus campos de búsqueda normalizados y deja al navegador alternar `hidden`; `SiteHeader.astro` conserva la responsabilidad del control transversal; y dos componentes pequeños mantienen explícito el contrato visual de cada tipo. Las fuentes versionadas siguen siendo la única persistencia y los comandos existentes bloquean publicación mediante la validación ampliada.

## Complexity Tracking

No hay violaciones constitucionales ni excepciones de complejidad justificadas.
