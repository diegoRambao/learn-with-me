---

description: "Tareas de implementación para categorías y rutas de aprendizaje"
---

# Tasks: Categorías y rutas de aprendizaje

**Input**: Documentos de diseño en `/specs/001-category-learning-notes/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: La especificación exige escenarios de prueba y el plan define Vitest, Playwright, `astro check` y `astro build`; las pruebas se escriben antes de la implementación de cada historia.

**Organization**: Las tareas están agrupadas por historia de usuario para permitir implementación, validación y entrega independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque afecta archivos diferentes y no depende de tareas incompletas.
- **[Story]**: Historia de usuario cubierta (`US1`, `US2`, `US3`).
- Todas las descripciones incluyen rutas exactas.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar el sitio estático y las herramientas del stack aprobado.

- [ ] T001 Crear `package.json` con Astro 7.x, TypeScript 5.x, Tailwind CSS 4 mediante `@tailwindcss/vite`, Vitest y Playwright, scripts base y requisito Node.js LTS 22+ en package.json
- [ ] T002 [P] Configurar salida estática de Astro y el plugin oficial de Tailwind CSS 4 en astro.config.ts
- [ ] T003 [P] Habilitar TypeScript `strict` y aliases usados por el proyecto en tsconfig.json
- [ ] T004 [P] Configurar los proyectos y comandos de pruebas unitarias y E2E en vitest.config.ts y playwright.config.ts
- [ ] T005 [P] Crear el layout HTML compartido, metadatos, navegación base y carga de estilos en src/layouts/BaseLayout.astro
- [ ] T006 [P] Definir tokens visuales, tipografía, foco visible, contraste WCAG 2.2 AA y utilidades Tailwind en src/styles/global.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establecer el contrato de contenido, consultas, validación y gate de publicación que bloquean todas las historias.

**⚠️ CRITICAL**: Ninguna historia puede implementarse hasta completar esta fase.

- [ ] T007 Definir la colección `categories` en src/content.config.ts con estos constraints literales: `id`: "Derivado del nombre del archivo; slug URL-safe, único globalmente"; `name`: "No vacío después de trim; texto visible"; `image`: "Ruta local válida bajo /images/categories/ o URL absoluta https"; `level`: "beginner, intermediate, advanced, pro"
- [ ] T008 Ampliar la colección `notes` en src/content.config.ts con estos constraints literales: `id`: "Derivado del nombre del archivo; slug URL-safe, único globalmente"; `title`: "No vacío; identificador visible en listados"; `description`: "No vacía; resumen contextual de la clase"; `category`: "Debe coincidir con un Category.id existente"; `durationMinutes`: "Mayor que 0; duración estimada de consumo"; `position`: "Mayor que 0; única dentro de su categoría"; `format`: "Exactamente written o video"; `youtubeVideoId`: "Obligatorio y con formato válido solo si format=video; prohibido en written"; `body`: "No vacío solo si format=written; vacío en video"
- [ ] T009 [P] Escribir pruebas unitarias inicialmente fallidas para IDs duplicados, categorías inexistentes, posiciones repetidas, enteros positivos, cuerpo/ID de YouTube mutuamente excluyentes y acumulación de issues en tests/unit/validation.test.ts
- [ ] T010 [P] Crear fixtures para campo ausente, categoría inexistente, posición duplicada, nota escrita inválida y nota de video inválida en tests/fixtures/invalid-content/categories/invalid-category.json y tests/fixtures/invalid-content/notes/invalid-notes.md
- [ ] T011 Implementar tipos inmutables `Category`, `Note`, `LearningRoute`, `CategoryFilter` y `ContentValidationIssue`, las etiquetas centralizadas de nivel y las consultas tipadas de colecciones en src/lib/content.ts
- [ ] T012 Implementar la función pura que retorna todos los issues agrupables y aplica las invariantes relacionales y de formato en src/lib/validation.ts
- [ ] T013 Crear el ejecutor que carga todas las entradas, imprime `sourcePath`, `field`, `code` y mensaje accionable, y termina con código distinto de cero ante cualquier issue en scripts/validate-content.ts
- [ ] T014 Encadenar `validate:content` antes de `check`, `test` y `build` para impedir builds parciales en package.json
- [ ] T015 [P] Crear el fallback visual accesible de categorías en public/category-fallback.svg

**Checkpoint**: Los contratos, consultas y gate de publicación están listos; las historias pueden avanzar en paralelo.

---

## Phase 3: User Story 1 - Descubrir categorías por nivel (Priority: P1) 🎯 MVP

**Goal**: Permitir descubrir desde el menú todas las categorías válidas y filtrarlas por un nivel único.

**Independent Test**: Con categorías de varios niveles, abrir `/categorias/` desde el menú, verificar nombre, imagen/fallback y etiqueta de nivel, aplicar cada filtro y volver a “Todos”; comprobar también catálogo vacío y filtro sin coincidencias.

### Tests for User Story 1

- [ ] T016 [P] [US1] Escribir pruebas Playwright inicialmente fallidas para acceso desde el menú, tarjetas, filtros, `aria-pressed`, conteo anunciado, “Ver todas”, imágenes y estados vacíos en tests/e2e/categories.spec.ts

### Implementation for User Story 1

- [ ] T017 [P] [US1] Implementar el encabezado compartido con enlace visible, estable y operable por teclado a `/categorias/` en src/components/SiteHeader.astro
- [ ] T018 [P] [US1] Implementar tarjeta semántica con nombre, etiqueta de nivel centralizada, dimensiones reservadas y sustitución por fallback conservando el nombre en src/components/CategoryCard.astro
- [ ] T019 [P] [US1] Implementar controles “Todos”, “Principiante”, “Intermedio”, “Avanzado” y “Pro” con `data-level`, `aria-pressed`, filtrado menor a 100 ms, conteo y región `aria-live="polite"` en src/components/CategoryFilters.astro
- [ ] T020 [P] [US1] Implementar estados reutilizables para cero categorías y cero coincidencias, incluido el botón “Ver todas”, en src/components/EmptyState.astro
- [ ] T021 [P] [US1] Crear categorías representativas de los cuatro niveles con IDs slug, nombres e imágenes válidas en src/content/categories/flutter.json, src/content/categories/aws.json, src/content/categories/sdd.json y src/content/categories/dart.json
- [ ] T022 [US1] Construir el catálogo `/categorias/`, omitiendo filtros cuando no haya categorías e integrando tarjetas, filtros, estado vacío y aviso conocido de query string en src/pages/categorias/index.astro
- [ ] T023 [US1] Construir la portada que explica el propósito de aprendizaje y reutilización e integra la navegación compartida hacia categorías en src/pages/index.astro

**Checkpoint**: US1 funciona y puede probarse sin implementar la ruta ni los formatos de nota.

---

## Phase 4: User Story 2 - Recorrer las notas de una categoría (Priority: P2)

**Goal**: Mostrar las notas de una categoría como una secuencia ordenada, abrir la primera automáticamente y navegar conservando el contexto.

**Independent Test**: Con una categoría de tres notas desordenadas en origen, abrir `/categorias/{categoryId}/`, comprobar que conduce a la menor `position`, recorrer todos los enlaces, verificar orden, URL y nota activa en escritorio y móvil, y validar el estado de una categoría sin notas.

### Tests for User Story 2

- [ ] T024 [P] [US2] Escribir pruebas unitarias inicialmente fallidas para filtrado por categoría, orden ascendente por `position`, desempate defensivo por `id`, primera nota y ruta vacía en tests/unit/content-ordering.test.ts
- [ ] T025 [P] [US2] Escribir pruebas Playwright inicialmente fallidas para redirección a la primera nota, navegación completa, `aria-current="page"`, layout lateral, control móvil y categoría sin notas en tests/e2e/learning-route.spec.ts

### Implementation for User Story 2

- [ ] T026 [P] [US2] Implementar constructores de URLs jerárquicas con barra final y selección de pares categoría/nota válidos en src/lib/routes.ts
- [ ] T027 [P] [US2] Implementar la lista ordenada lateral y el control móvil equivalente con enlaces reales, nombre accesible e indicador activo que no dependa solo del color en src/components/CourseNavigation.astro
- [ ] T028 [P] [US2] Añadir tres notas Markdown de la categoría Flutter con posiciones únicas y no ordenadas por archivo para probar el orden derivado en src/content/notes/flutter-intro.md, src/content/notes/flutter-widgets.md y src/content/notes/flutter-state.md
- [ ] T029 [US2] Implementar `getStaticPaths()`, filtrado y orden de notas, redirección a la primera nota y estado sin notas en src/pages/categorias/[categoryId]/index.astro
- [ ] T030 [US2] Implementar `getStaticPaths()` solo para pares válidos y la vista de ruta con metadatos de nota activa y navegación responsive en src/pages/categorias/[categoryId]/[noteId].astro

**Checkpoint**: US2 permite recorrer cada ruta y reconocer la nota activa aun antes de incorporar los renderers finales de US3.

---

## Phase 5: User Story 3 - Consumir notas escritas o en video (Priority: P3)

**Goal**: Renderizar exactamente un formato por nota, soportar deep links válidos y orientar los accesos sin contexto válido.

**Independent Test**: Abrir y recargar una nota escrita y otra de video del mismo curso, verificar metadatos y renderer; abrir una nota sin categoría y un par no relacionado, y confirmar que terminan en `/categorias/` con explicación sin exponer la nota.

### Tests for User Story 3

- [ ] T031 [P] [US3] Ampliar las pruebas Playwright inicialmente fallidas para Markdown completo, iframe de YouTube, metadatos, deep links, par no relacionado, ruta sin categoría y fallos contextuales en tests/e2e/learning-route.spec.ts

### Implementation for User Story 3

- [ ] T032 [P] [US3] Añadir una nota escrita con cuerpo no vacío y una nota de video con cuerpo vacío e ID de YouTube válido en src/content/notes/dart-types.md y src/content/notes/dart-video.md
- [ ] T033 [US3] Implementar el renderer discriminado que siempre muestra título, descripción y duración; para `written` renderiza Markdown en `<article>` y para `video` un iframe responsive con título, `loading="lazy"`, `allowfullscreen`, sin autoplay y URL `youtube.com/embed/{id}` en src/components/NoteContent.astro
- [ ] T034 [US3] Integrar `NoteContent` y mensajes contextuales accionables de fallo sin detalles técnicos, conservando operable la navegación, en src/pages/categorias/[categoryId]/[noteId].astro
- [ ] T035 [US3] Implementar el fallback estático para paths de aprendizaje inválidos con explicación, enlace sin JavaScript y `location.replace('/categorias/?notice=invalid-note-context')` en src/pages/404.astro
- [ ] T036 [US3] Interpretar solo `notice=invalid-note-context`, mostrar el mensaje contractual y permitir descartarlo sin exponer parámetros desconocidos en src/pages/categorias/index.astro

**Checkpoint**: US3 completa ambos formatos y el contrato de URLs válidas e inválidas.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificar calidad, documentación y gates comunes a todas las historias.

- [ ] T037 [P] Documentar el flujo para añadir categorías/notas, las restricciones de formato y la ejecución del gate de publicación en README.md
- [ ] T038 Ejecutar y registrar la matriz manual de escritorio, móvil, teclado, estados resilientes y contenido inválido descrita en specs/001-category-learning-notes/quickstart.md
- [ ] T039 Corregir cualquier fallo hasta que `npm run validate:content`, `npm run check`, `npm run test:unit`, `npm run test:e2e` y `npm run build` terminen con código 0 usando package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; inicia inmediatamente.
- **Foundational (Phase 2)**: Depende de Setup y bloquea todas las historias.
- **US1, US2 y US3 (Phases 3-5)**: Empiezan tras Foundational. Para entrega incremental se ejecutan P1 → P2 → P3.
- **Polish (Phase 6)**: Depende de todas las historias incluidas en la entrega.

### User Story Dependency Graph

```text
Setup → Foundational ─┬→ US1 (P1, MVP)
                     ├→ US2 (P2)
                     └→ US3 (P3)

US2 → US3 para la integración incremental de NoteContent en la página de ruta,
pero US3 se prueba directamente con URLs válidas y fixtures propios.
```

### Within Each User Story

- Escribir las pruebas y confirmar que fallan antes de implementar.
- Preparar contenido/modelos antes de consultas o renderers que los consumen.
- Implementar utilidades antes de páginas que las integran.
- Completar el checkpoint e independent test antes de avanzar de prioridad.

### Parallel Opportunities

- En Setup, T002-T006 trabajan sobre archivos distintos después de T001.
- En Foundational, T009, T010 y T015 pueden avanzar en paralelo; T011 puede comenzar tras los esquemas.
- Después de Foundational, las pruebas iniciales T016, T024-T025 y T031 pueden escribirse en paralelo por historia, evitando editar simultáneamente `tests/e2e/learning-route.spec.ts`.
- En US1, T017-T021 afectan archivos distintos y pueden ejecutarse en paralelo antes de T022-T023.
- En US2, T026-T028 pueden ejecutarse en paralelo antes de integrar las rutas T029-T030.
- En US3, T032 puede ejecutarse en paralelo con la primera versión de T033; T034-T036 se integran después.

---

## Parallel Example: User Story 1

```text
Task T017: Implementar src/components/SiteHeader.astro
Task T018: Implementar src/components/CategoryCard.astro
Task T019: Implementar src/components/CategoryFilters.astro
Task T020: Implementar src/components/EmptyState.astro
Task T021: Crear src/content/categories/*.json
```

## Parallel Example: User Story 2

```text
Task T026: Implementar src/lib/routes.ts
Task T027: Implementar src/components/CourseNavigation.astro
Task T028: Crear las tres notas src/content/notes/flutter-*.md
```

## Parallel Example: User Story 3

```text
Task T032: Crear src/content/notes/dart-types.md y src/content/notes/dart-video.md
Task T033: Implementar src/components/NoteContent.astro tras disponer del contrato de T008
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Setup.
2. Completar Foundational y confirmar el gate de contenido.
3. Escribir la prueba T016 y comprobar que falla.
4. Completar T017-T023.
5. Ejecutar el independent test de US1 y detenerse para validar el MVP.

### Incremental Delivery

1. Setup + Foundational → contrato y publicación segura.
2. US1 → catálogo filtrable y MVP demostrable.
3. US2 → rutas ordenadas con navegación responsive.
4. US3 → consumo escrito/video y deep links resilientes.
5. Polish → documentación, validación manual y gates verdes.

### Parallel Team Strategy

1. El equipo completa Setup y Foundational.
2. Después del gate, se reparten US1, US2 y las pruebas/fixtures de US3 según los conflictos de archivo indicados.
3. Se integra en prioridad P1 → P2 → P3 y se valida cada checkpoint de forma independiente.

---

## Notes

- `[P]` identifica tareas sobre archivos distintos sin dependencia pendiente.
- `[USn]` mantiene trazabilidad con la historia correspondiente.
- No se introduce backend, base de datos, CMS, framework cliente ni estado editorial.
- Las pruebas se escriben primero y deben fallar antes de la implementación.
- Cada contenido válido se publica automáticamente; cualquier issue bloquea toda la publicación.
