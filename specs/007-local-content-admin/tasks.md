---

description: "Tareas de implementación para la administración local de contenido"
---

# Tasks: Administración local de contenido

**Input**: Documentos de diseño en `/specs/007-local-content-admin/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: La especificación y el plan exigen pruebas de dominio, filesystem, API, recorridos administrativos, accesibilidad y aislamiento del build público. Las tareas de prueba se escriben primero y deben fallar antes de implementar cada historia.

**Organization**: Las tareas se agrupan por historia de usuario para que cada incremento pueda implementarse, probarse y demostrarse de forma independiente.

## Formato: `[ID] [P?] [Story] Descripción`

- **[P]**: Puede ejecutarse en paralelo porque trabaja en archivos distintos y no depende de una tarea incompleta.
- **[Story]**: Historia de usuario a la que pertenece la tarea (`US1`, `US2`, `US3`, `US4`).
- Todas las descripciones indican rutas exactas.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar el segundo entrypoint Astro y los comandos de desarrollo y validación sin alterar el sitio público.

- [X] T001 Añadir scripts `admin`, `test:admin` y `verify:public-build` que apunten explícitamente al segundo root Astro en `package.json`
- [X] T002 [P] Crear el entrypoint Astro local con host fijo `127.0.0.1`, salida aislada y aliases compartidos en `admin/astro.config.ts`
- [X] T003 [P] Declarar tipos Astro/Vite y variables públicas seguras del administrador en `admin/env.d.ts`
- [X] T004 [P] Excluir staging, journals, uploads y papelera locales añadiendo `.content-admin/` a `.gitignore`
- [X] T005 [P] Crear helpers de repositorio fixture temporal y limpieza para pruebas administrativas en `tests/helpers/admin-repository.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implementar contratos, lectura segura, validación compartida y transacciones recuperables que bloquean todas las historias.

**⚠️ CRITICAL**: Ninguna historia puede comenzar hasta completar esta fase.

### Tests for Foundational Infrastructure

- [X] T006 [P] Escribir pruebas fallidas para slugs, contención canónica, rechazo de symlinks/traversal y derivación de rutas autorizadas en `tests/unit/admin/safe-paths.test.ts`
- [X] T007 [P] Escribir pruebas fallidas para SHA-256, precondiciones de revisión, serialización mutua, journal, rollback y recuperación tras reinicio en `tests/unit/admin/file-transaction.test.ts`
- [X] T008 [P] Escribir pruebas fallidas de lectura de JSON/frontmatter inválido, preservación de claves no administradas e índice derivado de tags en `tests/unit/admin/content-repository.test.ts`

### Implementation for Foundational Infrastructure

- [X] T009 [P] Definir DTOs inmutables y resultados API sin imports de Node en `admin/src/lib/contracts.ts`, incluyendo EditingDraft `kind` “`'category' | 'topic' | 'note' | 'order'`”, `identity` “Ausente en creación; estable durante edición”, `baseRevision` “`null` al crear; hash leído al editar”, `values` “Copia mutable de los campos editables”, `dirty` “Verdadero cuando difiere del valor cargado”, `fieldIssues` “Mensajes visibles asociados con controles” y `pendingUploads` “Tokens staged aún no confirmados”
- [ ] T010 Ampliar las reglas puras compartidas en `src/lib/validation.ts` con estas restricciones del modelo: Category `id` “slug `[a-z0-9]+(?:-[a-z0-9]+)*`; único global”, `name` y `description` “Obligatorio y no vacío después de trim”, `image` “Ruta no vacía bajo `/images/categories/` o URL HTTPS absoluta”, `level` “`beginner`, `intermediate`, `advanced` o `pro`”, y `topics` “Obligatorio; puede estar vacío”
- [ ] T011 Completar en `src/lib/validation.ts` las restricciones compartidas de Topic y Note: Topic `id` “Slug no vacío y único dentro de la categoría”, `name` “Obligatorio y visible”, `position` “Entero positivo y único en `topics ∪ notes` de la categoría”; Note `title` y `description` “Obligatorio y no vacío”, `tags` “Al menos una etiqueta no vacía”, `category` “Debe resolver a una categoría existente”, `topic` “Si existe, debe resolver dentro de `category`”, y `durationMinutes`/`position` “Entero positivo”
- [ ] T012 Completar en `src/lib/validation.ts` las variantes discriminadas: WrittenNote `body` “Markdown no vacío” y `youtubeVideoId` “No se serializa”; VideoNote `youtubeVideoId` “Exactamente 11 caracteres `[A-Za-z0-9_-]`” y `body` “No puede contener Markdown”
- [X] T013 [P] Implementar IDs slug, raíces permitidas, contención canónica y rechazo de symlinks en `admin/src/lib/server/safe-paths.ts`, aplicando Category `sourcePath` “Ruta relativa autorizada; nunca la envía el cliente como destino”, Topic `categoryId` “Categoría propietaria; no se serializa en JSON”, Note `sourcePath` “Ruta activa exacta; no es un destino controlable por el cliente”, y `folder` “Segmento de carpeta slug. Para nuevas notas coincide con la categoría inicial; en notas existentes se conserva para no romper recursos relativos”
- [X] T014 [P] Implementar hashing y comparación de bytes en `admin/src/lib/server/revisions.ts`, aplicando Category `revision` “SHA-256 de los bytes originales; obligatorio para editar/eliminar” y Note `revision` “SHA-256 de los bytes Markdown originales”
- [X] T015 Implementar carga consistente de categorías, notas, tags e issues parciales en `admin/src/lib/server/content-repository.ts`, respetando Note `id` “Derivado del basename Markdown; slug. En creación se propone desde el título y se confirma antes de guardar”, `format` “`'written' | 'video'`; discriminador del payload”, `status` “`'active'`; los documentos bajo la colección siempre están activos”, Tag `value` “Texto no vacío después de trim” y `usageCount` “Conteo derivado de notas activas”
- [X] T016 Implementar serialización estable de JSON y frontmatter que conserve claves válidas no administradas y archivos ajenos byte a byte en `admin/src/lib/server/content-serialization.ts`
- [ ] T017 Implementar operaciones staged, backups, manifest durable, renames atómicos y rollback en `admin/src/lib/server/file-transaction.ts`, con `transactionId` “ID aleatorio”, `status` “`'prepared' | 'committing' | 'committed' | 'rollingBack'`”, `operations` “Creaciones, reemplazos, moves y eliminaciones autorizadas”, `expectedRevisions` “Preconditions comprobadas justo antes del commit” y `backupPaths` “Copias para rollback bajo `.content-admin/transactions/`”
- [ ] T018 Implementar cola de una sola mutación y recuperación de journals incompletos antes de servir solicitudes en `admin/src/lib/server/mutation-coordinator.ts`
- [ ] T019 [P] Implementar validación de Host/Origin loopback, token CSRF por proceso, content types, respuestas tipadas y ocultación de trazas/rutas absolutas en `admin/src/lib/server/http-guard.ts`
- [ ] T020 Implementar bootstrap con recuperación previa, snapshot, papelera resumida, capacidades y token del proceso en `admin/src/pages/api/bootstrap.ts`
- [ ] T021 [P] Crear layout accesible con landmarks para explorador, formulario, acciones y preview en `admin/src/layouts/AdminLayout.astro`
- [ ] T022 [P] Crear estilos administrativos responsive, foco perceptible, contraste claro/oscuro y estados no dependientes solo de color en `admin/src/styles/admin.css`
- [ ] T023 Integrar el shell inicial, estados de carga/error y montaje de la aplicación en `admin/src/pages/index.astro`

**Checkpoint**: El administrador puede arrancar solo en loopback, recuperar transacciones y leer un snapshot seguro sin mutar contenido.

---

## Phase 3: User Story 1 - Crear una nota desde el administrador (Priority: P1) 🎯 MVP

**Goal**: Crear una nota escrita o de video mediante formulario, tags, editor Markdown, upload sin transformación y preview, confirmando una transacción válida en los archivos públicos.

**Independent Test**: Con una categoría y tema existentes, crear una nota escrita con metadatos, tag, Markdown e imagen; comprobar preview previa, copia byte a byte, archivo válido en la ruta informada y aparición en el build público. Repetir con datos inválidos y verificar cero cambios activos.

### Tests for User Story 1

- [ ] T024 [P] [US1] Escribir pruebas fallidas de toolbar sobre selecciones, estado dirty y validación cliente del borrador de nota en `tests/unit/admin/note-draft.test.ts`
- [ ] T025 [P] [US1] Escribir pruebas fallidas del contrato `POST /api/preview` para written/video, límite de Markdown e HTML sandbox-compatible en `tests/integration/admin/preview-api.test.ts`
- [ ] T026 [P] [US1] Escribir pruebas fallidas del upload PNG/JPEG/WebP/GIF/SVG de máximo 10 MiB, detección por bytes, TTL, hash, colisión y rechazo `413`/`415` en `tests/integration/admin/uploads-api.test.ts`
- [ ] T027 [P] [US1] Escribir pruebas fallidas de creación written/video, destino existente, relación/posición inválida, consumo transaccional de upload y rollback sin efectos parciales en `tests/integration/admin/create-note-api.test.ts`
- [ ] T028 [P] [US1] Escribir recorrido fallido de creación solo con teclado, tags nuevos, toolbar, imagen, preview, errores contextuales y confirmación de paths en `tests/e2e/admin-content.spec.ts`

### Implementation for User Story 1

- [ ] T029 [P] [US1] Implementar el renderer de preview con `@astrojs/markdown-remark`, GFM y el plugin YouTube vigente en `admin/src/lib/server/preview.ts`
- [ ] T030 [US1] Implementar `POST /api/preview` sin escrituras, límite de payload y documento HTML seguro en `admin/src/pages/api/preview.ts`
- [ ] T031 [P] [US1] Implementar staging en `admin/src/lib/server/uploads.ts` con formatos “PNG, JPEG, WebP, GIF y SVG”, límite “10 MiB”, `uploadToken` “ID aleatorio efímero, no una ruta”, `originalName` “Solo informativo; nunca se usa directamente como ruta”, `safeFileName` “Basename normalizado con extensión permitida”, `mediaType` “Debe coincidir con un formato de imagen admitido”, `byteSize` “Positivo y dentro del límite configurado”, `sha256` “Hash de los bytes staged y finales; debe conservarse”, `stagedPath` “Bajo `.content-admin/uploads/`”, `destinationPath` “Bajo `src/content/notes/{folder}/assets/`” y `markdownReference` “`assets/{safeFileName}`”
- [ ] T032 [US1] Implementar `POST /api/uploads` multipart con un solo campo `image`, token opaco y respuestas `201`/`409`/`413`/`415` en `admin/src/pages/api/uploads.ts`
- [ ] T033 [P] [US1] Implementar propuesta de ID, payload discriminado, serialización y snapshot staged para crear notas en `admin/src/lib/server/note-mutations.ts`
- [ ] T034 [US1] Implementar `POST /api/notes` con validación del grafo completo, destino libre, uploads referenciados y transacción atómica en `admin/src/pages/api/notes/index.ts`
- [ ] T035 [P] [US1] Implementar cliente tipado de bootstrap, preview, uploads y creación con manejo de `400`/`401`/`409`/`500` en `admin/src/lib/client/admin-api.ts`
- [ ] T036 [P] [US1] Implementar estado de borrador, dirty tracking, field issues, tags sugeridos/nuevos y confirmación written↔video en `admin/src/lib/client/note-draft.ts`
- [ ] T037 [P] [US1] Implementar comandos accesibles de toolbar que preserven selección y foco para encabezados, énfasis, listas, enlaces, código, imágenes y video en `admin/src/lib/client/markdown-toolbar.ts`
- [ ] T038 [US1] Crear formulario de nota con IDs estables, categoría/tema compatible, tags, formato, duración y posición en `admin/src/components/NoteForm.astro`
- [ ] T039 [P] [US1] Crear textarea etiquetado y toolbar de botones nativos con shortcuts anunciados en `admin/src/components/MarkdownEditor.astro`
- [ ] T040 [P] [US1] Crear selector/upload con nombre, tipo, tamaño, alt, preview local y conservación del resto del formulario ante error en `admin/src/components/ImageUpload.astro`
- [ ] T041 [US1] Crear preview con debounce de 300 ms, actualización manual, última versión válida, estado anunciado e iframe sin scripts/formularios/top-navigation en `admin/src/components/NotePreview.astro`
- [ ] T042 [US1] Conectar creación, validación contextual, resumen enfocable, status de archivo/recurso guardado y recarga de revisiones en `admin/src/pages/index.astro`

**Checkpoint**: US1 crea de extremo a extremo notas válidas sin edición manual y no produce cambios ante errores.

---

## Phase 4: User Story 2 - Administrar la estructura editorial (Priority: P2)

**Goal**: Crear, editar y eliminar con seguridad categorías/temas, y persistir el orden global de temas y notas mediante controles subir/bajar.

**Independent Test**: Crear una categoría con dos temas, editar nombres, mover temas/notas con teclado, guardar posiciones contiguas y comprobar que eliminaciones con dependencias responden conflicto sin cambiar archivos.

### Tests for User Story 2

- [ ] T043 [P] [US2] Escribir pruebas fallidas de contratos CRUD de categoría/tema, IDs estables, revisiones y bloqueos por dependencias en `tests/integration/admin/structure-api.test.ts`
- [ ] T044 [P] [US2] Escribir pruebas fallidas en `tests/unit/admin/order-draft.test.ts` para OrderDraft `categoryId` “Categoría existente”, `items` “Contiene exactamente una vez cada tema y nota activa de la categoría”, `baseRevisions` “Incluye categoría y todas las notas cuya posición pueda cambiar”, secuencia global, movimientos adyacentes, foco lógico, posiciones `1..N` y commit multifichero
- [ ] T045 [P] [US2] Escribir recorrido fallido de creación/edición, bloqueo de borrado y reordenamiento solo con teclado en `tests/e2e/admin-structure.spec.ts`

### Implementation for User Story 2

- [ ] T046 [P] [US2] Implementar creación/edición/borrado de categorías y temas embebidos con revisiones y detección de dependencias en `admin/src/lib/server/structure-mutations.ts`
- [ ] T047 [US2] Implementar `POST /api/categories` y despacho de CRUD con confirmación exacta en `admin/src/pages/api/categories/index.ts`
- [ ] T048 [US2] Implementar `PUT`/`DELETE /api/categories/{categoryId}` preservando ID y temas no editados en `admin/src/pages/api/categories/[categoryId]/index.ts`
- [ ] T049 [US2] Implementar CRUD de `/api/categories/{categoryId}/topics` y bloqueo `topic_has_notes` en `admin/src/pages/api/categories/[categoryId]/topics/[topicId].ts`
- [ ] T050 [P] [US2] Implementar secuencia única topic/note, intercambio adyacente y renumeración contigua en `admin/src/lib/client/order-draft.ts`
- [ ] T051 [US2] Implementar validación de membresía/revisiones y transacción de orden que actualiza JSON/frontmatters afectados en `admin/src/lib/server/order-mutations.ts`
- [ ] T052 [US2] Implementar `POST /api/categories/{categoryId}/order` con paths y revisiones resultantes en `admin/src/pages/api/categories/[categoryId]/order.ts`
- [ ] T053 [P] [US2] Crear formularios de categoría y tema con errores asociados, resumen y confirmaciones accesibles en `admin/src/components/StructureForms.astro`
- [ ] T054 [US2] Crear vista de orden con botones Subir/Bajar, estados disabled, foco persistente, anuncio `aria-live` y guardar/descartar en `admin/src/components/OrderEditor.astro`
- [ ] T055 [US2] Integrar selección, formularios de estructura, orden y conflictos accionables en `admin/src/pages/index.astro`

**Checkpoint**: US2 mantiene la estructura y el orden sin referencias rotas ni posiciones duplicadas.

---

## Phase 5: User Story 3 - Mantener contenido existente (Priority: P3)

**Goal**: Explorar, buscar, editar y proteger contenido existente, advertir borradores sucios y gestionar la papelera recuperable.

**Independent Test**: Buscar una nota existente por título/tag, editar solo tag y cuerpo, simular un cambio externo para obtener `409` sin sobrescritura, moverla a papelera, restaurarla completa y purgarla únicamente tras confirmación separada.

### Tests for User Story 3

- [ ] T056 [P] [US3] Escribir pruebas fallidas de edición preservando campos/ruta, revisión obsoleta, cambio de categoría y archivos ajenos idénticos en `tests/integration/admin/edit-note-api.test.ts`
- [ ] T057 [P] [US3] Escribir pruebas fallidas de trash, renumeración, manifest/revisión, assets compartidos, restore con colisión y purga confirmada en `tests/integration/admin/trash-api.test.ts`
- [ ] T058 [P] [US3] Escribir recorrido fallido de exploración/filtros, cero resultados, contenido inválido y advertencia de cambios sin guardar en `tests/e2e/admin-maintenance.spec.ts`
- [ ] T059 [P] [US3] Escribir recorrido fallido de mover, consultar, restaurar y purgar una nota con foco restaurado y diálogos accesibles en `tests/e2e/admin-trash.spec.ts`

### Implementation for User Story 3

- [ ] T060 [US3] Extender edición transaccional para conservar `id`, `folder`, frontmatter no administrado y detectar revisión externa en `admin/src/lib/server/note-mutations.ts`
- [ ] T061 [US3] Implementar `PUT /api/notes/{folder}/{noteId}` con borrador intacto en conflictos y changed paths exactos en `admin/src/pages/api/notes/[folder]/[noteId]/index.ts`
- [ ] T062 [P] [US3] Implementar filtros combinables por categoría, tema, título y tag conservando contexto y excluyendo trash en `admin/src/lib/client/content-filters.ts`
- [ ] T063 [US3] Crear explorador expandible con búsqueda, vacíos accionables, archivos inválidos visibles y papelera separada en `admin/src/components/ContentExplorer.astro`
- [ ] T064 [P] [US3] Implementar guard de navegación, `beforeunload` y diálogo Seguir editando/Descartar con captura y retorno de foco en `admin/src/lib/client/unsaved-changes.ts`
- [ ] T065 [P] [US3] Implementar bundle en `admin/src/lib/server/trash.ts` con `trashId` “ID opaco único”, `note` “bytes Markdown; copia exacta del documento retirado”, `originalPath` “Ruta relativa autorizada para restaurar”, `originalRevision` “SHA-256 al eliminar”, `deletedAt` “Timestamp ISO-8601”, `assetCopies` “Copias de recursos locales referenciados que puedan recuperarse”, `manifestRevision` “Hash usado para detectar cambios en el bundle”, restore y purga sin eliminar recursos activos compartidos
- [ ] T066 [US3] Implementar mover nota a papelera y renumerar su categoría en `admin/src/pages/api/notes/[folder]/[noteId]/trash.ts`
- [ ] T067 [US3] Implementar `GET /api/trash`, restore por revisión y purge con `confirmTrashId` exacto en `admin/src/pages/api/trash/[trashId].ts`
- [ ] T068 [US3] Crear panel de papelera con resumen, conflicto no destructivo, restauración y confirmación separada de purga en `admin/src/components/TrashPanel.astro`
- [ ] T069 [US3] Integrar carga/edición existente, filtros, archivos inválidos, guard de borrador y papelera en `admin/src/pages/index.astro`

**Checkpoint**: US3 convierte el administrador en el punto único de mantenimiento sin perder cambios ni ocultar contenido inválido.

---

## Phase 6: User Story 4 - Trabajar sin afectar el sitio publicado (Priority: P4)

**Goal**: Demostrar que la administración solo existe en el proceso loopback explícito y que el build público no contiene rutas, assets, strings, dependencias ni escritura administrativa.

**Independent Test**: Usar el administrador en `127.0.0.1`, rechazar Host/Origin/token no válidos, detenerlo, construir el sitio y comprobar que `/admin`, APIs y artefactos administrativos no existen mientras todas las rutas públicas siguen funcionando.

### Tests for User Story 4

- [X] T070 [P] [US4] Escribir pruebas fallidas de Host/Origin/token, ausencia de CORS permisivo y rechazo antes de leer contenido en `tests/integration/admin/local-boundary.test.ts`
- [ ] T071 [P] [US4] Escribir prueba fallida que inspecciona `dist/` y el servidor estático para ausencia de admin/API/runtime y regresión de rutas públicas en `tests/e2e/public-build-isolation.spec.ts`

### Implementation for User Story 4

- [ ] T072 [US4] Aplicar el guard local a todas las rutas administrativas mediante middleware Astro sin exponer el token en artefactos persistentes en `admin/src/middleware.ts`
- [ ] T073 [US4] Implementar inspección determinista de `dist/` para rutas, assets, strings y runtime prohibidos en `scripts/verify-public-build.ts`
- [ ] T074 [US4] Ajustar scripts de build/test para ejecutar aislamiento público sin importar ni compilar `admin/` desde `astro.config.ts`

**Checkpoint**: US4 prueba estructuralmente que la capacidad de escritura nunca forma parte de la entrega pública.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar accesibilidad, rendimiento, documentación y gates completos de la característica.

- [ ] T075 [P] Escribir y estabilizar el recorrido crítico solo con teclado, foco, nombres/estados, errores anunciados y ancho mínimo sin overflow en `tests/e2e/admin-accessibility.spec.ts`
- [ ] T076 [P] Añadir mediciones automatizadas para inventario/filtro menor a 1 s, preview tras debounce de 300 ms y mutación ordinaria menor a 1 s con 1.000 notas/100 categorías en `tests/integration/admin/performance.test.ts`
- [ ] T077 [P] Documentar inicio local, límites de seguridad, recuperación, flujos editoriales y separación entre guardar/publicar en `docs/GUIA_DE_USO.md`
- [ ] T078 Ejecutar los diez escenarios de `specs/007-local-content-admin/quickstart.md` y registrar cualquier ajuste reproducible en `specs/007-local-content-admin/validation-results.md`
- [ ] T079 Ejecutar `npm run validate:content`, `npm run check`, `npm run test:unit`, `npm run test:admin`, `npm run test:e2e`, `npm run build` y `npm run verify:public-build` desde `package.json`, corrigiendo solo fallos dentro del alcance de esta feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; comienza inmediatamente.
- **Foundational (Phase 2)**: Depende de Setup y bloquea todas las historias.
- **US1 (Phase 3)**: Depende de Foundational; constituye el MVP.
- **US2 (Phase 4)**: Depende de Foundational y puede desarrollarse en paralelo con US1 usando contenido fixture/existente.
- **US3 (Phase 5)**: Depende de Foundational; reutiliza mutaciones de nota de US1 para edición, pero sus filtros, guard y papelera pueden adelantarse en paralelo.
- **US4 (Phase 6)**: Depende de Setup y Foundational; su verificación final requiere las rutas implementadas de las historias incluidas.
- **Polish (Phase 7)**: Depende de todas las historias seleccionadas para la entrega.

### User Story Dependency Graph

```text
Setup → Foundational ─┬→ US1 (MVP: crear nota) ─┐
                     ├→ US2 (estructura/orden) ├→ Polish + gates
                     ├→ US3 (mantenimiento) ────┤
                     └→ US4 (aislamiento) ──────┘

US3 edición de nota reutiliza el servicio de mutación construido en US1;
las demás capacidades de US3 pueden implementarse tras Foundational.
```

### Within Each User Story

- Escribir cada prueba indicada y comprobar que falla antes de implementar.
- Implementar funciones puras y adapters de filesystem antes de endpoints.
- Implementar endpoints antes de conectarlos a componentes cliente.
- Completar validación servidor y transacción antes de considerar funcional la UI.
- Ejecutar el Independent Test de la historia antes de avanzar al siguiente checkpoint.

### Parallel Opportunities

- T002–T005 pueden ejecutarse en paralelo después de T001.
- T006–T008 pueden escribirse en paralelo; T013, T014, T019, T021 y T022 trabajan en archivos independientes.
- Tras Foundational, US1, US2, partes independientes de US3 y las pruebas de frontera de US4 pueden avanzar en paralelo.
- En cada historia, todas las tareas de prueba marcadas `[P]` pueden escribirse simultáneamente.
- Los componentes cliente marcados `[P]` pueden implementarse mientras se completan módulos servidor distintos, respetando los contratos de `admin/src/lib/contracts.ts`.

---

## Parallel Examples

### User Story 1

```text
Task T025: contrato de preview en tests/integration/admin/preview-api.test.ts
Task T026: contrato de uploads en tests/integration/admin/uploads-api.test.ts
Task T027: creación transaccional en tests/integration/admin/create-note-api.test.ts
Task T028: recorrido UI en tests/e2e/admin-content.spec.ts
```

### User Story 2

```text
Task T043: CRUD y dependencias en tests/integration/admin/structure-api.test.ts
Task T044: orden puro en tests/unit/admin/order-draft.test.ts
Task T045: recorrido UI en tests/e2e/admin-structure.spec.ts
```

### User Story 3

```text
Task T056: edición/conflictos en tests/integration/admin/edit-note-api.test.ts
Task T057: papelera/restore en tests/integration/admin/trash-api.test.ts
Task T058: búsqueda y cambios sin guardar en tests/e2e/admin-maintenance.spec.ts
Task T059: recorrido de papelera en tests/e2e/admin-trash.spec.ts
```

### User Story 4

```text
Task T070: frontera HTTP local en tests/integration/admin/local-boundary.test.ts
Task T071: aislamiento del build en tests/e2e/public-build-isolation.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Setup.
2. Completar Foundational y sus pruebas de seguridad/transacción.
3. Completar US1 con pruebas primero.
4. Ejecutar el Independent Test de US1 y `npm run validate:content`.
5. Detenerse para demostrar creación de una nota completa sin edición manual.

### Incremental Delivery

1. **Foundation**: arranque loopback, snapshot, validación y transacciones seguras.
2. **MVP / US1**: creación written/video, tags, Markdown, imagen y preview.
3. **US2**: estructura y orden editorial gestionables.
4. **US3**: edición, búsqueda, conflictos, borradores y papelera.
5. **US4**: prueba completa de aislamiento local/público.
6. **Polish**: accesibilidad, rendimiento, documentación y todos los gates.

### Team Parallel Strategy

Tras completar Foundational, equipos separados pueden tomar US1, US2 y US4. El trabajo de US3 sobre filtros, cambios sin guardar y papelera puede comenzar en paralelo; la edición de notas (T060–T061) espera al servicio de mutación de US1 (T033–T034).

---

## Notes

- `[P]` significa archivos distintos y ausencia de dependencia sobre una tarea incompleta.
- `[USn]` mantiene trazabilidad directa con las historias de `spec.md`.
- Los endpoints traducen HTTP a funciones; validación, rutas y transacciones permanecen en módulos funcionales planos.
- Ningún test de filesystem debe tocar contenido real: usar siempre `tests/helpers/admin-repository.ts` y directorios temporales.
- Ningún error cliente muestra stack, excepción ni ruta absoluta.
- Confirmar los paths cambiados y que todos los demás archivos permanecen byte a byte idénticos en cada mutación.
