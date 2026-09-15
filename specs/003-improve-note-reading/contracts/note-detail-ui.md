# Contract: Lectura, copia y navegación del detalle de nota

## Ruta y contenido

- `GET /categorias/{categoryId}/{noteId}/` continúa entregando HTML estático solo cuando la nota pertenece a la categoría indicada.
- La página conserva título, descripción, duración, índice lateral, selector de tema y destinos actuales.
- Una nota escrita muestra su cuerpo Markdown; una nota de video conserva reproductor y fallback de YouTube.
- Esta feature no modifica el Markdown fuente, frontmatter, orden de publicación ni comportamiento de enlaces existentes.

## Contrato editorial de Markdown

- El cuerpo usa un alcance visual propio que no altera contenido fuera de la nota.
- Encabezados, párrafos, listas, citas, separadores, código en línea y bloques se distinguen mediante más de una señal de jerarquía.
- Listas ordenadas y no ordenadas conservan marcadores visibles; cada anidación añade sangría perceptible sin recortar el marcador a 320 px.
- Los bloques de código usan una escala menor que los encabezados y no dominan el texto explicativo.
- Una línea larga desplaza horizontalmente solo el bloque; el documento mantiene `scrollWidth <= clientWidth` en el viewport soportado.
- El texto del código conserva espacios, saltos de línea y caracteres emitidos desde el Markdown.

## Contrato de copia

- Con JavaScript disponible, cada `pre > code` tiene exactamente una acción de copia asociada inequívocamente.
- El nombre accesible identifica que la acción copia ese bloque; el control es un botón nativo, se alcanza por Tab y se activa con teclado.
- El payload copiado es el `textContent` del `<code>` correspondiente, sin texto del botón, etiqueta de lenguaje, numeración ni decoración.
- Una copia resuelta muestra una confirmación breve visible y la anuncia en una región `aria-live="polite"` perteneciente al mismo bloque.
- Si Clipboard no existe o rechaza la operación, se muestra un mensaje comprensible, no una excepción; el código permanece intacto y queda seleccionado para facilitar copia manual.
- Múltiples bloques mantienen controles y feedback independientes. Activar uno nunca copia ni confirma otro.
- Sin JavaScript, el texto completo continúa visible y seleccionable; no se promete una copia automática inexistente.

## Contrato de enlaces Markdown

- Todo enlace dentro de la nota conserva su `href` actual.
- Usa un color de acento ya existente y subrayado permanente en temas claro, oscuro y sistema.
- Hover y foco son perceptibles y nunca eliminan la identificación como enlace.
- El foco visible global se conserva y el contraste se valida en ambos esquemas.
- Enlaces internos y externos mantienen su comportamiento de apertura previo; esta feature no añade pestañas ni reescribe destinos.

## Contrato de navegación secuencial

- Después del contenido completo, tanto escrito como de video, aparece como máximo un landmark `<nav aria-label="Navegación entre notas">`.
- Cada destino se deriva de [LearningRoute](../data-model.md#learningroute), usa `noteUrl` y permanece dentro de la categoría activa.
- El orden del DOM es Anterior y luego Siguiente.
- Cada enlace muestra su dirección y el título completo del destino; las flechas decorativas, si existen, se ocultan a tecnologías de asistencia.
- Primera nota: solo Siguiente. Intermedia: ambos. Última: solo Anterior. Única o sin activa: no se renderiza el landmark.
- No existen destinos circulares, inventados, vacíos ni deshabilitados.
- Las notas de video participan exactamente como las escritas.
- A 320 px los destinos se apilan o reajustan, envuelven títulos largos y no generan desplazamiento horizontal; en anchura suficiente pueden ocupar columnas anterior/siguiente.
- Los enlaces son HTML ordinario, funcionan sin JavaScript y conservan foco visible.

## Resiliencia y privacidad

- La única operación de navegador es escribir texto elegido por la persona en su portapapeles.
- No se recopilan métricas, identidad ni contenido del portapapeles, y no se añade persistencia.
- Un fallo de copia no impide leer, seleccionar, navegar ni usar el índice lateral.
- Ningún mensaje visible expone detalles internos, trazas o nombres de API.
