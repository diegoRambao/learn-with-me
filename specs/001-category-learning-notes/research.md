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

**Decision**: Combinar esquemas por entrada con una función pura `validateContent(categories, notes, siteConfig)` ejecutada por `npm run validate:content` antes de `check`, `test` y `build`. La función acumula todos los problemas y termina con código distinto de cero cuando detecta campos inválidos, IDs duplicados, categorías inexistentes, posiciones repetidas, incoherencia entre formato y contenido o redes sociales inválidas/duplicadas.

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

**Decision**: Usar Vitest para reglas puras (validación, orden, selección inicial) y Playwright contra `astro preview` para portada, menú, filtros, deep links, formatos, estados vacíos, accesibilidad, movimiento reducido y layouts desktop/móvil. Separar `homepage.spec.ts`, `categories.spec.ts`, `learning-route.spec.ts` y `note-content.spec.ts` evita conflictos de edición y mantiene cada flujo identificable. `astro check` y `astro build` completan el gate.

**Rationale**: Astro documenta Vitest como opción Vite-native con TypeScript y Playwright para pruebas end-to-end en navegadores modernos. Referencia: [Astro testing](https://docs.astro.build/en/guides/testing/).

**Alternatives considered**:

- Solo pruebas E2E: diagnósticos más lentos para invariantes de datos.
- Solo unitarias: no verifican routing, responsividad ni interacción real.

## Decisión 8: Arquitectura de información de la portada

**Decision**: Renderizar una portada semántica y content-first con introducción del propósito, instrucciones en pasos, tres beneficios explícitos, índice de categorías y redes del autor. El índice se ordena por nombre visible normalizado y usa `id` como desempate; la presentación amplia y la compacta consumen el mismo array y las mismas URLs canónicas.

**Rationale**: La jerarquía responde en orden a “qué es”, “cómo se usa”, “qué aporta” y “por dónde comienzo”, cubre FR-020 a FR-024 y evita diferencias entre variantes responsive. HTML completo antes de JavaScript conserva navegación, SEO y accesibilidad.

**Alternatives considered**:

- Hero puramente promocional: llamativo, pero no explica cómo iniciar el aprendizaje.
- Dos listas independientes para escritorio y móvil: duplica datos, foco y riesgo de divergencia.
- Orden editorial adicional: introduce un campo que la especificación no solicita; el orden por nombre e ID es determinista sin ampliar el esquema de categoría.

## Decisión 9: Configuración versionada de redes sociales

**Decision**: Mantener `socialLinks` como datos `readonly` en `src/data/site.ts`. Cada entrada declara identificador de red, etiqueta comprensible y URL HTTPS absoluta; red y URL son únicas. El array puede estar vacío y en ese caso no se renderizan enlaces ni placeholders. La validación es sintáctica y participa en el gate, sin consultar disponibilidad remota.

**Rationale**: Los perfiles son pocos, públicos y aportados por el autor; una configuración tipada conserva simplicidad, revisión por Git y publicación estática. Evitar comprobaciones de red impide builds frágiles por fallos transitorios externos.

**Alternatives considered**:

- Hardcodear enlaces en `index.astro`: mezcla contenido y presentación y dificulta validar duplicados.
- Nueva Content Collection: agrega estructura editorial innecesaria para una lista pequeña de configuración del sitio.
- Verificar cada red durante el build: introduce dependencia de red no determinista.

## Decisión 10: Sistema visual oscuro con identidad propia

**Decision**: Traducir la referencia de Vercel a principios —jerarquía tipográfica clara, espacio generoso, bordes sutiles, superficies oscuras y composición por grilla— sin copiar marca ni activos. Centralizar tokens Tailwind para superficies casi negras, texto, bordes, foco y una paleta restringida de acentos. Verificar contraste mínimo WCAG 2.2 AA: 4.5:1 para texto normal, 3:1 para texto grande y 3:1 para límites, iconos y estados esenciales; el color nunca comunica estado por sí solo.

**Rationale**: Los tokens producen consistencia y código modular, mientras los umbrales convierten “oscuro y moderno” en un contrato verificable. La identidad propia evita que la inspiración visual se convierta en imitación.

**Alternatives considered**:

- Copiar secciones o activos de Vercel: contradice FR-025 y la constitución.
- Grises de bajo contraste sobre negro puro: sacrifica legibilidad por estética.
- Acentos distintos por componente: fragmenta la jerarquía visual y aumenta mantenimiento.

Referencias: [Vercel](https://vercel.com/), [WCAG 2.2 — Contrast Minimum](https://www.w3.org/TR/WCAG22/#contrast-minimum), [WCAG 2.2 — Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [WCAG 2.2 — Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color).

## Decisión 11: Movimiento estático-first y progresivo

**Decision**: La interfaz estática es la experiencia base. Activar únicamente bajo `@media (prefers-reduced-motion: no-preference)` transiciones cortas de opacidad, color y transformaciones pequeñas para hover, foco y disclosures. Bajo `reduce` se eliminan desplazamientos, escalado, parallax, scroll suave y movimiento no esencial; los cambios de estado son inmediatos y nunca dependen solo de animación.

**Rationale**: La estrategia honra automáticamente la preferencia del sistema, evita estado o controles adicionales y cumple FR-026 sin ocultar ni retrasar contenido. W3C recomienda aplicar movimiento no esencial solo cuando la persona no ha solicitado reducirlo.

**Alternatives considered**:

- Animar por defecto y sobrescribir después: aumenta el riesgo de que una regla quede activa en modo reducido.
- Toggle propio de animaciones: agrega persistencia y UI que no son necesarias para respetar el sistema operativo.
- Parallax o animación ligada al scroll: añade distracción y riesgo vestibular sin aportar al aprendizaje.

Referencias: [WCAG Technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39), [Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions), [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide).

## Decisión 12: Fallback determinista para videos y verificación de rendimiento

**Decision**: Mostrar junto a cada iframe un enlace externo siempre visible y descriptivo para abrir el video en YouTube; no intentar inferir de forma fiable un bloqueo del iframe entre orígenes. Para el filtro, Playwright ejecuta 20 cambios sobre un fixture de 100 tarjetas, mide desde el evento hasta la actualización visible del DOM y exige p95 menor a 100 ms; si el entorno CI no permite tiempos estables, el mismo protocolo se registra como perfil local repetible y el test automatizado valida solo exactitud.

**Rationale**: El enlace garantiza una acción útil incluso cuando el embed no carga, mientras la medición definida vuelve verificable la meta de rendimiento sin convertir fluctuaciones de CI en falsos fallos.

**Alternatives considered**:

- Depender de `iframe.onerror`: no cubre de forma consistente bloqueos, restricciones o errores del proveedor.
- Mostrar el enlace solo después de detectar un fallo: puede dejar al estudiante sin salida.
- Afirmar tiempo con una sola interacción CI: no produce una medida estable ni representativa.

## Resolución de incógnitas

No quedan incógnitas técnicas. El stack, persistencia, rutas, esquema, configuración social, portada, sistema visual, movimiento, fallback de video, validación, pruebas y estrategia responsive están definidos sin excepciones constitucionales.
