---

description: "Tareas de implementación para la portada de notas y el selector de tema"
---

# Tasks: Portada de notas y selector de tema

**Input**: Design documents from `/specs/002-notes-homepage/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Se incluyen pruebas primero porque la especificación define criterios verificables de conteo, copy, navegación, tema, persistencia, responsive y accesibilidad.

**Organization**: Las tareas se agrupan por historia de usuario para entregar y validar cada incremento por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo con otras tareas marcadas dentro del mismo bloque porque usa archivos distintos y no depende de trabajo incompleto.
- **[Story]**: Historia de usuario cubierta por la tarea (`US1`, `US2`, `US3`).
- Todas las tareas incluyen rutas exactas relativas a la raíz del repositorio.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar que el proyecto existente y sus gates están sanos antes de cambiar comportamiento.

- [X] T001 Ejecutar la línea base `npm run validate:content`, `npm run check`, `npm run test:unit`, `npm run test:e2e` y `npm run build` usando los scripts de `package.json`, `vitest.config.ts` y `playwright.config.ts`, y detener la feature si falla código no relacionado

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Preparar la capa visual compartida para que los tres incrementos no introduzcan colores incompatibles entre sí.

**⚠️ CRITICAL**: Ninguna historia debe modificar la composición visual antes de completar esta base.

- [X] T002 Sustituir en `src/styles/global.css` los literales globales de fondo, superficie, borde, texto, texto atenuado, acento, texto sobre acento y foco por variables semánticas, conservando inicialmente la apariencia oscura actual y el comportamiento de movimiento reducido

**Checkpoint**: La web conserva su apariencia y suites actuales, pero sus primitivas globales ya consumen tokens semánticos.

---

## Phase 3: User Story 1 - Comprender el propósito de las notas (Priority: P1) 🎯 MVP

**Goal**: Presentar el sitio como apuntes personales compartidos, eliminar el índice lateral de la portada y ofrecer una acción central hacia Categorías sin prometer clases, cursos ni academia.

**Independent Test**: Una persona que solo ve encabezado y contenido principal explica que son apuntes del autor sobre lo que estudia, reconoce que pueden servirle para estudiar o repasar y encuentra el catálogo en menos de 10 segundos; el contenido principal no contiene el vocabulario prohibido como oferta.

### Tests for User Story 1 ⚠️

> Escribir o actualizar estas pruebas primero y comprobar que fallan antes de implementar la historia.

- [X] T003 [US1] Reemplazar en `tests/e2e/homepage.spec.ts` las expectativas del copy y sidebar anteriores por pruebas semánticas del nuevo propósito, ausencia de `<aside>`/navegación lateral, CTA central a `/categorias/`, skip link y ausencia en `main` de `clase|clases|curso|cursos` como oferta

### Implementation for User Story 1

- [X] T004 [P] [US1] Reescribir `src/components/HomeIntroduction.astro` con un único H1 sobre apuntes personales, explicación de que nacen de temas estudiados, utilidad para terceros, pasos “elige un tema/recorre las notas/estudia a tu ritmo”, beneficios y un CTA central descriptivo a `/categorias/`
- [X] T005 [P] [US1] Ajustar título, descripción y copy general de portada/pie en `src/layouts/BaseLayout.astro` para usar “notas” o “apuntes” y no presentar el sitio como academia, clases o cursos
- [X] T006 [US1] Recomponer `src/pages/index.astro` como flujo central de una columna, eliminar el import y render de `HomeCategoryIndex.astro`, conservar `HomeIntroduction.astro` y `SocialLinks.astro`, y asegurar que no queda un sidebar visible
- [X] T007 [US1] Eliminar `src/components/HomeCategoryIndex.astro` después de confirmar con `rg` que no conserva imports ni consumidores en `src/` o `tests/`

**Checkpoint**: US1 se puede demostrar en `/` sin la muestra nueva ni un tema manual: el propósito, la terminología y el acceso central ya cumplen su contrato.

---

## Phase 4: User Story 2 - Descubrir rutas desde la portada (Priority: P2)

**Goal**: Mostrar hasta tres rutas principales y hasta tres rutas atenuadas, con CTA accesible al catálogo y comportamiento coherente para cualquier conteo.

**Independent Test**: Con seis o más categorías se proyectan exactamente 3+3; con 0–5 solo se muestran las existentes según la tabla del modelo; con las cuatro categorías reales la portada muestra tres principales y una atenuada, sin duplicados, con enlaces canónicos y sin overflow móvil.

### Tests for User Story 2 ⚠️

> Escribir estas pruebas primero y comprobar que fallan antes de implementar la historia.

- [X] T008 [P] [US2] Crear pruebas parametrizadas para entradas de 0, 1, 2, 3, 4, 5, 6 y 7 categorías en `tests/unit/home-category-preview.test.ts`, verificando límites 3+3, orden estable, IDs únicos, cero placeholders, conservación de referencias y ausencia de mutación
- [X] T009 [P] [US2] Ampliar `tests/e2e/homepage.spec.ts` para exigir con el contenido real tres tarjetas en el grupo principal, una en el atenuado, cuatro IDs únicos en orden, URLs `/categorias/{id}/`, CTA “Explorar más rutas”, foco operable, capa decorativa no bloqueante, fallback de imagen, movimiento reducido y ausencia de overflow a 320/640 px

### Implementation for User Story 2

- [X] T010 [P] [US2] Definir `HomeCategoryPreview` y `createHomeCategoryPreview` en `src/lib/content.ts` respetando literalmente estas restricciones de `specs/002-notes-homepage/data-model.md`: “`primary.length` está entre 0 y 3”, “`teaser.length` está entre 0 y 3”, el total “nunca supera 6”, no se repiten IDs, se conserva el orden y no se muta la entrada
- [X] T011 [P] [US2] Extender `src/components/CategoryCard.astro` con una prop tipada de nivel de encabezado que conserve `h2` en el catálogo, permita el nivel subordinado en portada y mantenga imagen/fallback, nivel, nombre y URL canónica sin duplicar markup
- [X] T012 [US2] Crear `src/components/HomeRoutePreview.astro` para consumir `HomeCategoryPreview`, renderizar los estados empty/primary-only/with-teaser, separar los dos grupos semánticos y mantener el CTA “Explorar más rutas” fuera o por encima del fade con destino `/categorias/`
- [X] T013 [P] [US2] Añadir en `src/styles/global.css` la cuadrícula responsive y el gradiente decorativo del grupo teaser con `pointer-events: none`, foco visible por encima del efecto, relajación mediante `:focus-within` cuando sea necesaria y sin reducir la legibilidad del CTA
- [X] T014 [US2] Integrar `createHomeCategoryPreview` y `HomeRoutePreview.astro` en `src/pages/index.astro` usando el orden estable existente, sin duplicar categorías y sin modificar el catálogo ni las páginas de notas

**Checkpoint**: US1 y US2 funcionan juntas; la portada comunica su propósito y permite descubrir rutas con todos los límites funcionales cubiertos.

---

## Phase 5: User Story 3 - Elegir la apariencia del sitio (Priority: P3)

**Goal**: Ofrecer Sistema/Claro/Oscuro desde el encabezado, seguir el sistema por defecto, persistir elecciones explícitas y mantener toda la interfaz legible y operable.

**Independent Test**: En una sesión limpia la apariencia sigue el sistema; Claro u Oscuro prevalecen y sobreviven una recarga; volver a Sistema reanuda cambios del dispositivo; valores inválidos o storage bloqueado degradan sin error y el control se opera con teclado.

### Tests for User Story 3 ⚠️

> Crear las pruebas primero y comprobar que fallan antes de implementar la historia.

- [X] T015 [US3] Crear `tests/e2e/theme.spec.ts` con escenarios de sistema claro/oscuro antes de navegar, selector nativo etiquetado Tema, overrides opuestos al SO, recarga persistente, retorno a Sistema, cambio del SO durante la sesión, valor local inválido, `localStorage` bloqueado, teclado y contraste en portada/catálogo/detalle

### Implementation for User Story 3

- [X] T016 [US3] Crear en `src/lib/theme.ts` el tipo `ThemePreference`, la lista inmutable y el guard de valores `system|light|dark`, usando `system` para ausencia, cadena vacía, valor desconocido o error de lectura conforme a `specs/002-notes-homepage/data-model.md`
- [X] T017 [P] [US3] Crear `src/components/ThemeSelector.astro` con `<label>` y `<select>` nativos, opciones Sistema/Claro/Oscuro, valor sincronizado con `document.documentElement.dataset.theme`, cambio inmediato y persistencia encapsulada en `try/catch` sin perder el foco
- [X] T018 [P] [US3] Añadir en el `<head>` de `src/layouts/BaseLayout.astro` el atributo inicial `data-theme="system"` y un bootstrap inline temprano que valida y aplica la preferencia guardada antes del contenido visual sin exponer errores técnicos
- [X] T019 [P] [US3] Completar en `src/styles/global.css` las asignaciones Claro, Oscuro y Sistema mediante `prefers-color-scheme`, actualizar `color-scheme` y migrar los colores duros restantes de superficies, prose, controles y estados para mantener 4.5:1 en texto y 3:1 en foco/bordes esenciales
- [X] T020 [US3] Integrar `ThemeSelector.astro` junto al enlace Categorías en `src/components/SiteHeader.astro`, con layout responsive, objetivo táctil suficiente y orden de foco que conserva “Saltar al contenido” como primer elemento enfocable

**Checkpoint**: Las tres historias funcionan; el tema se aplica en toda página compartida sin alterar el contenido o comportamiento del catálogo y las notas.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar regresiones, verificar alcance y registrar evidencia completa.

- [X] T021 Auditar con búsquedas y revisión visual `src/components/CategoryFilters.astro`, `src/components/CourseNavigation.astro`, `src/components/EmptyState.astro`, `src/components/NoteContent.astro`, `src/components/SocialLinks.astro`, `src/pages/404.astro` y `src/styles/global.css`; reemplazar solo los colores duros que impidan los temas y confirmar que no cambian contratos internos
- [ ] T022 Ejecutar `npm run validate:content`, `npm run check`, `npm run test:unit`, `npm run test:e2e` y `npm run build` desde `package.json`, corregir cualquier regresión dentro del alcance y registrar resultados en `specs/002-notes-homepage/quickstart.md`
- [ ] T023 Validar manualmente los escenarios de copy, CTA centrado, fade, conteos visuales 0/3/4/6+, tema, teclado, 320 px, reflow 200% y movimiento reducido descritos en `specs/002-notes-homepage/quickstart.md`, y añadir allí el resultado y cualquier limitación reproducible

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no tiene dependencias y establece la línea base.
- **Foundational (Phase 2)**: depende de T001 y bloquea cambios visuales de todas las historias.
- **US1 (Phase 3)**: depende de T002 y entrega el MVP de posicionamiento y acceso.
- **US2 (Phase 4)**: depende de T002; T014 integra sobre la composición final de US1, por lo que en ejecución secuencial se completa después de T006. Su modelo y componente pueden desarrollarse en paralelo con US1.
- **US3 (Phase 5)**: depende de T002 y puede desarrollarse en paralelo con US1/US2 salvo los puntos de integración en `BaseLayout.astro`, `SiteHeader.astro` y `global.css`.
- **Polish (Phase 6)**: depende de todas las historias incluidas en la entrega.

### User Story Dependency Graph

```text
T001 Setup
  └── T002 Foundation
        ├── US1 (MVP) ───────────────┐
        ├── US2 model/component ─────┼── T014 homepage integration
        └── US3 theme ───────────────┘
                                      └── Polish + full validation
```

### Within Each User Story

- Las pruebas de la historia se escriben y fallan antes de su implementación.
- En US1, T004 y T005 pueden avanzar juntas; T006 las integra y T007 limpia el componente obsoleto.
- En US2, T008/T009 se escriben juntas; T010, T011 y T013 pueden avanzar juntas; T012 depende de T010/T011 y T014 depende de T012/T013 y de la composición de T006.
- En US3, T015 precede la implementación; T017/T018/T019 pueden avanzar tras T016; T020 depende de T017.

### Parallel Opportunities

- **US1**: T004 y T005 usan archivos distintos.
- **US2 tests**: T008 y T009 usan suites distintas.
- **US2 implementation**: T010, T011 y T013 usan archivos distintos; después T012 ensambla modelo y tarjeta.
- **US3 implementation**: T017, T018 y T019 usan archivos distintos tras definir el contrato tipado en T016.
- **Cross-story**: US2 y US3 pueden progresar simultáneamente después de la base si se coordina la integración final en `global.css` y `BaseLayout.astro`.

---

## Parallel Example: User Story 1

```text
Task T004: Reescribir src/components/HomeIntroduction.astro
Task T005: Ajustar metadata y copy compartido en src/layouts/BaseLayout.astro
```

## Parallel Example: User Story 2

```text
Task T008: Crear tests/unit/home-category-preview.test.ts
Task T009: Ampliar tests/e2e/homepage.spec.ts

Después de las pruebas:
Task T010: Implementar la proyección en src/lib/content.ts
Task T011: Generalizar encabezado en src/components/CategoryCard.astro
Task T013: Crear estilos responsive/fade en src/styles/global.css
```

## Parallel Example: User Story 3

```text
Después de T016:
Task T017: Crear src/components/ThemeSelector.astro
Task T018: Añadir bootstrap en src/layouts/BaseLayout.astro
Task T019: Completar temas en src/styles/global.css
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar T001–T002.
2. Escribir T003 y confirmar el fallo esperado.
3. Completar T004–T007.
4. Ejecutar la prueba independiente de US1.
5. Detenerse y demostrar el nuevo posicionamiento y acceso central antes de añadir rutas o tema.

### Incremental Delivery

1. **Base**: línea base verde + tokens semánticos.
2. **US1 / MVP**: copy correcto, CTA central y portada sin sidebar.
3. **US2**: proyección 3+3, tarjetas y fade accesible.
4. **US3**: Sistema/Claro/Oscuro con persistencia y fallback.
5. **Polish**: auditoría compartida, suite completa y validación manual.

Cada incremento conserva navegación a Categorías y puede verificarse antes de avanzar.

### Parallel Team Strategy

Después de T002:

- Una persona puede completar US1.
- Otra puede desarrollar modelo, pruebas unitarias y componente de US2.
- Otra puede desarrollar utilidad, selector y pruebas de US3.
- La integración en `index.astro`, `BaseLayout.astro` y `global.css` se realiza respetando el orden de dependencias anterior.

## Notes

- `[P]` identifica trabajo en archivos distintos que puede ejecutarse simultáneamente en su bloque.
- Las etiquetas `[US1]`, `[US2]` y `[US3]` mantienen trazabilidad con `spec.md`.
- No se debe añadir backend, cuenta, sincronización, librería de tema, framework cliente ni campos editoriales.
- Los tests deben fallar por el comportamiento ausente, no por errores de sintaxis o fixtures incompletos.
- Completar el checkbox únicamente después de ejecutar la verificación indicada por la tarea.
