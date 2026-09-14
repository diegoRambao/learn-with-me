# Feature Specification: Categorías y rutas de aprendizaje

**Feature Branch**: `main`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Mostrar categorías desde un apartado estático del menú, permitir filtrarlas por nivel de complejidad y presentar sus notas como una ruta de curso con la primera nota abierta y un listado lateral. Las notas solo se acceden desde categorías y pueden contener Markdown o un video de YouTube."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descubrir categorías por nivel (Priority: P1)

Como visitante, quiero abrir el apartado de categorías desde el menú principal y filtrar las categorías por nivel de complejidad para encontrar una ruta de aprendizaje adecuada a mi experiencia.

**Why this priority**: Es la puerta de entrada obligatoria al contenido educativo y permite que cada persona identifique rápidamente por dónde empezar.

**Independent Test**: Puede probarse cargando el sitio con categorías de varios niveles, entrando desde el menú y aplicando cada filtro; aporta por sí sola el descubrimiento organizado del contenido.

**Acceptance Scenarios**:

1. **Given** que el visitante se encuentra en cualquier página principal del sitio, **When** observa el menú, **Then** encuentra un acceso visible y estable al apartado de categorías.
2. **Given** que existen categorías publicadas, **When** abre el apartado de categorías, **Then** ve cada categoría con su nombre, imagen y nivel de complejidad.
3. **Given** que existen categorías de distintos niveles, **When** selecciona un nivel, **Then** solo permanecen visibles las categorías que tienen ese nivel.
4. **Given** que hay un filtro de nivel activo, **When** el visitante lo elimina o elige ver todas, **Then** vuelve a ver todas las categorías publicadas.

---

### User Story 2 - Recorrer las notas de una categoría (Priority: P2)

Como estudiante, quiero seleccionar una categoría y recorrer sus notas en un orden definido, con la nota activa junto a un listado de la ruta, para estudiar como si cada nota fuera una clase de un curso.

**Why this priority**: Convierte una colección de contenidos en una secuencia de aprendizaje comprensible y cumple el flujo principal de estudio.

**Independent Test**: Puede probarse con una categoría que contenga al menos tres notas ordenadas; al abrirla debe mostrarse la primera y debe ser posible cambiar entre todas desde el listado de la ruta.

**Acceptance Scenarios**:

1. **Given** una categoría con notas publicadas, **When** el estudiante la selecciona, **Then** ve únicamente las notas de esa categoría, ordenadas según su posición en la ruta.
2. **Given** que el estudiante acaba de entrar en una categoría, **When** se carga la ruta, **Then** la primera nota de la secuencia aparece seleccionada y su contenido se muestra sin otra acción.
3. **Given** una ruta abierta, **When** el estudiante selecciona otra nota desde el listado lateral, **Then** esa nota pasa a ser la activa y su contenido reemplaza al anterior.
4. **Given** una nota activa, **When** el estudiante consulta el listado de la ruta, **Then** puede distinguir visualmente cuál está abierta y conserva el orden completo de las notas.

---

### User Story 3 - Consumir notas escritas o en video (Priority: P3)

Como estudiante, quiero leer una nota escrita o reproducir una nota en video dentro de la ruta seleccionada para aprender mediante el formato disponible para cada clase.

**Why this priority**: Hace consumible el contenido final y permite combinar material escrito y audiovisual sin cambiar el modelo de navegación.

**Independent Test**: Puede probarse con una nota escrita y una nota de video dentro de la misma categoría, verificando que cada una presenta su título, descripción, duración estimada y el contenido correspondiente.

**Acceptance Scenarios**:

1. **Given** una nota escrita seleccionada, **When** se muestra su detalle, **Then** el estudiante ve el título, la descripción, la duración estimada y el contenido escrito completo con su formato legible.
2. **Given** una nota de video seleccionada, **When** se muestra su detalle, **Then** el estudiante ve el título, la descripción, la duración estimada y un reproductor del video de YouTube correspondiente.
3. **Given** que una persona intenta abrir directamente una nota fuera del flujo de categorías, **When** el sistema procesa el acceso, **Then** la conduce al apartado de categorías y le explica que debe elegir primero una categoría.

### Edge Cases

- Si no hay categorías publicadas, el apartado muestra un estado vacío comprensible y no presenta filtros inútiles.
- Si ningún resultado coincide con el nivel elegido, se informa que no hay categorías para ese nivel y se ofrece volver a mostrar todas.
- Si una categoría no contiene notas publicadas, se conserva la información de la categoría, se muestra un estado vacío y no se intenta seleccionar una nota.
- Si la imagen local o remota de una categoría no está disponible, se muestra una alternativa visual que conserva el nombre y la legibilidad de la categoría.
- Si el contenido escrito no puede cargarse o el video no está disponible, se muestra un mensaje contextual y accionable sin detalles técnicos; el listado de la ruta continúa utilizable.
- En pantallas donde no cabe un listado lateral permanente, la ruta de notas sigue siendo accesible mediante un control compacto sin perder el orden ni la indicación de la nota activa.
- Una nota asociada a una categoría distinta no aparece ni puede seleccionarse dentro de la ruta actual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mantener un acceso visible y estable a "Categorías" dentro del menú principal en todas las vistas que compartan esa navegación.
- **FR-002**: El sistema DEBE permitir declarar cada categoría con un identificador único, nombre, referencia de imagen local o remota y exactamente un nivel de complejidad.
- **FR-003**: Los niveles iniciales admitidos DEBEN incluir `Principiante`, `Intermedio`, `Avanzado` y `Pro`, y su presentación DEBE ser consistente en todas las categorías.
- **FR-004**: El apartado de categorías DEBE mostrar todas las categorías publicadas y hacer visibles, como mínimo, su nombre, imagen y nivel de complejidad.
- **FR-005**: El visitante DEBE poder filtrar las categorías por nivel de complejidad y restablecer el listado completo.
- **FR-006**: Al seleccionar una categoría, el sistema DEBE mostrar únicamente las notas publicadas que pertenecen a ella.
- **FR-007**: Cada nota DEBE declarar un identificador único, título, descripción, categoría, duración estimada de lectura o consumo y posición dentro de la ruta.
- **FR-008**: Cada nota DEBE declarar exactamente un formato de contenido: contenido escrito o video de YouTube.
- **FR-009**: Una nota escrita DEBE tener contenido legible versionado junto con el resto del contenido del sitio; una nota de video DEBE tener una referencia válida al video de YouTube que se mostrará.
- **FR-010**: Las notas de una categoría DEBEN aparecer en orden ascendente de posición, sin que el visitante tenga que ordenarlas manualmente.
- **FR-011**: Al entrar en una categoría con notas, el sistema DEBE seleccionar y mostrar automáticamente la primera nota de la ruta.
- **FR-012**: En pantallas amplias, el sistema DEBE mostrar a la izquierda del contenido un listado ordenado de todas las notas de la categoría e indicar claramente la nota activa.
- **FR-013**: El estudiante DEBE poder cambiar la nota activa desde el listado de la ruta sin abandonar la categoría seleccionada.
- **FR-014**: En pantallas estrechas, el sistema DEBE ofrecer un acceso compacto y operable al mismo listado, orden e indicador de nota activa.
- **FR-015**: El detalle de toda nota DEBE mostrar su título, descripción, duración estimada y el contenido que corresponda a su formato.
- **FR-016**: El sistema DEBE impedir el consumo de una nota fuera de una categoría seleccionada; un acceso directo DEBE llevar al apartado de categorías con una explicación clara.
- **FR-017**: Los estados vacíos y los fallos de imagen o contenido DEBEN comunicarse con mensajes comprensibles, contextuales y sin exponer detalles técnicos.
- **FR-018**: Los responsables del contenido DEBEN poder añadir o actualizar categorías y notas mediante las fuentes de contenido versionadas del sitio, sin requerir una herramienta administrativa ni una base de datos externa.
- **FR-019**: El sistema DEBE rechazar de la publicación categorías sin los campos de FR-002 y notas sin los campos o el contenido exigidos por FR-007 a FR-009, e identificar el dato faltante para que pueda corregirse.

### Key Entities

- **Categoría**: Tema o ruta de aprendizaje disponible. Tiene identificador único, nombre, imagen, nivel de complejidad y una colección ordenada de notas.
- **Nivel de complejidad**: Clasificación única de una categoría para orientar al estudiante. Sus valores iniciales son Principiante, Intermedio, Avanzado y Pro.
- **Nota**: Unidad de aprendizaje perteneciente a una sola categoría. Tiene identificador único, título, descripción, duración estimada, posición y un formato de contenido.
- **Contenido de nota**: Material consumido por el estudiante; es contenido escrito o un video de YouTube, pero no ambos en una misma nota.
- **Ruta de aprendizaje**: Vista ordenada de las notas publicadas de una categoría, con una nota activa y navegación entre unidades.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al menos el 95% de los participantes de una prueba de usabilidad encuentra el apartado de categorías desde cualquier vista principal en menos de 10 segundos y sin ayuda.
- **SC-002**: El 100% de las categorías mostradas presenta nombre, imagen o alternativa visual y nivel de complejidad, y cada filtro muestra exclusivamente coincidencias correctas.
- **SC-003**: Al menos el 90% de los participantes selecciona una categoría y comienza la primera nota de su ruta en menos de 30 segundos desde que abre el apartado.
- **SC-004**: En el 100% de las categorías con notas, estas aparecen en el orden definido, la primera se abre inicialmente y la nota activa se identifica de forma inequívoca.
- **SC-005**: Al menos el 95% de los participantes cambia entre dos notas de una ruta en menos de 10 segundos, tanto en pantalla amplia como estrecha.
- **SC-006**: El 100% de las notas válidas muestra título, descripción, duración estimada y su contenido escrito o reproductor de video correspondiente.
- **SC-007**: El 100% de los intentos de acceso directo a una nota fuera del flujo de categorías termina en el apartado de categorías con orientación comprensible y sin mostrar el contenido restringido.
- **SC-008**: El 100% de los contenidos incompletos incluidos en las pruebas de publicación se detecta antes de quedar disponible para visitantes, indicando cuál información debe corregirse.

## Assumptions

- El sitio es público y no requiere autenticación para descubrir categorías ni estudiar notas.
- El nivel de complejidad clasifica la categoría completa; las notas heredan el contexto de dificultad de su categoría y no tienen un nivel independiente.
- Cada nota pertenece a una sola categoría y ocupa una posición única dentro de esa ruta.
- "Primera nota" significa la nota publicada con la posición más baja dentro de la categoría.
- El acceso restringido a notas se refiere al flujo de navegación: para consumir una nota debe existir una categoría seleccionada, incluso si alguien conoce una dirección directa.
- La administración visual de categorías y notas está fuera del alcance; el contenido lo mantienen responsables con acceso al repositorio.
- Los controles de reproducción, disponibilidad y políticas del video dependen de YouTube; el sitio ofrece un mensaje útil cuando el recurso no puede mostrarse.
- La accesibilidad mediante teclado, etiquetas comprensibles, contraste suficiente y adaptación a distintos tamaños de pantalla forma parte de la calidad esperada del flujo.

