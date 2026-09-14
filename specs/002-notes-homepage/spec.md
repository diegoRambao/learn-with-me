# Feature Specification: Portada de notas y selector de tema

**Feature Branch**: `main`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Rediseñar la página principal para eliminar el índice lateral de categorías, comunicar que el sitio reúne apuntes personales de estudio que pueden servir a otras personas, evitar presentarlo como una academia de clases o cursos, destacar rutas o categorías desde la portada y añadir un selector de tema claro, oscuro o del sistema."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comprender el propósito de las notas (Priority: P1)

Como visitante, quiero entender desde el primer vistazo que el sitio reúne los apuntes personales del autor sobre los temas que estudia y que puedo aprovecharlos para mi propio aprendizaje, sin confundirlo con una academia o plataforma de cursos.

**Why this priority**: El posicionamiento correcto da sentido al resto de la experiencia y evita crear expectativas equivocadas sobre el contenido.

**Independent Test**: Puede probarse mostrando únicamente el encabezado y el contenido principal de la portada a una persona que no conoce el proyecto; la persona debe poder explicar qué contiene el sitio, quién origina las notas y para qué pueden servirle.

**Acceptance Scenarios**:

1. **Given** que una persona abre la página principal por primera vez, **When** lee el mensaje principal, **Then** entiende que el autor comparte apuntes de los temas que va estudiando para conservarlos y ayudar a otras personas a estudiar.
2. **Given** que una persona revisa los textos visibles de la página principal, **When** interpreta la naturaleza del sitio, **Then** no encuentra afirmaciones que lo presenten como academia, catálogo de cursos o colección de clases.
3. **Given** que una persona desea comenzar a explorar, **When** observa la zona principal de la portada, **Then** encuentra una acción destacada y centrada que la lleva al catálogo completo de categorías.

---

### User Story 2 - Descubrir rutas desde la portada (Priority: P2)

Como visitante, quiero ver una muestra de rutas de estudio en la página principal y una invitación clara a explorar todas las categorías para decidir rápidamente qué tema revisar.

**Why this priority**: Una muestra concreta conecta la explicación del sitio con su contenido real y reduce el esfuerzo necesario para empezar.

**Independent Test**: Puede probarse con seis o más categorías publicadas; la portada debe mostrar tres rutas claramente, anticipar tres rutas adicionales en una segunda fila atenuada y ofrecer una acción inequívoca para abrir el catálogo completo.

**Acceptance Scenarios**:

1. **Given** que existen al menos seis categorías publicadas, **When** la persona llega a la sección de rutas destacadas, **Then** ve tres rutas completas en la primera fila y otras tres en una segunda fila con un efecto visual de desvanecimiento.
2. **Given** que la segunda fila está atenuada, **When** la persona observa la sección, **Then** la acción para ver o explorar más categorías permanece legible, operable y visualmente prioritaria.
3. **Given** que la persona activa la acción de explorar más, **When** se completa la navegación, **Then** llega al catálogo completo de categorías.
4. **Given** que una persona usa una pantalla estrecha, **When** consulta la muestra de rutas, **Then** conserva el orden, el contenido y el acceso al catálogo sin desplazamiento horizontal obligatorio.

---

### User Story 3 - Elegir la apariencia del sitio (Priority: P3)

Como visitante, quiero usar el tema de mi sistema por defecto y poder elegir desde el menú una apariencia clara u oscura para leer cómodamente en distintas condiciones.

**Why this priority**: La preferencia de tema mejora la comodidad y hace que la experiencia se adapte tanto al entorno como a la elección personal.

**Independent Test**: Puede probarse en un navegador sin preferencia previa, alternando la apariencia del sistema y seleccionando después cada opción del menú; el sitio debe reflejar la opción activa en toda la interfaz y recordarla en visitas posteriores desde el mismo navegador.

**Acceptance Scenarios**:

1. **Given** que una persona no ha elegido un tema previamente, **When** abre el sitio, **Then** la apariencia coincide con la preferencia clara u oscura de su sistema.
2. **Given** que el sitio está abierto, **When** la persona selecciona tema claro u oscuro desde el menú, **Then** toda la interfaz adopta la apariencia seleccionada y el control indica cuál está activa.
3. **Given** que la persona seleccionó una preferencia explícita, **When** vuelve a visitar o recarga el sitio desde el mismo navegador, **Then** se mantiene su elección aunque el tema del sistema sea diferente.
4. **Given** que la persona vuelve a elegir la opción del sistema, **When** cambia la preferencia de apariencia de su dispositivo, **Then** el sitio vuelve a seguir ese cambio.
5. **Given** que la persona navega usando teclado o tecnología de asistencia, **When** abre y utiliza el selector, **Then** puede identificar su propósito, recorrer sus opciones y confirmar cuál está seleccionada.

### Edge Cases

- Si no hay categorías publicadas, la portada muestra un estado vacío comprensible y conserva la acción hacia el catálogo, sin representar tarjetas inexistentes.
- Si existen entre una y tres categorías, se muestran todas como rutas completas y no se presenta una segunda fila vacía o artificial.
- Si existen entre cuatro y cinco categorías, las tres primeras se muestran completas y las restantes forman la muestra atenuada sin duplicar contenido.
- Si una ruta destacada carece de recurso visual disponible, mantiene su nombre y una alternativa visual legible.
- Si el navegador no permite recordar la elección de tema, la selección funciona durante la visita actual y en una nueva visita se vuelve a usar el tema del sistema.
- Si el tema del sistema cambia mientras está activa una preferencia explícita clara u oscura, el sitio conserva la elección explícita.
- El desvanecimiento de la segunda fila no debe ocultar el foco, el nombre accesible de la sección ni la acción para explorar más.
- En cualquiera de los temas, el contenido, los estados interactivos y el foco deben conservar contraste y legibilidad suficientes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página principal DEBE eliminar el índice o barra lateral de categorías como mecanismo de navegación visible.
- **FR-002**: La zona principal de la portada DEBE incluir una acción destacada, ubicada visualmente en el centro de su composición, que conduzca al catálogo completo de categorías.
- **FR-003**: La página principal DEBE comunicar que el sitio es el espacio donde el autor conserva y comparte apuntes sobre los temas que va estudiando.
- **FR-004**: La página principal DEBE comunicar que otras personas pueden utilizar esos apuntes como apoyo para estudiar o repasar por su cuenta.
- **FR-005**: Los textos de la página principal DEBEN referirse a las unidades de contenido como “notas” o “apuntes” y NO DEBEN utilizar “clase” o “curso” para describir la oferta del sitio.
- **FR-006**: La página principal NO DEBE afirmar ni insinuar que el sitio es una academia, que imparte formación formal o que ofrece cursos propios.
- **FR-007**: La página principal DEBE incluir una sección de descubrimiento que denomine “rutas” o “categorías” a las agrupaciones temáticas y utilice una denominación consistente dentro de la misma sección.
- **FR-008**: Cuando existan al menos seis categorías publicadas, la sección de descubrimiento DEBE mostrar exactamente seis: tres rutas completas como muestra principal y tres rutas adicionales en una segunda muestra visualmente atenuada.
- **FR-009**: La segunda muestra DEBE usar un desvanecimiento gradual que anticipe contenido adicional sin impedir identificar la existencia de más rutas ni comprender la acción siguiente.
- **FR-010**: La sección de descubrimiento DEBE presentar, por encima del contenido atenuado, una acción legible y operable con un mensaje equivalente a “Ver más” o “Explorar más rutas”, cuyo destino sea el catálogo completo de categorías.
- **FR-011**: Cuando existan menos de seis categorías, la sección DEBE mostrar todas las disponibles una sola vez, completar primero la muestra principal hasta un máximo de tres y atenuar únicamente las restantes; no DEBE crear elementos ficticios para llenar espacios.
- **FR-012**: La muestra de rutas y sus acciones DEBEN conservar contenido, orden y operabilidad en pantallas amplias y estrechas sin exigir desplazamiento horizontal para alcanzar el catálogo.
- **FR-013**: El menú principal DEBE incluir un selector de tema con tres opciones identificables: “Sistema”, “Claro” y “Oscuro”.
- **FR-014**: En ausencia de una elección previa, el tema activo DEBE ser “Sistema” y la apariencia DEBE corresponder con la preferencia vigente del dispositivo.
- **FR-015**: Al elegir “Claro” u “Oscuro”, toda la interfaz compartida DEBE adoptar la apariencia seleccionada e indicar de forma perceptible la opción activa.
- **FR-016**: La elección explícita de tema DEBE conservarse para visitas posteriores realizadas desde el mismo navegador, mientras sea posible recordar preferencias locales.
- **FR-017**: Al elegir nuevamente “Sistema”, el sitio DEBE dejar de aplicar una apariencia explícita y volver a seguir los cambios de preferencia del dispositivo.
- **FR-018**: El selector de tema, las acciones de navegación y la muestra atenuada DEBEN ser comprensibles y operables mediante teclado y tecnologías de asistencia, con estados de foco y selección perceptibles.
- **FR-019**: Los temas claro y oscuro DEBEN mantener legibles el contenido, los controles y sus estados, sin pérdida de información al alternar entre apariencias.
- **FR-020**: El alcance de esta feature SE LIMITA a la página principal, su navegación compartida y la preferencia visual; no modifica el contenido, filtrado, orden interno ni modelo de datos del catálogo o del detalle de notas.

### Key Entities

- **Ruta o categoría destacada**: Agrupación temática publicada que puede aparecer en la muestra de la portada y conduce al contenido correspondiente; conserva el orden definido por el catálogo existente.
- **Preferencia de tema**: Elección de apariencia de una persona. Sus valores son Sistema, Claro y Oscuro; Sistema es el valor inicial y sigue la preferencia del dispositivo, mientras Claro u Oscuro representan elecciones explícitas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Después de observar la portada durante 20 segundos, al menos el 90% de las personas participantes identifica que el sitio comparte apuntes personales de estudio y no lo describe como una academia o plataforma de cursos.
- **SC-002**: Al menos el 95% de las personas participantes encuentra y activa una vía hacia el catálogo completo de categorías en menos de 10 segundos desde la portada.
- **SC-003**: Con seis o más categorías publicadas, el 100% de las evaluaciones muestra tres rutas completas, tres rutas atenuadas y una acción legible hacia el catálogo, sin duplicados.
- **SC-004**: Con cualquier cantidad entre cero y cinco categorías, el 100% de las evaluaciones muestra únicamente las categorías existentes y un estado coherente, sin espacios presentados como contenido ni rutas ficticias.
- **SC-005**: Al menos el 90% de las personas participantes comprende, sin ayuda, que la muestra atenuada indica que existen más categorías para explorar.
- **SC-006**: El 100% de los recorridos evaluados en pantallas amplias y estrechas permite acceder al catálogo y utilizar el selector de tema mediante puntero y teclado.
- **SC-007**: En una primera visita sin elección previa, el 100% de las pruebas usa la apariencia del sistema; después de elegir Claro u Oscuro, el 100% de las recargas en condiciones que permiten recordar preferencias conserva esa elección.
- **SC-008**: El 100% de las pantallas principales evaluadas conserva contenido legible, controles identificables y estados de foco perceptibles en los temas claro y oscuro.
- **SC-009**: Al menos el 90% de las personas participantes puede cambiar entre Sistema, Claro y Oscuro y reconocer la opción activa en menos de 15 segundos, sin asistencia.

## Assumptions

- El catálogo de categorías y su destino de navegación ya existen y esta feature reutiliza ese contenido publicado.
- “Ruta” es una forma amigable de presentar una categoría temática; no implica un curso formal ni cambia el modelo de contenido existente.
- La muestra de la portada respeta el orden estable ya definido para las categorías; la selección editorial o personalización de rutas queda fuera de alcance.
- La prohibición de “clase” y “curso” aplica al contenido visible de la página principal incluido en esta feature; no exige reescribir notas históricas que citen esos términos en otro contexto.
- La preferencia de tema es anónima, pertenece al navegador de la persona y no requiere cuenta ni sincronización entre dispositivos.
- La accesibilidad esperada incluye navegación por teclado, nombres comprensibles, foco visible y contraste suficiente en ambas apariencias.
- La inspiración visual de otros sitios orienta la composición y el énfasis del acceso central, pero no autoriza copiar identidad, textos, ilustraciones ni marca de terceros.

