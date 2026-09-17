# Data Model: Temas, videos y panel de notas

## NavigationTopic

Tema editorial declarado dentro de una categoría.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | `string` | Obligatorio, slug URL-safe no vacío y único entre los temas de la categoría. |
| `name` | `string` | Obligatorio, visible y no vacío después de trim. |
| `position` | `number` | Entero positivo y único en la unión de temas y notas de la categoría. |
| `category` | `string` derivado | ID de la categoría propietaria; no se repite en el JSON del tema. |

Un tema puede tener cero notas. No existe fuera de su categoría, no tiene ruta pública y no puede contener otros temas.

## Category

Extiende la categoría vigente.

| Campo | Tipo | Reglas nuevas o conservadas |
|---|---|---|
| `id` | `string` | Derivado del archivo JSON, slug único global. |
| `name` | `string` | No vacío. |
| `description` | `string` | No vacío. |
| `image` | `string` | Ruta pública admitida o URL HTTPS. |
| `level` | `CategoryLevel` | Uno de los niveles existentes. |
| `topics` | `ReadonlyArray<NavigationTopic>` | Obligatorio en el modelo; puede estar vacío. Los datos existentes pueden migrarse con `[]`. |

Relaciones: una categoría posee cero o más temas y cero o más notas. Eliminar o renombrar un tema exige actualizar primero toda nota que lo referencie.

## Note

Conserva la unión discriminada `WrittenNote | VideoNote` y añade a su base:

| Campo | Tipo | Reglas nuevas o conservadas |
|---|---|---|
| `topic` | `string | undefined` | Slug opcional. Si existe, debe resolver a un tema de `note.category`. |
| `position` | `number` | Entero positivo, único frente a todas las notas y temas de `note.category`. |
| demás campos | sin cambio | Título, descripción, tags, categoría, duración, formato y payload siguen sus contratos actuales. |

Una nota pertenece como máximo a un tema. La ausencia de `topic` significa que aparece directamente en la raíz del panel; no se crea un grupo implícito.

## NavigationItem

Unión derivada, efímera e inmutable usada exclusivamente por el panel.

### TopicNavigationItem

| Campo | Tipo | Descripción |
|---|---|---|
| `kind` | `'topic'` | Discriminador. |
| `topic` | `NavigationTopic` | Tema raíz. |
| `notes` | `ReadonlyArray<Note>` | Notas que lo referencian, ordenadas por posición global. Puede estar vacío. |

### UngroupedNoteNavigationItem

| Campo | Tipo | Descripción |
|---|---|---|
| `kind` | `'note'` | Discriminador. |
| `note` | `Note` | Nota sin tema mostrada en raíz. |

La lista raíz combina ambos tipos y se ordena por `position`. La unicidad validada hace que no exista un empate publicado; un desempate determinista por tipo/ID puede conservarse solo como defensa interna.

## LearningRoute

Mantiene el contrato existente y añade la proyección agrupada.

| Campo | Tipo | Regla |
|---|---|---|
| `category` | `Category` | Categoría activa. |
| `notes` | `ReadonlyArray<Note>` | Todas las notas de la categoría en posición global; fuente de inicio, anterior y siguiente. |
| `navigationItems` | `ReadonlyArray<NavigationItem>` | Árbol visual del panel. |
| `activeNote` | `Note | null` | Nota solicitada o primera nota global. |
| `previousNote` | `Note | null` | Nota anterior en `notes`; ignora los nodos tema. |
| `nextNote` | `Note | null` | Nota siguiente en `notes`; ignora los nodos tema. |
| `activeTopicId` | `string | null` | Tema de la nota activa, si existe. |

## EmbeddedYouTubeVideo

Modelo derivado durante el procesamiento Markdown; no se persiste ni cambia `Note.format`.

| Campo | Tipo | Regla |
|---|---|---|
| `videoId` | `string` | Exactamente 11 caracteres `[A-Za-z0-9_-]`. |
| `sourceFormat` | `'watch' | 'youtu.be' | 'shorts' | 'embed'` | Forma reconocida del URL fuente. |
| `embedUrl` | `string` | `https://www.youtube-nocookie.com/embed/{videoId}` construido, no copiado. |
| `watchUrl` | `string` | `https://www.youtube.com/watch?v={videoId}` construido. |

Solo nace de un párrafo raíz que contiene exclusivamente una URL HTTP(S) desnuda admitida; sus destinos derivados siempre usan HTTPS. Un texto alrededor, enlace etiquetado, lista, cita, canal, perfil, playlist, host no permitido o ID inválido no crea esta entidad y permanece como enlace Markdown.

## SidebarVisitState

Estado efímero del navegador, aislado por categoría.

| Campo | Tipo | Regla |
|---|---|---|
| `visible` | `boolean` | `true` por defecto. |
| `expandedTopicIds` | `ReadonlyArray<string>` | Solo IDs presentes en la categoría; duplicados y desconocidos se ignoran. |
| `navigationScrollTop` | `number` | Finito y no negativo; `0` por defecto. |

La clave incluye versión y `category.id` para evitar colisiones. La nota activa no se duplica: la URL es su fuente de verdad.

## Reglas de validación cruzada

1. Cada `topic.id` es único dentro de la categoría que lo declara.
2. Cada `note.topic`, cuando existe, resuelve dentro de `note.category`.
3. Toda posición es única en `topics ∪ notes` para una categoría, aunque los elementos aparezcan en niveles distintos.
4. Una relación o posición inválida bloquea validación, prueba y build con mensaje que identifica campo, elemento y fuente que colisiona.
5. La validación relacional no inventa temas, mueve notas ni corrige posiciones automáticamente.

## Transiciones de estado

### Tema

- `collapsed → expanded`: activación de su `summary`; se añade el ID a `expandedTopicIds`.
- `expanded → collapsed`: nueva activación; se elimina el ID.
- `collapsed → expanded` automática: una navegación activa una nota de ese tema; se añade sin cerrar otros temas.
- Primera apertura sin estado previo: solo `activeTopicId` comienza expandido; si la nota no tiene tema, todos comienzan contraídos.

### Panel

- `visible → hidden`: activación del toggle; el aside deja de ocupar espacio, pero el estado de temas y scroll se conserva.
- `hidden → visible`: activación del mismo toggle; se restituye el ancho definido por diseño y el scroll guardado.
- Navegación entre notas de la categoría: se restaura el registro de visita y se aplica la expansión automática del tema activo.
- Estado ausente, corrupto o almacenamiento no disponible: se usan defaults seguros sin impedir lectura ni navegación.
