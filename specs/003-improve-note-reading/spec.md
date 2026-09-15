# Feature Specification: Lectura mejorada y navegación entre notas

**Feature Branch**: `main`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Mejorar la vista de contenido Markdown de las notas: corregir la sangría, reducir el tamaño visual de los bloques de código, permitir copiar su contenido, destacar los enlaces con color y subrayado y añadir navegación hacia la nota anterior y siguiente. Tomar como referencia editorial el blog de React Native sin cambiar el sistema de diseño ni la paleta actual del sitio."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Leer Markdown con una jerarquía clara (Priority: P1)

Como visitante que estudia una nota, quiero que sus títulos, párrafos, listas, citas, elementos en línea y bloques de código conserven una jerarquía y una sangría claras para poder seguir el contenido sin confundir sus niveles.

**Why this priority**: La lectura es el propósito principal de la página de nota; una estructura visual incorrecta dificulta comprender incluso el contenido más básico.

**Independent Test**: Puede probarse con una nota de muestra que incluya encabezados de varios niveles, párrafos, listas simples y anidadas, citas, código en línea y bloques de código. Cada elemento debe distinguirse y mantener su relación jerárquica en pantallas amplias y estrechas.

**Acceptance Scenarios**:

1. **Given** una nota con listas simples y anidadas, **When** la persona visualiza su contenido, **Then** cada nivel presenta una sangría perceptible, sus marcadores son visibles y ningún nivel se confunde con el texto circundante.
2. **Given** una nota que combina títulos, párrafos, citas, separadores, código en línea y bloques de código, **When** se renderiza la página, **Then** cada tipo de contenido presenta una jerarquía visual consistente y mantiene el orden declarado en la nota.
3. **Given** un bloque de código con líneas largas, **When** se consulta desde una pantalla estrecha, **Then** el bloque permanece dentro del ancho disponible y permite leer todo el código sin ensanchar ni romper el resto de la página.
4. **Given** una nota extensa con varios bloques de código, **When** la persona la recorre, **Then** los bloques ocupan solo el espacio necesario para su contenido y no dominan visualmente la lectura frente al texto explicativo.

---

### User Story 2 - Copiar un bloque de código (Priority: P2)

Como visitante, quiero copiar el contenido completo de cualquier bloque de código con una sola acción para reutilizar un ejemplo sin seleccionarlo manualmente.

**Why this priority**: Las notas son material de estudio práctico y copiar ejemplos reduce errores y fricción al probarlos.

**Independent Test**: Puede probarse con una nota que contenga al menos dos bloques diferentes; al activar la acción de cada uno, el contenido copiado debe corresponder exactamente a ese bloque y debe mostrarse una confirmación perceptible.

**Acceptance Scenarios**:

1. **Given** una nota con uno o más bloques de código, **When** la persona observa cualquiera de ellos, **Then** encuentra una acción de copia asociada inequívocamente a ese bloque.
2. **Given** un bloque de código visible, **When** la persona activa su acción de copia, **Then** obtiene el contenido textual completo del bloque, preservando saltos de línea y sangría, pero sin incluir la propia acción ni adornos visuales.
3. **Given** una copia completada correctamente, **When** finaliza la acción, **Then** la página comunica de forma breve y perceptible que el contenido fue copiado.
4. **Given** que el entorno impide copiar automáticamente, **When** la persona activa la acción, **Then** recibe un mensaje comprensible y el código permanece disponible para selección manual.
5. **Given** que la persona navega solo con teclado o tecnología de asistencia, **When** alcanza la acción de copia, **Then** puede identificar el bloque al que pertenece, activarla y percibir su resultado.

---

### User Story 3 - Reconocer y abrir enlaces (Priority: P2)

Como visitante, quiero distinguir inmediatamente los enlaces dentro de una nota para saber qué texto es interactivo antes de intentar abrirlo.

**Why this priority**: Las referencias amplían el aprendizaje, pero pierden utilidad si se confunden con texto ordinario.

**Independent Test**: Puede probarse con enlaces en párrafos y listas, en las apariencias clara y oscura; todos deben mostrar color distintivo de la paleta vigente, subrayado y estados perceptibles de interacción.

**Acceptance Scenarios**:

1. **Given** una nota con enlaces dentro de su contenido Markdown, **When** la persona lee la nota, **Then** cada enlace se diferencia del texto normal mediante un color ya perteneciente a la paleta del sitio y una línea debajo del texto.
2. **Given** un enlace dentro de una nota, **When** recibe foco o interacción de puntero, **Then** conserva su identificación como enlace y presenta un estado de interacción perceptible.
3. **Given** cualquiera de las apariencias disponibles del sitio, **When** se muestra un enlace, **Then** su texto, subrayado y foco se mantienen legibles sin introducir colores ajenos al sistema visual vigente.

---

### User Story 4 - Continuar por notas relacionadas (Priority: P3)

Como visitante, quiero avanzar a la nota siguiente o volver a la anterior desde el final de la lectura para recorrer una categoría en su orden previsto sin regresar al índice lateral.

**Why this priority**: La navegación secuencial facilita estudiar una categoría como un recorrido continuo y reduce pasos innecesarios.

**Independent Test**: Puede probarse abriendo la primera, una intermedia y la última nota de una categoría ordenada. Cada página debe mostrar únicamente los destinos que existan, con dirección y título correctos.

**Acceptance Scenarios**:

1. **Given** una nota intermedia de una categoría, **When** la persona llega al final del contenido, **Then** encuentra una opción “Anterior” con el título de la nota previa y una opción “Siguiente” con el título de la nota posterior.
2. **Given** la primera nota de una categoría, **When** la persona llega al final, **Then** encuentra la opción “Siguiente” con el título correcto y no se presenta una opción anterior inexistente.
3. **Given** la última nota de una categoría, **When** la persona llega al final, **Then** encuentra la opción “Anterior” con el título correcto y no se presenta una opción siguiente inexistente.
4. **Given** una categoría con una sola nota, **When** la persona llega al final, **Then** no se muestran destinos anterior o siguiente vacíos, deshabilitados ni inventados.
5. **Given** una opción anterior o siguiente disponible, **When** la persona la activa, **Then** llega a la nota indicada dentro de la misma categoría.
6. **Given** una pantalla estrecha o navegación mediante teclado, **When** la persona recorre la navegación secuencial, **Then** puede leer cada dirección y título, distinguir el foco y activar los destinos sin desplazamiento horizontal obligatorio.

### Edge Cases

- Una lista puede combinar varios niveles, elementos extensos, numeración y viñetas; la sangría debe conservar la relación entre padre e hijo sin recortar marcadores.
- Un bloque de código puede tener una sola línea, muchas líneas, líneas más anchas que el área de lectura, caracteres especiales o no declarar un lenguaje; debe seguir siendo legible y copiable.
- Una nota puede contener varios bloques de código consecutivos; cada acción de copia debe copiar únicamente su bloque asociado.
- El contenido de un bloque puede coincidir parcialmente con el texto de otro; la confirmación de copia no debe atribuirse al bloque incorrecto.
- Un enlace puede aparecer dentro de una lista, cita o párrafo; su tratamiento visual e interacción deben mantenerse consistentes.
- Una nota puede mezclar enlaces internos y externos; ambos deben reconocerse como enlaces sin cambiar sus destinos existentes.
- Dos notas de la misma categoría pueden compartir posición; se conserva el criterio estable de desempate que ya emplea el recorrido actual.
- Las notas de video participan en el mismo orden de navegación de la categoría, aunque la mejora del renderizado Markdown y la copia de código solo aplican a notas escritas.
- Si la copia automática falla o no está disponible, la página no debe ocultar, reemplazar ni alterar el código original.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página de detalle de una nota escrita DEBE representar de manera diferenciada y consistente los párrafos, encabezados, listas ordenadas, listas no ordenadas, listas anidadas, citas, separadores, código en línea y bloques de código presentes en su contenido Markdown.
- **FR-002**: Las listas DEBEN mostrar marcadores o numeración visibles y aplicar una sangría incremental perceptible por cada nivel anidado, sin recortar el contenido en el ancho mínimo admitido por el sitio.
- **FR-003**: La jerarquía de encabezados y el espaciado entre elementos DEBEN permitir reconocer secciones y relaciones de contenido sin depender únicamente del tamaño del texto.
- **FR-004**: Los bloques de código DEBEN integrarse en el ancho del área de lectura, usar una escala visual que no sobrepase la jerarquía del texto explicativo y ofrecer acceso a líneas largas sin expandir el ancho de la página.
- **FR-005**: El contenido de los bloques de código DEBE preservar espacios, sangría, saltos de línea y caracteres tal como aparecen en la nota.
- **FR-006**: Cada bloque de código DEBE incluir una acción identificable para copiar exclusivamente su contenido textual completo.
- **FR-007**: Después de una copia exitosa, el sistema DEBE presentar una confirmación breve, perceptible visualmente y comunicable a tecnologías de asistencia.
- **FR-008**: Si la copia automática no puede completarse, el sistema DEBE mostrar un aviso comprensible, conservar el bloque intacto y permitir que su texto se seleccione manualmente.
- **FR-009**: Las acciones de copia DEBEN poder localizarse, identificarse y activarse mediante teclado y tecnologías de asistencia, con foco visible.
- **FR-010**: Todo enlace renderizado dentro del contenido Markdown DEBE utilizar un color de enlace perteneciente a la paleta actual del sitio y mostrar un subrayado permanente.
- **FR-011**: Los enlaces del contenido DEBEN conservar estados perceptibles de foco e interacción y un contraste suficiente en las apariencias clara y oscura existentes.
- **FR-012**: El final de cada página de nota DEBE ofrecer navegación hacia la nota inmediatamente anterior y la inmediatamente siguiente de la misma categoría, de acuerdo con el orden vigente del recorrido.
- **FR-013**: Cada destino disponible DEBE mostrar una etiqueta direccional, “Anterior” o “Siguiente”, junto con el título completo de la nota de destino.
- **FR-014**: La navegación secuencial NO DEBE mostrar un control cuando no exista una nota en esa dirección y NO DEBE enlazar notas de otra categoría.
- **FR-015**: La navegación anterior/siguiente DEBE incluir tanto notas escritas como notas de video cuando formen parte del recorrido ordenado de la categoría.
- **FR-016**: El contenido Markdown, los controles de copia y la navegación secuencial DEBEN mantener lectura y operación completas en pantallas amplias y estrechas, sin provocar desplazamiento horizontal en la página.
- **FR-017**: La mejora DEBE conservar el sistema de diseño, las tipografías, componentes compartidos y paleta de colores vigentes; la referencia del blog de React Native orienta la legibilidad, jerarquía editorial, tratamiento contenido del código y navegación entre publicaciones, pero no autoriza copiar su marca ni introducir una nueva identidad visual.
- **FR-018**: La mejora NO DEBE modificar el contenido fuente de las notas, sus metadatos, el orden actual del recorrido, el selector de tema ni la navegación lateral existente.
- **FR-019**: El alcance se limita a la presentación del contenido en la página de detalle, la copia de bloques de código y la navegación secuencial; no incluye edición de notas, búsqueda, comentarios, ejecución de código ni cambios en el modelo de contenido.

### Key Entities

- **Nota**: Unidad de contenido perteneciente a una categoría, con título, formato y posición; puede ser escrita o de video y puede tener una nota anterior y una siguiente dentro de su recorrido.
- **Recorrido de categoría**: Secuencia ordenada de notas de una misma categoría que determina los destinos anterior y siguiente.
- **Bloque de código**: Fragmento preformateado perteneciente a una nota escrita; conserva exactamente el texto, los saltos de línea y la sangría que la persona puede copiar.
- **Enlace de contenido**: Referencia interactiva incluida en el Markdown de una nota; conserva su texto y destino existentes y debe reconocerse visualmente como enlace.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el 100% de una muestra representativa que cubra todos los elementos Markdown admitidos, la estructura, los marcadores y la sangría permiten distinguir correctamente el tipo y nivel de cada elemento en pantallas de 320 px o más.
- **SC-002**: El 100% de los bloques evaluados permanece contenido dentro del área de lectura; las líneas largas pueden consultarse completas sin generar desplazamiento horizontal en la página.
- **SC-003**: Al menos el 90% de las personas participantes identifica sin ayuda la acción de copia y copia correctamente un bloque elegido en menos de 10 segundos.
- **SC-004**: En el 100% de las pruebas de copia exitosa, el texto obtenido coincide con el bloque elegido, incluidos sus saltos de línea, sangría y caracteres, y se comunica una confirmación perceptible.
- **SC-005**: Al menos el 95% de las personas participantes identifica los enlaces dentro del contenido en menos de 3 segundos, tanto en apariencia clara como oscura.
- **SC-006**: El 100% de las pruebas sobre la primera, una intermedia, la última y una única nota muestra solo los destinos secuenciales existentes, con dirección, título y categoría correctos.
- **SC-007**: Al menos el 90% de las personas participantes avanza a la siguiente nota o vuelve a la anterior en menos de 10 segundos después de terminar la lectura, sin recurrir al índice de la categoría.
- **SC-008**: El 100% de los recorridos críticos —leer contenido estructurado, copiar código y navegar entre notas— puede completarse mediante teclado en pantallas amplias y estrechas, con foco y resultados perceptibles.
- **SC-009**: Una revisión visual comparativa confirma que el 100% de las pantallas modificadas utiliza exclusivamente la paleta, tipografías y lenguaje visual ya presentes en el sitio.

## Assumptions

- El orden vigente de las notas se determina primero por su posición y, ante empates, por el criterio estable ya usado por el sitio; esta feature no redefine ese orden.
- “Anterior” y “Siguiente” se calculan únicamente dentro de la categoría activa y se presentan al final del contenido principal de la nota.
- La navegación secuencial incluye notas escritas y de video para preservar la continuidad completa del recorrido de categoría.
- La acción de copia se ofrece por bloque de código y copia su texto fuente, no decoraciones, etiquetas de lenguaje ni números de línea que pudieran mostrarse visualmente.
- La confirmación de copia es temporal, pero permanece el tiempo suficiente para ser percibida; no requiere historial de copias ni persistencia entre páginas.
- Los destinos actuales de los enlaces internos y externos se conservan; la feature mejora su reconocimiento visual, no redefine dónde ni cómo se abren.
- La referencia editorial es la página del blog de React Native indicada por el usuario: https://reactnative.dev/blog/2026/04/07/react-native-0.85. Se toman como guía su ritmo de lectura, jerarquía, código contenido y navegación entre publicaciones, manteniendo la identidad propia del proyecto.
- La paleta, temas y componentes compartidos actuales son una dependencia y una restricción; cualquier color necesario para enlaces o estados debe seleccionarse entre los valores ya disponibles.
