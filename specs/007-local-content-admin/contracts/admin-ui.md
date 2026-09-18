# Contract: Interfaz del administrador local

## Entrada y estructura

- La interfaz solo abre desde la URL loopback mostrada por `npm run admin`.
- No existe enlace, ruta ni descubrimiento desde el sitio público.
- Una cabecera identifica claramente “Administrador local” y muestra que los cambios afectan archivos del repositorio, no que publiquen a internet.
- El layout de escritorio usa tres zonas reconocibles: explorador editorial, formulario/editor y vista previa. En anchuras estrechas se apilan sin perder controles ni crear una experiencia móvil dedicada.
- El editor Markdown ofrece un modo de enfoque dentro de la aplicación: en escritorio ocupa el viewport con editor y preview simultáneos; bajo 900 px conserva ambas vistas mediante el selector Editor/Vista previa.
- La composición, contraste, bordes, tipografía y densidad toman como referencia la claridad de Vercel, usando la identidad visual y el español propios del proyecto.

## Explorador editorial

- Muestra categorías expandibles, sus temas y notas activas; la papelera es una sección separada.
- Permite filtrar notas por título o etiqueta y limitar por categoría/tema sin perder los filtros cuando no hay resultados.
- Una búsqueda sin coincidencias explica el estado y ofrece limpiar filtros.
- Los archivos inválidos permanecen visibles con estado de atención, ruta relativa y resumen accionable; abrirlos nunca dispara una escritura automática.
- Si no existe contenido, el estado inicial dirige primero a “Crear categoría”; tema y nota permanecen explicados pero no utilizables hasta que existan sus dependencias.
- Las acciones de alta se distinguen con texto e iconos propios: “Nueva categoría”, “Nuevo tema” y “Nueva nota”.

## Formularios

### Categoría

- Campos: ID al crear, nombre, descripción, imagen y nivel.
- El ID propuesto se deriva del nombre, puede corregirse antes del primer guardado y después queda estable.
- La imagen admite la ruta pública o URL HTTPS que permite el contrato actual.
- Crear, editar y eliminar se inicia desde la propia biblioteca y usa diálogos enfocados; no existe un selector intermedio de “editar existente”.

### Tema

- Campos: ID al crear, nombre y ubicación en la secuencia de su categoría.
- El ID queda estable después de crear.
- El alta se realiza en el contexto de la categoría seleccionada y añade el tema al final; el orden se cambia desde la vista Orden.
- Cada fila de tema ofrece acciones contextuales para editar o eliminar.
- Eliminar muestra dependencias y se bloquea mientras existan notas relacionadas.

### Nota

- Campos comunes: ID al crear, título, descripción, etiquetas, categoría, tema opcional, duración, formato y posición.
- El selector de tema solo lista temas de la categoría elegida; cambiar categoría limpia o exige corregir un tema incompatible.
- El selector de etiquetas muestra existentes, permite búsqueda y crea una etiqueta al confirmar texto no vacío, sin abandonar el formulario.
- `written` muestra textarea Markdown, toolbar, upload de imagen y preview.
- `video` muestra `youtubeVideoId`, oculta el cuerpo y no permite uploads; un cambio de formato que descartaría datos requiere confirmación.

## Editor Markdown y recursos

- El contenido se edita directamente en un `<textarea>` con label persistente.
- La toolbar usa botones nativos con nombres accesibles y shortcuts anunciados para encabezado, negrita, cursiva, lista ordenada/no ordenada, enlace, código inline, bloque de código, imagen y recurso audiovisual compatible.
- Cada comando modifica o envuelve la selección, devuelve foco al textarea y preserva una selección útil.
- “Modo enfoque” oculta navegación y metadatos, conserva toolbar, estado de borrador, Guardar y Salir, y devuelve el foco al control que lo activó al pulsar Escape.
- Si un guardado en modo enfoque falla por metadatos, la interfaz sale del modo, abre los ajustes y enfoca el resumen de errores.
- Elegir una imagen muestra nombre, tipo, tamaño, texto alternativo y preview local. Solo después de “Guardar nota” el recurso pasa a la carpeta activa.
- Un upload inválido conserva todos los demás campos y asocia el error al control de imagen.

## Vista previa

- Se actualiza tras un debounce y también mediante “Actualizar vista previa”.
- Representa título, descripción, etiquetas, duración, formato, cuerpo y recursos con el procesador Markdown vigente.
- Vive en un iframe `sandbox` sin permisos de scripts, formularios ni navegación superior.
- Mientras procesa conserva la última preview válida y anuncia el estado de forma no intrusiva.
- Un fallo muestra un mensaje accionable y no borra el borrador.
- La preview es una ayuda editorial; no promete igualdad pixel a pixel con cada página pública.

## Orden

- La vista de orden muestra una secuencia única de temas y notas de la categoría.
- Cada fila tiene botones “Subir” y “Bajar”; el primero/último deshabilita solo la acción imposible.
- Tras activar un control, se renumeran todas las filas de `1..N`, el foco permanece en el elemento movido y una región `aria-live="polite"` anuncia su nueva posición.
- Los movimientos cambian un borrador. Solo “Guardar orden” persiste todos los archivos; “Descartar” recupera el snapshot leído.
- Teclado, foco y nombre accesible distinguen tipo, título y posición de cada fila.

## Guardado, errores y conflictos

- “Guardar” valida primero en cliente para feedback inmediato y siempre vuelve a validar en servidor.
- Un error aparece junto al campo, se resume al inicio del formulario y el foco se mueve al resumen; los links del resumen enfocan cada control.
- En un guardado exitoso, un status anuncia elemento y paths relativos creados/modificados. El borrador pasa a limpio con revisiones nuevas.
- Un `409` conserva íntegro el borrador y explica si cambió el archivo, existe el destino, hay una dependencia o colisión de recurso. Ofrece recargar la versión externa o conservar el borrador para copiar/comparar; nunca sobrescribe.
- Un fallo inesperado no muestra traza. Indica que la versión previa sigue disponible y presenta el ID local de incidente si existe.

## Cambios no guardados

- Seleccionar otro elemento, cambiar de sección, recargar o cerrar con un borrador sucio dispara una advertencia.
- Dentro de la aplicación, el diálogo ofrece “Seguir editando” y “Descartar cambios”; el foco inicial y de retorno son deterministas.
- Para cierre/recarga se usa la advertencia nativa `beforeunload`.
- Los uploads staged asociados se limpian al descartar o expirar, sin modificar recursos activos.

## Eliminación y papelera

- “Mover a papelera” identifica la nota y explica que dejará de aparecer en el sitio; no es una eliminación definitiva.
- Tras confirmar, la nota desaparece del contenido activo, la categoría se renumera y el status informa el bundle creado.
- La papelera permite consultar título, categoría, fecha y ruta original, y ofrece “Restaurar” o “Eliminar definitivamente”.
- Restaurar explica cualquier conflicto sin consumir la entrada.
- Eliminar definitivamente usa un segundo diálogo que exige confirmar el `trashId` o nombre mostrado; nunca comparte la misma acción que mover a papelera.
- Categorías y temas no usan papelera en v1 y no se eliminan con dependencias.

## Accesibilidad

- Todas las funciones críticas se completan con teclado; no dependen de drag-and-drop.
- El orden DOM sigue explorador, editor/formulario, acciones y preview; los landmarks y encabezados permiten saltar entre zonas.
- Todo control tiene label/nombre accesible, estados `disabled`, `expanded`, `selected`, `invalid` o `current` cuando corresponde y foco visible en tema claro/oscuro.
- Mensajes de validación se asocian con `aria-describedby`; status usa `aria-live="polite"` y fallos bloqueantes `role="alert"` sin anunciar cada pulsación de preview.
- Color nunca es la única señal de error, selección, formato o estado.
- Diálogos gestionan foco, Escape y retorno al disparador; no se crean componentes interactivos con elementos no semánticos.

## Aislamiento público verificable

Después de `npm run build` del sitio público:

- no existe `/admin`, `/api/*` administrativo ni página equivalente;
- `dist/` no contiene JavaScript, CSS, strings, iconos ni runtime de `.content-admin` propios del administrador;
- no existe operación de escritura accesible desde la entrega;
- las rutas y el contenido público actual conservan sus pruebas E2E.
