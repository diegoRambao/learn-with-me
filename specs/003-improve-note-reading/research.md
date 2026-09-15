# Research: Lectura mejorada y navegación entre notas

## Decisión 1: Mejorar el HTML Markdown existente sin cambiar el procesador

**Decision**: Conservar el procesador Markdown `unified` y el resaltado Shiki incluidos en Astro. Aplicar estilos bajo una clase de alcance `note-prose` al HTML generado para encabezados, párrafos, listas, citas, separadores, código en línea, `pre` y enlaces.

**Rationale**: Astro ya genera HTML semántico y resaltado de sintaxis desde las notas actuales. La necesidad es de presentación e interacción local, no de una nueva sintaxis ni de transformar el árbol Markdown. Un alcance explícito evita afectar tarjetas, navegación y otros enlaces globales.

**Alternatives considered**:

- Añadir plugins remark/rehype: útiles cuando debe modificarse el árbol, pero innecesarios para estilos y copia y agregarían dependencias/configuración.
- Sustituir Markdown por MDX o componentes manuales: modificaría el contrato de contenido y el alcance.
- Usar el plugin Typography de Tailwind: ampliaría dependencias y exigiría retocar su sistema visual genérico para reproducir tokens ya existentes.

## Decisión 2: Sangría y ritmo editorial mediante CSS semántico

**Decision**: Definir marcadores visibles, `padding-inline-start` incremental y espacios específicos para `ul`, `ol`, `li`, listas anidadas, encabezados, párrafos, citas y separadores dentro de `note-prose`. Usar propiedades lógicas y valores acotados para conservar jerarquía a 320 px.

**Rationale**: Tailwind Preflight elimina por defecto los marcadores, márgenes y padding de listas, causa directa de la sangría actual. Las propiedades lógicas restauran la semántica visual sin modificar el Markdown. La referencia de React Native se usa solo para ritmo, anchura legible, código contenido y navegación editorial; colores, tipografía e identidad siguen siendo los del sitio.

**Alternatives considered**:

- Insertar clases en cada nodo Markdown: requiere transformar el AST sin aportar semántica.
- Márgenes fijos amplios: recortan marcadores y contenido en pantallas estrechas.
- Aplanar listas anidadas: destruye la relación expresada por el contenido.

## Decisión 3: Bloques de código compactos con overflow local

**Decision**: Mantener el `<pre><code>` emitido por Astro/Shiki, limitarlo a `max-width: 100%`, usar tipografía y padding compactos, y aplicar `overflow-x: auto` al bloque. El documento no debe adquirir scroll horizontal; solo la línea larga puede desplazarse dentro del bloque.

**Rationale**: Conserva resaltado y texto original, reduce el peso visual y satisface lectura completa sin reflow destructivo. No se añaden números de línea, etiquetas ni adornos que pudieran confundirse con el contenido copiable.

**Alternatives considered**:

- Ajustar líneas con `white-space: pre-wrap`: cambia la representación espacial del código y dificulta comparar líneas.
- Truncar con ellipsis: oculta contenido.
- Sustituir Shiki: no es necesario y alteraría el aspecto actual más allá de la feature.

## Decisión 4: Copia como mejora progresiva TypeScript sin framework

**Decision**: Incluir en `NoteContent.astro` un script procesado por Astro que localiza todos los `pre > code` dentro de la nota escrita, envuelve cada bloque una sola vez y añade una acción de copia asociada. Copia `code.textContent` mediante `navigator.clipboard.writeText`, sin incorporar el botón ni decoración.

**Rationale**: Los scripts de componente de Astro admiten TypeScript, bundling y deduplicación. La consulta de todos los bloques cubre cualquier cantidad sin hidratar un framework y mantiene el HTML del contenido visible disponible antes y después de JavaScript.

**Alternatives considered**:

- Una isla React/Svelte por bloque: aumenta JavaScript y añade un framework para una acción pequeña.
- Un plugin rehype que genere controles: todavía requeriría JavaScript de navegador y acoplaría la UI al pipeline global.
- API obsoleta `document.execCommand('copy')`: comportamiento inconsistente y sin ventaja para el contrato de fallo explícito.

## Decisión 5: Estado accesible por bloque y degradación seleccionable

**Decision**: Cada control mantiene estado efímero `idle`, `copied` o `error`, con texto visual y una región de estado `aria-live="polite"` asociada al bloque. Tras éxito muestra una confirmación temporal y vuelve a reposo. Ante API ausente o rechazo, muestra un mensaje no técnico y selecciona el `<code>` mediante `Range`/`Selection` para facilitar la copia manual sin cambiarlo.

**Rationale**: El feedback pertenece inequívocamente al bloque activado, es perceptible por vista y tecnología de asistencia, y el fallo deja el contenido disponible. El estado no necesita persistencia ni coordinación entre bloques.

**Alternatives considered**:

- Un toast global: puede atribuirse al bloque equivocado cuando existen varios.
- Cambiar solo el icono: no ofrece un resultado suficientemente claro ni accesible.
- Ocultar el control si Clipboard no existe: contradice el estado de fallo requerido y no ayuda a seleccionar manualmente.

## Decisión 6: Vecinos derivados dentro de `LearningRoute`

**Decision**: Extender el modelo inmutable `LearningRoute` con `previousNote` y `nextNote`, ambos `Note | null`. `createLearningRoute` filtra y ordena una sola vez por `position` e `id`, localiza la nota activa y deriva los índices adyacentes; si no hay nota activa, ambos son `null`.

**Rationale**: El índice lateral y la navegación final comparten exactamente la misma fuente de orden y aislamiento de categoría. La función pura es fácil de probar y admite posiciones no consecutivas, empates defensivos y mezcla de notas escritas y de video.

**Alternatives considered**:

- Calcular `position ± 1`: falla con posiciones discontinuas y empates.
- Calcular vecinos en la página o componente: duplica lógica de dominio en un consumidor.
- Inferirlos desde el DOM del índice lateral: depende de presentación y JavaScript innecesariamente.
- Navegación circular o controles deshabilitados: contradice la omisión requerida en los extremos.

## Decisión 7: Componente estático dedicado para navegación final

**Decision**: Crear `NoteNavigation.astro` con `category`, `previousNote` y `nextNote`. Renderizar un `<nav aria-label="Navegación entre notas">` solo cuando exista algún destino, en orden DOM Anterior/Siguiente, usando `noteUrl`, etiqueta direccional y título completo. La página lo coloca después de `NoteContent` para ambos formatos.

**Rationale**: Separa presentación de derivación, conserva enlaces HTML funcionales sin JavaScript y garantiza que las notas de video formen parte del recorrido. El grid responsive reserva la posición lógica de cada dirección y permite envolver títulos largos.

**Alternatives considered**:

- Incluirlo dentro de la rama de Markdown: excluiría notas de video.
- Reutilizar `CourseNavigation`: su propósito, densidad y ubicación lateral son distintos.
- Truncar títulos: incumple el título completo exigido.

## Decisión 8: Pruebas por capas sobre contenido real

**Decision**: Ampliar Vitest para las invariantes de vecinos y configurar `getViteConfig` junto con Astro Container para renderizar `NoteNavigation.astro` de forma aislada. Usar Playwright para DOM Markdown, overflow, copia exacta, éxito/fallo accesible, enlaces en temas y navegación first/middle/last. Las formas ausentes del contenido real —`blockquote`, línea garantizadamente larga y enlace interno— se inyectan como markup semántico exclusivo de prueba dentro del alcance de la nota, sin crear una ruta publicada.

**Rationale**: La lógica combinatoria se valida rápido; Astro Container comprueba que ambos vecinos nulos omiten realmente el landmark; y Playwright verifica el contrato real generado por Astro y las APIs del navegador. La nota `dart-function` ya aporta múltiples bloques y enlaces externos; las notas de terminal aportan listas anidadas, y la ruta Dart escrita–video–escrita valida navegación entre formatos.

**Alternatives considered**:

- Probar todo manualmente: deja regresiones de copia y navegación sin gate repetible.
- Crear contenido de producción artificial: viola la restricción de no modificar notas.
- Añadir una aplicación Astro paralela de fixtures: complejidad desproporcionada para este alcance.

## Decisión 9: Alinear la versión mínima real de Node.js

**Decision**: Declarar Node.js `>=22.12.0` en el plan, quickstart y `package.json` durante la implementación.

**Rationale**: Astro 7.3.2 exige al menos Node 22.12 dentro de la línea 22. El rango actual `>=22` admite versiones con las que ni el build ni las pruebas pueden arrancar.

**Alternatives considered**:

- Mantener `>=22`: publica una compatibilidad que la dependencia principal rechaza.
- Adoptar otra línea mayor de Node: no aporta valor a la feature y amplía la matriz de soporte.

## Resolución de incógnitas

No quedan decisiones técnicas pendientes. Están definidos el pipeline Markdown, alcance CSS, overflow, fuente exacta de copia, estados accesibles, fallo y selección manual, derivación de vecinos, ubicación para ambos formatos, URLs, versión mínima de Node.js, comportamiento responsive y estrategia de pruebas.
