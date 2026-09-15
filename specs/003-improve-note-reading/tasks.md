---

description: "Implementation tasks for improved note reading and sequential navigation"
---

# Tasks: Lectura mejorada y navegación entre notas

**Input**: Design documents from `/specs/003-improve-note-reading/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/note-detail-ui.md`, `quickstart.md`

**Tests**: Automated tests are required by the specification and quickstart. Write each story's tests first and confirm they fail for the intended reason before implementation.

**Organization**: Tasks are grouped by user story so reading, copying, links, and sequential navigation can each be implemented and validated as an independently useful increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes a different file and does not depend on an incomplete task
- **[Story]**: User story traced from `spec.md`
- Every task names the exact file it changes or validates

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align the repository runtime contract with the Astro version already selected by the design.

- [X] T001 Change the Node.js engine requirement from `>=22` to `>=22.12.0` in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared Markdown scope used by the reading, copy, and link stories without changing note sources.

**⚠️ CRITICAL**: Complete this phase before User Stories 1–3; User Story 4 may proceed after Phase 1 because it does not depend on the Markdown scope.

- [X] T002 Replace the generic `prose` class with the feature-specific `note-prose` scope on the written-note body while preserving the existing written/video branches and fallback in src/components/NoteContent.astro

**Checkpoint**: Written Markdown has an isolated styling and enhancement boundary, and no file under `src/content/notes/` has changed.

---

## Phase 3: User Story 1 - Leer Markdown con una jerarquía clara (Priority: P1) 🎯 MVP

**Goal**: Make generated Markdown readable and structurally clear at desktop and 320 px while confining long-line overflow to each code block.

**Independent Test**: Open representative written notes containing headings, paragraphs, nested ordered/unordered lists, horizontal rules, inline code, and code blocks; inject a semantic blockquote and guaranteed long code line in the test-only DOM; verify hierarchy, visible markers, incremental indentation, compact code, preserved text, local code scrolling, and no page-level horizontal overflow at 320 px.

### Tests for User Story 1

- [X] T003 [US1] Expand Playwright coverage for Markdown hierarchy, nested-list markers and indentation, test-only blockquote markup, inline versus block code, exact preformatted text, compact code-block sizing, local long-line overflow, and `document.scrollWidth <= document.clientWidth` at 320 px in tests/e2e/note-content.spec.ts

### Implementation for User Story 1

- [X] T004 [US1] Add token-based responsive `note-prose` rules in src/styles/global.css satisfying the data-model contracts verbatim: headings use “Jerarquía distinguible por tamaño, peso, espacio y separación, no solo tamaño”; `ul` / `ol` use “Marcadores visibles y sangría lógica incremental por nivel”; `blockquote` / `hr` use “Separación y forma propias usando tokens existentes”; inline code is “Diferente del texto sin confundirse con un bloque”; and `pre > code` uses “Espacios y saltos preservados; overflow horizontal local; control copiable asociado”

**Checkpoint**: User Story 1 is independently functional and its focused Playwright tests pass on wide and 320 px viewports.

---

## Phase 4: User Story 2 - Copiar un bloque de código (Priority: P2)

**Goal**: Give every code block an accessible, independent copy action with exact payload, success feedback, and useful non-technical failure recovery.

**Independent Test**: On a real note with at least two code blocks, activate each native button by keyboard, compare the clipboard payload to its associated `code.textContent`, observe feedback only for that block, and simulate missing/rejected Clipboard support to verify the intact code becomes selected for manual copying.

### Tests for User Story 2

- [X] T005 [US2] Add Playwright tests for one native accessible copy button per `pre > code`, keyboard focus and activation, exact independent `code.textContent` payloads, block-local visible and `aria-live="polite"` success feedback, missing/rejected Clipboard handling, intact code, and manual-selection fallback in tests/e2e/note-content.spec.ts

### Implementation for User Story 2

- [X] T006 [US2] Add a deduplicated framework-free TypeScript enhancement in src/components/NoteContent.astro that wraps each `pre > code` once and enforces the data-model rules verbatim: “Cada bloque mantiene su propio control, mensaje y temporizador”; “El payload es exactamente `code.textContent`; no contiene texto de botones, lenguaje, números de línea ni decoración”; “Ninguna transición modifica el nodo `<code>` ni el archivo Markdown”; and “Los fallos técnicos no se imprimen en la interfaz”
- [X] T007 [US2] Implement the copy-state presentation in src/styles/global.css with the data-model outcomes verbatim: `idle` has “Acción identificada como copiar el bloque; sin anuncio pendiente”; `copied` has “Confirmación breve asociada al bloque y anunciada de forma `polite`”; and `error` has “Mensaje no técnico, código intacto y texto del bloque seleccionado para copia manual”, while retaining native visible focus and readable selection in both themes

**Checkpoint**: User Story 2 copies multiple blocks exactly and degrades to a clear manual-selection flow when Clipboard access fails.

---

## Phase 5: User Story 3 - Reconocer y abrir enlaces (Priority: P2)

**Goal**: Make every Markdown link unmistakably interactive without changing its destination, opening behavior, palette, or theme system.

**Independent Test**: Inspect external links from real notes plus a test-only internal link inside `note-prose` in light and dark themes; verify the original `href`, palette accent, permanent underline, pointer state, keyboard focus, and absence of page overflow.

### Tests for User Story 3

- [X] T008 [US3] Add Playwright coverage for real external and test-only internal Markdown links, unchanged `href` values and opening behavior, permanent underline, existing-palette accent, perceptible hover/focus, visible keyboard focus, and readable light/dark rendering in tests/e2e/note-content.spec.ts

### Implementation for User Story 3

- [X] T009 [US3] Add scoped link styling in src/styles/global.css satisfying the data-model contract verbatim: “Color de acento, subrayado permanente y estados hover/focus perceptibles en claro y oscuro”, while preserving the global focus treatment and existing destinations

**Checkpoint**: User Story 3 is independently testable in both themes and changes presentation only inside the note body.

---

## Phase 6: User Story 4 - Continuar por notas relacionadas (Priority: P3)

**Goal**: Show ordinary previous/next links after written and video notes, derived from the active category's canonical ordered learning route.

**Independent Test**: Open the first, middle, and last Dart notes and render the navigation component with a single-note route; verify only real neighbors appear, in Anterior/Siguiente DOM order, with full titles, canonical same-category URLs, keyboard operation, and no horizontal overflow at 320 px.

### Tests and Test Infrastructure for User Story 4

- [X] T010 [US4] Configure Vitest with Astro `getViteConfig` while retaining the Node test environment, unit include pattern, and coverage reporters in vitest.config.ts
- [X] T011 [P] [US4] Extend route unit tests for category isolation, `position` then `id` ordering, first/middle/last neighbors, one-note/empty/invalid-active null neighbors, discontinuous positions, video neighbors, tie-breaking, and input immutability in tests/unit/content-ordering.test.ts
- [X] T012 [P] [US4] Create failing Astro Container contract tests for zero, previous-only, next-only, and two-link output; landmark omission; Anterior/Siguiente DOM order; complete titles; and canonical same-category URLs in tests/unit/note-navigation.test.ts
- [X] T013 [P] [US4] Extend Playwright coverage over the Dart written–video–written sequence for correct first/middle/last links, full labels and titles, same-category navigation, keyboard activation, and 320 px overflow behavior in tests/e2e/learning-route.spec.ts

### Implementation for User Story 4

- [X] T014 [US4] Extend `LearningRoute` and `createLearningRoute` in src/lib/content.ts with the data-model constraints verbatim: `category` is “Categoría seleccionada”; `notes` contains “Solo notas cuyo `category` coincide, ordenadas por `position` y luego `id`”; `activeNote` is “Nota solicitada dentro del recorrido; primera nota cuando no se especifica ID; `null` si no existe”; `previousNote` is “Elemento inmediatamente anterior a `activeNote` en `notes`; `null` en el inicio o sin activa”; and `nextNote` is “Elemento inmediatamente posterior a `activeNote` en `notes`; `null` al final o sin activa”, without mutating the input array or using `position ± 1`
- [X] T015 [US4] Create src/components/NoteNavigation.astro with the presentation-model rules verbatim: `category` “Proporciona el segmento canónico de URL”; `previousNote`, “Si existe, genera un único destino “Anterior””; and `nextNote`, “Si existe, genera un único destino “Siguiente””; omit the landmark when both neighbors are null, render at most one `<nav aria-label="Navegación entre notas">` in Anterior/Siguiente DOM order, use `noteUrl(category.id, note.id)`, and show each direction plus the full destination title
- [X] T016 [US4] Render `NoteNavigation.astro` after `NoteContent` for both written and video notes and pass the route's category and neighbor values in src/pages/categorias/[categoryId]/[noteId].astro
- [X] T017 [US4] Add token-based responsive styles for the sequential-navigation landmark, logical previous/next placement, wrapped full titles, visible focus, and stacked or reflowed 320 px layout without horizontal overflow in src/styles/global.css

**Checkpoint**: User Story 4 works without JavaScript for written and video notes, and component, route, and browser tests all pass independently.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify all stories together against the specification, regression suite, static-output constraint, and project constitution.

- [X] T018 [P] Update implementation-facing validation notes only if command behavior or verified expectations differ from the documented workflow in specs/003-improve-note-reading/quickstart.md
- [ ] T019 Run `npm run validate:content`, `npm run check`, `npm run test:unit`, `npm run test:e2e`, and `npm run build`; confirm all exit 0, written and video pages exist in `dist/`, and record any necessary corrections in specs/003-improve-note-reading/quickstart.md
- [ ] T020 Perform the five manual desktop/320 px, light/dark, keyboard, success/failure, and written–video–written scenarios plus the final constitutional review in specs/003-improve-note-reading/quickstart.md, confirming no files under src/content/notes/ changed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start with T001.
- **Foundational (Phase 2)**: T002 depends on T001 and blocks User Stories 1–3.
- **User Story 1 (Phase 3)**: T003 must be written and fail before T004; this is the suggested MVP.
- **User Story 2 (Phase 4)**: Depends on T002. T005 must fail before T006, then T007 completes the presentation. It does not require User Story 1 behavior, though implementing in priority order avoids conflicts in shared files.
- **User Story 3 (Phase 5)**: Depends on T002. T008 must fail before T009. It does not require User Stories 1 or 2 behavior, though all three edit shared files.
- **User Story 4 (Phase 6)**: Depends only on T001. T010 precedes T012; T011–T013 must fail for their intended assertions before T014–T017 are implemented.
- **Polish (Phase 7)**: T018 may start after the desired stories stabilize; T019 and T020 require all selected story phases to be complete.

### User Story Dependency Graph

```text
T001 Setup
├── T002 Shared note-prose scope
│   ├── US1 (T003 → T004)
│   ├── US2 (T005 → T006 → T007)
│   └── US3 (T008 → T009)
└── US4 (T010 → T011/T012/T013 → T014 → T015 → T016 → T017)

US1 + US2 + US3 + US4 → Polish (T018 → T019 → T020)
```

### Within Each User Story

- Add the focused tests first and confirm they fail for the missing behavior, not for environment or fixture problems.
- Implement the smallest model or presentation change that satisfies that story.
- Run the story's focused test command at its checkpoint before proceeding.
- Keep `src/content/notes/`, content metadata, route order, theme selection, and sidebar behavior unchanged.

### Parallel Opportunities

- After T001, User Story 4 test infrastructure can proceed in parallel with T002 and the Markdown-centered stories.
- After T010, T011, T012, and T013 can be authored in parallel because they modify separate test files.
- After T002, different developers may prepare the failing tests for User Stories 1–3, but edits to tests/e2e/note-content.spec.ts must be coordinated or sequenced.
- Implementation work in src/components/NoteContent.astro and src/styles/global.css must be sequenced to avoid same-file conflicts even when stories are logically independent.

---

## Parallel Examples by User Story

### User Story 1

```text
Task: "Write T003 in tests/e2e/note-content.spec.ts and confirm the focused test fails."
Then: "Implement T004 in src/styles/global.css and run the focused User Story 1 tests."
```

### User Story 2

```text
Task: "Write T005 in tests/e2e/note-content.spec.ts and confirm copy scenarios fail."
Then: "Implement T006 in src/components/NoteContent.astro."
Then: "Implement T007 in src/styles/global.css and run the focused User Story 2 tests."
```

### User Story 3

```text
Task: "Write T008 in tests/e2e/note-content.spec.ts and confirm link-style scenarios fail."
Then: "Implement T009 in src/styles/global.css and run the focused User Story 3 tests."
```

### User Story 4

```text
After T010, launch together:
Task: "Write T011 in tests/unit/content-ordering.test.ts."
Task: "Write T012 in tests/unit/note-navigation.test.ts."
Task: "Write T013 in tests/e2e/learning-route.spec.ts."

After those tests fail for the expected missing behavior, implement T014 → T015 → T016 → T017.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001–T002.
2. Write T003 and confirm the focused Playwright assertions fail for missing Markdown presentation.
3. Implement T004.
4. Run `npm run test:e2e -- tests/e2e/note-content.spec.ts` and manually check the representative notes at desktop and 320 px.
5. Stop and validate the reading improvement before adding copy, link, or sequential-navigation behavior.

### Incremental Delivery

1. Deliver Setup + Foundational + User Story 1 as the readable-note MVP.
2. Add User Story 2 and validate exact clipboard payload plus accessible fallback independently.
3. Add User Story 3 and validate link recognition in light and dark themes independently.
4. Add User Story 4 and validate the static written–video–written route independently.
5. Complete T018–T020 to verify the integrated static site and constitutional constraints.

### Parallel Team Strategy

1. One developer completes T001–T002.
2. A navigation workstream takes T010–T017 while the Markdown workstream executes T003–T009 in priority order.
3. Within User Story 4, assign T011, T012, and T013 to separate developers after T010.
4. Rejoin for T018–T020 and resolve only integration regressions, without expanding scope.

---

## Notes

- `[P]` marks tasks that touch different files and have no dependency on unfinished work.
- User-story labels provide traceability to `spec.md`; setup, foundational, and polish tasks intentionally have no story label.
- Tests are included because the specification makes testing mandatory and `quickstart.md` defines concrete Vitest and Playwright coverage.
- Do not add a backend, database, UI framework, Markdown plugin, new content field, fixture route, telemetry, or code-execution capability.
- Do not modify Markdown sources, frontmatter, published ordering, existing link destinations, the theme selector, or the sidebar.
- Commit after each task or coherent task group and stop at each checkpoint for independent validation.
