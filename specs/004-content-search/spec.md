# Feature Specification: Búsqueda transversal de contenido

**Feature Branch**: `004-content-search`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "Añadir un buscador al header transversal que encuentre categorías y notas; mostrar los resultados en una página dedicada, incluyendo descripciones, etiquetas e imágenes de categoría. Añadir descripciones a categorías y descripciones y etiquetas a notas."

## Clarifications

### Session 2026-09-15

- Q: ¿La búsqueda debe considerar equivalentes las letras con y sin tilde, por ejemplo, “categoria” y “categoría”? → A: Ignorar tildes; ambas formas coinciden.
- Q: ¿La URL de la página de resultados debe conservar la consulta para que pueda recargarse, copiarse y compartirse? → A: Sí; la URL conserva la consulta y reproduce los mismos resultados.
- Q: ¿Cómo debe interpretarse una consulta con varias palabras, como “css animaciones”? → A: Todas las palabras deben coincidir, en cualquier orden y entre los campos buscables del mismo elemento.
- Q: ¿Qué debe ocurrir si una categoría o nota publicada carece de la descripción o las etiquetas obligatorias? → A: La validación falla y bloquea la publicación hasta completar los metadatos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Encontrar contenido desde el encabezado (Priority: P1)

Como visitante, quiero buscar un término desde el encabezado presente en todo el sitio para encontrar rápidamente categorías y notas relacionadas sin tener que recorrerlas una por una.

**Why this priority**: Encontrar material relevante es el valor principal de la mejora y el encabezado permite iniciar la búsqueda desde cualquier vista.

**Independent Test**: Puede probarse publicando una categoría y varias notas con el término "css" distribuido entre títulos, descripciones y etiquetas; al buscarlo desde distintas páginas, la persona llega a una página dedicada que muestra todos los elementos coincidentes.

**Acceptance Scenarios**:

1. **Given** que una persona visita cualquier página que muestre el encabezado transversal, **When** escribe un término y confirma la búsqueda, **Then** llega a una página de resultados dedicada a ese término.
2. **Given** una categoría cuyo nombre o descripción contiene "css", **When** la persona busca "css", **Then** la página de resultados la incluye en la sección Categorías.
3. **Given** notas cuyo título, descripción o al menos una etiqueta contiene "css", **When** la persona busca "css", **Then** la página de resultados incluye cada nota coincidente en la sección Notas.
4. **Given** que el término se escribe con una combinación distinta de mayúsculas y minúsculas, **When** se confirma la búsqueda, **Then** se obtienen los mismos resultados que con la misma secuencia de letras en una sola capitalización.
5. **Given** una página de resultados para una consulta válida, **When** la persona recarga la página o abre su URL copiada, **Then** se conserva la consulta y se reproducen los mismos resultados disponibles.

---

### User Story 2 - Entender y abrir un resultado (Priority: P2)

Como visitante, quiero ver información suficiente en cada resultado para decidir si abrir la categoría o nota correcta.

**Why this priority**: Una lista de resultados sin contexto obliga a abrir destinos innecesarios y reduce la utilidad de buscar.

**Independent Test**: Puede probarse con resultados de ambas clases que compartan términos similares; cada entrada debe mostrar los campos solicitados y conducir a su destino correspondiente.

**Acceptance Scenarios**:

1. **Given** una categoría incluida en los resultados, **When** la persona la observa, **Then** ve su nombre, descripción e imagen de categoría.
2. **Given** una nota incluida en los resultados, **When** la persona la observa, **Then** ve su título, descripción, etiquetas e imagen de la categoría a la que pertenece.
3. **Given** un resultado de categoría o nota, **When** la persona activa su entrada, **Then** llega al destino publicado correspondiente.
4. **Given** que solo hay coincidencias de una clase, **When** se muestran los resultados, **Then** se muestra la sección con coincidencias y se comunica claramente que la otra clase no tiene resultados, sin inventar entradas.

---

### User Story 3 - Mantener contenido preparado para búsqueda (Priority: P3)

Como autor del sitio, quiero que cada categoría y nota publicada incluya los datos de contexto necesarios para que sus resultados de búsqueda sean informativos.

**Why this priority**: Las descripciones y etiquetas hacen que la búsqueda sea útil más allá de coincidencias en títulos.

**Independent Test**: Puede probarse revisando todas las categorías y notas publicadas: cada categoría cuenta con una descripción, y cada nota con descripción y una colección de etiquetas visibles cuando aparece como resultado.

**Acceptance Scenarios**:

1. **Given** una categoría publicada, **When** se revisa su información de contenido, **Then** tiene una descripción no vacía disponible para su resultado de búsqueda.
2. **Given** una nota publicada, **When** se revisa su información de contenido, **Then** tiene una descripción no vacía y una o más etiquetas disponibles para su resultado de búsqueda.
3. **Given** una nota con varias etiquetas, **When** una de ellas coincide con la búsqueda, **Then** la nota aparece una sola vez y muestra todas sus etiquetas.
4. **Given** una categoría o nota marcada para publicación sin sus metadatos obligatorios, **When** se valida el contenido para publicar el sitio, **Then** la validación falla, identifica el contenido incompleto y bloquea la publicación hasta corregirlo.

### Edge Cases

- Una búsqueda vacía o compuesta únicamente por espacios no ejecuta una consulta y comunica cómo introducir un término válido.
- Si no existe ninguna coincidencia, la página conserva el término consultado y muestra un estado vacío comprensible en lugar de secciones o resultados ficticios.
- Un mismo término puede coincidir con varios campos de una nota; esa nota se presenta una sola vez.
- En una consulta con varias palabras, cada palabra puede coincidir en un campo buscable distinto del mismo elemento; un elemento que no coincida con todas las palabras queda excluido.
- Las coincidencias parciales dentro de una palabra y las diferencias de mayúsculas/minúsculas o de tildes se consideran coincidencias; los demás caracteres visibles del término se tratan literalmente, sin interpretar operadores de búsqueda.
- Si una imagen de categoría no está disponible, el resultado conserva su texto y destino con una alternativa visual y accesible; la ausencia de imagen no elimina el resultado.
- Los términos, títulos, descripciones y etiquetas extensos no deben provocar desplazamiento horizontal ni ocultar la acción para abrir el resultado.
- Si una categoría no contiene notas, puede aparecer como coincidencia de categoría; no se muestran notas inexistentes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El encabezado transversal DEBE incluir un control de búsqueda identificable y operable desde todas las vistas que utilicen dicho encabezado.
- **FR-002**: Al confirmar un término de búsqueda válido, el sistema DEBE mostrar una página de resultados dedicada cuya URL conserve la consulta; al recargar o abrir esa URL, DEBE identificar la consulta y reproducir los mismos resultados disponibles.
- **FR-003**: La búsqueda DEBE evaluar los nombres y descripciones de las categorías publicadas.
- **FR-004**: La búsqueda DEBE evaluar el título, la descripción y cada etiqueta de las notas publicadas.
- **FR-005**: La búsqueda DEBE dividir una consulta con varias palabras y devolver un elemento solo cuando todas aparezcan como parte de uno o más de sus campos aplicables, en cualquier orden; las coincidencias NO DEBEN distinguir entre mayúsculas y minúsculas ni entre letras con y sin tilde.
- **FR-006**: La página de resultados DEBE agrupar los resultados en las secciones claramente identificadas “Categorías” y “Notas”.
- **FR-007**: Cada resultado de categoría DEBE mostrar su nombre, descripción e imagen de categoría, y ofrecer acceso a su destino publicado.
- **FR-008**: Cada resultado de nota DEBE mostrar su título, descripción, todas sus etiquetas e imagen de la categoría a la que pertenece, y ofrecer acceso a su destino publicado.
- **FR-009**: Un elemento que coincida en más de un campo DEBE aparecer una sola vez dentro de su sección de resultados.
- **FR-010**: Cuando una sección no tenga coincidencias, la página DEBE comunicarlo de forma clara sin mostrar resultados ficticios ni ocultar las coincidencias de la otra sección.
- **FR-011**: Cuando ninguna categoría ni nota coincida, la página DEBE mostrar un estado vacío comprensible, conservar el término consultado y permitir iniciar otra búsqueda.
- **FR-012**: El sistema DEBE impedir la ejecución de búsquedas vacías o compuestas solo por espacios e indicar a la persona que introduzca un término válido.
- **FR-013**: Toda categoría publicada DEBE contar con una descripción no vacía disponible para mostrar en los resultados de búsqueda.
- **FR-014**: Toda nota publicada DEBE contar con una descripción no vacía y una o más etiquetas disponibles para mostrar en los resultados de búsqueda.
- **FR-015**: La validación del contenido DEBE fallar, identificar el contenido incompleto y bloquear la publicación cuando una categoría publicada no tenga descripción o una nota publicada no tenga descripción o al menos una etiqueta; las categorías y notas existentes DEBEN completar esos metadatos antes de publicarse.
- **FR-016**: La búsqueda, los resultados y sus destinos DEBEN poder recorrerse y activarse mediante teclado y tecnologías de asistencia, con etiquetas comprensibles, foco visible y anuncios claros de los estados vacío o inválido.
- **FR-017**: Las listas de resultados DEBEN conservar la información y operabilidad en pantallas amplias y estrechas, sin exigir desplazamiento horizontal.
- **FR-018**: La feature SE LIMITA al descubrimiento de categorías y notas publicadas y a los metadatos requeridos para ello; no incluye búsqueda dentro del cuerpo completo de una nota, filtros avanzados, ordenamiento configurable, sugerencias mientras se escribe, cuentas, historial ni servicios externos.

### Key Entities

- **Consulta de búsqueda**: Término no vacío introducido desde el encabezado que determina las categorías y notas a listar.
- **Resultado de categoría**: Representación de una categoría publicada que coincide con la consulta; incluye nombre, descripción, imagen y destino.
- **Resultado de nota**: Representación de una nota publicada que coincide con la consulta; incluye título, descripción, etiquetas, imagen de su categoría y destino.
- **Categoría**: Agrupación temática de notas; para esta feature incorpora una descripción de contexto y puede proporcionar su imagen a los resultados de sus notas.
- **Nota**: Unidad de contenido publicada dentro de una categoría; para esta feature incorpora una descripción y una o más etiquetas para facilitar su descubrimiento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el 100% de las pruebas con un término presente en el nombre o descripción de una categoría, la categoría coincidente aparece en la sección Categorías.
- **SC-002**: En el 100% de las pruebas con un término presente en el título, descripción o etiquetas de una nota, la nota coincidente aparece una sola vez en la sección Notas.
- **SC-003**: Al menos el 90% de las personas participantes completa una búsqueda desde una vista con encabezado y abre el resultado correcto en menos de 20 segundos, sin asistencia.
- **SC-004**: El 100% de los resultados evaluados muestra los campos requeridos para su tipo: nombre, descripción e imagen para categorías; título, descripción, etiquetas e imagen de categoría para notas.
- **SC-005**: El 100% de las categorías y notas publicadas evaluadas dispone de los metadatos obligatorios: descripción para categorías, y descripción más al menos una etiqueta para notas.
- **SC-006**: El 100% de las pruebas de consulta sin coincidencias, consulta vacía y consulta con espacios comunica un estado comprensible y permite iniciar una búsqueda válida posterior.
- **SC-007**: El 100% de los recorridos críticos —buscar, distinguir resultados de ambas secciones y abrir un destino— puede completarse con teclado en pantallas de 320 px o más, sin desplazamiento horizontal obligatorio.
- **SC-008**: En una muestra de al menos 50 consultas representativas, el 95% o más de las páginas de resultados se muestra en menos de 2 segundos desde la confirmación de la búsqueda.

## Assumptions

- El encabezado transversal, las páginas de destino de categorías y notas, y las imágenes de categoría ya existen y se reutilizan sin cambiar su identidad visual.
- La búsqueda se limita a las categorías y notas publicadas disponibles en el sitio; el contenido no publicado no se expone ni se considera.
- Una coincidencia parcial, sin distinción de mayúsculas/minúsculas ni de tildes, ofrece una experiencia predecible para consultas como “css”, “CSS”, “anim”, “categoria” o “categoría”.
- Las descripciones y etiquetas son metadatos editoriales administrados junto con el contenido versionado existente; no requieren cuentas ni una fuente de datos externa.
- Para una nota, la imagen presentada es la de su categoría, conforme a la solicitud; las notas no necesitan una imagen propia para esta feature.
- El orden de resultados conserva el orden estable vigente de categorías y notas dentro de cada sección; esta feature no introduce un nuevo criterio de relevancia ni ordenamiento personalizable.
- La accesibilidad esperada incluye nombres comprensibles para el control y los resultados, foco visible, navegación por teclado y mensajes de estado perceptibles para tecnologías de asistencia.
