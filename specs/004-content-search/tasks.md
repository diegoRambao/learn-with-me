---

description: "Tareas de implementación para la búsqueda transversal de contenido"
---

# Tasks: Búsqueda transversal de contenido

**Input**: Design documents from `/specs/004-content-search/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/search-ui.md](./contracts/search-ui.md), [quickstart.md](./quickstart.md)

**Tests**: Se incluyen pruebas porque la especificación declara escenarios de prueba obligatorios y criterios medibles SC-001–SC-008. En cada historia, escribir las pruebas antes de su implementación y comprobar que fallen por la ausencia del comportamiento nuevo.

**Organization**: Las tareas se agrupan por historia para entregar primero el descubrimiento funcional, después el contexto visual de los resultados y finalmente el bloqueo editorial explícito.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque modifica archivos distintos y no depende de otra tarea incompleta del mismo grupo.
- **[Story]**: Traza la tarea a US1, US2 o US3. Setup, fundamentos y polish no llevan etiqueta de historia.
- Todas las descripciones señalan archivos concretos del repositorio.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar la base del proyecto antes de introducir la feature.

El proyecto Astro, TypeScript, Vitest y Playwright ya está inicializado y no requiere nuevas dependencias, configuración ni directorios vacíos. No hay tareas de setup que aporten cambios justificables.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establecer el contrato de datos compartido y migrar el contenido antes de implementar cualquier historia.

**⚠️ CRITICAL**: Ninguna historia puede compilar de forma válida hasta completar esta fase.

- [X] T001 [P] Ampliar los esquemas Astro y tipos inmutables para que `Category.description` sea “obligatorio, recortado y no vacío” y `Note.tags` tenga “al menos una etiqueta; cada valor recortado y no vacío” en src/content.config.ts y src/lib/content.ts
- [X] T002 [P] Añadir una descripción editorial no vacía y útil para búsqueda a las cinco categorías existentes en src/content/categories/aws.json, src/content/categories/dart.json, src/content/categories/flutter-basic.json, src/content/categories/sdd.json y src/content/categories/terminal.json
- [X] T003 [P] Añadir una o más etiquetas editoriales no vacías a cada nota existente, conservando sus descripciones actuales, categoría, formato y orden, en src/content/notes/*.md
- [X] T004 Actualizar los objetos tipados y factories existentes afectados por `Category.description` y `Note.tags` sin relajar los nuevos campos obligatorios en tests/unit/content-ordering.test.ts, tests/unit/home-category-preview.test.ts y tests/unit/note-navigation.test.ts

**Checkpoint**: Las colecciones y tipos contienen los metadatos buscables requeridos, el contenido existente cumple el esquema y las historias pueden comenzar.

---

## Phase 3: User Story 1 - Encontrar contenido desde el encabezado (Priority: P1) 🎯 MVP

**Goal**: Buscar categorías y notas desde cualquier encabezado, conservar la consulta en `?q=`, aplicar coincidencia parcial AND sin distinguir caja o tildes y mostrar resultados agrupados una sola vez.

**Independent Test**: Introducir un término presente en nombre/descripción de categoría y en título/descripción/etiquetas de notas desde home, categorías y detalle; comprobar navegación a `/buscar/?q=...`, agrupación correcta, normalización, recarga reproducible, orden estable y estados inicial, inválido y sin coincidencias.

### Tests for User Story 1

- [X] T005 [P] [US1] Escribir pruebas unitarias fallidas para `SearchQuery`, normalización NFD, deduplicación de tokens, coincidencia parcial literal, AND entre campos, exclusión del cuerpo Markdown, deduplicación por entidad y orden canónico en tests/unit/search.test.ts
- [X] T006 [P] [US1] Escribir pruebas E2E fallidas para presencia transversal del formulario, envío GET, codificación y recarga de `q`, secciones Categorías/Notas, variantes de caja/tilde, consultas multi-token y estados inicial, vacío y cero resultados en tests/e2e/search.spec.ts

### Implementation for User Story 1

- [X] T007 [US1] Implementar tipos derivados, normalización Unicode, parseo de `SearchQuery`, construcción de registros únicos y filtrado AND puro que preserve orden en src/lib/search.ts
- [X] T008 [P] [US1] Añadir a `SiteHeader` el formulario GET accesible con `name="q"`, destino `/buscar/`, validación trim para espacios, mensaje “Escribe un término para buscar” y foco correctivo en src/components/SiteHeader.astro
- [X] T009 [US1] Crear la página estática que carga ambas colecciones, relaciona notas con categorías, excluye el cuerpo Markdown y prerenderiza una entrada oculta por entidad en orden canónico en src/pages/buscar/index.astro
- [X] T010 [US1] Conectar `window.location.search` con las funciones de búsqueda, reflejar `q` en el formulario, alternar `hidden`, actualizar conteos y presentar estados inicial, inválido, parcial y sin resultados mediante mensajes anunciables en src/pages/buscar/index.astro

**Checkpoint**: US1 funciona de extremo a extremo y puede validarse sin la presentación enriquecida de US2: cada resultado ya expone su nombre o título y destino canónico.

---

## Phase 4: User Story 2 - Entender y abrir un resultado (Priority: P2)

**Goal**: Presentar contexto completo para distinguir y abrir categorías y notas, incluyendo imágenes resilientes, descripciones y todas las etiquetas.

**Independent Test**: Buscar un término compartido por ambos tipos y confirmar que cada categoría muestra nombre, descripción, imagen y enlace; cada nota muestra título, descripción, todas sus etiquetas, imagen de categoría y enlace; una sección sin coincidencias conserva explícitamente su estado.

### Tests for User Story 2

- [X] T011 [US2] Ampliar primero las pruebas E2E con aserciones fallidas para campos completos por tipo, rutas canónicas, sección parcialmente vacía, fallback de imagen, teclado, texto largo y ausencia de overflow a 320 px en tests/e2e/search.spec.ts

### Implementation for User Story 2

- [X] T012 [P] [US2] Crear el resultado de categoría prerenderizado con heading, descripción completa, imagen con alternativa contextual, fallback `/category-fallback.svg` y enlace de `categoryUrl` en src/components/SearchCategoryResult.astro
- [X] T013 [P] [US2] Crear el resultado de nota prerenderizado con heading, descripción completa, todas las etiquetas como texto, nombre e imagen de categoría, fallback `/category-fallback.svg` y enlace de `noteUrl` en src/components/SearchNoteResult.astro
- [X] T014 [US2] Sustituir las entradas mínimas por los componentes de resultado, mantener los campos normalizados separados y completar el layout responsive, wrapping, estados por sección y foco visible usando tokens existentes en src/pages/buscar/index.astro y src/styles/global.css

**Checkpoint**: US1 y US2 ofrecen resultados completos, distinguibles, accesibles y navegables en vistas amplias y estrechas.

---

## Phase 5: User Story 3 - Mantener contenido preparado para búsqueda (Priority: P3)

**Goal**: Bloquear publicación con errores accionables si una categoría carece de descripción o una nota carece de descripción o de al menos una etiqueta válida.

**Independent Test**: Ejecutar la validación contra contenido válido y fixtures incompletos; el contenido válido aprueba y cada descripción/colección de etiquetas ausente, vacía o con valores vacíos falla señalando archivo y campo.

### Tests for User Story 3

- [X] T015 [P] [US3] Añadir fixtures con categoría sin descripción y notas sin `tags`, con arreglo vacío y con etiqueta vacía en tests/fixtures/invalid-content/categories/missing-description.json y tests/fixtures/invalid-content/notes/missing-search-metadata.md
- [X] T016 [US3] Escribir pruebas fallidas que exijan problemas accionables por `sourcePath` y campo para `description` y `tags`, además de aceptación del grafo completo, en tests/unit/validation.test.ts

### Implementation for User Story 3

- [X] T017 [US3] Ampliar `CategoryInput`, `NoteInput`, `validateCategory` y `validateNote` para exigir descripción de categoría no vacía y tags como arreglo con al menos un string recortado no vacío, acumulando errores sin ocultar los existentes, en src/lib/validation.ts
- [X] T018 [US3] Cargar `description` y `tags` desde JSON/frontmatter hacia el validador y conservar mensajes técnicos agrupados por archivo solo en consola en scripts/validate-content.ts

**Checkpoint**: Las tres historias están completas y `validate:content`, tests y build impiden publicar metadatos incompletos.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar criterios de rendimiento, accesibilidad y regresión que atraviesan todas las historias.

- [X] T019 Añadir cobertura E2E para orden completo de teclado, anuncios de estado, temas claro/oscuro/sistema, no-JavaScript comprensible, ausencia de solicitudes externas y una muestra de 50 consultas cuyo p95 desde submit hasta resultado sea menor de 2000 ms en tests/e2e/search.spec.ts
- [X] T020 Ejecutar todos los escenarios de specs/004-content-search/quickstart.md y corregir cualquier regresión encontrada en src/, scripts/, tests/unit/ y tests/e2e/ sin introducir backend, base de datos, ranking, sugerencias, filtros, historial ni búsqueda del cuerpo Markdown

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No requiere cambios; el stack existente ya satisface el plan.
- **Foundational (Phase 2)**: Empieza inmediatamente y bloquea todas las historias.
- **US1 (Phase 3)**: Depende de T001–T004 y constituye el MVP funcional.
- **US2 (Phase 4)**: Depende de US1 porque enriquece las entradas y estados que US1 ya filtra; conserva un criterio de prueba propio.
- **US3 (Phase 5)**: Depende solo de Foundation y puede ejecutarse en paralelo con US1/US2; para la secuencia por prioridad se ubica después de US2.
- **Polish (Phase 6)**: Depende de las historias que vayan a entregarse; para el release completo depende de T001–T018.

### User Story Dependency Graph

```text
Foundation (T001–T004)
├── US1 (T005–T010) ──> US2 (T011–T014)
└── US3 (T015–T018)

US1 + US2 + US3 ──> Polish (T019–T020)
```

### Within Each User Story

- Escribir las pruebas de la historia y comprobar el fallo esperado antes del comportamiento correspondiente.
- Crear modelos/funciones deterministas antes de integrar la página.
- Prerenderizar contenido antes de habilitar el filtrado cliente.
- Implementar componentes por tipo antes de integrarlos y estilizarlos.
- Añadir fixtures y pruebas editoriales antes de ampliar el validador y su cargador.
- Ejecutar el criterio independiente al llegar a cada checkpoint.

### Parallel Opportunities

- T001, T002 y T003 pueden avanzar en paralelo; T004 espera el contrato de T001.
- T005 y T006 pueden escribirse en paralelo.
- T008 puede implementarse en paralelo con T007; T009 espera T007 y T010 espera T009.
- T012 y T013 pueden implementarse en paralelo después de T011.
- Tras Foundation, US3 puede avanzar en paralelo con US1 y US2.
- T002 y T003 distribuyen la migración editorial entre archivos independientes si participa más de una persona, evitando editar el mismo archivo simultáneamente.

---

## Parallel Example: User Story 1

```text
Task: "Escribir tests de semántica de búsqueda en tests/unit/search.test.ts"
Task: "Escribir tests del flujo URL/header en tests/e2e/search.spec.ts"

Después de fijar los tests:
Task: "Implementar búsqueda funcional en src/lib/search.ts"
Task: "Implementar formulario transversal en src/components/SiteHeader.astro"
```

## Parallel Example: User Story 2

```text
Task: "Crear resultado de categoría en src/components/SearchCategoryResult.astro"
Task: "Crear resultado de nota en src/components/SearchNoteResult.astro"
```

## Parallel Example: User Story 3

```text
Task: "Preparar fixtures inválidos en tests/fixtures/invalid-content/"
Task: "Revisar en paralelo la migración válida de src/content/categories/ y src/content/notes/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Foundation T001–T004.
2. Completar US1 T005–T010 con tests primero.
3. Detenerse y validar el criterio independiente de US1.
4. Demostrar búsqueda desde cualquier header, URL reproducible y matching correcto aunque las tarjetas aún tengan contexto visual mínimo.

### Incremental Delivery

1. **Foundation**: metadatos disponibles y contenido migrado.
2. **US1 / MVP**: descubrimiento funcional por URL y resultados agrupados.
3. **US2**: contexto completo, destinos, imágenes y presentación responsive.
4. **US3**: garantía editorial accionable para publicaciones futuras.
5. **Polish**: verificación integral de accesibilidad, rendimiento y regresión.

### Parallel Team Strategy

Con varias personas después de Foundation:

- Una persona implementa US1 y luego US2 en la cadena de interfaz.
- Otra implementa US3 de forma independiente sobre validador y fixtures.
- Dentro de US1 se separan tests unitarios/E2E y módulo/header.
- Dentro de US2 se separan los dos componentes de resultado.

## Notes

- `[P]` solo aparece cuando los archivos y dependencias permiten ejecución simultánea.
- Cada tarea de historia lleva `[US1]`, `[US2]` o `[US3]`; Setup, Foundation y Polish no llevan etiqueta.
- Las rutas canónicas se derivan con helpers existentes; no se interpolan desde texto libre.
- Los metadatos se prerenderizan como texto; no se usa `innerHTML`.
- La ausencia de JavaScript conserva la navegación GET y muestra orientación comprensible, pero no promete resultados dinámicos.
- No añadir dependencias, servicios externos, telemetría ni capas arquitectónicas no justificadas.
