# Phase 0 Research: Categorías y rutas de aprendizaje

## Decisión 1: Colecciones de contenido en tiempo de build

**Decision**: Usar dos Astro Content Collections: categorías cargadas desde `src/content/categories/*.json` y notas desde `src/content/notes/*.md`, ambas con esquemas Zod en `src/content.config.ts`.

**Rationale**: Astro recomienda colecciones de build-time para contenido relativamente estático y ofrece carga con `glob()`, consultas tipadas y validación de esquemas. Esto satisface la fuente versionada, el tipado TypeScript y la publicación automática sin CMS ni base de datos. Referencia: [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/).

**Alternatives considered**:

- Importaciones manuales con `import.meta.glob`: menos validación, peor experiencia de autor y consultas menos expresivas.
- CMS o base de datos: contradice FR-018 y la constitución.
- Live collections: agregan costo de runtime sin necesidad de datos en tiempo real.

## Decisión 2: Una nota siempre es Markdown, con formato discriminado

**Decision**: Cada nota es un archivo `.md` con `format: written | video`. Una nota `written` exige cuerpo Markdown no vacío y prohíbe `youtubeVideoId`; una nota `video` exige un ID válido de YouTube y cuerpo vacío (salvo espacios/comentarios). Ambos formatos comparten id derivado del archivo, título, descripción, categoría, duración y posición.

**Rationale**: Mantiene todas las notas versionadas y cumple el contrato constitucional. La discriminación evita estados ambiguos y permite que el componente de detalle seleccione un único renderer.

**Alternatives considered**:

- Separar videos en JSON: haría que algunas notas no fueran archivos Markdown y dividiría el flujo editorial.
- Permitir Markdown y video simultáneamente: contradice la aclaración y FR-008.
- Guardar URLs completas de YouTube: dificulta normalizar y validar; un `youtubeVideoId` produce de forma segura `https://www.youtube.com/embed/VIDEO_ID`, formato documentado por [YouTube](https://developers.google.com/youtube/player_parameters).

## Decisión 3: Validación en dos niveles que falla la publicación

**Decision**: Combinar esquemas por entrada con una función pura `validateContent(categories, notes)` ejecutada por `npm run validate:content` antes de `check`, `test` y `build`. La función acumula todos los problemas y termina con código distinto de cero cuando detecta campos inválidos, IDs duplicados, categorías inexistentes, posiciones repetidas o incoherencia entre formato y contenido.

**Rationale**: Zod valida cada archivo, pero las invariantes entre colecciones y el cuerpo Markdown requieren una revisión global. Ejecutar el validador como `prebuild` y como gate de CI impide que se publique cualquier subconjunto aparentemente válido y permite corregir todos los errores reportados en una iteración.

**Alternatives considered**:

- Validar al renderizar cada página: puede omitir entradas huérfanas y reporta tarde.
- Ignorar entradas inválidas: contradice FR-019.
- Script con mutaciones/correcciones automáticas: podría alterar contenido editorial; el gate solo informa y bloquea.

## Decisión 4: Rutas jerárquicas prerenderizadas

**Decision**: Usar `/categorias/`, `/categorias/{categoryId}/` y `/categorias/{categoryId}/{noteId}/`. `getStaticPaths()` generará exclusivamente pares válidos. La ruta de categoría redirige a su primera nota si existe o muestra el estado vacío. `404.astro` reconocerá accesos con forma de nota/categoría inválida, los enviará a `/categorias/?notice=invalid-note-context` y la página anunciará una explicación clara.

**Rationale**: La URL contiene la relación requerida, se puede recargar y compartir, y cada nota queda prerenderizada. Astro exige `getStaticPaths()` para parámetros dinámicos en modo SSG, por lo que las relaciones válidas quedan decididas al build. Referencia: [Astro routing, Static SSG Mode](https://docs.astro.build/en/guides/routing/#static-ssg-mode).

**Alternatives considered**:

- Identificar la nota solo por query string: obliga a hidratar y cargar más contenido antes de mostrar la nota correcta.
- Ruta global `/notas/{noteId}`: omite el contexto obligatorio de categoría.
- SSR con catch-all: resolvería cualquier URL en servidor, pero introduce backend sin necesidad.

## Decisión 5: Interactividad con mejora progresiva y sin framework cliente

**Decision**: Renderizar tarjetas y rutas como HTML semántico. Un script TypeScript pequeño filtra tarjetas mediante atributos `data-level`; el listado de notas usa enlaces reales. En móvil, `<details>/<summary>` o un control equivalente accesible expone la misma secuencia. No se añadirá React/Vue/Svelte.

**Rationale**: El contenido y la navegación funcionan con HTML, se minimiza JavaScript y se respeta el principio de simplicidad. El filtro es una transformación local que no justifica una isla con framework.

**Alternatives considered**:

- Componente SPA para toda la ruta: aumenta bundle, estado y superficie de pruebas.
- Filtrado exclusivamente por URL y páginas separadas: añade navegación completa para una interacción inmediata y pequeña.

## Decisión 6: Tailwind CSS 4 mediante el plugin oficial de Vite

**Decision**: Integrar Tailwind CSS 4 con `@tailwindcss/vite`, importar `tailwindcss` en `src/styles/global.css` y cargarlo desde el layout base.

**Rationale**: Es el camino oficial documentado por Astro para versiones modernas y evita la integración antigua `@astrojs/tailwind`. Referencia: [Astro — Add Tailwind 4](https://docs.astro.build/en/guides/styling/#tailwind).

**Alternatives considered**:

- CSS manual sin Tailwind: contradice el stack constitucional.
- `@astrojs/tailwind`: corresponde al flujo de Tailwind 3 y está deprecado para esta decisión.

## Decisión 7: Pruebas por capas

**Decision**: Usar Vitest para reglas puras (validación, orden, selección inicial) y Playwright contra `astro preview` para menú, filtros, deep links, estados vacíos, accesibilidad básica y layouts desktop/móvil. `astro check` y `astro build` completan el gate.

**Rationale**: Astro documenta Vitest como opción Vite-native con TypeScript y Playwright para pruebas end-to-end en navegadores modernos. Referencia: [Astro testing](https://docs.astro.build/en/guides/testing/).

**Alternatives considered**:

- Solo pruebas E2E: diagnósticos más lentos para invariantes de datos.
- Solo unitarias: no verifican routing, responsividad ni interacción real.

## Resolución de incógnitas

No quedan incógnitas técnicas. El stack, persistencia, rutas, esquema, validación, pruebas y estrategia responsive están definidos sin excepciones constitucionales.
