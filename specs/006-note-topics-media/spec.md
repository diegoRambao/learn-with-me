# Feature Specification: Temas, videos y panel de notas

**Feature Branch**: `main`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "Agrupar las notas por temas en el panel lateral, permitir videos de YouTube dentro del contenido Markdown y hacer que el panel lateral pueda ocultarse y mostrarse sin cambiar el sistema de diseño actual."

## Clarifications

### Session 2026-09-16

- Q: ¿La posición debe ser única para todos los temas y notas de una categoría, aunque una nota esté agrupada dentro de un tema? → A: Temas y notas comparten posiciones únicas dentro de toda la categoría.
- Q: ¿Qué temas deben aparecer expandidos inicialmente al abrir directamente una nota? → A: Solo se expande automáticamente el tema que contiene la nota activa; los demás comienzan contraídos.
- Q: ¿Qué formatos de enlace de YouTube deben convertirse automáticamente en reproductores cuando aparecen como bloques independientes en Markdown? → A: Enlaces `watch`, `youtu.be`, `shorts` y `embed` de videos individuales.
- Q: Si la navegación anterior/siguiente abre una nota cuyo tema estaba contraído, ¿qué debe ocurrir con ese tema en el panel? → A: Se expande el tema de la nueva nota activa sin contraer los demás.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar notas agrupadas por temas (Priority: P1)

Como estudiante que consulta una categoría, quiero ver sus notas organizadas en temas expandibles para comprender la estructura del contenido y localizar con rapidez la nota que deseo estudiar.

**Why this priority**: La agrupación transforma el listado plano en una ruta comprensible y constituye el cambio principal de organización solicitado.

**Independent Test**: Puede probarse con una categoría que contenga dos temas, notas asignadas, una nota sin tema y un tema vacío; el panel debe mostrar cada elemento en el nivel y orden correctos, permitir expandir y contraer los temas y abrir cualquier nota disponible.

**Acceptance Scenarios**:

1. **Given** una categoría con temas y notas asignadas, **When** la persona abre una nota de esa categoría, **Then** el panel lateral muestra los temas ordenados y permite expandirlos para revelar sus notas ordenadas.
2. **Given** un tema expandido, **When** la persona activa su control, **Then** sus notas se ocultan sin afectar los demás temas ni la nota activa.
3. **Given** una nota visible dentro de un tema, **When** la persona la selecciona, **Then** su contenido aparece en el área principal y el panel la identifica como activa.
4. **Given** una nota sin tema asignado, **When** se muestra el panel, **Then** aparece directamente en el nivel principal y puede seleccionarse sin abrir ningún grupo.
5. **Given** un tema que no contiene notas, **When** la persona lo expande, **Then** el panel muestra exactamente el mensaje “No hay notas”.
6. **Given** temas y notas con posiciones definidas, **When** se muestra cualquier nivel del panel, **Then** cada elemento aparece en orden ascendente de posición dentro de ese nivel.
7. **Given** una apertura inicial de una nota asignada a un tema, **When** se muestra el panel, **Then** el tema de la nota activa aparece expandido y todos los demás temas aparecen contraídos.
8. **Given** una navegación anterior o siguiente hacia una nota de un tema contraído, **When** la nueva nota se vuelve activa, **Then** su tema se expande automáticamente y los demás temas conservan su estado.

---

### User Story 2 - Reproducir videos incluidos en Markdown (Priority: P2)

Como estudiante que lee una nota escrita, quiero reproducir los videos de YouTube incluidos en su contenido sin abandonar la página para complementar la explicación mientras mantengo el contexto de estudio.

**Why this priority**: El contenido audiovisual enriquece las notas escritas y evita interrumpir el recorrido de aprendizaje con navegación externa.

**Independent Test**: Puede probarse con una nota escrita que incluya una dirección válida de YouTube en una línea independiente, texto antes y después, y otra dirección no compatible; la válida debe convertirse en un reproductor adaptable en su posición original y el resto del contenido debe conservarse.

**Acceptance Scenarios**:

1. **Given** una nota escrita con un enlace válido de YouTube en una línea independiente, **When** se muestra el contenido Markdown, **Then** el enlace se presenta como un reproductor integrado en la misma posición del contenido.
2. **Given** un reproductor integrado, **When** la persona inicia la reproducción, **Then** puede ver y controlar el video sin salir de la página de la nota.
3. **Given** un reproductor en una pantalla amplia o estrecha, **When** cambia el ancho disponible, **Then** ocupa como máximo el ancho del contenido y conserva la proporción del video sin generar desplazamiento horizontal en la página.
4. **Given** un enlace de YouTube inválido, no compatible o no disponible, **When** se muestra la nota, **Then** el resto del Markdown permanece legible y la persona recibe una alternativa comprensible para acceder al enlace cuando sea seguro hacerlo.

---

### User Story 3 - Ocultar y recuperar el panel lateral (Priority: P3)

Como estudiante, quiero ocultar el panel lateral para concentrarme en la nota y aprovechar todo el ancho disponible, y volver a mostrarlo sin perder el contexto de navegación.

**Why this priority**: Mejora la concentración y el uso del espacio, pero depende de que el panel ya presente correctamente la estructura de temas y notas.

**Independent Test**: Puede probarse expandiendo varios temas, seleccionando una nota, ocultando el panel y mostrándolo de nuevo; el contenido debe ampliar y reducir su área, mientras la nota activa y los temas expandidos conservan su estado.

**Acceptance Scenarios**:

1. **Given** el panel visible, **When** la persona activa el control para ocultarlo, **Then** el panel deja de ocupar espacio y el contenido de la nota utiliza todo el ancho disponible de la página.
2. **Given** el panel oculto, **When** la persona activa el control para mostrarlo, **Then** el panel recupera su tamaño anterior y el contenido vuelve a ocupar el espacio restante.
3. **Given** uno o más temas expandidos y una nota activa, **When** la persona oculta y vuelve a mostrar el panel durante la misma visita, **Then** se conservan los temas expandidos, la nota activa y la posición de navegación.
4. **Given** una persona que navega con teclado o tecnología de asistencia, **When** encuentra el control del panel, **Then** puede conocer el estado actual, activarlo y percibir el nuevo estado.

### Edge Cases

- Una categoría puede no tener temas y conservar únicamente sus notas en el nivel principal del panel.
- Una categoría puede contener temas vacíos, notas agrupadas y notas sin tema al mismo tiempo.
- Un tema vacío conserva su lugar por posición y solo muestra “No hay notas” al estar expandido.
- Una nota puede pertenecer como máximo a un tema de su propia categoría; una referencia a un tema inexistente o de otra categoría impide publicar el contenido afectado y señala el dato que debe corregirse.
- Dos temas o notas de una misma categoría no pueden compartir posición, aunque se muestren en niveles diferentes; la publicación se bloquea con un mensaje que identifica el conflicto.
- Ocultar el panel mientras un tema está expandido no contrae el tema ni cambia la nota activa.
- Si el contenido incluye varios videos consecutivos, cada uno conserva su posición y se adapta al ancho sin superponerse con los demás.
- Un enlace ordinario de YouTube dentro de un párrafo conserva su comportamiento de enlace; solo una dirección compatible colocada como bloque independiente se transforma automáticamente en reproductor.
- Los enlaces a canales, perfiles o listas de reproducción de YouTube no se transforman en reproductores; conservan su comportamiento de enlace.
- Si YouTube impide cargar o reproducir un video, la nota y su navegación continúan disponibles y no muestran detalles técnicos.
- En una pantalla estrecha, mostrar el panel no debe dejar inaccesibles el contenido, el control de cierre ni la nota activa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada tema de navegación DEBE pertenecer a una sola categoría y declarar un identificador único dentro de ella, un nombre visible y una posición.
- **FR-002**: Los responsables del contenido DEBEN poder declarar un tema sin asociarle notas, sin requerir una interfaz administrativa.
- **FR-003**: Cada nota DEBE poder declarar opcionalmente un único tema perteneciente a su misma categoría.
- **FR-004**: El panel lateral de una nota DEBE mostrar los temas de la categoría activa y las notas que pertenecen a cada tema.
- **FR-005**: Las notas sin tema DEBEN mostrarse directamente en el nivel principal del panel lateral y no dentro de un grupo implícito.
- **FR-006**: Cada tema DEBE ofrecer un control para expandir u ocultar su contenido, con nombre y estado perceptibles para personas que navegan visualmente, con teclado o con tecnologías de asistencia; en la apertura inicial, solo el tema que contiene la nota activa DEBE aparecer expandido y los demás DEBEN aparecer contraídos.
- **FR-007**: Al expandir un tema sin notas, el panel DEBE mostrar exactamente “No hay notas” en el espacio destinado a su contenido.
- **FR-008**: Al seleccionar una nota desde cualquier nivel del panel, el área principal DEBE mostrar esa nota y el panel DEBE identificarla como activa.
- **FR-009**: Todos los temas y notas de una categoría DEBEN compartir una única secuencia de posiciones; el nivel principal muestra temas y notas sin tema en orden ascendente, y cada tema muestra sus notas también en orden ascendente según esa misma secuencia. Los temas no muestran número; dentro de cada tema, las notas se numeran visualmente desde `01` según su índice local, mientras las notas sin tema conservan su posición global visible.
- **FR-010**: La posición DEBE ser única entre todos los temas y notas de una categoría, aunque se muestren en niveles diferentes; cualquier conflicto DEBE impedir la publicación e identificar los elementos que deben corregirse.
- **FR-011**: Una nota que declare un tema inexistente, perteneciente a otra categoría o inválido DEBE impedir la publicación y producir un mensaje contextual y accionable para el responsable del contenido.
- **FR-012**: El contenido Markdown de una nota escrita DEBE reconocer como video integrable una dirección válida de un video individual de YouTube colocada como bloque independiente en los formatos `watch`, `youtu.be`, `shorts` o `embed`; los enlaces a canales, perfiles y listas de reproducción NO DEBEN convertirse automáticamente en reproductores.
- **FR-013**: Cada video reconocido dentro del Markdown DEBE aparecer como reproductor integrado en la posición ocupada por su enlace, sin convertir en reproductor los enlaces de YouTube incluidos dentro de párrafos ordinarios.
- **FR-014**: El reproductor DEBE permitir iniciar, pausar y controlar la reproducción dentro de la página, sujeto a la disponibilidad y las políticas del recurso de YouTube.
- **FR-015**: Cada reproductor DEBE ajustarse al ancho disponible, conservar la proporción panorámica del video y no provocar desplazamiento horizontal de la página en los tamaños de pantalla admitidos.
- **FR-016**: Si un video no puede integrarse o reproducirse, el sistema DEBE mantener disponible el resto de la nota y presentar un mensaje comprensible con una alternativa segura para abrir el recurso.
- **FR-017**: Una nota escrita PUEDE contener cero o más videos integrados como material complementario sin convertirse por ello en una nota cuyo formato principal sea video.
- **FR-018**: El panel lateral DEBE incluir un control para ocultarlo y mostrarlo desde la página de nota.
- **FR-019**: Mientras el panel esté oculto, el área principal DEBE utilizar todo el ancho disponible y el control para volver a mostrar el panel DEBE permanecer accesible.
- **FR-020**: Al volver a mostrar el panel durante la misma visita, este DEBE recuperar su tamaño anterior, la nota activa, los temas expandidos y la posición de navegación previa al ocultamiento.
- **FR-021**: El estado visible u oculto del panel y el estado expandido o contraído de cada tema DEBEN conservarse al cambiar entre notas de la misma categoría durante la misma visita; si la nueva nota activa pertenece a un tema contraído, ese tema DEBE expandirse automáticamente sin contraer los demás.
- **FR-022**: En pantallas estrechas, el panel DEBE poder mostrarse y ocultarse mediante un control compacto equivalente, sin bloquear el acceso al contenido ni generar desplazamiento horizontal obligatorio.
- **FR-023**: Todos los controles nuevos DEBEN poder localizarse, comprenderse y activarse mediante teclado, mostrar foco perceptible y comunicar su nombre y estado a tecnologías de asistencia.
- **FR-024**: La funcionalidad DEBE conservar los componentes, colores, tipografías, espaciados, apariencias y patrones de interacción del sistema de diseño vigente; los elementos nuevos DEBEN componerse a partir de ese lenguaje visual.
- **FR-025**: La funcionalidad NO DEBE cambiar las direcciones públicas actuales de categorías o notas, el contenido existente, el orden anterior/siguiente de la ruta ni el comportamiento de las notas cuyo formato principal es video.
- **FR-026**: El alcance NO incluye edición visual de temas o notas, redimensionamiento manual del panel, cuentas de usuario, comentarios, listas de reproducción ni soporte para proveedores de video distintos de YouTube.

### Key Entities

- **Tema de navegación**: Agrupación opcional dentro de una categoría. Tiene identificador, nombre y posición; puede contener cero o más notas y conserva un estado expandido o contraído durante la visita.
- **Nota**: Unidad de aprendizaje que pertenece a una categoría, conserva sus atributos actuales y puede referenciar opcionalmente un tema de esa misma categoría.
- **Elemento de navegación**: Tema o nota de una categoría, mostrado en el nivel principal o dentro de un tema. Su posición es única en toda la categoría y determina su lugar en la secuencia global.
- **Video integrado**: Recurso complementario de YouTube declarado mediante una dirección compatible dentro del Markdown de una nota escrita; ocupa una posición en el flujo del contenido y conserva una proporción adaptable.
- **Estado del panel**: Contexto temporal de la visita formado por su visibilidad, tamaño, posición de navegación, nota activa y conjunto de temas expandidos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los temas, notas agrupadas y notas sin tema de una categoría de prueba aparece en el nivel correcto y en orden ascendente de posición.
- **SC-002**: El 100% de los temas puede expandirse y contraerse; todos los temas vacíos muestran “No hay notas” al expandirse y ningún tema vacío desaparece del panel.
- **SC-003**: Al menos el 90% de las personas participantes localiza y abre una nota indicada dentro de un tema en menos de 15 segundos, sin ayuda.
- **SC-004**: El 100% de los enlaces válidos `watch`, `youtu.be`, `shorts` y `embed` de videos individuales se convierte en un reproductor en la posición correcta del contenido, mientras el 100% de los enlaces incluidos en párrafos y de los enlaces a canales, perfiles o listas permanece como enlace.
- **SC-005**: El 100% de los reproductores evaluados conserva su proporción y permanece dentro del ancho de la nota en pantallas de 320 px o más, sin provocar desplazamiento horizontal en la página.
- **SC-006**: Al menos el 90% de las personas participantes inicia la reproducción de un video integrado en menos de 10 segundos sin salir de la página.
- **SC-007**: En el 100% de las pruebas de ocultar y mostrar, el contenido aprovecha el espacio liberado y el panel recupera su tamaño, nota activa, posición de navegación y temas expandidos anteriores.
- **SC-008**: Al menos el 90% de las personas participantes oculta o recupera el panel en menos de 5 segundos, tanto en pantalla amplia como estrecha.
- **SC-009**: El 100% de los recorridos críticos —expandir temas, seleccionar notas, controlar el panel y acceder al reproductor— puede completarse mediante teclado con foco y estados perceptibles.
- **SC-010**: Una revisión visual comparativa confirma que el 100% de los elementos nuevos utiliza componentes, colores, tipografías, espaciados y patrones ya presentes en el sistema de diseño.
- **SC-011**: El 100% de las direcciones públicas de categorías y notas existentes continúa abriendo el mismo contenido después de incorporar la funcionalidad.

## Assumptions

- Un tema es una subdivisión de navegación dentro de una categoría; no reemplaza a la categoría ni puede agrupar notas de categorías distintas.
- Los temas y su asignación a notas se mantienen en las fuentes de contenido versionadas del sitio, igual que las categorías y notas actuales; no se añade una interfaz de administración.
- Todos los temas y notas de una categoría comparten una única secuencia de posiciones; agrupar una nota cambia su nivel visual, pero no crea una secuencia independiente ni altera su lugar en el recorrido global.
- El estado del panel y de los temas se conserva durante la visita activa y al navegar entre notas de la misma categoría; no se exige conservarlo después de cerrar o recargar la página.
- “Recuperar su tamaño anterior” significa volver al ancho definido por el diseño vigente antes de ocultarlo; el panel no será redimensionable manualmente.
- Las direcciones `watch`, `youtu.be`, `shorts` y `embed` de videos individuales se integran automáticamente solo cuando ocupan un bloque independiente del Markdown. Los enlaces dentro de párrafos y los destinos que no representan un video individual permanecen como enlaces para evitar reemplazos inesperados.
- Las notas cuyo formato principal es video conservan su comportamiento actual; los videos dentro de Markdown son recursos complementarios de notas escritas.
- La reproducción depende de la disponibilidad, permisos y políticas de YouTube; el sitio garantiza una presentación y alternativa comprensibles, no la disponibilidad del servicio externo.
- La navegación anterior y siguiente conserva el orden global vigente de las notas dentro de la categoría; la agrupación del panel no redefine ese recorrido.
