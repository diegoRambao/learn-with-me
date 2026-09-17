# Implementation Plan: Temas, videos y panel de notas

**Branch**: `006-note-topics-media` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-note-topics-media/spec.md`

**Note**: El plan termina en el diseño de Fase 1. La descomposición ejecutable se generará mediante `$speckit-tasks`.

## Summary

Ampliar las categorías versionadas con temas declarativos y las notas con una referencia opcional a tema, validando durante el build la integridad referencial y una posición única compartida por temas y notas. Mantener la secuencia plana de notas para las rutas y la navegación anterior/siguiente, mientras una proyección separada alimenta el panel agrupado. Un plugin rehype local convertirá únicamente URLs web desnudas de videos individuales de YouTube, colocadas como bloques Markdown independientes, en reproductores HTTPS adaptables con fallback seguro. El panel usará controles nativos accesibles y conservará visibilidad, temas expandidos y desplazamiento por categoría en `sessionStorage`, sin backend ni framework cliente.

## Technical Context

**Language/Version**: TypeScript 5.9.x, componentes Astro y APIs del navegador; Node.js 22.12+ según `package.json`

**Primary Dependencies**: Astro 7.x, Tailwind CSS 4.x, `@astrojs/markdown-remark` 7.3.x con Unified/rehype, Astro Content Collections y Zod incluido por Astro; sin nuevas dependencias de runtime

**Storage**: JSON versionado bajo `src/content/categories/`, Markdown con frontmatter bajo `src/content/notes/` y estado efímero por categoría en `sessionStorage`; sin base de datos

**Testing**: Astro Check 0.9.x, Vitest 3.2.x para modelos, validación y transformación Markdown; Playwright 1.55+ para navegación, persistencia de visita, teclado, accesibilidad y responsive

**Target Platform**: Sitio web generado de forma estática para navegadores evergreen modernos, con viewport mínimo soportado de 320 CSS px

**Project Type**: Aplicación web estática Astro de un solo proyecto

**Performance Goals**: Mantener renderizado estático sin solicitudes propias posteriores a la carga; proyectar navegación en una pasada por los temas y notas de la categoría; alternar el panel y los temas sin desplazamiento horizontal ni recarga adicional

**Constraints**: Rutas públicas y orden anterior/siguiente invariantes; posiciones positivas y únicas en la unión tema-nota por categoría; temas vacíos válidos; JavaScript progresivo y sin framework cliente; videos solo para URL HTTP(S) desnuda de `watch`, `youtu.be`, `shorts` o `embed`, canonicalizada a HTTPS; proporción 16:9; fallback permanente; controles operables por teclado; estado limitado a la visita; sin backend, cuentas, editor visual ni proveedores adicionales

**Scale/Scope**: Seis categorías y trece notas existentes; extensión de dos esquemas/tipos y del validador editorial; una proyección de navegación; un plugin Markdown local; refactor del panel y layout de detalle; migración de contenido de demostración; pruebas unitarias y E2E enfocadas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Pre-research gate

| Obligación constitucional | Evaluación |
|---|---|
| I. Aprendizaje abierto y reutilizable | PASS — temas, videos complementarios y control del panel mejoran directamente el descubrimiento, estudio y repaso de las notas. |
| II. Descubrimiento por categorías | PASS — cada tema pertenece a una categoría y organiza su ruta sin mezclar contenido de otras categorías ni sustituir la secuencia de aprendizaje. |
| III. Contrato de las notas | PASS — título, categoría, duración, formato y Markdown permanecen; la referencia opcional a tema y los videos complementarios están exigidos y delimitados por la especificación. |
| IV. Stack TypeScript basado en contenido | PASS — la solución conserva Astro, Tailwind, TypeScript, JSON y Markdown con salida estática; no añade backend ni persistencia externa. |
| V. Simplicidad y código funcional | PASS — modelos inmutables, validadores y transformaciones puras concentran las reglas; los controles usan HTML nativo y JavaScript del navegador sin clases ni capas preventivas. |
| Interfaz, errores y validación | PASS — se reutilizan tokens y patrones actuales; la validación bloquea conflictos al ingresar el contenido y produce mensajes editoriales contextuales sin exponer errores técnicos a visitantes. |
| Flujo dirigido por especificaciones | PASS — el diseño se limita a temas, videos Markdown y estado del panel; excluye expresamente editor, redimensionamiento, cuentas, comentarios, listas y otros proveedores. |

No hay violaciones de gate que requieran excepción de complejidad.

### Post-design gate

PASS. El modelo añade solo `topics` en categorías y `topic` opcional en notas, manteniendo JSON y Markdown como fuentes versionadas. Los contratos conservan las rutas y la secuencia global, definen una transformación Markdown build-time segura y restringida, y usan estado efímero del navegador sin convertirlo en persistencia de producto. El quickstart comprueba validación editorial, navegación agrupada, fallback de video, teclado, responsive y regresiones. No se introduce backend, base de datos, framework cliente, telemetría ni capacidad fuera de alcance.

## Project Structure

### Documentation (this feature)

```text
specs/006-note-topics-media/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content-schema.md
│   ├── markdown-youtube.md
│   └── note-sidebar-ui.md
└── tasks.md                 # Generado después por $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── CourseNavigation.astro       # Temas nativos, notas raíz/hijas y estado de visita
│   ├── NoteContent.astro            # Conserva notas escritas y videos principales actuales
│   └── NoteNavigation.astro         # Anterior/siguiente sin cambio de secuencia
├── content/
│   ├── categories/*.json            # Declara topics, incluidos temas vacíos
│   └── notes/*/*.md                  # Declara topic opcional y fixtures Markdown de video
├── content.config.ts                # Esquemas de Topic y referencia opcional
├── lib/
│   ├── content.ts                   # Tipos y proyección agrupada; ruta plana intacta
│   ├── rehype-youtube-embeds.ts     # Reconocimiento y HAST seguro para videos complementarios
│   └── validation.ts                # Relaciones tema-nota y posiciones globales
├── pages/
│   └── categorias/[categoryId]/[noteId].astro # Layout expandible y toggle persistente
└── styles/
    └── global.css                   # Panel responsive y marco 16:9 basado en tokens

astro.config.ts                      # Registra el plugin rehype en Unified
scripts/
└── validate-content.ts              # Carga topics y topic para el gate prebuild

tests/
├── fixtures/invalid-content/        # Referencias, IDs y posiciones inválidas
├── unit/
│   ├── content-ordering.test.ts     # Ruta plana y proyección agrupada
│   ├── rehype-youtube-embeds.test.ts # Matriz de URLs y salida segura
│   └── validation.test.ts           # Integridad y conflictos tema-nota
└── e2e/
    ├── learning-route.spec.ts       # Regresión de rutas y anterior/siguiente
    ├── note-content.spec.ts         # Video Markdown, fallback y responsive
    └── note-topics-sidebar.spec.ts  # Grupos, estado, teclado y panel
```

**Structure Decision**: Conservar el proyecto Astro único y plano. Los temas se almacenan dentro del JSON de su categoría porque esa relación es de propiedad y así pueden existir vacíos; las notas solo guardan el ID opcional. `src/lib/content.ts` mantiene `LearningRoute.notes` como la lista global usada por rutas y anterior/siguiente y añade una proyección independiente para el panel. El transformador rehype produce nodos estructurados durante el build, y el panel se mejora con HTML nativo más un script pequeño con `sessionStorage`; no se requiere backend, nueva aplicación ni librería cliente.

## Complexity Tracking

No hay violaciones constitucionales ni excepciones de complejidad justificadas.
