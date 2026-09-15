# Data Model: Lectura mejorada y navegación entre notas

Esta feature no modifica el esquema persistente de `Category` o `Note` ni añade metadatos a los archivos Markdown. Amplía un modelo derivado existente y define estados efímeros de presentación.

## LearningRoute

Recorrido inmutable derivado de una categoría y del catálogo completo de notas.

| Campo | Tipo | Derivación y reglas |
|---|---|---|
| `category` | `Category` | Categoría seleccionada |
| `notes` | `ReadonlyArray<Note>` | Solo notas cuyo `category` coincide, ordenadas por `position` y luego `id` |
| `activeNote` | `Note \| null` | Nota solicitada dentro del recorrido; primera nota cuando no se especifica ID; `null` si no existe |
| `previousNote` | `Note \| null` | Elemento inmediatamente anterior a `activeNote` en `notes`; `null` en el inicio o sin activa |
| `nextNote` | `Note \| null` | Elemento inmediatamente posterior a `activeNote` en `notes`; `null` al final o sin activa |

### Invariantes

1. `notes` no contiene notas de otra categoría y no muta la entrada.
2. `activeNote`, `previousNote` y `nextNote`, cuando existen, pertenecen a `notes` y a `category`.
3. Los vecinos se derivan por índice sobre `notes`, nunca por aritmética de `position`.
4. `previousNote` precede inmediatamente a `activeNote`; `nextNote` la sucede inmediatamente.
5. Una sola nota activa produce ambos vecinos como `null`.
6. Sin nota activa ambos vecinos son `null`.
7. Las notas `written` y `video` obedecen el mismo orden y pueden ser vecinas entre sí.
8. El desempate por `id` conserva el comportamiento defensivo actual cuando dos posiciones coinciden.

### Estados

```text
sin nota activa ──> previous=null, next=null

primera de varias ──> previous=null, next=notes[1]
intermedia          ──> previous=notes[index-1], next=notes[index+1]
última de varias   ──> previous=notes[index-1], next=null
única               ──> previous=null, next=null
```

## SequentialNavigation

Proyección de presentación consumida por el componente de navegación final; no se persiste.

| Campo | Tipo | Regla |
|---|---|---|
| `category` | `Category` | Proporciona el segmento canónico de URL |
| `previousNote` | `Note \| null` | Si existe, genera un único destino “Anterior” |
| `nextNote` | `Note \| null` | Si existe, genera un único destino “Siguiente” |

Cada destino usa `noteUrl(category.id, note.id)`. Si ambos vecinos son `null`, el componente no crea el landmark ni controles vacíos. Los títulos se muestran completos y no forman parte de un nuevo modelo persistente.

## CodeBlockCopyState

Estado local y efímero de una única acción de copia.

| Estado | Disparador | Resultado visible y accesible |
|---|---|---|
| `idle` | Inicial o fin de confirmación | Acción identificada como copiar el bloque; sin anuncio pendiente |
| `copied` | `navigator.clipboard.writeText` resuelve | Confirmación breve asociada al bloque y anunciada de forma `polite` |
| `error` | API ausente o promesa rechazada | Mensaje no técnico, código intacto y texto del bloque seleccionado para copia manual |

### Transiciones

```text
idle ── activar ──> intento de copia
                       ├── éxito ──> copied ── tiempo breve ──> idle
                       └── fallo ──> error ── nueva activación ──> intento de copia
```

### Reglas

- Cada bloque mantiene su propio control, mensaje y temporizador.
- El payload es exactamente `code.textContent`; no contiene texto de botones, lenguaje, números de línea ni decoración.
- Ninguna transición modifica el nodo `<code>` ni el archivo Markdown.
- Los fallos técnicos no se imprimen en la interfaz.

## MarkdownPresentation

Modelo conceptual del HTML semántico generado desde una nota escrita.

| Elemento | Contrato de presentación |
|---|---|
| Encabezados | Jerarquía distinguible por tamaño, peso, espacio y separación, no solo tamaño |
| `ul` / `ol` | Marcadores visibles y sangría lógica incremental por nivel |
| `blockquote` / `hr` | Separación y forma propias usando tokens existentes |
| Código en línea | Diferente del texto sin confundirse con un bloque |
| `pre > code` | Espacios y saltos preservados; overflow horizontal local; control copiable asociado |
| Enlaces | Color de acento, subrayado permanente y estados hover/focus perceptibles en claro y oscuro |

No almacena datos: es una proyección visual del cuerpo Markdown existente.
