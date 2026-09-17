# Data Model: Administración local de contenido

## CategoryDocument

Documento activo cargado desde `src/content/categories/{id}.json`.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | `string` | Derivado del nombre de archivo; slug `[a-z0-9]+(?:-[a-z0-9]+)*`; único global. |
| `name` | `string` | Obligatorio y no vacío después de trim. |
| `description` | `string` | Obligatorio y no vacío después de trim. |
| `image` | `string` | Ruta no vacía bajo `/images/categories/` o URL HTTPS absoluta. |
| `level` | `CategoryLevel` | `beginner`, `intermediate`, `advanced` o `pro`. |
| `topics` | `ReadonlyArray<Topic>` | Obligatorio; puede estar vacío. |
| `sourcePath` | `string` derivado | Ruta relativa autorizada; nunca la envía el cliente como destino. |
| `revision` | `string` derivado | SHA-256 de los bytes originales; obligatorio para editar/eliminar. |

Una categoría posee sus temas. Tiene cero o más notas por la relación `NoteDocument.category`. No se elimina mientras existan notas; un cambio de `id` se trata como crear una categoría nueva y reasignar dependencias, no como una edición ordinaria.

## Topic

Valor embebido dentro de `CategoryDocument.topics`.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | `string` | Slug no vacío y único dentro de la categoría. |
| `name` | `string` | Obligatorio y visible. |
| `position` | `number` | Entero positivo y único en `topics ∪ notes` de la categoría. |
| `categoryId` | `string` derivado | Categoría propietaria; no se serializa en JSON. |

Un tema puede no tener notas. No tiene archivo, ruta pública, anidación ni vida independiente. No se elimina mientras alguna nota de su categoría lo referencie.

## NoteDocument

Documento activo cargado desde `src/content/notes/{folder}/{id}.md`.

### Campos comunes

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | `string` | Derivado del basename Markdown; slug. En creación se propone desde el título y se confirma antes de guardar. |
| `folder` | `string` | Segmento de carpeta slug. Para nuevas notas coincide con la categoría inicial; en notas existentes se conserva para no romper recursos relativos. |
| `title` | `string` | Obligatorio y no vacío; es el identificador visible. |
| `description` | `string` | Obligatorio y no vacío según el contrato vigente. |
| `tags` | `ReadonlyArray<string>` | Al menos una etiqueta no vacía; sugeridas desde el conjunto derivado. |
| `category` | `string` | Debe resolver a una categoría existente. |
| `topic` | `string \| undefined` | Si existe, debe resolver dentro de `category`. |
| `durationMinutes` | `number` | Entero positivo. |
| `position` | `number` | Entero positivo y único en la unión de temas y notas de `category`. |
| `format` | `'written' \| 'video'` | Discriminador del payload. |
| `sourcePath` | `string` derivado | Ruta activa exacta; no es un destino controlable por el cliente. |
| `revision` | `string` derivado | SHA-256 de los bytes Markdown originales. |
| `status` | `'active'` | Los documentos bajo la colección siempre están activos. |

### WrittenNotePayload

| Campo | Tipo | Reglas |
|---|---|---|
| `format` | `'written'` | Obligatorio. |
| `body` | `string` | Markdown no vacío. |
| `youtubeVideoId` | ausente | No se serializa. |
| `managedAssets` | `ReadonlyArray<ManagedAssetReference>` derivado | Referencias relativas detectadas o añadidas mediante upload. |

### VideoNotePayload

| Campo | Tipo | Reglas |
|---|---|---|
| `format` | `'video'` | Obligatorio. |
| `youtubeVideoId` | `string` | Exactamente 11 caracteres `[A-Za-z0-9_-]`. |
| `body` | `''` | No puede contener Markdown. |

El `id` y `folder` de una nota existente permanecen estables durante la edición ordinaria. Reasignar `category` cambia su relación y orden público, pero no mueve automáticamente el archivo ni sus recursos relativos. Esto conserva archivos válidos que ya usan una carpeta distinta de su categoría, caso permitido por el validador vigente.

## Tag

Valor derivado, no documento persistente independiente.

| Campo | Tipo | Reglas |
|---|---|---|
| `value` | `string` | Texto no vacío después de trim. |
| `usageCount` | `number` | Conteo derivado de notas activas. |

El selector muestra valores distintos ordenados de forma insensible a mayúsculas/acentos y permite agregar uno nuevo. Crear una etiqueta solo modifica `tags` de la nota guardada.

## ManagedAsset

Imagen seleccionada para una nota escrita y copiada sin transformación.

| Campo | Tipo | Reglas |
|---|---|---|
| `uploadToken` | `string` | ID aleatorio efímero, no una ruta. |
| `originalName` | `string` | Solo informativo; nunca se usa directamente como ruta. |
| `safeFileName` | `string` | Basename normalizado con extensión permitida. |
| `mediaType` | `string` | Debe coincidir con un formato de imagen admitido. |
| `byteSize` | `number` | Positivo y dentro del límite configurado. |
| `sha256` | `string` | Hash de los bytes staged y finales; debe conservarse. |
| `stagedPath` | `string` derivado | Bajo `.content-admin/uploads/`. |
| `destinationPath` | `string` derivado | Bajo `src/content/notes/{folder}/assets/`. |
| `markdownReference` | `string` derivado | `assets/{safeFileName}`. |

El upload staged no forma parte del contenido activo. Solo pasa a ser recurso administrado si la transacción de guardado de la nota que lo referencia finaliza. Una colisión nunca sobrescribe el archivo existente.

## ContentSnapshot

Vista consistente devuelta a la interfaz.

| Campo | Tipo | Descripción |
|---|---|---|
| `categories` | `ReadonlyArray<CategoryDocument>` | Categorías y temas válidos o parcialmente legibles. |
| `notes` | `ReadonlyArray<NoteDocument>` | Notas activas legibles. |
| `tags` | `ReadonlyArray<Tag>` | Índice derivado. |
| `issues` | `ReadonlyArray<ValidationIssue>` | Problemas por archivo/campo, incluidos documentos no editables. |
| `snapshotRevision` | `string` | Hash determinista del conjunto de rutas y revisiones. |

Un archivo con JSON/frontmatter inválido se representa mediante `issues` y un descriptor mínimo de origen. No se normaliza ni sobrescribe automáticamente.

## EditingDraft

Estado cliente efímero para categoría, tema, nota u orden.

| Campo | Tipo | Reglas |
|---|---|---|
| `kind` | `'category' \| 'topic' \| 'note' \| 'order'` | Define formulario y validación. |
| `identity` | referencia opcional | Ausente en creación; estable durante edición. |
| `baseRevision` | `string \| null` | `null` al crear; hash leído al editar. |
| `values` | objeto tipado | Copia mutable de los campos editables. |
| `dirty` | `boolean` | Verdadero cuando difiere del valor cargado. |
| `fieldIssues` | mapa | Mensajes visibles asociados con controles. |
| `pendingUploads` | `ReadonlyArray<string>` | Tokens staged aún no confirmados. |

El borrador no se persiste como contenido ni constituye una función de autoguardado. Cambiar de elemento, navegar o cerrar con `dirty = true` exige confirmar conservar o descartar la edición.

## OrderDraft

Secuencia editable de todos los elementos posicionados de una categoría.

| Campo | Tipo | Reglas |
|---|---|---|
| `categoryId` | `string` | Categoría existente. |
| `items` | `ReadonlyArray<OrderItem>` | Contiene exactamente una vez cada tema y nota activa de la categoría. |
| `baseRevisions` | mapa `sourcePath → sha256` | Incluye categoría y todas las notas cuya posición pueda cambiar. |

`OrderItem` contiene `kind: 'topic' | 'note'`, `id` y `position`. Después de cada movimiento la posición es el índice uno-basado. Guardar valida membresía, revisiones y unicidad antes de actualizar todos los archivos afectados en una transacción.

## TrashEntry

Bundle recuperable fuera de las colecciones activas.

| Campo | Tipo | Reglas |
|---|---|---|
| `trashId` | `string` | ID opaco único. |
| `note` | bytes Markdown | Copia exacta del documento retirado. |
| `originalPath` | `string` | Ruta relativa autorizada para restaurar. |
| `originalRevision` | `string` | SHA-256 al eliminar. |
| `deletedAt` | `string` | Timestamp ISO-8601. |
| `assetCopies` | `ReadonlyArray<TrashAsset>` | Copias de recursos locales referenciados que puedan recuperarse. |
| `manifestRevision` | `string` | Hash usado para detectar cambios en el bundle. |

El bundle vive en `.content-admin/trash/notes/{trashId}/`. La nota no participa en búsquedas, posiciones, validación pública ni build. Restaurar vuelve a usar la posición original, desplaza de forma contigua los elementos activos necesarios y repone recursos faltantes solo si no colisionan. Eliminar definitivamente requiere `trashId`, revisión y confirmación explícita.

## FileTransaction

Estado técnico interno, no historial editorial visible.

| Campo | Tipo | Descripción |
|---|---|---|
| `transactionId` | `string` | ID aleatorio. |
| `status` | `'prepared' \| 'committing' \| 'committed' \| 'rollingBack'` | Estado durable del journal. |
| `operations` | lista | Creaciones, reemplazos, moves y eliminaciones autorizadas. |
| `expectedRevisions` | mapa | Preconditions comprobadas justo antes del commit. |
| `backupPaths` | mapa | Copias para rollback bajo `.content-admin/transactions/`. |

Solo una transacción mutante se ejecuta a la vez. El proceso valida el snapshot propuesto completo antes de `committing`; un fallo ejecuta rollback. Al iniciar el administrador, cualquier journal no finalizado se recupera antes de aceptar solicitudes.

## ValidationIssue

| Campo | Tipo | Descripción |
|---|---|---|
| `sourcePath` | `string` | Ruta de proyecto segura. |
| `field` | `string` | Campo o relación afectada. |
| `code` | `string` | Código estable para UI/tests. |
| `message` | `string` | Mensaje español claro y accionable. |

Las trazas, excepciones y rutas absolutas permanecen solo en stderr local. El cliente recibe issues esperados o un fallo genérico.

## Relaciones e invariantes

1. Cada `Topic` pertenece exactamente a una `CategoryDocument`.
2. Cada `NoteDocument` pertenece exactamente a una categoría y como máximo a un tema de esa misma categoría.
3. Cada categoría tiene un único espacio de posiciones para todos sus temas y notas activas.
4. `Tag` se deriva de `NoteDocument.tags`; no hay archivo de etiquetas.
5. Un `ManagedAsset` confirmado pertenece al directorio de assets de la carpeta física de la nota, aunque pueda ser referenciado por más de una nota.
6. `TrashEntry` contiene una nota inactiva; nunca coexiste como la misma ruta activa.
7. Toda edición o movimiento usa la revisión exacta observada por el borrador.
8. Ninguna entrada del cliente puede escapar de las raíces autorizadas ni seleccionar una ruta arbitraria.

## Transiciones de estado

### Borrador

- `clean → dirty`: cambia un campo, tag, cuerpo, upload u orden.
- `dirty → validating`: se solicita guardar.
- `validating → dirty`: hay issues; no cambia ningún archivo.
- `validating → conflict`: una revisión/destino difiere; no cambia ningún archivo y el borrador se conserva.
- `validating → committing → clean`: transacción completa; se recargan valores y revisiones.
- `dirty → discarded`: confirmación explícita; se liberan uploads staged asociados.

### Nota

- `absent → active`: creación válida, destino libre y commit exitoso.
- `active → active`: edición o reordenamiento con revisión coincidente.
- `active → trashed`: move transaccional a bundle local; deja de publicarse y se renumera su categoría.
- `trashed → active`: destino libre, recursos compatibles y restauración transaccional.
- `trashed → purged`: segunda confirmación y eliminación definitiva del bundle.

### Transacción

- `prepared → committing → committed`: camino exitoso.
- `committing → rollingBack → removed`: fallo controlado restaura backups.
- `committing` encontrado al iniciar: recuperación decide terminar un rename ya durable o revertir desde backups antes de servir la UI.
