# Implementation Plan: Administración local de contenido

**Branch**: `007-local-content-admin` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-local-content-admin/spec.md`

**Note**: El plan termina en el diseño de Fase 1. La descomposición ejecutable se generará mediante `$speckit-tasks`.

## Summary

Crear una aplicación Astro independiente, iniciada de forma explícita y enlazada únicamente a `127.0.0.1`, para administrar las fuentes JSON, Markdown y recursos del repositorio mediante formularios accesibles. La aplicación reutilizará el contrato y el renderizado Markdown actuales, expondrá endpoints Astro solo locales para lectura, vista previa y mutaciones, y aplicará validación del grafo completo antes de una transacción de archivos con hashes optimistas, staging, journal y rollback. El árbol administrativo quedará fuera de `src/pages` y del `dist/` público; no se añade base de datos, autenticación, servicio remoto ni dependencia de editor.

## Technical Context

**Language/Version**: TypeScript 5.9.3 sobre Node.js 22.12 o superior

**Primary Dependencies**: Astro 7.3.2, Tailwind CSS 4.1, `@astrojs/markdown-remark` 7.3.1 y `gray-matter` 4.0.3; no se requiere una dependencia nueva para editor, servidor ni carga multipart

**Storage**: Archivos JSON en `src/content/categories`, Markdown y recursos en `src/content/notes`, y estado local recuperable en `.content-admin/`; sin base de datos

**Testing**: Vitest 3.2.7 para dominio, filesystem y endpoints; Playwright 1.63 para recorridos administrativos y regresión pública; `npm run validate:content`, `astro check` y build estático como gates

**Target Platform**: Navegador de escritorio moderno y proceso local Node.js enlazado exclusivamente a IPv4 loopback (`127.0.0.1`)

**Project Type**: Aplicación web Astro local separada dentro del repositorio, junto al sitio Astro estático público existente

**Performance Goals**: Abrir y filtrar el inventario editorial actual en menos de 1 segundo; reflejar una edición en la vista previa dentro de 300 ms después del debounce; completar una mutación ordinaria de contenido en menos de 1 segundo para hasta 1.000 notas y 100 categorías en almacenamiento local

**Constraints**: El administrador solo existe al ejecutar `npm run admin`; nunca se incorpora al `dist/` público; todas las rutas de filesystem se derivan en servidor desde IDs validados; las imágenes se copian byte a byte; ninguna mutación se confirma si falla validación, cambió una revisión o no puede completarse la transacción; operación de una sola persona, sin cuentas ni red remota

**Scale/Scope**: Un responsable editorial, 6 categorías y 13 notas actuales, diseñado con margen para aproximadamente 100 categorías, 1.000 notas, miles de etiquetas derivadas y una carga de imagen por operación; una pantalla principal con explorador, formularios, editor/vista previa y papelera

## Constitution Check

*GATE: Debe aprobarse antes de Fase 0 y volver a comprobarse después del diseño de Fase 1.*

| Gate constitucional | Antes de investigación | Después del diseño |
|---|---|---|
| I. Aprendizaje abierto y reutilizable | PASS — el flujo mantiene las notas versionadas y reduce fricción editorial sin cambiar la experiencia pública | PASS — contratos y modelo solo administran contenido de aprendizaje ya definido |
| II. Descubrimiento por categorías | PASS — categorías, temas y secuencia siguen siendo la estructura obligatoria | PASS — el orden se guarda en el mismo espacio global de posiciones consumido por el sitio |
| III. Contrato de las notas | PASS — título, categoría, duración, Markdown y video conservan el contrato vigente | PASS — `content-files.md` documenta exactamente los campos escritos y no añade metadatos públicos innecesarios |
| IV. Astro, Tailwind y TypeScript; archivos como persistencia | PASS — la interfaz y los endpoints son Astro/TypeScript y escriben JSON/Markdown; no hay base de datos | PASS — la capacidad de escritura se resuelve con endpoints Astro locales, por lo que no se activa la excepción de Express |
| V. Simplicidad y código funcional | PASS — segundo entrypoint Astro, módulos funcionales planos y tipos inmutables; sin framework de editor | PASS — frontend, endpoints y adaptadores de filesystem están separados por límite de ejecución, sin capas o clases preventivas |
| Interfaz, errores y validación | PASS — se prevén foco visible, teclado, errores contextuales y validación en el límite | PASS — el contrato UI define estados accesibles; el API usa `400`, `401`, `404`, `409` y `500` sin filtrar trazas |
| Desarrollo dirigido por especificación | PASS — no se incluyen cuentas, publicación, colaboración, historial propio ni CMS externo | PASS — cada endpoint y transición corresponde a FR-001–FR-027; la transacción técnica no expone historial editorial |

El gate se aprueba sin excepciones. La ejecución local de endpoints es necesaria para acceder al filesystem, pero Astro la resuelve dentro del stack autorizado; no se introduce un backend Express.

## Project Structure

### Documentation (this feature)

```text
specs/007-local-content-admin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── admin-ui.md
│   ├── content-files.md
│   └── local-admin-api.md
└── tasks.md                 # Generado después por $speckit-tasks
```

### Source Code (repository root)

```text
admin/
├── astro.config.ts                    # Entry point local, loopback y salida aislada
├── env.d.ts
└── src/
    ├── components/                    # Explorador, formularios, orden, editor y papelera
    ├── layouts/
    │   └── AdminLayout.astro
    ├── lib/
    │   ├── client/                    # Estado de borrador, toolbar y llamadas tipadas
    │   ├── server/                    # Repositorio, seguridad, transacciones, recursos y trash
    │   └── contracts.ts               # DTOs y resultados compartidos, sin imports de node en cliente
    ├── pages/
    │   ├── index.astro
    │   └── api/                       # Snapshot, preview, CRUD, orden, uploads y papelera
    └── styles/
        └── admin.css

src/
├── content/
│   ├── categories/*.json              # Persistencia activa de categorías y temas
│   └── notes/*/*.md                    # Persistencia activa de notas y assets adyacentes
└── lib/
    ├── validation.ts                   # Reglas puras compartidas por build y administrador
    ├── note-path.ts                    # Convenciones de IDs y rutas
    └── rehype-youtube-embeds.ts        # Renderizado compartido de Markdown

scripts/
├── validate-content.ts
└── verify-public-build.ts              # Prueba ausencia de administración en dist/

.content-admin/                         # Runtime ignorado: staging, journals, uploads y trash

tests/
├── unit/
│   └── admin/                          # Orden, serialización, hashes, paths y rollback
├── integration/
│   └── admin/                          # API contra repositorios fixture temporales
└── e2e/
    ├── admin-content.spec.ts
    ├── admin-accessibility.spec.ts
    └── public-build-isolation.spec.ts
```

**Structure Decision**: Mantener intacto el entrypoint público de la raíz y añadir `admin/` como segundo root Astro que solo se inicia mediante su script dedicado. Las páginas públicas nunca importan el árbol administrativo. Dentro de `admin/src`, los módulos se separan únicamente por el límite necesario: componentes y scripts de navegador, endpoints Astro y funciones de servidor que acceden a archivos. Las reglas de dominio existentes continúan en `src/lib` para que el validador de build y el administrador ejecuten la misma lógica.

## Complexity Tracking

No hay violaciones constitucionales ni excepciones de complejidad justificadas.
