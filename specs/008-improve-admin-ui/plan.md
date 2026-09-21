# Implementation Plan: Mejora de la interfaz administrativa

**Branch**: `008-improve-admin-ui` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-improve-admin-ui/spec.md`

**Note**: El plan termina en el diseño de Fase 1. La descomposición ejecutable se generará mediante `$speckit-tasks`.

## Summary

Renovar la única pantalla del administrador local con componentes shadcn/ui de Base UI, conservando Astro como host, Tailwind CSS y TypeScript como stack y todos los contratos funcionales creados por `007-local-content-admin`. El administrador incorporará React solo en su entrypoint mediante un único workspace hidratado que será dueño de los controles interactivos; los endpoints, el contenido JSON/Markdown, la seguridad local, las transacciones y el sitio público no cambian. Los controles equivalentes de categorías, temas, notas, orden, vista previa y papelera se migrarán a primitivas compartidas con tokens semánticos propios, estados accesibles y confirmaciones consistentes. La aceptación combinará pruebas funcionales, auditoría WCAG 2.2 AA, matriz de navegadores y una comparación reproducible que limita a 10% la regresión de carga e interacción.

## Technical Context

**Language/Version**: TypeScript 5.9.3 sobre Node.js 22.12 o superior; JSX con React 19 solo dentro del administrador

**Primary Dependencies**: Astro 7.3.2, Tailwind CSS 4.3.3, `@astrojs/react` 6.x, React 19, shadcn/ui con Base UI fijado explícitamente, `cn`, `lucide-react` y las dependencias declaradas por los componentes generados; se conservan `@astrojs/markdown-remark` 7.3.1 y `gray-matter` 4.0.3

**Storage**: Sin cambios: categorías JSON en `src/content/categories`, notas y recursos en `src/content/notes`, y estado recuperable local en `.content-admin/`; no se añade base de datos ni persistencia de preferencias nueva

**Testing**: Vitest 3.2.7 para estado y dominio; Playwright 1.63 para recorridos y proyectos Chromium/Firefox/WebKit/Chrome/Edge; `@axe-core/playwright` para reglas automatizables WCAG A/AA; checklist manual para criterios no automatizables, tecnologías de asistencia y las dos versiones estables más recientes; comparación de rendimiento contra un baseline anterior a la migración

**Target Platform**: Administrador local servido en `127.0.0.1`, ventanas de 768 a 1440 px y las dos versiones estables más recientes de Chrome, Firefox, Safari y Edge; el sitio público estático conserva sus plataformas actuales

**Project Type**: Aplicación web Astro local separada, con un workspace React cliente dentro del entrypoint administrativo y un sitio Astro estático público independiente

**Performance Goals**: La mediana y el percentil 95 de carga hasta “Inventario listo” y de las interacciones críticas no superan 110% del baseline previo en el mismo equipo, fixture, build y protocolo; se conservan los límites existentes de inventario/mutación menores a 1 segundo y preview con debounce de 300 ms

**Constraints**: Cumplimiento WCAG 2.2 AA; ninguna señal depende solo del color; foco, teclado, movimiento reducido y retorno de diálogos son obligatorios; sin cambios en archivos de contenido, API local, reglas editoriales o publicación; sin runtime React/shadcn en `dist/` público; el código generado de shadcn se revisa y versiona como código propio; los scripts imperativos no pueden mutar DOM propiedad de React

**Scale/Scope**: Una pantalla administrativa con explorador de categorías, árbol de temas/notas, formularios, editor Markdown, preview, orden y papelera; 9 componentes Astro actuales, 4 controladores de navegador principales y unos 1.300 renglones de CSS se migran a un sistema compartido; categorías, temas y notas reciben cobertura completa

## Constitution Check

*GATE: Debe aprobarse antes de Fase 0 y volver a comprobarse después del diseño de Fase 1.*

| Gate constitucional | Antes de investigación | Después del diseño |
|---|---|---|
| I. Aprendizaje abierto y reutilizable | PASS — la mejora reduce errores y fricción al administrar las mismas notas de estudio | PASS — los contratos solo renuevan la experiencia editorial local y no agregan funciones ajenas al aprendizaje |
| II. Descubrimiento por categorías | PASS — categorías, temas y secuencia siguen siendo la estructura obligatoria | PASS — la UI conserva búsqueda, selección y orden sin alterar el modelo de descubrimiento público |
| III. Contrato de las notas | PASS — título, categoría, duración, formato y Markdown permanecen intactos | PASS — `data-model.md` declara explícitamente que no hay migración ni campos persistentes nuevos |
| IV. Astro, Tailwind y TypeScript; archivos como persistencia | PASS — React se integra como renderer de UI dentro de Astro, no sustituye el host ni introduce backend o base de datos | PASS — `@astrojs/react` vive solo en `admin/astro.config.ts`; el root público continúa sin integración React |
| V. Simplicidad y código funcional | PASS — un único workspace React evita doble propiedad del DOM y reutiliza módulos funcionales existentes | PASS — componentes funcionales, estado inmutable y una frontera cliente/API plana sustituyen controladores imperativos; no se añaden capas preventivas |
| Interfaz, errores y validación | PASS — el alcance exige WCAG 2.2 AA, estados comprensibles y errores accionables | PASS — contratos definen labels, errores por campo, live regions, foco, confirmaciones y pruebas automáticas/manuales |
| Desarrollo dirigido por especificación | PASS — no se incluyen sitio público, nuevos flujos, contenido, acceso ni publicación | PASS — cada componente y gate trazan FR-001–FR-021 y SC-001–SC-012; los contratos de `007` siguen siendo fuente funcional |

El gate se aprueba sin excepciones. React y Base UI agregan runtime únicamente al administrador porque los componentes shadcn interactivos lo requieren; concentrarlos en un workspace evita mezclar ownership con los scripts DOM vigentes y mantiene el aislamiento público.

## Project Structure

### Documentation (this feature)

```text
specs/008-improve-admin-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── admin-ui.md
│   └── quality-gates.md
└── tasks.md                     # Generado después por $speckit-tasks
```

### Source Code (repository root)

```text
components.json                  # Configuración shadcn: Base UI, Tailwind v4 y aliases de admin
package.json                     # React, integración Astro, shadcn y dependencias de prueba
tsconfig.json                    # JSX React y alias @admin/*

admin/
├── astro.config.ts              # React integrado solo en el entrypoint local
└── src/
    ├── components/
    │   ├── admin/               # Workspace y secciones funcionales React
    │   │   ├── AdminWorkspace.tsx
    │   │   ├── ContentExplorer.tsx
    │   │   ├── ContentOutline.tsx
    │   │   ├── NoteEditor.tsx
    │   │   ├── NotePreview.tsx
    │   │   ├── StructureDialogs.tsx
    │   │   └── TrashPanel.tsx
    │   └── ui/                  # Código shadcn generado y adaptado, propiedad del repositorio
    ├── layouts/
    │   └── AdminLayout.astro    # Documento, metadata, skip link y shell no interactivo
    ├── lib/
    │   ├── client/              # API, reducers/hooks y funciones puras de borrador/orden
    │   ├── server/              # Sin cambios funcionales: repositorio y mutaciones locales
    │   ├── contracts.ts         # DTOs existentes compartidos
    │   └── utils.ts             # Reexport de cn y utilidades UI mínimas
    ├── pages/
    │   ├── index.astro          # Monta el workspace con client:load
    │   └── api/                 # Contrato HTTP existente sin cambios
    └── styles/
        └── admin.css            # Tailwind/shadcn, tokens semánticos y layout administrativo

src/                             # Sitio público y contenido; no importa admin ni React

tests/
├── unit/admin/                  # Reducers, variantes, borradores, orden y utilidades
├── integration/admin/           # API y presupuesto de dominio existentes
├── e2e/                         # Flujos, estados, responsive, a11y y rendimiento UI
└── performance/
    └── admin-ui-baseline.json   # Medición pre-migración y metadatos reproducibles

scripts/
└── verify-public-build.ts       # Continúa garantizando aislamiento del dist público
```

**Structure Decision**: Conservar `AdminLayout.astro` y `index.astro` como frontera Astro, pero mover toda la región interactiva a un solo árbol React hidratado. Los componentes shadcn compuestos —diálogo, select, menú, tabs y tooltip— permanecen completos dentro de ese árbol, y los antiguos controladores que consultan IDs o crean DOM se retiran al alcanzar paridad. `admin-api.ts`, los tipos y las funciones puras de borrador/orden se reutilizan; los endpoints y el servidor no se rediseñan. La integración React no se añade a `astro.config.ts` de la raíz, por lo que el build público conserva su frontera estructural.

## Complexity Tracking

No hay violaciones constitucionales ni excepciones de complejidad que justificar.
