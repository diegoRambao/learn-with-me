# Feature Specification: Administración local de contenido

**Feature Branch**: `main`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "Crear una sección de administración separada del blog público, disponible solo de forma local, para crear y gestionar categorías, temas y notas mediante formularios. Debe permitir definir orden, etiquetas, fotos, temas y demás datos del contenido, y continuar generando los archivos correspondientes dentro del proyecto sin incluir el administrador en el sitio publicado."

## Clarifications

### Session 2026-09-17

- Q: ¿Cómo debe editarse el contenido principal de una nota? → A: Editor Markdown con barra de herramientas y vista previa en vivo.
- Q: ¿Cómo deben gestionarse las etiquetas al editar una nota? → A: Selector con etiquetas existentes y creación de nuevas desde la misma nota.
- Q: ¿Cómo debe cambiarse el orden de temas y notas dentro de una categoría? → A: Controles “subir” y “bajar” con recálculo automático de posiciones.
- Q: ¿Qué debe ocurrir al eliminar una nota que no tiene dependencias? → A: Moverla a una papelera local recuperable.
- Q: ¿Qué debe hacer el administrador con una imagen seleccionada desde el equipo? → A: Copiarla sin cambios a los recursos administrados del proyecto y enlazarla desde la nota.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una nota desde el administrador (Priority: P1)

Como responsable del contenido, quiero crear una nota mediante una interfaz local con todos sus datos y contenido para no tener que escribir o estructurar manualmente los archivos del proyecto.

**Why this priority**: Crear notas es la tarea central y de mayor frecuencia; por sí sola entrega el valor mínimo de convertir una labor técnica en un flujo editorial guiado.

**Independent Test**: Puede probarse creando una nota escrita con título, categoría, tema, duración, posición, etiquetas, imagen y contenido; al guardar, debe existir un archivo válido que el sitio público pueda presentar con esos mismos datos.

**Acceptance Scenarios**:

1. **Given** que existen una categoría y un tema, **When** el responsable completa los campos obligatorios de una nota y la guarda, **Then** el administrador crea el archivo de contenido correspondiente y confirma su ubicación.
2. **Given** una nota en edición, **When** el responsable agrega etiquetas, una imagen y contenido enriquecido admitido, **Then** la vista previa refleja esos elementos antes de guardar.
3. **Given** datos incompletos, una posición duplicada o una relación inválida, **When** el responsable intenta guardar, **Then** no se modifica ningún archivo y se muestran mensajes claros junto a los campos que debe corregir.
4. **Given** una nota guardada correctamente, **When** el sitio público procesa el contenido del proyecto, **Then** la nota cumple el contrato vigente y aparece en la categoría, tema y posición elegidos.
5. **Given** una imagen válida seleccionada desde el equipo, **When** el responsable guarda la nota, **Then** se copia la imagen sin transformarla a los recursos administrados del proyecto y la nota referencia esa copia.

---

### User Story 2 - Administrar la estructura editorial (Priority: P2)

Como responsable del contenido, quiero crear y editar categorías y temas, y ordenar la estructura completa, para mantener rutas de aprendizaje coherentes sin modificar archivos manualmente.

**Why this priority**: Las notas dependen de una estructura válida; administrarla visualmente evita referencias rotas y facilita reorganizar el material a medida que crece.

**Independent Test**: Puede probarse creando una categoría con dos temas, asignando posiciones únicas, editando sus nombres y comprobando que los archivos resultantes conservan las relaciones y el orden seleccionado.

**Acceptance Scenarios**:

1. **Given** el administrador local abierto, **When** el responsable crea una categoría con sus datos obligatorios, **Then** queda disponible para clasificar temas y notas y se crea o actualiza su representación dentro del proyecto.
2. **Given** una categoría existente, **When** el responsable crea un tema con nombre y posición válidos, **Then** el tema queda disponible para las notas de esa categoría.
3. **Given** una categoría con temas y notas, **When** el responsable usa los controles “subir” o “bajar” sobre un elemento, **Then** el administrador recalcula posiciones únicas y el sitio público refleja el nuevo orden después de guardar.
4. **Given** una categoría o tema referenciado por contenido, **When** el responsable intenta eliminarlo, **Then** el administrador impide dejar referencias rotas y explica qué contenido debe reasignarse o eliminarse primero.

---

### User Story 3 - Mantener contenido existente (Priority: P3)

Como responsable del contenido, quiero localizar, revisar y actualizar el contenido que ya existe en el proyecto para usar el administrador como punto único de mantenimiento editorial.

**Why this priority**: Sin lectura y edición del contenido previo, el administrador serviría solo para altas nuevas y obligaría a conservar dos formas de trabajo.

**Independent Test**: Puede probarse abriendo una nota ya existente, modificando una etiqueta y su contenido, revisando los cambios y guardando; solo el archivo esperado debe cambiar y el resto de sus datos debe conservarse.

**Acceptance Scenarios**:

1. **Given** archivos de contenido válidos ya presentes, **When** el responsable abre el administrador, **Then** puede explorarlos por categoría y tema y buscar una nota por título o etiqueta.
2. **Given** una nota existente, **When** el responsable cambia uno o más campos y guarda, **Then** solo se aplican los cambios confirmados y se conservan los datos no editados.
3. **Given** cambios aún no guardados, **When** el responsable intenta abandonar la edición o seleccionar otro elemento, **Then** recibe una advertencia y puede continuar editando o descartar los cambios de forma explícita.
4. **Given** un archivo existente que no cumple el contrato de contenido, **When** el administrador intenta abrirlo, **Then** identifica el archivo y los problemas sin sobrescribirlo ni mostrar detalles técnicos innecesarios.

---

### User Story 4 - Trabajar sin afectar el sitio publicado (Priority: P4)

Como propietario del sitio, quiero que el administrador se ejecute exclusivamente en mi entorno local y quede excluido del sitio publicado para que las herramientas editoriales y el acceso de escritura no se expongan a visitantes.

**Why this priority**: La separación protege el flujo editorial y mantiene el sitio público liviano, pero se valida después de asegurar las capacidades principales de gestión.

**Independent Test**: Puede probarse iniciando el administrador local y completando una edición, para luego generar la entrega pública y verificar que ninguna ruta, pantalla, recurso o capacidad de escritura del administrador esté disponible en ella.

**Acceptance Scenarios**:

1. **Given** el proyecto en el equipo del responsable, **When** inicia expresamente la herramienta administrativa, **Then** puede acceder a ella desde ese entorno y gestionar los archivos autorizados del proyecto.
2. **Given** una entrega del sitio público, **When** un visitante intenta localizar o abrir la administración, **Then** no existe una ruta, pantalla ni operación administrativa accesible.
3. **Given** una entrega del sitio público, **When** se inspeccionan sus recursos, **Then** no contiene código, dependencias exclusivas ni datos temporales pertenecientes al administrador.

### Edge Cases

- El proyecto no contiene todavía categorías, temas o notas; el administrador presenta un estado inicial accionable y permite comenzar por una categoría.
- Dos elementos de una misma categoría intentan utilizar la misma posición; el guardado se bloquea e identifica el conflicto.
- Una nota intenta asignarse a un tema de otra categoría; el guardado se bloquea y solicita una combinación válida.
- El título propuesto produce el mismo identificador o destino que otro elemento; el administrador solicita resolver el conflicto sin sobrescribir el contenido existente.
- La imagen seleccionada no existe, no puede leerse o no es de un formato admitido; el resto del formulario se conserva y se indica cómo corregirla.
- Un archivo cambia fuera del administrador mientras está abierto; antes de guardar, se advierte el conflicto y no se sobrescribe silenciosamente la versión externa.
- Ocurre un fallo durante el guardado; el contenido anterior permanece recuperable y no queda un archivo parcial presentado como válido.
- Una búsqueda no encuentra resultados; se conserva el contexto de filtros y se ofrece una salida clara.
- Una categoría o tema con dependencias no puede eliminarse hasta que sus elementos relacionados se reasignen o eliminen explícitamente.
- Una nota enviada a la papelera deja de formar parte del contenido activo y puede restaurarse sin perder sus datos; su eliminación definitiva requiere una confirmación separada.
- El administrador se intenta abrir fuera del entorno local autorizado; no ofrece funciones de lectura ni escritura del contenido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE ofrecer un espacio administrativo separado de la experiencia pública del blog y destinado al responsable del contenido.
- **FR-002**: El espacio administrativo DEBE estar disponible únicamente cuando se inicie expresamente en el entorno local del proyecto.
- **FR-003**: La entrega pública NO DEBE contener rutas, pantallas, operaciones de escritura, recursos ni dependencias exclusivas del administrador.
- **FR-004**: El administrador DEBE leer las categorías, temas y notas existentes desde las fuentes de contenido vigentes del proyecto, sin exigir su migración a un servicio de datos externo.
- **FR-005**: El responsable DEBE poder crear, consultar y editar categorías con todos los atributos exigidos por el contrato de contenido vigente.
- **FR-006**: El responsable DEBE poder crear, consultar y editar temas, asignarlos a una categoría y definir su posición.
- **FR-007**: El responsable DEBE poder crear, consultar y editar notas con, como mínimo, título, categoría, duración estimada de lectura, posición y contenido.
- **FR-008**: El responsable DEBE poder asignar opcionalmente a una nota un tema de su misma categoría, una o más etiquetas y una imagen cuando el tipo de contenido lo admita; el selector de etiquetas DEBE sugerir las existentes y permitir crear una nueva sin abandonar la edición de la nota.
- **FR-009**: El administrador DEBE ofrecer los campos adicionales admitidos por el contrato vigente, incluidos los necesarios para notas escritas y notas cuyo formato principal sea video.
- **FR-010**: El editor de notas DEBE mostrar y editar directamente el contenido Markdown, ofrecer una barra de herramientas para insertar los elementos admitidos —incluidos encabezados, párrafos, listas, enlaces, bloques de código, imágenes y recursos audiovisuales compatibles— y mantener una vista previa en vivo durante la edición.
- **FR-011**: El administrador DEBE ofrecer una vista previa antes del guardado que represente el título, los metadatos, el contenido y los recursos visuales de la nota de forma suficientemente fiel para detectar errores editoriales.
- **FR-012**: El administrador DEBE permitir ordenar temas y notas mediante controles “subir” y “bajar” operables con teclado y DEBE recalcular automáticamente posiciones únicas dentro de la categoría después de cada movimiento.
- **FR-013**: Antes de guardar, el administrador DEBE validar campos obligatorios, identificadores, relaciones, posiciones, referencias de recursos y compatibilidad con el contrato de contenido.
- **FR-014**: Ante una validación fallida, el administrador NO DEBE modificar archivos y DEBE mostrar mensajes claros, contextuales y accionables junto al problema correspondiente.
- **FR-015**: Un guardado exitoso DEBE crear o actualizar los archivos del proyecto que constituyen la fuente del sitio público, preservando su compatibilidad con el contrato vigente.
- **FR-016**: Cada guardado DEBE informar qué elemento se guardó y qué archivo o recurso del proyecto fue creado o modificado.
- **FR-017**: El administrador DEBE impedir la sobrescritura silenciosa cuando el destino ya existe o cuando el archivo cambió externamente desde que comenzó la edición.
- **FR-018**: Si un guardado no puede completarse, el administrador DEBE conservar la versión anterior recuperable y evitar que un resultado parcial sea tratado como contenido válido.
- **FR-019**: El responsable DEBE poder explorar el contenido por categoría y tema y buscar notas por título o etiqueta.
- **FR-020**: El administrador DEBE advertir sobre cambios no guardados antes de abandonar una edición y permitir conservarlos o descartarlos de forma explícita.
- **FR-021**: Al eliminar una nota, el administrador DEBE retirarla del contenido activo y moverla a una papelera local recuperable; una categoría o tema con dependencias NO DEBE eliminarse mientras deje referencias rotas.
- **FR-022**: Al detectar contenido existente inválido o no reconocido, el administrador DEBE identificar el archivo y los campos problemáticos sin modificarlo automáticamente.
- **FR-023**: Las operaciones administrativas DEBEN limitar su lectura y escritura a las ubicaciones autorizadas de contenido y recursos dentro del proyecto.
- **FR-024**: Los controles y mensajes del administrador DEBEN poder comprenderse y operarse con teclado, mostrar foco perceptible y comunicar nombres, estados y errores a tecnologías de asistencia.
- **FR-025**: El alcance inicial NO incluye cuentas de usuario, administración remota, publicación directa a internet, colaboración simultánea, historial editorial propio ni sustitución del control de versiones del proyecto.
- **FR-026**: El responsable DEBE poder consultar la papelera, restaurar una nota con todos sus datos o eliminarla definitivamente mediante una confirmación separada; las notas en la papelera NO DEBEN publicarse ni ocupar posiciones dentro de una categoría.
- **FR-027**: Al guardar una imagen seleccionada desde el equipo, el administrador DEBE copiar el archivo sin transformar su formato, dimensiones ni calidad a la ubicación administrada de recursos del proyecto y DEBE registrar en la nota una referencia a esa copia.

### Key Entities

- **Categoría**: Ruta principal de aprendizaje que agrupa temas y notas. Incluye identidad, nombre visible, descripción y los atributos vigentes necesarios para presentarla en el sitio.
- **Tema**: Agrupación opcional dentro de una categoría. Incluye identidad, nombre, categoría y posición, y puede estar relacionado con cero o más notas.
- **Nota**: Unidad de contenido educativo. Incluye identidad, título, categoría, tema opcional, duración, posición, etiquetas, imagen opcional, formato, contenido, demás metadatos admitidos y estado activo o en papelera.
- **Etiqueta**: Descriptor reutilizable asociado a una o más notas para facilitar su clasificación y búsqueda editorial. Puede seleccionarse del conjunto existente o crearse durante la edición de una nota.
- **Recurso multimedia**: Imagen o recurso audiovisual referenciado por una nota, con origen, destino y datos descriptivos necesarios para validar y presentar el contenido. Una imagen incorporada desde el equipo se conserva sin transformaciones como una copia administrada dentro del proyecto.
- **Archivo de contenido**: Representación versionable de una categoría, tema, nota o recurso dentro del proyecto y consumida por el sitio público.
- **Borrador de edición**: Estado temporal de los cambios realizados en el administrador antes de confirmarlos en los archivos del proyecto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al menos el 90% de las personas participantes crea una nota completa con categoría, tema, orden, etiquetas e imagen en menos de 5 minutos y sin editar archivos manualmente.
- **SC-002**: El 100% de las categorías, temas y notas guardados en los casos de prueba cumple el contrato de contenido vigente y puede ser presentado por el sitio público sin correcciones manuales.
- **SC-003**: El 100% de los intentos con campos obligatorios incompletos, relaciones inválidas o posiciones duplicadas se bloquea antes de modificar archivos y muestra una indicación accionable.
- **SC-004**: En el 100% de las pruebas de guardado correcto, solo cambian los archivos y recursos confirmados por el responsable y el administrador identifica esos cambios.
- **SC-005**: En el 100% de los fallos de guardado simulados, la versión previa permanece recuperable y ningún archivo parcial se acepta como contenido válido.
- **SC-006**: Al menos el 90% de las personas participantes localiza una nota existente por categoría, tema, título o etiqueta en menos de 20 segundos.
- **SC-007**: El 100% de las entregas públicas inspeccionadas carece de rutas, interfaces, operaciones de escritura, recursos y dependencias exclusivas del administrador.
- **SC-008**: El 100% de los recorridos críticos de crear, editar, previsualizar, validar y guardar puede completarse solo con teclado, con foco, estados y errores perceptibles.
- **SC-009**: En una prueba editorial de al menos 20 operaciones consecutivas entre altas y ediciones, el 100% conserva relaciones válidas entre categorías, temas, notas y recursos.

## Assumptions

- El administrador está dirigido inicialmente a un único responsable con acceso autorizado al equipo y al proyecto; no requiere autenticación propia mientras sea exclusivamente local.
- El sitio público conserva los archivos de contenido del repositorio como fuente persistente y no se introduce una base de datos externa.
- Guardar contenido modifica archivos locales, pero publicarlo continúa siendo una acción separada mediante el flujo existente de revisión, control de versiones y entrega.
- Las reglas actuales de categorías, temas, notas, posiciones, videos y recursos siguen siendo la fuente de verdad; el administrador las facilita, no las redefine.
- Las etiquetas se incorporan como metadatos opcionales de las notas para organización y búsqueda editorial; su exposición en la experiencia pública queda fuera de este alcance salvo que el sitio ya las muestre.
- Las imágenes seleccionadas deben quedar disponibles como recursos versionables del proyecto y no depender de una biblioteca multimedia remota.
- La vista previa busca detectar errores editoriales y no garantiza una reproducción pixel por pixel de todos los contextos del sitio público.
- La primera versión prioriza equipos de escritorio; debe ser accesible y usable en el entorno local, pero no requiere una experiencia administrativa móvil dedicada.
