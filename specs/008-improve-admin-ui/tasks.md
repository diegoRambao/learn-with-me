---

description: "Tareas de implementación para renovar la interfaz administrativa con shadcn/ui"
---

# Tasks: Mejora de la interfaz administrativa

**Input**: Documentos de diseño en `/specs/008-improve-admin-ui/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: La especificación exige pruebas funcionales de categorías, temas y notas, WCAG 2.2 AA, responsive, navegadores, aislamiento público y rendimiento relativo. Las tareas de prueba se escriben primero y deben fallar antes de implementar cada historia.

**Organization**: Las tareas se agrupan por historia de usuario para que cada incremento pueda implementarse, probarse y demostrarse de forma independiente.

## Formato: `[ID] [P?] [Story] Descripción`

- **[P]**: Puede ejecutarse en paralelo porque trabaja en archivos distintos y no depende de una tarea incompleta.
- **[Story]**: Historia de usuario a la que pertenece la tarea (`US1`, `US2`, `US3`).
- Todas las descripciones indican rutas exactas.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capturar la referencia anterior a la migración y preparar React, shadcn/ui Base UI y las herramientas de calidad solo para el administrador.

- [ ] T001 Crear el runner reproducible pre/post migración en `scripts/measure-admin-ui.ts` con 5 warmups, al menos 30 muestras por métrica, carga cold, interacciones warm y captura de datos crudos, mediana, p95, bytes JavaScript, requests y long tasks
- [ ] T002 Capturar antes de cambiar el markup `tests/performance/admin-ui-baseline.json` con `sourceRevision` “Commit exacto de la UI anterior”, `capturedAt` “Fecha/hora de captura”, `environment` “Equipo, OS, Node, navegador, viewport, build y fixture”, `warmupRuns` “Exactamente 5 salvo justificación registrada”, `sampleRuns` “Al menos 30 por métrica primaria”, y `metrics` “Una entrada por carga/interacción crítica”; para cada métrica incluir `name` “Identificador estable de escenario”, `unit` “`'ms'`”, `cacheMode` “`'cold' | 'warm'`”, `median`, `p95` y `samples` “Datos crudos para diagnosticar dispersión”
- [ ] T003 Añadir React 19, `@astrojs/react` 6.x, shadcn/ui Base UI, `cn`, `lucide-react`, `@axe-core/playwright` y los scripts de medición/validación requeridos en `package.json` y `package-lock.json`
- [ ] T004 [P] Crear `components.json` con `rsc: false`, TypeScript, Tailwind CSS 4, Base UI explícito, hoja `admin/src/styles/admin.css` y aliases `@admin/*`
- [ ] T005 Integrar `react()` exclusivamente en `admin/astro.config.ts`, conservando host loopback, output aislado, Markdown vigente y aliases de servidor existentes
- [ ] T006 [P] Habilitar JSX React y el alias `@admin/*` sin exponer imports administrativos al sitio público en `tsconfig.json` y `admin/tsconfig.json`
- [ ] T007 [P] Añadir proyectos Chromium, Firefox, WebKit, Chrome stable y Edge stable sin skips por engine, con fixture administrativo reinicializado por proyecto, en `playwright.config.ts` y `tests/e2e/admin-global-setup.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establecer estado, primitives, tokens, overlays y shell accesible compartidos por todas las historias.

**⚠️ CRITICAL**: Ninguna historia puede comenzar hasta completar esta fase.

### Tests for Foundational Infrastructure

- [ ] T008 [P] Escribir pruebas fallidas de transiciones, conservación de contexto, selección válida, borradores, workspace y anuncio en `tests/unit/admin/admin-ui-state.test.ts`
- [ ] T009 [P] Escribir pruebas fallidas que exijan inventario completo, primitive o justificación especializada, estados aplicables, nombre accesible y evidencia por control en `tests/unit/admin/control-inventory.test.ts`
- [ ] T010 [P] Escribir un recorrido fallido del shell con skip link, banner, `main` enfocable, bootstrap loading/ready/failed, reintento y ausencia de errores técnicos en `tests/e2e/admin-ui-foundation.spec.ts`

### Implementation for Foundational Infrastructure

- [ ] T011 [P] Crear `cn` y utilidades UI mínimas, puras y tipadas en `admin/src/lib/utils.ts`
- [ ] T012 Definir `AdminUiState` en `admin/src/lib/client/admin-ui-state.ts` con `bootstrap` “`null` hasta completar la carga; utiliza los DTO existentes sin cambiar su forma”, `phase` “Estado global visible y anunciado”, `activeCategoryId` “Debe resolver dentro del snapshot actual”, `activeNote` “Debe identificar una nota del snapshot o ser `null` para nueva nota”, `workspace` “Una sola región principal activa”, `notePane` “`'editor' | 'preview'`; controlado por tabs/toggle y preservado al entrar/salir de enfoque”, `focusMode` “Oculta navegación no esencial sin perder borrador ni preview”, `filters` “Query, categoría, tema y etiqueta; se normalizan con la función existente”, `draft` “Reutiliza el contrato vigente; nunca se descarta implícitamente”, `orderDraft` “Reutiliza posiciones y revisiones vigentes”, `overlay` “Como máximo un diálogo modal activo” y `announcement` “Último mensaje relevante para live region; no sustituye errores visibles”
- [ ] T013 Implementar reducer y selectores inmutables en `admin/src/lib/client/admin-ui-state.ts` con transiciones `booting -> ready`, `booting -> failed`, `ready -> mutating -> ready`, `ready -> mutating -> failed`, `failed -> booting`; conservar contexto válido, deshabilitar solo acciones duplicables relacionadas durante `mutating`, y hacer que `note`, `order`, `trash` y `empty` cumplan las precondiciones de `WorkspaceMode` descritas en `data-model.md`
- [ ] T014 [P] Implementar la unión `OverlayState` y acciones de apertura/cierre en `admin/src/lib/client/admin-overlays.ts`: `none` sin modal; `categoryForm` y `topicForm` validan antes de cerrar; `unsavedChanges` enfoca inicialmente “Seguir editando”; `destructiveConfirmation` enfoca cancelar y no cierra durante mutación; `markdownInput` cancela sin modificar selección y confirma devolviendo foco; todos conservan título visible, descripción, cierre seguro y trigger lógico
- [ ] T015 [P] Implementar `UiAnnouncement` en `admin/src/lib/client/ui-announcements.ts` con `id` “Cambia para anuncios consecutivos incluso si el texto coincide”, `kind` “`'status' | 'error'`; `status` es no interruptivo; `error` se usa solo para fallo que requiere atención”, `message` “Claro, contextual, sin stack, ruta absoluta ni detalle interno” y `relatedControlId` “Permite llevar foco a la acción correctiva cuando aplica”
- [ ] T016 Crear el inventario ejecutable en `admin/src/lib/client/control-inventory.ts` con `surface` “Explorer, outline, editor, estructura, orden, preview o papelera”, `existingControl` “Nombre funcional, no selector CSS”, `targetPrimitive` “Componente shadcn seleccionado o excepción explícita”, `states` “Incluye cada estado aplicable”, `accessibleName` “Coincide con el texto visible cuando existe”, `exceptionRationale` “Obligatorio si `targetPrimitive` es `specialized`”, y evidencias automáticas/manuales; cubrir `normal`, `hover`, `focus-visible`, `disabled`, `busy`, `success`, `warning`, `error`, `selected`, `expanded`, `empty`, señal no basada solo en color y targets de al menos 24×24 CSS px o excepción válida
- [ ] T017 [P] Generar y adaptar acciones y formularios Base UI en `admin/src/components/ui/button.tsx`, `admin/src/components/ui/button-group.tsx`, `admin/src/components/ui/field.tsx`, `admin/src/components/ui/input.tsx`, `admin/src/components/ui/textarea.tsx` y `admin/src/components/ui/select.tsx`
- [ ] T018 [P] Generar y adaptar feedback y overlays Base UI en `admin/src/components/ui/alert.tsx`, `admin/src/components/ui/badge.tsx`, `admin/src/components/ui/spinner.tsx`, `admin/src/components/ui/skeleton.tsx`, `admin/src/components/ui/empty.tsx`, `admin/src/components/ui/dialog.tsx`, `admin/src/components/ui/alert-dialog.tsx` y `admin/src/components/ui/tooltip.tsx`
- [ ] T019 [P] Generar y adaptar navegación y composición Base UI en `admin/src/components/ui/card.tsx`, `admin/src/components/ui/tabs.tsx`, `admin/src/components/ui/toggle-group.tsx`, `admin/src/components/ui/dropdown-menu.tsx`, `admin/src/components/ui/collapsible.tsx` y `admin/src/components/ui/accordion.tsx`
- [ ] T020 Definir en `admin/src/styles/admin.css` valores claro/oscuro medidos para `background`/`foreground`, `card`/`card-foreground`, `popover`/`popover-foreground`, `primary`/`primary-foreground`, `secondary`/`secondary-foreground`, `muted`/`muted-foreground`, `accent`/`accent-foreground`, `destructive`, `border`, `input`, `ring`, `success` y `warning`; documentar contraste y mantener señal estática equivalente cuando `prefers-reduced-motion: reduce` desactive transiciones
- [ ] T021 [P] Reducir `admin/src/layouts/AdminLayout.astro` al documento y shell no interactivo con metadata, skip link, banner identificable, advertencia persistente de escritura y `main` enfocable
- [ ] T022 Montar un único `AdminWorkspace` con `client:load` y token inicial seguro en `admin/src/components/admin/AdminWorkspace.tsx` y `admin/src/pages/index.astro`, incluyendo bootstrap, estados globales, live regions y reintento sin que scripts imperativos muten DOM propiedad de React

**Checkpoint**: Existe un único árbol React administrativo con estado inmutable, primitives versionadas, tokens semánticos y shell accesible; el API y los archivos de contenido siguen sin cambios.

---

## Phase 3: User Story 1 - Gestionar contenido con una interfaz coherente (Priority: P1) 🎯 MVP

**Goal**: Crear y editar categorías, temas y notas con controles, validación, confirmaciones y estados consistentes sin alterar los contratos funcionales existentes.

**Independent Test**: Crear y editar de principio a fin una categoría, un tema, una nota escrita con imagen y una nota de video; comprobar que controles equivalentes usan la misma primitive/terminología, los errores aparecen junto al campo y en resumen enfocable, el éxito conserva el contexto y los archivos resultantes coinciden con los contratos de 007.

### Tests for User Story 1

- [ ] T023 [P] [US1] Escribir recorridos fallidos de creación/edición de categoría, tema, nota written y nota video por rol/nombre/estado, con éxito visible y contexto conservado, en `tests/e2e/admin-content.spec.ts` y `tests/e2e/admin-structure.spec.ts`
- [ ] T024 [P] [US1] Escribir pruebas fallidas de labels, `aria-invalid`, mensajes correctivos, resumen enfocable, links a controles y conservación de borrador/uploads ante `400`, `409` y `500` en `tests/e2e/admin-form-validation.spec.ts`
- [ ] T025 [P] [US1] Escribir pruebas fallidas de adaptadores de borrador, formato, filtros y respuesta API sin cambiar DTOs, rutas ni schemas en `tests/unit/admin/admin-form-state.test.ts`

### Implementation for User Story 1

- [ ] T026 [P] [US1] Adaptar el cliente tipado vigente a efectos React cancelables y errores accionables, conservando endpoints, DTOs, códigos y token local, en `admin/src/lib/client/admin-api.ts`
- [ ] T027 [P] [US1] Crear el explorador React de categorías con búsqueda, selección programática/no cromática, conteo, colapso, nombres largos y acción de crear en `admin/src/components/admin/ContentExplorer.tsx`
- [ ] T028 [P] [US1] Crear el outline React de temas/notas con selección, filtros, menús nombrados por elemento y estados cero/uno/muchos en `admin/src/components/admin/ContentOutline.tsx`
- [ ] T029 [P] [US1] Crear formularios controlados de categoría/tema en `admin/src/components/admin/StructureDialogs.tsx` usando `Dialog`, Field/Label/Input/Select, validación contextual, resumen enfocable, pending y retorno de foco
- [ ] T030 [US1] Crear el formulario/editor controlado de nota en `admin/src/components/admin/NoteEditor.tsx` con metadata, tags, formato, duración, posición, toolbar, upload staged, confirmación written↔video, dirty tracking y persistencia del borrador entre vistas
- [ ] T031 [P] [US1] Crear preview React en `admin/src/components/admin/NotePreview.tsx` con debounce exacto de 300 ms, actualización manual, última preview válida, estados no intrusivos e iframe con `sandbox` vacío, `referrerpolicy="no-referrer"` y título accesible
- [ ] T032 [US1] Integrar explorer, outline, diálogos, editor y preview en `admin/src/components/admin/AdminWorkspace.tsx`, preservando selección, borradores, paths relativos anunciados y snapshot/revisiones actualizados después de cada guardado

**Checkpoint**: US1 permite administrar categorías, temas y notas con un lenguaje de componentes coherente y se valida independientemente contra los mismos archivos y API de 007.

---

## Phase 4: User Story 2 - Reconocer estados y jerarquía de acciones (Priority: P2)

**Goal**: Hacer inequívocas la acción primaria, las acciones secundarias/destructivas y los estados loading, empty, busy, success, warning y error, incluyendo orden y papelera.

**Independent Test**: Forzar estados normales, vacíos, sin resultados, lentos, exitosos, fallidos y conflictivos; identificar la acción primaria y el estado sin depender del color, comprobar que no hay envíos duplicados y completar mover/restaurar/purgar una nota mediante confirmaciones separadas y explícitas.

### Tests for User Story 2

- [ ] T033 [P] [US2] Escribir pruebas fallidas para loading, vacío, sin resultados, busy, success, warning, error recuperable, retry seguro y jerarquía primaria/secundaria/destructiva en `tests/e2e/admin-states.spec.ts`
- [ ] T034 [P] [US2] Escribir pruebas fallidas de `Dialog`/`AlertDialog`: nombre, fondo inerte, trap Tab/Shift+Tab, Escape, cancelar visible, foco inicial seguro, error que no cierra y retorno al trigger/sucesor en `tests/e2e/admin-dialogs.spec.ts`
- [ ] T035 [P] [US2] Ampliar pruebas fallidas de orden para drag, Subir/Bajar, cambio de tema, posiciones `1..N`, anuncios, foco, guardar/descartar y bloqueo de duplicados en `tests/unit/admin/order-draft.test.ts` y `tests/e2e/admin-structure.spec.ts`
- [ ] T036 [P] [US2] Escribir recorridos fallidos de mover a papelera, restaurar, conflicto y purga con confirmación exacta separada en `tests/e2e/admin-trash.spec.ts`

### Implementation for User Story 2

- [ ] T037 [P] [US2] Implementar presentación reutilizable de loading, empty, status, alert, retry y operación busy con texto/icono además de color en `admin/src/components/admin/AdminWorkspace.tsx`
- [ ] T038 [US2] Completar edición de orden en `admin/src/components/admin/ContentOutline.tsx` con drag opcional, botones “Subir”/“Bajar”, select de tema, anuncios de posición, foco persistente y guardar/descartar solo con borrador
- [ ] T039 [US2] Completar `admin/src/components/admin/StructureDialogs.tsx` con `AlertDialog` para cambios sin guardar, dependencias y acciones destructivas, confirmación fuerte por ID cuando el contrato la exige, cancelar inicialmente enfocado y pending no cancelable protegido
- [ ] T040 [P] [US2] Crear `admin/src/components/admin/TrashPanel.tsx` con empty state, metadatos, restauración no destructiva, conflictos preservados y purga en una segunda confirmación explícita
- [ ] T041 [US2] Integrar orden, estados, reintentos y papelera en `admin/src/components/admin/AdminWorkspace.tsx`, conservando contexto en fallos, evitando envíos duplicados y anunciando resultados sin stack ni rutas absolutas

**Checkpoint**: US2 comunica con claridad estado y riesgo en todos los flujos críticos y separa de forma segura las decisiones destructivas.

---

## Phase 5: User Story 3 - Operar el administrador de forma accesible y adaptable (Priority: P3)

**Goal**: Completar todos los flujos con teclado y tecnologías de asistencia en 768–1440 px y reflow equivalente a 320 CSS px, con WCAG 2.2 AA y evidencia de navegadores objetivo.

**Independent Test**: Crear, editar, buscar, ordenar, eliminar y restaurar categorías, temas y notas solo con teclado; repetir estados críticos a 768, 1024, 1280 y 1440 px, 200% de texto y 400% zoom/reflow; obtener cero violations axe, resolver manualmente todos los `incomplete` y registrar pass para N/N−1 de Chrome, Firefox, Safari y Edge.

### Tests for User Story 3

- [ ] T042 [P] [US3] Escribir scans axe fallidos WCAG A/AA/2.2 para inicial, loading, empty, sin resultados, invalid, success, operation error, menús/filtros abiertos, cada diálogo, orden, preview y papelera en `tests/e2e/admin-accessibility.spec.ts`
- [ ] T043 [P] [US3] Escribir recorridos fallidos solo teclado para crear, editar, buscar, ordenar, eliminar y restaurar categoría, tema y nota, incluidos foco visible/no oculto, names/roles/values, live regions y alternativa completa al drag, en `tests/e2e/admin-keyboard.spec.ts`
- [ ] T044 [P] [US3] Escribir pruebas fallidas a 768/1024/1280/1440 px, texto 200%, reflow 320 CSS px, reduced motion, targets, tema claro/oscuro y fixtures largos/multilingües/cero-uno-muchos en `tests/e2e/admin-layout.spec.ts`
- [ ] T045 [P] [US3] Ejecutar los recorridos críticos sin skips en Chromium, Firefox, WebKit, Chrome stable y Edge stable desde `playwright.config.ts`, aislando el fixture por proyecto y guardando reportes en `test-results/admin-browser-projects/`

### Implementation for User Story 3

- [ ] T046 [US3] Corregir semántica, orden DOM, labels, `disabled`/`expanded`/`selected`/`invalid`/`current`, retorno de foco y announcements en `admin/src/components/admin/AdminWorkspace.tsx`, `admin/src/components/admin/ContentExplorer.tsx`, `admin/src/components/admin/ContentOutline.tsx`, `admin/src/components/admin/NoteEditor.tsx`, `admin/src/components/admin/NotePreview.tsx`, `admin/src/components/admin/StructureDialogs.tsx` y `admin/src/components/admin/TrashPanel.tsx` hasta aprobar T042–T043
- [ ] T047 [US3] Implementar layout sin scroll horizontal global, wrapping/truncado perceptible, overlays con scroll, foco no tapado, targets 24×24 o excepción válida, temas contrastados y señal estática bajo reduced motion en `admin/src/styles/admin.css` hasta aprobar T044
- [ ] T048 [US3] Registrar la aceptación manual en `specs/008-improve-admin-ui/browser-acceptance.json` con `browser` “`'Chrome' | 'Firefox' | 'Safari' | 'Edge'`; navegador real”, `version` “Debe ser N o N−1 estable en la fecha registrada”, `operatingSystem` “Incluye versión; Safari se valida en macOS”, `executedAt` “Evidencia fechada por release”, `criticalFlows` “Categorías, temas, notas y estados compartidos”, `wcagManualChecks` “No se omiten criterios aplicables” y `evidence` “Reportes, trazas o capturas sin datos sensibles”; exigir registros `pass` para las dos versiones estables más recientes de cada navegador
- [ ] T049 [US3] Completar y registrar teclado, contraste, zoom/reflow, target size, reduced motion, VoiceOver+Safari y NVDA+Chrome/Firefox, resolviendo cada resultado `incomplete` de axe, en `specs/008-improve-admin-ui/validation-results.md`

**Checkpoint**: US3 demuestra WCAG 2.2 AA, operación completa sin puntero y adaptación en todos los tamaños y navegadores comprometidos.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Retirar la UI duplicada, cerrar rendimiento/aislamiento, documentar resultados humanos y ejecutar todos los gates de release.

- [ ] T050 [P] Añadir comparación automatizada del candidato contra `tests/performance/admin-ui-baseline.json` en `tests/e2e/admin-performance.spec.ts`, fallando si cualquier `candidate.median` o `candidate.p95` supera `baseline × 1.10` y conservando debounce de 300 ms y presupuestos de dominio menores a 1 segundo
- [ ] T051 [P] Reforzar `scripts/verify-public-build.ts` y `tests/e2e/public-build-isolation.spec.ts` para rechazar rutas/API, React/shadcn administrativo, CSS, strings, iconos o capacidades de `.content-admin` en `dist/` y volver a recorrer homepage, categorías, búsqueda y notas
- [ ] T052 Retirar los componentes Astro reemplazados en `admin/src/components/ContentExplorer.astro`, `admin/src/components/ContentOutline.astro`, `admin/src/components/ImageUpload.astro`, `admin/src/components/MarkdownEditor.astro`, `admin/src/components/NoteForm.astro`, `admin/src/components/NotePreview.astro`, `admin/src/components/OrderEditor.astro`, `admin/src/components/StructureForms.astro` y `admin/src/components/TrashPanel.astro` después de comprobar paridad completa
- [ ] T053 Retirar los controladores DOM obsoletos en `admin/src/lib/client/admin-app.ts`, `admin/src/lib/client/category-panel.ts`, `admin/src/lib/client/markdown-toolbar.ts`, `admin/src/lib/client/structure-app.ts` y `admin/src/lib/client/trash-app.ts`, conservando o trasladando solo funciones puras usadas por React y eliminando selectores legacy de `admin/src/styles/admin.css`
- [ ] T054 [P] Actualizar la guía de uso con los controles coherentes, estados, diálogos, teclado, orden alternativo al drag, papelera, recuperación y límites del runtime en `docs/GUIA_DE_USO.md`
- [ ] T055 Ejecutar un estudio de aceptación y registrar en `specs/008-improve-admin-ui/validation-results.md` los umbrales de SC-001 (≥90% crea/edita nota sin ayuda en <5 min), SC-002 (≥90% identifica acción/estado en <5 s), SC-007 (100% de funciones equivalentes usan el mismo patrón) y SC-008 (≥85% puntúa claridad 4/5 o 5/5)
- [ ] T056 Ejecutar los diez escenarios de `specs/008-improve-admin-ui/quickstart.md` y registrar ambiente, comandos, resultados, incidencias y evidencia reproducible en `specs/008-improve-admin-ui/validation-results.md`
- [ ] T057 Ejecutar `npm run validate:content`, `npm run check`, `npm run test:unit`, `npm run test:admin`, `npm run test:e2e`, `npm run build` y `npm run verify:public-build` desde `package.json`, corrigiendo únicamente regresiones dentro del alcance de esta feature y dejando todos los gates en código 0

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; T001–T002 deben completarse antes de modificar la UI para preservar un baseline válido.
- **Foundational (Phase 2)**: Depende de Setup y bloquea todas las historias.
- **US1 (Phase 3)**: Depende de Foundational; constituye el MVP coherente para crear/editar contenido.
- **US2 (Phase 4)**: Depende de Foundational; puede preparar tests y `TrashPanel` en paralelo con US1, pero la integración final T041 espera T032.
- **US3 (Phase 5)**: Depende de Foundational; sus tests pueden avanzar en paralelo, pero T046 valida los componentes entregados por US1/US2.
- **Polish (Phase 6)**: Depende de todas las historias seleccionadas para release; T052–T053 solo se ejecutan tras demostrar paridad.

### User Story Dependency Graph

```text
Setup → Foundational ─┬→ US1 (MVP: coherencia) ───────────────┐
                     ├→ US2 (estados y acciones) ────────────┼→ Polish + release gates
                     └→ US3 tests (accesibilidad/adaptación) ─┘

US3 remediation consumes the finished US1/US2 surfaces;
US1 and most of US2 remain independently testable after Foundational.
```

### Within Each User Story

- Escribir las pruebas indicadas y confirmar que fallan antes de implementar.
- Implementar estado/funciones puras antes de conectar componentes.
- Completar primitives y composición antes de retirar la UI anterior.
- Ejecutar el Independent Test de la historia antes de avanzar al checkpoint siguiente.
- No cambiar endpoints, schemas, persistencia, seguridad local ni comportamiento público.

### Parallel Opportunities

- T004, T006 y T007 pueden avanzar en paralelo después de capturar T002.
- T008–T010 se escriben en archivos distintos; T014, T015 y T017–T019 también son paralelizables después de sus contratos inmediatos.
- Tras Foundational, los tests de US1, US2 y US3 pueden escribirse en paralelo.
- ContentExplorer, ContentOutline, StructureDialogs y NotePreview de US1 trabajan en archivos separados; NoteEditor e integración respetan sus dependencias.
- TrashPanel de US2 y las suites de accesibilidad/layout de US3 pueden avanzar mientras se completa la integración de US1.
- Rendimiento, aislamiento y documentación de T050, T051 y T054 pueden ejecutarse en paralelo tras completar las superficies funcionales.

---

## Parallel Examples

### User Story 1

```text
Task T027: explorer en admin/src/components/admin/ContentExplorer.tsx
Task T028: outline en admin/src/components/admin/ContentOutline.tsx
Task T029: diálogos estructurales en admin/src/components/admin/StructureDialogs.tsx
Task T031: preview en admin/src/components/admin/NotePreview.tsx
```

### User Story 2

```text
Task T033: estados y jerarquía en tests/e2e/admin-states.spec.ts
Task T034: contrato modal en tests/e2e/admin-dialogs.spec.ts
Task T036: papelera en tests/e2e/admin-trash.spec.ts
Task T040: panel React en admin/src/components/admin/TrashPanel.tsx
```

### User Story 3

```text
Task T042: scans axe en tests/e2e/admin-accessibility.spec.ts
Task T043: teclado en tests/e2e/admin-keyboard.spec.ts
Task T044: responsive/reflow en tests/e2e/admin-layout.spec.ts
Task T045: matriz automática desde playwright.config.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Capturar baseline y completar Setup.
2. Completar Foundational y aprobar sus pruebas.
3. Completar US1 con pruebas primero.
4. Ejecutar el Independent Test de US1 y la regresión de archivos/API de 007.
5. Detenerse para demostrar administración coherente de categoría, tema y nota sin cambiar persistencia.

### Incremental Delivery

1. **Foundation**: React aislado, primitives Base UI, estado, overlays y tokens.
2. **MVP / US1**: creación/edición coherente de categorías, temas y notas.
3. **US2**: jerarquía, estados, orden y decisiones destructivas seguras.
4. **US3**: WCAG 2.2 AA, teclado, responsive/reflow y matriz de navegadores.
5. **Polish**: retirar duplicados, comparar rendimiento, verificar aislamiento y cerrar evidencia humana/manual.

### Team Parallel Strategy

Tras completar Foundational, una persona puede implementar US1 mientras otras preparan las suites de US2 y US3. La integración de US2 espera el workspace de US1; la remediación final de US3 espera todas las superficies, pero sus pruebas y fixtures no.

---

## Notes

- `[P]` significa archivos distintos y ausencia de dependencia sobre una tarea incompleta.
- `[USn]` mantiene trazabilidad directa con las tres historias de `spec.md`.
- Los componentes shadcn generados son código propio versionado y toda actualización se revisa con diff; no se sobrescriben personalizaciones accesibles sin revisión.
- React y shadcn solo pueden importarse desde `admin/`; el root público no registra la integración React.
- Un nodo propiedad de React nunca debe ser creado, reordenado o mutado por un controlador DOM legacy.
- Los tests consultan roles, nombres, estados y efectos en fixtures; no dependen únicamente de clases visuales.
- Axe no certifica por sí solo WCAG: cada `incomplete` y criterio manual aplicable requiere evidencia.
- WebKit no se registra como Safari y Firefox de Playwright no se registra como Firefox branded.
