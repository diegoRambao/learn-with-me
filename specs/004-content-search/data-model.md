# Data Model: Búsqueda transversal de contenido

## Fuentes persistentes

### Category

Categoría publicada desde `src/content/categories/<id>.json`.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | `string` | Derivado del nombre de archivo; slug único y URL-safe. |
| `name` | `string` | Obligatorio, recortado y no vacío; buscable. |
| `description` | `string` | Nuevo; obligatorio, recortado y no vacío; buscable y visible en resultados. |
| `image` | `string` | Ruta bajo `/images/categories/` o URL HTTPS; visible con fallback accesible si falla. |
| `level` | `CategoryLevel` | `beginner`, `intermediate`, `advanced` o `pro`. |

Relaciones: una categoría tiene cero o más `Note`; su `id` es destino de `Note.category` y produce `/categorias/<id>/`.

### Note

Nota publicada desde `src/content/notes/<id>.md`.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | `string` | Derivado del nombre de archivo; slug único y URL-safe. |
| `title` | `string` | Obligatorio, recortado y no vacío; buscable y visible. |
| `description` | `string` | Obligatorio, recortado y no vacío; buscable y visible. |
| `tags` | `ReadonlyArray<string>` | Nuevo; al menos una etiqueta; cada valor recortado y no vacío; buscable y todas visibles. No se exige unicidad ni se modifica el texto editorial. |
| `category` | `string` | Debe corresponder a un `Category.id` existente. |
| `durationMinutes` | `number` | Entero positivo. |
| `position` | `number` | Entero positivo y único dentro de la categoría. |
| `format` | `'written' \| 'video'` | Discriminante vigente. |
| `body` | `string` | Obligatorio solo en nota escrita; persiste para detalle pero no entra al índice de búsqueda. |
| `youtubeVideoId` | `string` | Obligatorio y válido solo en nota de video; no buscable. |

Relaciones: cada nota pertenece exactamente a una categoría. Su destino canónico es `/categorias/<category>/<id>/` y su imagen de resultado se toma de la categoría relacionada.

## Modelos derivados

### SearchQuery

| Campo | Tipo | Reglas |
|---|---|---|
| `raw` | `string` | Valor obtenido del primer parámetro URL `q`; se conserva para mostrarlo. |
| `trimmed` | `string` | `raw.trim()`; vacío significa consulta inválida o estado inicial. |
| `tokens` | `ReadonlyArray<string>` | Unidades separadas por espacios, normalizadas y deduplicadas conservando su primer orden. |
| `status` | `'initial' \| 'invalid' \| 'valid'` | `initial` si no existe `q`; `invalid` si existe pero queda vacío; `valid` si contiene al menos un token. |

Transiciones:

```text
sin parámetro q ──> initial
q vacío/espacios ──> invalid ──nueva confirmación válida──> valid
q con texto ──> valid ──edición y confirmación──> valid o invalid
```

### SearchCategoryRecord

| Campo | Tipo | Origen/uso |
|---|---|---|
| `type` | `'category'` | Discriminante y parte de la clave única. |
| `id` | `string` | `Category.id`. |
| `name` | `string` | Presentación y búsqueda. |
| `description` | `string` | Presentación y búsqueda. |
| `image` | `string` | Presentación. |
| `href` | `string` | Generado con `categoryUrl(id)`. |
| `searchableFields` | `ReadonlyArray<string>` | Versiones normalizadas de `name` y `description`, mantenidas como campos separados. |

### SearchNoteRecord

| Campo | Tipo | Origen/uso |
|---|---|---|
| `type` | `'note'` | Discriminante y parte de la clave única. |
| `id` | `string` | `Note.id`. |
| `title` | `string` | Presentación y búsqueda. |
| `description` | `string` | Presentación y búsqueda. |
| `tags` | `ReadonlyArray<string>` | Presentación y búsqueda por etiqueta individual. |
| `categoryId` | `string` | Relación y clave de orden. |
| `categoryName` | `string` | Contexto visible, no añade un campo buscable según FR-004. |
| `image` | `string` | Copiada de la categoría relacionada para presentación. |
| `href` | `string` | Generado con `noteUrl(categoryId, id)`. |
| `searchableFields` | `ReadonlyArray<string>` | Versiones normalizadas de `title`, `description` y cada etiqueta. |

### SearchResults

| Campo | Tipo | Reglas |
|---|---|---|
| `query` | `SearchQuery` | Debe estar en estado `valid` para evaluar el índice. |
| `categories` | `ReadonlyArray<SearchCategoryRecord>` | Cada registro aparece como máximo una vez; preserva orden canónico. |
| `notes` | `ReadonlyArray<SearchNoteRecord>` | Cada registro aparece como máximo una vez; preserva categoría/posición/id. |
| `total` | `number` | `categories.length + notes.length`. |

Regla de coincidencia para ambos tipos:

```text
matches(record, query) = query.tokens.every(token =>
  record.searchableFields.some(field => field.includes(token))
)
```

## Reglas de validación y publicación

- Astro Content Collections rechaza la forma inválida al cargar contenido.
- `validateContent` acumula problemas por `sourcePath`, `field`, `code` y mensaje accionable.
- Categoría sin `description` no puede superar `validate:content` ni build.
- Nota sin `description`, sin `tags`, con arreglo vacío o etiqueta vacía no puede superar validación ni build.
- Solo registros que superan el contrato forman el índice; no existe estado de publicación parcial ni borrador en esta feature.
- Una imagen ausente en runtime no invalida el registro: la vista cambia a `/category-fallback.svg` sin perder texto ni enlace.
