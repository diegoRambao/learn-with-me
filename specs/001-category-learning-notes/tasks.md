---

description: "Tareas de implementación para categorías, portada y rutas de aprendizaje"
---

# Tasks: Categorías y rutas de aprendizaje

**Input**: Documentos de diseño en `/specs/001-category-learning-notes/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: La especificación define escenarios obligatorios y el plan exige Vitest, Playwright, `astro check` y `astro build`; las pruebas de cada historia se escriben y fallan antes de su implementación.

**Organization**: Las tareas se agrupan por historia para permitir implementación, prueba y entrega independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque afecta archivos distintos y no depende de trabajo incompleto.
- **[Story]**: Historia cubierta (`US1`, `US2`, `US3`).
- Todas las tareas incluyen rutas exactas.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar el sitio estático y las herramientas del stack aprobado.

- [ ] T001 Crear package.json con Astro 7.x, TypeScript 5.x, Tailwind CSS 4 mediante `@tailwindcss/vite`, Vitest, Playwright, scripts base y requisito Node.js LTS 22+ en package.json
- [ ] T002 [P] Configurar salida estática de Astro, `@tailwindcss/vite` y trailing slash consistente en astro.config.ts
- [ ] T003 [P] Habilitar TypeScript `strict` y aliases del proyecto en tsconfig.json
- [ ] T004 [P] Configurar Vitest y Playwright contra `astro preview`, incluidos proyectos desktop, móvil y `reducedMotion: 'reduce'`, en vitest.config.ts y playwright.config.ts
- [ ] T005 Crear el layout HTML compartido con metadatos, import único de Tailwind, slot principal y enlace “Saltar al contenido” en src/layouts/BaseLayout.astro

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establecer los contratos, consultas, rutas, validación y gate de publicación compartidos por todas las historias.

**⚠️ CRITICAL**: Ninguna historia puede comenzar hasta completar esta fase.

- [ ] T006 [P] Escribir pruebas unitarias inicialmente fallidas para IDs duplicados, categorías inexistentes, posiciones repetidas, enteros positivos, formatos mutuamente excluyentes, redes inválidas/duplicadas y acumulación de issues en tests/unit/validation.test.ts
- [ ] T007 [P] Crear fixtures de campo ausente, categoría inexistente, posición duplicada, notas written/video inválidas y redes con etiqueta vacía, URL no HTTPS o duplicados en tests/fixtures/invalid-content/categories/invalid-category.json, tests/fixtures/invalid-content/notes/invalid-notes.md y tests/fixtures/invalid-content/site/invalid-social-links.json
- [ ] T008 Definir `categories` en src/content.config.ts con estos constraints literales: `id`: “Derivado del nombre del archivo; slug URL-safe, único globalmente”; `name`: “No vacío después de trim; texto visible”; `image`: “Ruta local válida bajo /images/categories/ o URL absoluta https”; `level`: “beginner, intermediate, advanced, pro”
- [ ] T009 Ampliar `notes` en src/content.config.ts con estos constraints literales: `id`: “Derivado del nombre del archivo; slug URL-safe, único globalmente”; `title`: “No vacío; identificador visible en listados”; `description`: “No vacía; resumen contextual de la clase”; `category`: “Debe coincidir con un Category.id existente”; `durationMinutes`: “Mayor que 0; duración estimada de consumo”; `position`: “Mayor que 0; única dentro de su categoría”; `format`: “Exactamente written o video”; `youtubeVideoId`: “Obligatorio y con formato válido solo si format=video; prohibido en written”; `body`: “No vacío solo si format=written; vacío en video”
- [ ] T010 Crear la configuración inmutable en src/data/site.ts aplicando estos constraints literales: `socialLinks`: “Puede estar vacío; nunca contiene valores inválidos ni de ejemplo”; `network`: “Clave estable, no vacía y única dentro de socialLinks”; `label`: “Texto no vacío que identifica de forma comprensible la red y el destino”; `url`: “URL absoluta con esquema https; única dentro de socialLinks”; incluir solo perfiles reales aportados por el autor o conservar `[]`
- [ ] T011 Implementar tipos inmutables, etiquetas de nivel y consultas en src/lib/content.ts, incluidos `HomeCategoryIndex.categories`: “Todas las categorías válidas, ordenadas por name normalizado y luego por id”; `HomeCategoryIndex.destination`: “URL canónica /categorias/{category.id}/”; `LearningRoute.category`: “Categoría seleccionada”; `LearningRoute.notes`: “Notas filtradas por categoría y ordenadas por posición”; `LearningRoute.activeNote`: “Nota indicada por URL; en la ruta de categoría, primera nota; null si no hay notas”; `CategoryFilter.selectedLevel`: “all, beginner, intermediate, advanced, pro”; `CategoryFilter.matchingCount`: “Número de tarjetas visibles”
- [ ] T012 [P] Implementar constructores de URLs jerárquicas con barra final y validación de pares categoría/nota en src/lib/routes.ts
- [ ] T013 Implementar `validateContent(categories, notes, siteConfig)` y `ContentValidationIssue` en src/lib/validation.ts con estos campos literales: `sourcePath`: “Archivo que debe corregirse”; `field`: “Campo o relación inválida”; `code`: “Clave estable del tipo de error”; `message`: “Explicación accionable para el responsable del contenido”
- [ ] T014 Crear el ejecutor que carga entradas/configuración, agrupa issues por archivo y termina con código distinto de cero ante cualquier issue en scripts/validate-content.ts
- [ ] T015 Encadenar `validate:content` antes de `check`, `test` y `build` para impedir publicaciones parciales en package.json
- [ ] T016 [P] Crear el fallback visual accesible que conserva el nombre de la categoría en public/category-fallback.svg

**Checkpoint**: Esquemas, modelos derivados, URLs y gate de publicación están listos; las historias pueden avanzar sin compartir archivos de prueba.

---

## Phase 3: User Story 1 - Comprender el sitio y descubrir categorías (Priority: P1) 🎯 MVP

**Goal**: Explicar propósito, uso y beneficios desde una portada oscura y accesible, ofrecer índice responsive y redes válidas, y permitir descubrir y filtrar categorías.

**Independent Test**: Abrir `/`, identificar propósito, pasos y tres beneficios, recorrer el índice en desktop/móvil, verificar redes configuradas y movimiento reducido; después abrir `/categorias/`, aplicar/limpiar niveles y comprobar tarjetas, estados vacíos y p95 de filtrado menor a 100 ms.

### Tests for User Story 1

- [ ] T017 [P] [US1] Escribir pruebas Playwright inicialmente fallidas para propósito, uso, beneficios, índice desktop/móvil con orden/destinos idénticos, redes válidas/ausentes, skip link, tema oscuro, contraste esencial y movimiento reducido en tests/e2e/homepage.spec.ts
- [ ] T018 [P] [US1] Escribir pruebas Playwright inicialmente fallidas para menú, tarjetas, filtros, `aria-pressed`, `aria-live`, “Ver todas”, imágenes/estados vacíos y 20 cambios sobre 100 tarjetas con p95 menor a 100 ms o perfil local documentado en tests/e2e/categories.spec.ts

### Implementation for User Story 1

- [ ] T019 [P] [US1] Definir tokens Tailwind de superficies oscuras, texto, bordes, foco y acentos con contraste 4.5:1/3:1, y habilitar solo bajo `prefers-reduced-motion: no-preference` transiciones de opacidad, color o transformaciones pequeñas; para `MotionPreference.reducedMotion=true`: “true cuando el navegador indica prefers-reduced-motion: reduce”, eliminar movimiento no esencial en src/styles/global.css
- [ ] T020 [P] [US1] Implementar el encabezado compartido con enlace estable a `/categorias/`, foco visible y navegación operable por teclado en src/components/SiteHeader.astro
- [ ] T021 [P] [US1] Implementar propósito educativo, pasos de uso y los tres beneficios exactos de FR-020 a FR-022 con landmarks y jerarquía semántica en src/components/HomeIntroduction.astro
- [ ] T022 [P] [US1] Implementar un único `<nav>` de categorías reutilizado por la presentación lateral amplia y disclosure estrecho, con Enter/Espacio, `aria-expanded`, nombre, nivel y URL canónica en src/components/HomeCategoryIndex.astro
- [ ] T023 [P] [US1] Implementar enlaces sociales descriptivos en la misma pestaña, omitiendo toda la región cuando `socialLinks` esté vacío y sin depender de icono/color/tooltip para el nombre en src/components/SocialLinks.astro
- [ ] T024 [P] [US1] Implementar tarjeta semántica con nombre, nivel centralizado, dimensiones reservadas y fallback de imagen en src/components/CategoryCard.astro
- [ ] T025 [P] [US1] Implementar filtros “Todos”, “Principiante”, “Intermedio”, “Avanzado” y “Pro” mediante script TypeScript procesado por Astro, `data-level`, `aria-pressed`, conteo visible y `aria-live="polite"` en src/components/CategoryFilters.astro
- [ ] T026 [P] [US1] Implementar estados de cero categorías y cero coincidencias, incluido “Ver todas”, sin mensajes técnicos en src/components/EmptyState.astro
- [ ] T027 [P] [US1] Crear categorías válidas de los cuatro niveles con IDs slug, nombres y referencias a ilustraciones locales propias en src/content/categories/flutter.json, src/content/categories/aws.json, src/content/categories/sdd.json y src/content/categories/dart.json, y crear sus imágenes en public/images/categories/flutter.svg, public/images/categories/aws.svg, public/images/categories/sdd.svg y public/images/categories/dart.svg
- [ ] T028 [P] [US1] Integrar layout, introducción, índice ordenado, redes y estados sin categorías en la portada prerenderizada en src/pages/index.astro
- [ ] T029 [P] [US1] Integrar encabezado, tarjetas, filtros, aviso conocido y estados vacíos en el catálogo prerenderizado en src/pages/categorias/index.astro

**Checkpoint**: La portada y el catálogo forman un MVP completo y comprobable sin la navegación entre notas.

---

## Phase 4: User Story 2 - Recorrer las notas de una categoría (Priority: P2)

**Goal**: Mostrar solo las notas de una categoría como secuencia ordenada, abrir la primera automáticamente y navegar conservando el contexto en desktop y móvil.

**Independent Test**: Con tres notas de posiciones distintas, abrir `/categorias/{categoryId}/`, comprobar redirección a la menor posición, recorrer todos los enlaces, verificar orden/URL/nota activa y probar una categoría vacía en ambos viewports.

### Tests for User Story 2

- [ ] T030 [P] [US2] Escribir pruebas unitarias inicialmente fallidas para filtrado por categoría, orden ascendente por `position`, desempate defensivo por `id`, primera nota y ruta vacía en tests/unit/content-ordering.test.ts
- [ ] T031 [P] [US2] Escribir pruebas Playwright inicialmente fallidas para primera nota, navegación completa, `aria-current="page"`, listado lateral, disclosure móvil y categoría sin notas en tests/e2e/learning-route.spec.ts

### Implementation for User Story 2

- [ ] T032 [P] [US2] Implementar lista ordenada lateral y disclosure móvil sobre el mismo array de enlaces, con nombre accesible e indicador activo que combina texto/forma/color en src/components/CourseNavigation.astro
- [ ] T033 [P] [US2] Añadir tres notas `written` válidas de Flutter con título, descripción, `category: flutter`, `durationMinutes` entero positivo, posiciones únicas no ordenadas por nombre de archivo y cuerpo Markdown no vacío en src/content/notes/flutter-intro.md, src/content/notes/flutter-widgets.md y src/content/notes/flutter-state.md
- [ ] T034 [P] [US2] Implementar `getStaticPaths()`, filtrado/orden, redirección a la primera nota y estado de categoría sin notas en src/pages/categorias/[categoryId]/index.astro
- [ ] T035 [P] [US2] Implementar `getStaticPaths()` solo para pares válidos y la vista de ruta con metadatos de nota activa y navegación responsive en src/pages/categorias/[categoryId]/[noteId].astro

**Checkpoint**: Cada ruta ordenada funciona y permite reconocer/cambiar la nota activa sin depender del renderer final de formatos.

---

## Phase 5: User Story 3 - Consumir notas escritas o en video (Priority: P3)

**Goal**: Renderizar exactamente un formato por nota, ofrecer fallback determinista para videos, conservar deep links válidos y orientar accesos inválidos.

**Independent Test**: Abrir y recargar una nota escrita y otra de video que comparten categoría pero tienen posiciones distintas; verificar metadatos, renderer y enlace externo, y confirmar que rutas sin contexto o pares no relacionados vuelven al catálogo sin revelar la nota.

### Tests for User Story 3

- [ ] T036 [P] [US3] Escribir pruebas Playwright inicialmente fallidas para Markdown, iframe, enlace externo siempre visible, embed bloqueado, metadatos, deep links, par no relacionado y nota sin categoría en tests/e2e/note-content.spec.ts

### Implementation for User Story 3

- [ ] T037 [P] [US3] Crear una nota `written` y una `video` con el mismo `category: dart`, títulos/descripciones/duraciones válidas y posiciones enteras positivas distintas; exigir cuerpo no vacío sin `youtubeVideoId` en la escrita y cuerpo vacío con ID válido en la de video, en src/content/notes/dart-types.md y src/content/notes/dart-video.md
- [ ] T038 [US3] Implementar renderer discriminado con título, descripción y duración; Markdown en `<article>` o iframe responsive con título, lazy loading, fullscreen, sin autoplay y enlace externo descriptivo siempre visible a YouTube en src/components/NoteContent.astro
- [ ] T039 [US3] Integrar `NoteContent` y mensajes contextuales sin detalles técnicos, manteniendo operable `CourseNavigation`, en src/pages/categorias/[categoryId]/[noteId].astro
- [ ] T040 [P] [US3] Implementar fallback para paths inválidos con explicación/enlace sin JavaScript y `location.replace('/categorias/?notice=invalid-note-context')` en src/pages/404.astro
- [ ] T041 [US3] Interpretar solo `notice=invalid-note-context`, mostrar el mensaje contractual y permitir descartarlo sin exponer parámetros desconocidos en src/pages/categorias/index.astro

**Checkpoint**: Ambos formatos, fallback externo y contratos de deep link funcionan de extremo a extremo.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentar y verificar calidad común sin ampliar el alcance funcional.

- [ ] T042 [P] Documentar cómo añadir categorías, notas y redes reales, ejecutar el gate y mantener la regla de un formato por nota en README.md
- [ ] T043 Ejecutar y registrar en specs/001-category-learning-notes/quickstart.md la matriz desktop/móvil, teclado, 200% zoom, contraste, movimiento reducido, estados resilientes, formatos, URLs y contenido/configuración inválidos
- [ ] T044 Revisar y registrar en specs/001-category-learning-notes/quickstart.md el cumplimiento constitucional: contrato de contenido, Astro/Tailwind/TypeScript, datos inmutables, nombres camelCase/PascalCase, ausencia de clases/capas innecesarias, identidad propia y errores no técnicos
- [ ] T045 Verificar sin ampliar alcance hasta que `npm run validate:content`, `npm run check`, `npm run test:unit`, `npm run test:e2e` y `npm run build` terminen con código 0 mediante los scripts de package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias.
- **Foundational (Phase 2)**: Depende de Setup y bloquea todas las historias.
- **US1, US2 y US3 (Phases 3-5)**: Pueden iniciar tras Foundational si se respetan sus archivos; para entrega incremental siguen P1 → P2 → P3.
- **Polish (Phase 6)**: Depende de las historias incluidas en la entrega.

### User Story Dependency Graph

```text
Setup → Foundational ─┬→ US1 (P1, MVP)
                     ├→ US2 (P2)
                     └→ US3 (P3)

US2 → US3 para integrar NoteContent sobre la página de ruta,
pero US3 conserva un archivo E2E independiente y fixtures propios.
```

### Within Each User Story

- Escribir las pruebas y confirmar que fallan antes de implementar.
- Crear datos/componentes antes de las páginas que los integran.
- Completar el independent test y checkpoint antes de avanzar de prioridad.
- T039 sigue a T035 y T038; T041 sigue a T029 y T040 por compartir integración de avisos.

### Parallel Opportunities

- Tras T001, T002-T004 trabajan en archivos distintos; T005 integra la configuración terminada.
- En Foundational, T006-T007 y T016 pueden avanzar en paralelo; T008-T015 respetan sus dependencias y archivos compartidos.
- Tras Foundational, T017-T018, T030-T031 y T036 usan archivos de prueba distintos y no generan conflictos.
- En US1, T019-T027 afectan archivos diferentes; luego T028 y T029 integran páginas distintas en paralelo.
- En US2, T032-T033 avanzan en paralelo; después T034-T035 integran rutas distintas en paralelo.
- En US3, T037 puede avanzar en paralelo con T040; T038-T039 permanecen secuenciales.

---

## Parallel Example: User Story 1

```text
Task T019: Definir el sistema visual en src/styles/global.css
Task T020: Implementar src/components/SiteHeader.astro
Task T021: Implementar src/components/HomeIntroduction.astro
Task T022: Implementar src/components/HomeCategoryIndex.astro
Task T023: Implementar src/components/SocialLinks.astro
Task T024: Implementar src/components/CategoryCard.astro
Task T025: Implementar src/components/CategoryFilters.astro
Task T026: Implementar src/components/EmptyState.astro
Task T027: Crear src/content/categories/*.json
```

## Parallel Example: User Story 2

```text
Task T032: Implementar src/components/CourseNavigation.astro
Task T033: Crear src/content/notes/flutter-*.md
```

## Parallel Example: User Story 3

```text
Task T037: Crear src/content/notes/dart-types.md y src/content/notes/dart-video.md
Task T040: Implementar src/pages/404.astro
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Setup.
2. Completar Foundational y confirmar el gate de contenido/configuración.
3. Escribir T017-T018 y comprobar que fallan.
4. Completar T019-T029.
5. Ejecutar el independent test de US1 y detenerse para validar el MVP.

### Incremental Delivery

1. Setup + Foundational → base estática y publicación segura.
2. US1 → portada explicativa, índice, redes y catálogo filtrable.
3. US2 → rutas ordenadas y navegación responsive.
4. US3 → contenido written/video, fallback y deep links resilientes.
5. Polish → documentación, revisión constitucional y gates verdes.

### Parallel Team Strategy

1. El equipo completa Setup y Foundational.
2. Se reparten historias usando archivos E2E separados y los grupos paralelos documentados.
3. Se integra en prioridad P1 → P2 → P3 y se valida cada checkpoint antes del siguiente incremento.

---

## Notes

- `[P]` significa archivos distintos y ausencia de dependencia pendiente.
- `[USn]` conserva trazabilidad con la especificación.
- No se introduce backend, base de datos, CMS, framework cliente ni estado editorial.
- Las pruebas deben fallar antes de implementar la historia correspondiente.
- Solo se configuran redes reales aportadas por el autor; no se publican placeholders.
- Cada issue bloquea toda publicación y nunca se expone como error técnico en la UI.
