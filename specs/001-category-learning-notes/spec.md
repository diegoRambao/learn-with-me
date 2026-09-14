# Feature Specification: Categorías y rutas de aprendizaje

**Feature Branch**: `main`

**Created**: 2026-09-14

**Status**: PASS

**Input**: User description: "Mostrar categorías desde un apartado estable del menú, permitir filtrarlas por nivel y presentar sus notas como una ruta de curso. La página de inicio debe explicar el propósito educativo del sitio, cómo utilizarlo y sus beneficios; debe incluir un índice lateral de categorías y enlaces a las redes sociales del autor. La experiencia visual debe inspirarse en la claridad y modernidad de Vercel, con tema oscuro, acentos de color y animaciones sutiles."

## Clarifications

### Session 2026-09-14

- Q: ¿El nivel de complejidad debe pertenecer a la categoría completa, a cada nota individual o a ambas? → A: Cada categoría tiene un nivel y todas sus notas lo heredan.
- Q: ¿Qué debe ocurrir cuando alguien abre directamente el enlace de una nota que incluye su categoría? → A: Abrir la nota si el enlace incluye su categoría válida.
- Q: ¿Puede una misma nota combinar contenido escrito y video, o debe usar un único formato? → A: Cada nota es exclusivamente escrita o de video.
- Q: ¿Cuándo debe considerarse publicada y visible una categoría o nota añadida a las fuentes de contenido? → A: Todo contenido válido queda publicado automáticamente.
- Q: ¿Qué debe pasar con la publicación del sitio cuando una categoría o nota tiene datos inválidos? → A: Bloquear toda la publicación hasta corregir el error.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Comprender el sitio y descubrir categorías (Priority: P1)

Como visitante, quiero comprender desde la página de inicio el propósito, la forma de uso y los beneficios del sitio, y acceder a un índice de categorías que pueda filtrar por nivel para encontrar una ruta de aprendizaje adecuada a mi experiencia.

**Why this priority**: Es la puerta de entrada al proyecto educativo, permite comprender su enfoque y ayuda a cada persona a identificar rápidamente por dónde empezar.

**Independent Test**: Puede probarse cargando la página de inicio y el catálogo con categorías de varios niveles: la persona debe comprender qué ofrece el sitio, cómo comenzar, qué beneficios obtiene, acceder al índice de categorías, abrir los enlaces sociales disponibles y aplicar o limpiar cada filtro.

**Acceptance Scenarios**:

1. **Given** que una persona abre la página de inicio, **When** consulta su contenido principal, **Then** entiende que el sitio comparte conocimientos adquiridos en la maestría en didáctica de las matemáticas con enfoque en educación de personas adultas, orientados por la educación popular y el aprendizaje significativo.
2. **Given** que una persona desconoce el sitio, **When** revisa la explicación de uso, **Then** identifica que puede elegir categorías por nivel y recorrer sus notas ordenadas, cada una disponible en formato escrito o video.
3. **Given** que una persona evalúa si el sitio le resulta útil, **When** consulta sus beneficios, **Then** encuentra que puede aprender de forma estructurada y organizada, acceder a contenido de calidad y actualizado, y aprender de un autor con experiencia en el campo.
4. **Given** que el autor ha proporcionado perfiles sociales, **When** la persona consulta la página de inicio, **Then** encuentra enlaces identificables y operables a esos perfiles.
5. **Given** que existen categorías publicadas, **When** la persona consulta el índice de la página de inicio, **Then** encuentra las categorías en un orden estable y puede abrir cualquiera de ellas; en una pantalla estrecha dispone de las mismas opciones mediante un control compacto.
6. **Given** que el visitante se encuentra en cualquier vista que comparte la navegación principal, **When** observa el menú, **Then** encuentra un acceso visible y estable al apartado de categorías.
7. **Given** que existen categorías publicadas, **When** abre el apartado de categorías, **Then** ve cada categoría con su nombre, imagen y nivel de complejidad.
8. **Given** que existen categorías de distintos niveles, **When** selecciona un nivel, **Then** solo permanecen visibles las categorías que tienen ese nivel.
9. **Given** que hay un filtro de nivel activo, **When** el visitante lo elimina o elige ver todas, **Then** vuelve a ver todas las categorías publicadas.
10. **Given** que una persona navega por la página de inicio, **When** interactúa con menús, tarjetas o enlaces, **Then** percibe una interfaz oscura, clara y moderna con acentos de color y transiciones discretas que no retrasan ni dificultan la navegación.
11. **Given** que una persona ha solicitado reducir el movimiento, **When** abre o utiliza la página de inicio, **Then** las animaciones no esenciales se eliminan o reducen y conserva toda la información y funcionalidad.

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
3. **Given** un enlace directo que identifica una categoría válida y una nota perteneciente a ella, **When** una persona abre o recarga el enlace, **Then** ve la ruta de esa categoría con la nota indicada activa.
4. **Given** un enlace de nota sin categoría o con una categoría que no le corresponde, **When** el sistema procesa el acceso, **Then** conduce a la persona al apartado de categorías con una explicación clara.

### Edge Cases

- Si no hay categorías publicadas, el apartado muestra un estado vacío comprensible y no presenta filtros inútiles.
- Si ningún resultado coincide con el nivel elegido, se informa que no hay categorías para ese nivel y se ofrece volver a mostrar todas.
- Si una categoría no contiene notas publicadas, se conserva la información de la categoría, se muestra un estado vacío y no se intenta seleccionar una nota.
- Si la imagen local o remota de una categoría no está disponible, se muestra una alternativa visual que conserva el nombre y la legibilidad de la categoría.
- Si el contenido escrito no puede cargarse o el video no está disponible, se muestra un mensaje contextual y accionable sin detalles técnicos; el listado de la ruta continúa utilizable.
- En pantallas donde no cabe un listado lateral permanente, la ruta de notas sigue siendo accesible mediante un control compacto sin perder el orden ni la indicación de la nota activa.
- Una nota asociada a una categoría distinta no aparece ni puede seleccionarse dentro de la ruta actual.
- Si un enlace combina una categoría y una nota que no pertenecen entre sí, no muestra el contenido de la nota y orienta a elegir una categoría válida.
- Si alguna categoría o nota no supera la validación, se bloquea la publicación completa hasta corregir todos los errores detectados.
- Si el autor todavía no ha proporcionado perfiles sociales válidos, la página no muestra enlaces vacíos, rotos ni de ejemplo.
- Si la persona ha solicitado reducir el movimiento en su dispositivo, las animaciones no esenciales se eliminan o se reducen sin perder información ni funcionalidad.
- En pantallas donde un índice lateral permanente no cabe, el índice de categorías se transforma en un control compacto que conserva las mismas opciones y orden.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema DEBE mantener un acceso visible y estable a "Categorías" dentro del menú principal en todas las vistas que compartan esa navegación.
- **FR-002**: El sistema DEBE permitir declarar cada categoría con un identificador único, nombre, referencia de imagen local o remota y exactamente un nivel de complejidad.
- **FR-003**: Los niveles iniciales admitidos DEBEN incluir `Principiante`, `Intermedio`, `Avanzado` y `Pro`; el nivel DEBE pertenecer exclusivamente a la categoría, aplicar a todas sus notas y presentarse de manera consistente.
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
- **FR-016**: El sistema DEBE permitir abrir, recargar y compartir una nota cuando su enlace identifica una categoría válida a la que pertenece; si falta la categoría o la relación no es válida, DEBE llevar al apartado de categorías con una explicación clara sin mostrar la nota.
- **FR-017**: Los estados vacíos y los fallos de imagen o contenido DEBEN comunicarse con mensajes comprensibles, contextuales y sin exponer detalles técnicos.
- **FR-018**: Los responsables del contenido DEBEN poder añadir o actualizar categorías y notas mediante las fuentes de contenido versionadas del sitio, sin requerir una herramienta administrativa ni una base de datos externa; todo contenido que supere la validación DEBE quedar publicado automáticamente, sin un estado editorial adicional.
- **FR-019**: El sistema DEBE bloquear la publicación completa mientras exista una categoría sin los campos de FR-002 o una nota sin los campos o el contenido exigidos por FR-007 a FR-009, e identificar cada dato inválido para que pueda corregirse.
- **FR-020**: La página de inicio DEBE explicar que el sitio comparte el conocimiento adquirido en la maestría en didáctica de las matemáticas con enfoque en educación de personas adultas, orientado por los principios de la educación popular y el aprendizaje significativo.
- **FR-021**: La página de inicio DEBE explicar cómo utilizar el sitio: elegir una categoría según su nivel, recorrer sus notas en el orden propuesto y consumir cada nota en el formato disponible.
- **FR-022**: La página de inicio DEBE presentar explícitamente estos beneficios: aprendizaje estructurado y organizado, acceso a contenido de calidad y actualizado, y aprendizaje acompañado por la experiencia del autor.
- **FR-023**: La página de inicio DEBE incluir un índice de categorías visible en pantallas amplias y un acceso compacto equivalente en pantallas estrechas, manteniendo el mismo orden y destino de navegación.
- **FR-024**: La página de inicio DEBE mostrar únicamente los enlaces a perfiles sociales válidos que el autor haya proporcionado; cada enlace DEBE identificar la red y su destino de forma comprensible.
- **FR-025**: La experiencia visual DEBE inspirarse en la claridad, el contraste, la composición y el acabado moderno de Vercel, manteniendo contenido e identidad propios, usando una base oscura y acentos de color para destacar acciones y elementos importantes.
- **FR-026**: Las transiciones visuales DEBEN ser discretas y fluidas, aportar contexto a cambios o interacciones, no bloquear el acceso al contenido y respetar la preferencia de movimiento reducido de la persona.

### Key Entities

- **Categoría**: Tema o ruta de aprendizaje disponible. Tiene identificador único, nombre, imagen, nivel de complejidad y una colección ordenada de notas.
- **Nivel de complejidad**: Clasificación única de una categoría para orientar al estudiante. Sus valores iniciales son Principiante, Intermedio, Avanzado y Pro.
- **Nota**: Unidad de aprendizaje perteneciente a una sola categoría. Tiene identificador único, título, descripción, duración estimada, posición y un formato de contenido.
- **Contenido de nota**: Material consumido por el estudiante; es contenido escrito o un video de YouTube, pero no ambos en una misma nota.
- **Ruta de aprendizaje**: Vista ordenada de las notas publicadas de una categoría, con una nota activa y navegación entre unidades.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Al menos el 95% de los participantes de una prueba de usabilidad encuentra el apartado de categorías desde cualquier vista principal en menos de 10 segundos y sin ayuda.
- **SC-002**: El 100% de las categorías mostradas presenta nombre, imagen o alternativa visual y nivel de complejidad, y cada filtro muestra exclusivamente coincidencias correctas.
- **SC-003**: Al menos el 90% de los participantes selecciona una categoría y comienza la primera nota de su ruta en menos de 30 segundos desde que abre el apartado.
- **SC-004**: En el 100% de las categorías con notas, estas aparecen en el orden definido, la primera se abre inicialmente y la nota activa se identifica de forma inequívoca.
- **SC-005**: Al menos el 95% de los participantes cambia entre dos notas de una ruta en menos de 10 segundos, tanto en pantalla amplia como estrecha.
- **SC-006**: El 100% de las notas válidas muestra título, descripción, duración estimada y su contenido escrito o reproductor de video correspondiente.
- **SC-007**: El 100% de los enlaces que combinan correctamente categoría y nota abren la ruta con esa nota activa; el 100% de los enlaces sin categoría válida o con una relación incorrecta terminan en el apartado de categorías sin mostrar la nota.
- **SC-008**: El 100% de los contenidos incompletos incluidos en las pruebas de publicación se detecta antes de quedar disponible para visitantes, indicando cuál información debe corregirse.
- **SC-009**: Al menos el 90% de las personas participantes identifica correctamente el propósito educativo, la forma de comenzar y al menos dos beneficios del sitio después de consultar la página de inicio durante 30 segundos.
- **SC-010**: El 100% de las páginas de inicio evaluadas presenta el propósito, las instrucciones de uso, los tres beneficios definidos, el índice de categorías y todos los enlaces sociales válidos proporcionados por el autor.
- **SC-011**: Al menos el 95% de las personas participantes localiza una categoría apropiada desde el índice de la página de inicio en menos de 15 segundos, tanto en pantalla amplia como estrecha.
- **SC-012**: El 100% de las transiciones evaluadas mantiene disponibles el contenido y los controles, y las animaciones no esenciales quedan eliminadas o reducidas cuando la persona solicita menos movimiento.

## Assumptions

- El sitio es público y no requiere autenticación para descubrir categorías ni estudiar notas.
- El nivel de complejidad clasifica la categoría completa; las notas heredan el contexto de dificultad de su categoría y no tienen un nivel independiente.
- Cada nota pertenece a una sola categoría y ocupa una posición única dentro de esa ruta.
- "Primera nota" significa la nota publicada con la posición más baja dentro de la categoría.
- El acceso restringido a notas exige un contexto de categoría válido, que puede provenir de la navegación o estar incluido en un enlace directo compartido.
- La administración visual de categorías y notas está fuera del alcance; el contenido lo mantienen responsables con acceso al repositorio.
- No existen estados de borrador o publicación: la validez del contenido determina automáticamente su visibilidad para visitantes.
- Los controles de reproducción, disponibilidad y políticas del video dependen de YouTube; el sitio ofrece un mensaje útil cuando el recurso no puede mostrarse.
- La accesibilidad mediante teclado, etiquetas comprensibles, contraste suficiente y adaptación a distintos tamaños de pantalla forma parte de la calidad esperada del flujo.
- La expresión “video y/o documento escrito” describe la variedad disponible en el conjunto de notas; cada nota individual conserva exactamente uno de los dos formatos establecidos.
- El autor proporcionará antes de la publicación las redes sociales y destinos reales que desea mostrar; no se publicarán perfiles de ejemplo.
- La referencia visual de Vercel orienta la claridad, el contraste, la composición y el acabado, pero no autoriza copiar su marca, textos, ilustraciones ni identidad.
- El índice de categorías de la página de inicio complementa el acceso “Categorías” de la navegación principal y no lo sustituye.
