# Feature Specification: Mejora de la interfaz administrativa

**Feature Branch**: `main`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "Agrega la libreria shadcn ui en el proyecto de administracion para mejorar la UI"

## Clarifications

### Session 2026-09-21

- Q: ¿Qué estándar de accesibilidad debe cumplir la interfaz administrativa renovada? → A: WCAG 2.2 nivel AA.
- Q: ¿En qué navegadores debe funcionar y probarse la interfaz administrativa renovada? → A: Las dos versiones más recientes de Chrome, Firefox, Safari y Edge.
- Q: ¿Hasta qué punto deben migrarse a shadcn/ui los controles existentes del administrador? → A: Todos los controles equivalentes en todas las pantallas administrativas.
- Q: ¿Qué tipos de contenido deben tener cobertura completa de pruebas de aceptación después de la renovación? → A: Categorías, temas y notas.
- Q: ¿Qué degradación máxima de rendimiento puede introducir la renovación respecto a la interfaz administrativa actual? → A: Máximo 10% de degradación.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestionar contenido con una interfaz coherente (Priority: P1)

Como responsable del contenido, quiero que las pantallas y controles del administrador compartan una presentación y un comportamiento coherentes para completar mis tareas sin tener que reaprender cada formulario o acción.

**Why this priority**: La consistencia en los flujos existentes es el valor principal de la mejora y reduce errores en las tareas editoriales más frecuentes.

**Independent Test**: Puede probarse recorriendo de principio a fin la creación y edición de una categoría, un tema y una nota, verificando que campos, botones, mensajes, diálogos y estados equivalentes se entienden y se comportan de la misma manera.

**Acceptance Scenarios**:

1. **Given** que el responsable navega por los listados y formularios del administrador, **When** encuentra acciones o datos equivalentes, **Then** se presentan con patrones visuales, nombres y comportamientos consistentes.
2. **Given** un formulario administrativo con datos válidos, **When** el responsable lo completa y confirma la acción, **Then** recibe una confirmación visible y conserva el contexto de la tarea realizada.
3. **Given** un formulario con datos inválidos o incompletos, **When** el responsable intenta continuar, **Then** los problemas se muestran junto a los controles correspondientes mediante mensajes claros y accionables.

---

### User Story 2 - Reconocer estados y jerarquía de acciones (Priority: P2)

Como responsable del contenido, quiero distinguir rápidamente la información principal, las acciones disponibles y el estado de cada operación para tomar decisiones con confianza y evitar acciones accidentales.

**Why this priority**: Una jerarquía clara hace más seguro y rápido el uso diario, especialmente en pantallas con formularios extensos y acciones destructivas.

**Independent Test**: Puede probarse mostrando estados normales, vacíos, de carga, correctos y con error en cada flujo crítico y solicitando a una persona identificar la acción principal y el estado actual sin ayuda externa.

**Acceptance Scenarios**:

1. **Given** una pantalla administrativa con varias acciones, **When** el responsable la consulta, **Then** puede distinguir la acción principal, las acciones secundarias y las acciones destructivas antes de interactuar.
2. **Given** una operación en curso, completada o fallida, **When** cambia su estado, **Then** la interfaz comunica el cambio sin depender únicamente del color.
3. **Given** una lista sin contenido o una búsqueda sin resultados, **When** se presenta el estado vacío, **Then** el responsable entiende qué ocurrió y dispone de una siguiente acción pertinente.
4. **Given** una acción irreversible o de alto impacto, **When** el responsable intenta ejecutarla, **Then** la interfaz exige una confirmación explícita que identifica el elemento afectado y las consecuencias.

---

### User Story 3 - Operar el administrador de forma accesible y adaptable (Priority: P3)

Como responsable del contenido, quiero usar el administrador con teclado, tecnologías de asistencia y distintos tamaños de ventana para mantener el control de mis tareas en mi entorno de trabajo.

**Why this priority**: La mejora visual debe conservar la usabilidad para diferentes capacidades y condiciones de pantalla; de lo contrario, la renovación excluye a parte de las personas usuarias.

**Independent Test**: Puede probarse completando con teclado los flujos de crear, editar, buscar, ordenar y eliminar contenido, y repitiendo los recorridos en los anchos de ventana admitidos sin pérdida de información o acciones.

**Acceptance Scenarios**:

1. **Given** cualquier flujo administrativo crítico, **When** el responsable lo recorre usando solo el teclado, **Then** todos los controles son alcanzables, el foco es visible y el orden de navegación es lógico.
2. **Given** un control, diálogo, aviso o error, **When** se consulta con tecnología de asistencia, **Then** comunica un nombre, una función y un estado comprensibles.
3. **Given** una ventana desde 768 hasta 1440 píxeles de ancho, **When** el responsable usa el administrador, **Then** el contenido permanece legible y todas las acciones esenciales siguen disponibles sin superposiciones ni recortes.

### Edge Cases

- Un formulario combina textos cortos, textos extensos, selectores, carga de archivos y contenido opcional; la jerarquía visual debe seguir siendo clara sin ocultar campos.
- Una etiqueta, título, ruta o mensaje de error supera el ancho habitual; el contenido debe ajustarse o truncarse de manera perceptible sin desplazar acciones esenciales fuera de la pantalla.
- Una operación tarda más de lo esperado; la interfaz debe impedir confirmaciones duplicadas, conservar los datos introducidos y mostrar que la acción continúa en curso.
- Una operación falla después de iniciarse; la interfaz debe conservar el contexto y ofrecer una recuperación o un nuevo intento cuando sea seguro.
- Un cuadro de diálogo se abre desde un control situado al final de una página; el foco debe entrar en el diálogo y regresar al control de origen al cerrarlo.
- Una tabla o lista contiene cero, uno o muchos elementos; encabezados, acciones y navegación deben seguir siendo comprensibles en todos los casos.
- El nombre o contenido de un elemento incluye caracteres especiales o texto en varios idiomas; debe mostrarse sin romper la composición ni perder información.
- Las preferencias de movimiento reducido o contraste del entorno están activas; la interfaz debe respetarlas sin impedir comprender cambios de estado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El administrador DEBE aplicar un sistema visual coherente a sus listados, formularios, navegación, mensajes y diálogos.
- **FR-002**: Los controles que cumplen la misma función DEBEN conservar nombres, apariencia, estados y comportamientos equivalentes en todas las pantallas administrativas.
- **FR-003**: Cada pantalla DEBE presentar una jerarquía visual perceptible entre título, contexto, contenido principal, acción primaria, acciones secundarias y acciones destructivas.
- **FR-004**: Los formularios DEBEN asociar cada campo con una etiqueta visible y presentar instrucciones únicamente cuando ayuden a completar o corregir el dato.
- **FR-005**: Los errores de validación DEBEN mostrarse junto al campo o grupo afectado, explicar cómo corregir el problema y permanecer disponibles para tecnologías de asistencia.
- **FR-006**: Las operaciones administrativas DEBEN comunicar estados de espera, éxito, advertencia y error mediante texto o indicadores comprensibles que no dependan solo del color.
- **FR-007**: Mientras una acción confirmada está en curso, el administrador DEBE evitar envíos duplicados sin impedir que la persona comprenda el estado de la operación.
- **FR-008**: Los estados vacíos DEBEN explicar por qué no hay contenido y ofrecer una acción relevante cuando exista una forma de continuar.
- **FR-009**: Las acciones destructivas o irreversibles DEBEN diferenciarse de las acciones ordinarias y solicitar confirmación explícita antes de ejecutarse.
- **FR-010**: Los diálogos DEBEN identificar su propósito, mantener la interacción dentro del contexto activo mientras estén abiertos, poder cerrarse por medios convencionales y devolver el foco al elemento que los abrió.
- **FR-011**: Todos los controles de los flujos críticos DEBEN poder operarse con teclado, mostrar foco visible y seguir un orden de navegación lógico.
- **FR-012**: La interfaz DEBE comunicar a tecnologías de asistencia el nombre, la función, el estado, los errores y los cambios relevantes de cada control interactivo.
- **FR-013**: El administrador DEBE mantener contenido legible y acciones esenciales disponibles en ventanas de escritorio y tableta desde 768 hasta 1440 píxeles de ancho, sin superposiciones ni desplazamiento horizontal de la página completa.
- **FR-014**: La renovación visual DEBE conservar todos los flujos y comportamientos administrativos vigentes de creación, consulta, edición, ordenamiento, búsqueda, previsualización, eliminación y restauración de contenido.
- **FR-015**: La mejora NO DEBE alterar los archivos de contenido generados, las reglas de validación editorial ni la separación entre el administrador local y el sitio público.
- **FR-016**: Los componentes visuales compartidos DEBEN contemplar, como mínimo, sus estados normal, enfocado, deshabilitado, en curso, correcto y con error cuando dichos estados sean aplicables.
- **FR-017**: Los cambios de estado o transiciones visuales DEBEN respetar las preferencias de movimiento reducido del entorno y mantener disponible una señal no animada equivalente.
- **FR-018**: El alcance inicial NO incluye rediseñar el sitio público, añadir nuevos flujos editoriales, modificar el modelo de contenido ni cambiar las reglas de acceso local del administrador.
- **FR-019**: La interfaz administrativa renovada DEBE cumplir todos los criterios aplicables de WCAG 2.2 nivel AA.
- **FR-020**: Todos los flujos administrativos críticos DEBEN funcionar en las dos versiones estables más recientes de Chrome, Firefox, Safari y Edge.
- **FR-021**: Todos los controles existentes del administrador que tengan un equivalente adecuado en el sistema de componentes compartido DEBEN migrarse a ese sistema en todas las pantallas administrativas; los controles especializados sin equivalente adecuado PUEDEN conservarse si cumplen los demás requisitos de esta especificación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al menos el 90% de las personas participantes completa sin ayuda los recorridos de crear y editar una nota en menos de 5 minutos cada uno.
- **SC-002**: Al menos el 90% de las personas participantes identifica correctamente la acción principal y el estado actual en cada pantalla crítica en menos de 5 segundos.
- **SC-003**: El 100% de los recorridos críticos de crear, editar, buscar, ordenar, eliminar y restaurar contenido puede completarse solo con teclado, con foco visible y orden lógico.
- **SC-004**: El 100% de los errores de validación evaluados identifica el campo afectado, explica una corrección posible y puede percibirse sin depender únicamente del color.
- **SC-005**: En el 100% de las pruebas realizadas entre 768 y 1440 píxeles de ancho, las acciones esenciales permanecen disponibles y no aparecen superposiciones ni desplazamiento horizontal de la página completa.
- **SC-006**: El 100% de la suite vigente de aceptación del administrador continúa superándose después de la renovación visual.
- **SC-007**: En una evaluación de consistencia de todas las pantallas administrativas, el 100% de las funciones equivalentes utiliza el mismo patrón de interacción y terminología.
- **SC-008**: Al menos el 85% de las personas participantes califica la claridad y facilidad de uso del administrador con 4 o 5 puntos sobre 5.
- **SC-009**: El 100% de las pantallas y recorridos administrativos críticos evaluados cumple todos los criterios aplicables de WCAG 2.2 nivel AA mediante comprobaciones automáticas y manuales.
- **SC-010**: El 100% de los recorridos administrativos críticos supera las pruebas de aceptación en las dos versiones estables más recientes de Chrome, Firefox, Safari y Edge.
- **SC-011**: El 100% de los flujos aplicables de creación, consulta, edición, ordenamiento, búsqueda, previsualización, eliminación y restauración de categorías, temas y notas supera las pruebas de aceptación después de la renovación.
- **SC-012**: En el mismo entorno, con los mismos datos y bajo las mismas condiciones de medición, la carga inicial y el tiempo de respuesta de las interacciones críticas no empeoran más de un 10% respecto a la interfaz administrativa anterior a la renovación.

## Assumptions

- La mejora se aplica únicamente al proyecto de administración local existente; la experiencia pública conserva su diseño actual.
- Las capacidades y reglas funcionales descritas por la especificación vigente del administrador continúan siendo la fuente de verdad y no se redefinen en este cambio.
- El entorno objetivo inicial son ventanas de tableta horizontal y escritorio; no se incluye una experiencia administrativa optimizada para teléfonos en esta fase.
- La identidad visual seguirá las restricciones de claridad, contraste y acabado definidas en la constitución del proyecto, conservando identidad propia.
- La adopción de una biblioteca visual compartida no debe introducir capacidades de servidor, persistencia externa ni dependencias en la entrega pública.
- Los textos actuales pueden ajustarse para mejorar claridad y consistencia, siempre que no cambie su significado funcional.
- Las pruebas existentes del administrador están disponibles como referencia para verificar que la renovación no cause regresiones.
