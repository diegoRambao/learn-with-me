# Contract: Panel lateral de temas y notas

## Estructura

- La página de detalle conserva `GET /categorias/{categoryId}/{noteId}/` como HTML estático.
- Un `<aside id="course-navigation-panel">` contiene el landmark `nav` de la categoría.
- La raíz del listado intercala temas y notas sin tema en posición ascendente.
- Cada tema es un disclosure nativo independiente con nombre y estado perceptibles; su posición global solo determina el orden y no se muestra como número.
- Al expandir un tema aparecen sus notas por posición global; si está vacío aparece exactamente `No hay notas`.
- Una nota activa usa `aria-current="page"`, esté en raíz o dentro de un tema.
- Las notas dentro de cada tema se numeran visualmente desde `01` según su índice local; la numeración se reinicia en cada tema.
- Las notas sin tema conservan como número visible su `note.position` global.

## Estado inicial y navegación

- Sin estado previo de la categoría, el panel está visible.
- Si la nota activa pertenece a un tema, solo ese tema se renderiza abierto inicialmente.
- Si la nota activa no tiene tema, todos los temas comienzan cerrados.
- Expandir un tema no cierra los demás.
- Al navegar a una nota de un tema cerrado, ese tema se abre y los demás conservan su estado.
- El footer Anterior/Siguiente sigue usando la lista global de notas y no cambia por la agrupación.

## Control del panel

- Un botón nativo permanece fuera del aside y controla `course-navigation-panel`.
- Su nombre visible alterna entre `Ocultar panel` y `Mostrar panel`.
- `aria-controls` identifica el aside y `aria-expanded` refleja si ocupa espacio.
- Ocultar elimina la columna del panel y permite que la nota use todo el ancho disponible.
- Mostrar restituye el ancho de 19rem en escritorio; el panel no es redimensionable.
- La activación mantiene el foco en el botón y no cambia la nota activa, temas abiertos ni scroll del panel.

## Estado durante la visita

- `sessionStorage` guarda una versión de `{ visible, expandedTopicIds, navigationScrollTop }` por `categoryId`.
- Se actualiza al alternar panel o temas, al desplazar el área de navegación y antes de abandonar el documento.
- Al cargar otra nota de la misma categoría, se restaura el registro y se añade el tema activo si faltaba.
- Cambiar de categoría usa otra clave y no hereda el estado anterior.
- Cerrar la pestaña termina el alcance requerido; no se promete persistencia entre sesiones.
- Si el almacenamiento está deshabilitado, lleno o corrupto, la página sigue usable con el estado renderizado por el servidor.

## Responsive y accesibilidad

- En escritorio visible, el layout conserva dos columnas; oculto, usa una.
- Por debajo de `lg`, el panel permanece en el flujo antes del contenido y el mismo toggle compacto lo muestra u oculta; no existe overlay ni focus trap.
- A partir de 320 px, toggle, panel, nota activa y contenido son alcanzables y la página no exige scroll horizontal.
- `summary` y botón se alcanzan y activan con teclado; el foco visible global se conserva.
- Iconos y carets decorativos se ocultan a tecnologías de asistencia.
- Los controles reutilizan `.panel`, `.route-link`, tokens de color, tipografía, espaciado, radios y estados interactivos vigentes.

## Degradación progresiva

- El HTML inicial expone toda la navegación y abre el tema activo aun si falla el script.
- Los enlaces de notas funcionan sin JavaScript.
- La persistencia y el toggle de layout son mejoras del navegador; un fallo de ellas no impide leer ni navegar.
