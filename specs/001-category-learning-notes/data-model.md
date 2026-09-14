# Data Model: Categorías y rutas de aprendizaje

## Category

Representa un tema y la raíz de una ruta de aprendizaje.

| Campo | Tipo | Requerido | Reglas |
|---|---|---:|---|
| `id` | string | sí | Derivado del nombre del archivo; slug URL-safe, único globalmente |
| `name` | string | sí | No vacío después de `trim`; texto visible |
| `image` | string | sí | Ruta local válida bajo `/images/categories/` o URL absoluta `https` |
| `level` | enum | sí | `beginner`, `intermediate`, `advanced`, `pro` |

Las etiquetas visibles se centralizan: `beginner → Principiante`, `intermediate → Intermedio`, `advanced → Avanzado`, `pro → Pro`. El modelo almacena claves estables y la UI traduce una sola vez.

### Relaciones

- Una categoría tiene cero o muchas notas.
- El nivel pertenece a la categoría; ninguna nota almacena nivel.
- Eliminar o renombrar una categoría exige actualizar todas sus notas antes de que el build vuelva a pasar.

## HomeCategoryIndex

Modelo derivado, no persistido, que alimenta el índice de la portada en todas las anchuras.

| Campo | Tipo | Derivación |
|---|---|---|
| `categories` | `ReadonlyArray<Category>` | Todas las categorías válidas, ordenadas por `name` normalizado y luego por `id` |
| `destination` | string por categoría | URL canónica `/categorias/{category.id}/` |

La presentación amplia y el control compacto DEBEN consumir el mismo array ordenado. No se crean copias con orden, etiquetas o destinos independientes.

## SiteConfig

Configuración pública, versionada e inmutable del sitio.

| Campo | Tipo | Requerido | Reglas |
|---|---|---:|---|
| `socialLinks` | `ReadonlyArray<SocialLink>` | sí | Puede estar vacío; nunca contiene valores inválidos ni de ejemplo |

Un array vacío significa que la portada omite los enlaces sociales; no muestra iconos deshabilitados, URLs vacías ni placeholders.

## SocialLink

Destino social proporcionado expresamente por el autor.

| Campo | Tipo | Requerido | Reglas |
|---|---|---:|---|
| `network` | string | sí | Clave estable, no vacía y única dentro de `socialLinks` |
| `label` | string | sí | Texto no vacío que identifica de forma comprensible la red y el destino |
| `url` | string | sí | URL absoluta con esquema `https`; única dentro de `socialLinks` |

La validez comprueba forma, unicidad y origen autoral; no consulta en tiempo de build si el proveedor remoto está disponible.

## Note

Unidad ordenada de aprendizaje. Cada entrada se almacena en un archivo Markdown.

| Campo | Tipo | Requerido | Reglas |
|---|---|---:|---|
| `id` | string | sí | Derivado del nombre del archivo; slug URL-safe, único globalmente |
| `title` | string | sí | No vacío; identificador visible en listados |
| `description` | string | sí | No vacía; resumen contextual de la clase |
| `category` | string | sí | Debe coincidir con un `Category.id` existente |
| `durationMinutes` | integer | sí | Mayor que 0; duración estimada de consumo |
| `position` | integer | sí | Mayor que 0; única dentro de su categoría |
| `format` | enum | sí | Exactamente `written` o `video` |
| `youtubeVideoId` | string | condicional | Obligatorio y con formato válido solo si `format=video`; prohibido en `written` |
| `body` | Markdown | condicional | No vacío solo si `format=written`; vacío en `video` |

### Invariantes

1. Cada nota referencia exactamente una categoría existente.
2. No hay dos notas con el mismo `id` global ni la misma `position` dentro de una categoría.
3. El orden de una ruta es ascendente por `position`; `id` se usa como desempate defensivo, aunque un empate bloquea el build.
4. `written` y `video` son mutuamente excluyentes.
5. No existe estado editorial. Una entrada válida está publicada; cualquier entrada inválida bloquea toda publicación.

### Invariante de datos de validación

Los datos usados para validar los dos formatos incluyen al menos una nota `written` y una nota `video` que comparten exactamente el mismo `category`, declaran títulos, descripciones y duraciones válidas, y usan posiciones enteras positivas distintas. Esta condición pertenece a fixtures y pruebas de aceptación; no obliga a que toda categoría de producción contenga ambos formatos.

## LearningRoute

Modelo derivado, no persistido.

| Campo | Tipo | Derivación |
|---|---|---|
| `category` | `Category` | Categoría seleccionada |
| `notes` | `ReadonlyArray<Note>` | Notas filtradas por categoría y ordenadas por posición |
| `activeNote` | `Note \| null` | Nota indicada por URL; en la ruta de categoría, primera nota; `null` si no hay notas |

### Estados

```text
category selected
    ├── notes empty ──> empty route (no active note)
    └── notes exist ──> first note active
                             │
                             └── select route item ──> selected note active
```

Una URL solo puede producir `activeNote` si sus IDs forman una relación válida. Cualquier otra combinación pasa al estado `invalid context` y redirige al catálogo de categorías con un aviso.

## CategoryFilter

Estado efímero de la página `/categorias/`; no se persiste.

| Campo | Tipo | Valores |
|---|---|---|
| `selectedLevel` | enum | `all`, `beginner`, `intermediate`, `advanced`, `pro` |
| `matchingCount` | integer | Número de tarjetas visibles |

### Transiciones

- Inicial → `all`.
- Seleccionar nivel → ocultar categorías no coincidentes y actualizar estado seleccionado.
- Seleccionar `all`/limpiar → restaurar todas las categorías.
- Cero coincidencias → mostrar mensaje y acción “Ver todas”.

## ContentValidationIssue

Modelo interno emitido por el gate; nunca se presenta crudo al visitante.

| Campo | Tipo | Descripción |
|---|---|---|
| `sourcePath` | string | Archivo que debe corregirse |
| `field` | string | Campo o relación inválida |
| `code` | string | Clave estable del tipo de error |
| `message` | string | Explicación accionable para el responsable del contenido |

El validador retorna todos los issues encontrados. El comando de validación los imprime agrupados por archivo y finaliza con error si la colección no es íntegramente válida.

## MotionPreference

Estado efímero derivado de la preferencia del sistema; no se persiste.

| Campo | Tipo | Valores |
|---|---|---|
| `reducedMotion` | boolean | `true` cuando el navegador indica `prefers-reduced-motion: reduce` |

- `false`: se habilitan transiciones discretas que no retrasan contenido ni navegación.
- `true`: se eliminan o reducen desplazamiento, escala, parallax, scroll suave y cualquier movimiento no esencial; la información y los controles permanecen idénticos.
