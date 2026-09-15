# UI Contract: Búsqueda transversal

## Rutas y parámetros

- El destino dedicado es `/buscar/`.
- El formulario transversal usa GET y el nombre de campo `q`.
- Una consulta confirmada se representa como `/buscar/?q=<consulta codificada>` y puede recargarse o compartirse.
- Los resultados de categoría enlazan mediante `categoryUrl`; los de nota mediante `noteUrl`.
- Parámetros desconocidos no alteran el matching ni producen mensajes técnicos.

## Formulario del encabezado

- Toda vista que use `BaseLayout` recibe exactamente un control de búsqueda dentro de `SiteHeader`.
- El input tiene label o nombre accesible “Buscar categorías y notas”, `name="q"`, tipo apropiado de búsqueda y botón submit identificable.
- El formulario sigue siendo legible y operable junto a Categorías y selector de tema; a 320 px puede ocupar una fila propia sin overflow.
- Enter y activación del botón confirman la búsqueda.
- Antes de navegar, el valor se recorta. Si queda vacío, se cancela el envío, se muestra “Escribe un término para buscar” de forma perceptible y se lleva el foco al input.
- En `/buscar/`, el input refleja la consulta URL actual para editarla y volver a buscar.

## Semántica observable

- La búsqueda usa solo:
  - categoría: `name`, `description`;
  - nota: `title`, `description`, cada elemento de `tags`.
- Nunca usa cuerpo Markdown, nombre de categoría como campo implícito de nota, nivel, duración, formato ni ID.
- No distingue mayúsculas de minúsculas ni letras con/sin tilde.
- Cada token admite coincidencia parcial literal dentro de un campo.
- Todos los tokens deben coincidir dentro del mismo elemento, aunque estén en campos diferentes y en distinto orden.
- Un elemento se devuelve una vez aunque varios campos o etiquetas coincidan.
- Categorías y notas se filtran por separado y conservan su orden estable; no existe ranking.

## Estados de la página

### Inicial

Al abrir `/buscar/` sin `q`, se muestra el título de la página, el formulario disponible y una instrucción para introducir un término. No se ejecuta búsqueda ni se anuncian resultados inexistentes.

### Inválido

Si la URL contiene un `q` vacío o solo espacios, no se evalúa el índice. Se conserva el valor de la URL y se anuncia “Escribe un término para buscar”; el control permite corregirlo.

### Con resultados

- Un encabezado indica la consulta y el total encontrado.
- Existen dos secciones con headings “Categorías” y “Notas”.
- Si una sección queda vacía y la otra no, la vacía muestra un mensaje explícito y la otra conserva todos sus resultados.
- La actualización posterior a una búsqueda es perceptible mediante `role="status"` o `aria-live="polite"` sin mover el foco arbitrariamente.

### Sin resultados

Se conserva y muestra la consulta, se anuncia que no hubo coincidencias y se invita a probar otro término. Las secciones no contienen tarjetas ficticias; el formulario permanece operativo.

## Resultado de categoría

- Un único enlace principal lleva al destino canónico.
- Muestra nombre como heading, descripción completa y la imagen de categoría.
- La imagen tiene texto alternativo contextual. Si falla, usa `/category-fallback.svg` sin ocultar contenido ni enlace.
- Texto largo envuelve; la acción nunca queda inaccesible ni aparece scroll horizontal de página.

## Resultado de nota

- Un único enlace principal lleva al destino canónico.
- Muestra título como heading, descripción completa, todas las etiquetas y la imagen de su categoría.
- Las etiquetas son texto contextual, no filtros ni enlaces.
- La imagen identifica visualmente la categoría, tiene alternativa contextual y usa el mismo fallback al fallar.
- Texto y etiquetas largas envuelven sin cortar la operabilidad.

## Accesibilidad, seguridad y resiliencia

- Formulario, resultados y destinos se recorren en orden lógico con teclado y conservan foco visible.
- Los headings distinguen página, secciones y entradas sin depender solo de color o imagen.
- Los mensajes inicial, inválido, parcial y vacío son texto real y los cambios dinámicos son anunciables.
- Los metadatos se insertan como texto, nunca como HTML interpretado.
- Todas las entradas se prerenderizan con Astro y empiezan ocultas; el cliente solo alterna `hidden` después de aplicar la consulta, sin construir `innerHTML`.
- Las rutas provienen de helpers validados y no de texto libre.
- Sin JavaScript, el formulario GET aún navega a la URL dedicada y la página explica que no puede actualizar resultados, sin exponer trazas; los destinos normales del sitio continúan disponibles.
- No hay telemetría, historial persistente, sugerencias, red externa ni envío de la consulta a terceros.
