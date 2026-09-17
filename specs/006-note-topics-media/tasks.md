---

description: "Implementation tasks for topics, Markdown videos, and note sidebar"
---

# Tasks: Temas, videos y panel de notas

**Input**: Design documents from `/specs/006-note-topics-media/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: La especificación define escenarios de prueba obligatorios. Las pruebas de cada historia se escriben primero y deben fallar por la ausencia del comportamiento nuevo antes de implementar esa historia.

**Organization**: Las tareas se agrupan por historia de usuario para permitir implementación, prueba y entrega independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque trabaja en archivos distintos y no depende de otra tarea incompleta.
- **[Story]**: Historia de usuario trazable (`US1`, `US2`, `US3`).
- Cada tarea incluye rutas exactas de archivos o directorios.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar datos de prueba compartidos sin cambiar dependencias ni crear capas nuevas.

- [X] T001 Crear el corpus reutilizable de fixtures en `tests/fixtures/note-topics-media/` con una categoría que tenga dos temas —uno vacío—, notas agrupadas y sin tema con posiciones únicas, y una nota Markdown que cubra URLs YouTube admitidas y rechazadas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Congelar las invariantes públicas existentes antes de modificar modelos, Markdown o layout.

**⚠️ CRITICAL**: Esta regresión debe quedar verde antes de iniciar cualquier historia.

- [X] T002 Extender la línea base de rutas, primera nota y orden anterior/siguiente sin temas en `tests/unit/category-destination.test.ts` y `tests/e2e/learning-route.spec.ts`, conservando todas las direcciones públicas y el recorrido global vigente

**Checkpoint**: Las rutas y la navegación secuencial actuales están protegidas; las historias pueden comenzar.

---

## Phase 3: User Story 1 - Explorar notas agrupadas por temas (Priority: P1) 🎯 MVP

**Goal**: Declarar temas versionados y mostrar temas, notas agrupadas, notas raíz y temas vacíos en un panel ordenado, expandible y accesible sin alterar el recorrido global.

**Independent Test**: Con una categoría que contenga dos temas, notas asignadas, una nota sin tema y un tema vacío, verificar nivel y orden, expandir/contraer cada tema, mostrar exactamente `No hay notas`, abrir cualquier nota y confirmar `aria-current="page"` y el orden anterior/siguiente existente.

### Tests for User Story 1

> Escribir estas pruebas primero y comprobar que fallan por el comportamiento aún no implementado.

- [X] T003 [P] [US1] Añadir pruebas del contrato editorial para IDs/nombres/posiciones de tema, referencia opcional de nota, tema inexistente o de otra categoría, IDs duplicados y conflictos de posición tema-nota en `tests/unit/validation.test.ts`
- [X] T004 [P] [US1] Añadir pruebas de `NavigationTopic`, `NavigationItem` y `LearningRoute` para raíz agrupada, tema vacío, notas hijas, nota sin tema y secuencia plana inmutable en `tests/unit/content-ordering.test.ts`
- [X] T005 [P] [US1] Crear pruebas E2E de orden global, disclosures por teclado, apertura inicial del tema activo, múltiples temas abiertos, mensaje `No hay notas`, selección de nota y estado activo en `tests/e2e/note-topics-sidebar.spec.ts`

### Implementation for User Story 1

- [X] T006 [P] [US1] Extender los esquemas Astro en `src/content.config.ts`: `topics` admite `[]`; cada tema exige `id` “obligatorio, slug URL-safe no vacío y único entre los temas de la categoría”, `name` “obligatorio, visible y no vacío después de trim” y `position` “entero positivo y único en la unión de temas y notas de la categoría”; ambas variantes de nota admiten un único `topic` slug opcional
- [X] T007 [US1] Extender `CategoryInput`, `NoteInput` y la validación relacional en `src/lib/validation.ts` para exigir IDs de tema únicos por categoría, resolver `note.topic` solo en `note.category` y bloquear toda posición repetida en `topics ∪ notes`, emitiendo issues accionables que identifiquen ambos elementos y fuentes en conflicto
- [X] T008 [US1] Cargar y transmitir explícitamente `topics` desde cada categoría y `topic` desde cada nota en `scripts/validate-content.ts`, sin perder temas vacíos ni corregir relaciones silenciosamente
- [X] T009 [P] [US1] Añadir los tipos inmutables `NavigationTopic`, `TopicNavigationItem`, `UngroupedNoteNavigationItem` y la referencia `Note.topic?: string` en `src/lib/content.ts`, y proyectar `navigationItems` ordenados manteniendo `LearningRoute.notes`, `activeNote`, `previousNote` y `nextNote` como la secuencia plana vigente
- [X] T010 [US1] Migrar el corpus publicado en `src/content/categories/*.json` y `src/content/notes/*/*.md` para declarar `topics` —incluido `[]` donde aplique— y asignaciones opcionales, renumerando solo lo necesario para que temas y notas compartan posiciones únicas sin cambiar el orden relativo ni las rutas existentes
- [X] T011 [US1] Pasar `route.navigationItems` y `route.activeTopicId` al panel desde `src/pages/categorias/[categoryId]/[noteId].astro` sin modificar la resolución de la nota inicial ni los destinos anterior/siguiente
- [X] T012 [US1] Reemplazar el listado plano por raíz mixta y disclosures nativos `<details>/<summary>` en `src/components/CourseNavigation.astro`, sin numerar los temas, numerando localmente las notas hijas, conservando la posición global visible en notas sin tema, mostrando `aria-current="page"`, solo el tema activo abierto inicialmente y exactamente `No hay notas` para un tema vacío
- [X] T013 [US1] Ejecutar las pruebas de `tests/unit/validation.test.ts`, `tests/unit/content-ordering.test.ts`, `tests/unit/category-destination.test.ts`, `tests/e2e/note-topics-sidebar.spec.ts` y `tests/e2e/learning-route.spec.ts`, y corregir únicamente archivos de US1 hasta que el incremento sea independiente y verde

**Checkpoint**: La navegación agrupada es funcional, accesible y publicable como MVP; rutas y anterior/siguiente permanecen intactos.

---

## Phase 4: User Story 2 - Reproducir videos incluidos en Markdown (Priority: P2)

**Goal**: Convertir URLs desnudas compatibles de videos individuales de YouTube en reproductores complementarios adaptables con fallback seguro, sin afectar enlaces ordinarios ni notas de video principal.

**Independent Test**: En una nota escrita con texto antes/después, formatos `watch`, `youtu.be`, `shorts` y `embed`, videos consecutivos y destinos incompatibles, verificar que solo los bloques válidos se convierten en iframes 16:9 en su posición original y que el resto continúa como enlace o contenido legible.

### Tests for User Story 2

> Escribir estas pruebas primero y comprobar que fallan por el transformador aún ausente.

- [X] T014 [P] [US2] Crear pruebas del procesador Markdown real para HTTP(S) `watch`, `youtu.be`, `shorts`, `embed`, bloques consecutivos, canonicalización HTTPS y atributos seguros, además de párrafos, enlaces etiquetados, listas, citas, canales, perfiles, playlists, `list`, hosts engañosos, IDs inválidos y rutas extra en `tests/unit/rehype-youtube-embeds.test.ts`
- [X] T015 [P] [US2] Extender las pruebas E2E con markup de contrato para orden, fallback permanente, proporción 16:9, ancho contenido y ausencia de overflow a 320 px y escritorio, preservando el reproductor principal vigente, en `tests/e2e/note-content.spec.ts`

### Implementation for User Story 2

- [X] T016 [US2] Implementar en `src/lib/rehype-youtube-embeds.ts` un transformador funcional que solo acepte un párrafo raíz con un único enlace cuyo texto sea el `href`, protocolo HTTP(S), host/ruta permitidos e ID `[A-Za-z0-9_-]{11}`, rechace `list` y construya nodos HAST con iframe `youtube-nocookie.com` y fallback `youtube.com/watch` HTTPS sin interpolar HTML fuente
- [X] T017 [US2] Registrar el plugin en `astro.config.ts` mediante `unified({ gfm: true, rehypePlugins: [...] })`, manteniendo el procesador y comportamiento GFM actuales
- [X] T018 [P] [US2] Añadir en `src/styles/global.css` el bloque de video complementario con `max-width: 100%`, marco `aspect-ratio: 16 / 9`, iframe al 100%, borde/radio/tokens actuales y fallback legible sin overflow
- [X] T019 [US2] Ejecutar `tests/unit/rehype-youtube-embeds.test.ts` y `tests/e2e/note-content.spec.ts`, además de la regresión de notas `format: video`, y corregir únicamente archivos de US2 hasta que el incremento sea independiente y verde

**Checkpoint**: Las notas escritas reproducen videos complementarios válidos y degradan a enlaces seguros sin depender de JavaScript del navegador.

---

## Phase 5: User Story 3 - Ocultar y recuperar el panel lateral (Priority: P3)

**Goal**: Ocultar y mostrar el panel en escritorio y móvil, liberar el ancho de lectura y conservar durante la visita su visibilidad, temas abiertos y desplazamiento.

**Independent Test**: Expandir varios temas, seleccionar una nota, desplazar el panel, ocultarlo y mostrarlo; verificar que el contenido cambia de ancho, el toggle permanece accesible y conserva foco/estado, y que temas, nota activa y scroll sobreviven a la navegación dentro de la categoría.

### Tests for User Story 3

> Escribir estas pruebas primero y comprobar que fallan por el estado/toggle aún no implementados.

- [X] T020 [P] [US3] Crear pruebas unitarias para parseo, saneamiento y transición inmutable de `SidebarVisitState` —`visible` booleano, IDs conocidos sin duplicados y `navigationScrollTop` finito no negativo— incluyendo estado ausente, corrupto y tema activo añadido sin cerrar otros, en `tests/unit/sidebar-state.test.ts`
- [X] T021 [P] [US3] Ampliar `tests/e2e/note-topics-sidebar.spec.ts` con toggle por teclado, `aria-controls`, `aria-expanded`, foco retenido, cambio de ancho, persistencia por categoría, scroll restaurado, navegación que abre el tema destino, almacenamiento no disponible/corrupto y viewport de 320 px sin overflow

### Implementation for User Story 3

- [X] T022 [US3] Implementar funciones puras de defaults, validación, restauración y transición del registro versionado por categoría `{ visible, expandedTopicIds, navigationScrollTop }` en `src/lib/sidebar-state.ts`, ignorando IDs desconocidos/duplicados y usando `0` ante scroll no finito o negativo
- [X] T023 [P] [US3] Añadir a `src/components/CourseNavigation.astro` la persistencia tolerante a errores de temas abiertos y `scrollTop` en `sessionStorage`, restaurando el conjunto previo y agregando `activeTopicId` sin contraer los demás; si el almacenamiento falla, conservar el HTML inicial usable
- [X] T024 [P] [US3] Añadir fuera del aside el botón nativo `Ocultar panel`/`Mostrar panel`, `aria-controls="course-navigation-panel"`, `aria-expanded`, el `<aside>` identificado y el estado de workspace en `src/pages/categorias/[categoryId]/[noteId].astro`, manteniendo foco, nota activa y tamaño fijo de 19rem al restaurar
- [X] T025 [P] [US3] Implementar en `src/styles/global.css` el layout visible de dos columnas, el estado oculto de una columna y el panel móvil en flujo —sin overlay ni focus trap— reutilizando tokens y garantizando controles/contenido alcanzables desde 320 px
- [X] T026 [US3] Ejecutar `tests/unit/sidebar-state.test.ts`, `tests/e2e/note-topics-sidebar.spec.ts` y la matriz Playwright desktop/mobile/reduced-motion, corrigiendo únicamente archivos de US3 hasta que visibilidad, expansión y scroll sean estables durante la visita

**Checkpoint**: Las tres historias funcionan y pueden demostrarse de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentación editorial, regresión integral y validación de resultados medibles.

- [X] T027 [P] Documentar la sintaxis de `topics`, `topic`, posición global y URLs YouTube independientes en `README.md`, enlazando los contratos de `specs/006-note-topics-media/contracts/`
- [X] T028 Ejecutar los gates completos definidos en `package.json` —`npm run validate:content`, `npm run check`, `npm run test:unit`, `npm run test:e2e` y `npm run build`— y resolver regresiones dentro de los archivos enumerados en `specs/006-note-topics-media/plan.md`
- [ ] T029 [P] Realizar la revisión visual comparativa claro/oscuro y la medición manual de SC-003, SC-006 y SC-008, registrando participantes, viewport, tiempos y resultados reales —sin inventarlos— en `specs/006-note-topics-media/validation-results.md`
- [X] T030 Ejecutar todos los escenarios de `specs/006-note-topics-media/quickstart.md` y registrar el resultado final, incluidos fallos externos de YouTube, storage corrupto y compatibilidad de rutas, en `specs/006-note-topics-media/validation-results.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; crea fixtures compartidos.
- **Foundational (Phase 2)**: Depende de T001 y congela regresiones públicas antes de tocar implementación.
- **User Story 1 (Phase 3)**: Depende de Setup y Foundational; es el MVP y habilita la estructura de temas usada por US3.
- **User Story 2 (Phase 4)**: Depende solo de Setup y Foundational; puede desarrollarse en paralelo con US1 porque actúa sobre el pipeline Markdown.
- **User Story 3 (Phase 5)**: Depende de US1 porque persiste los disclosures y controla el panel agrupado.
- **Polish (Phase 6)**: Depende de todas las historias incluidas en la entrega.

### User Story Dependency Graph

```text
Setup → Foundational → US1 (P1/MVP) → US3 (P3)
                   └→ US2 (P2)

US1 + US2 + US3 → Polish
```

### Within Each User Story

- Escribir las pruebas de contrato/unitarias/E2E y confirmar el fallo esperado.
- Implementar modelos y funciones puras antes de integrarlos con componentes o configuración.
- Integrar contenido/layout después de que los contratos estén tipados y validados.
- Ejecutar la selección de pruebas de la historia y alcanzar su checkpoint antes de cerrarla.

### Parallel Opportunities

- T003, T004 y T005 pueden escribirse en paralelo después de T002.
- T006 y T009 pueden implementarse en paralelo porque modifican schema y dominio por separado.
- T014 y T015 pueden escribirse en paralelo; T018 puede avanzar en paralelo con T016 una vez fijado el markup del contrato.
- US2 completo puede ejecutarse en paralelo con US1 después de Foundational.
- T020 y T021 pueden escribirse en paralelo; después de T022, T023, T024 y T025 trabajan en archivos distintos.
- T027 y T029 pueden ejecutarse en paralelo después de completar las historias.

---

## Parallel Example: User Story 1

```text
Task: "Añadir validación editorial en tests/unit/validation.test.ts"
Task: "Añadir proyección agrupada en tests/unit/content-ordering.test.ts"
Task: "Crear recorrido del panel en tests/e2e/note-topics-sidebar.spec.ts"
```

## Parallel Example: User Story 2

```text
Task: "Probar el transformador Markdown en tests/unit/rehype-youtube-embeds.test.ts"
Task: "Probar responsive/fallback en tests/e2e/note-content.spec.ts"
```

## Parallel Example: User Story 3

```text
Task: "Probar SidebarVisitState en tests/unit/sidebar-state.test.ts"
Task: "Probar toggle y persistencia en tests/e2e/note-topics-sidebar.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar T001–T002 para fixtures y protección de regresiones.
2. Completar T003–T013 para el panel agrupado.
3. Detenerse y ejecutar el Independent Test de US1.
4. Publicar/demostrar el MVP si el checkpoint está verde.

### Incremental Delivery

1. Setup + Foundational → comportamiento público protegido.
2. US1 → temas y navegación agrupada → validar/demostrar MVP.
3. US2 → videos complementarios Markdown → validar sin depender de US3.
4. US3 → panel ocultable y estado de visita → validar sobre US1.
5. Polish → gates, quickstart, revisión visual y métricas reales.

### Parallel Team Strategy

1. El equipo completa Setup y Foundational.
2. Después, una persona implementa US1 mientras otra implementa US2.
3. US3 comienza cuando la estructura de US1 está estable.
4. Las revisiones de documentación/métricas avanzan en paralelo antes del gate final.

## Notes

- `[P]` significa archivos distintos y ausencia de dependencia incompleta, no solo “trabajo pequeño”.
- `[US1]`, `[US2]` y `[US3]` permiten rastrear cada cambio a una historia entregable.
- No añadir backend, base de datos, framework cliente, editor, redimensionamiento, cuentas, comentarios, playlists ni proveedores de video adicionales.
- Mantener funciones/datos inmutables, `camelCase` para funciones/variables y `PascalCase` para tipos.
- No declarar una prueba completa hasta haber observado primero su fallo esperado y después su aprobación.
