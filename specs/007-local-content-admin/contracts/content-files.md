# Contract: Archivos administrados de contenido

## Raíces autorizadas

El administrador solo puede leer o mutar estas ubicaciones derivadas desde la raíz del repositorio:

| Uso | Ubicación |
|---|---|
| Categorías y temas activos | `src/content/categories/*.json` |
| Notas activas | `src/content/notes/*/*.md` |
| Recursos locales de notas | `src/content/notes/*/assets/*` |
| Imágenes de categoría ya administradas | `public/images/categories/*` |
| Runtime recuperable no publicado | `.content-admin/{uploads,transactions,trash}/**` |

El cliente nunca envía una ruta de origen o destino que el servidor acepte directamente. IDs y tokens válidos se resuelven contra estas raíces; toda ruta canónica debe permanecer contenida, no atravesar symlinks y corresponder al tipo de operación.

## Categoría

`src/content/categories/{categoryId}.json` conserva este contrato:

```json
{
  "name": "Nombre visible",
  "description": "Descripción no vacía",
  "image": "/images/categories/example.svg",
  "level": "beginner",
  "topics": [
    { "id": "fundamentos", "name": "Fundamentos", "position": 1 }
  ]
}
```

- `categoryId` es un slug único derivado del nombre de archivo.
- `name`, `description` e `image` son obligatorios.
- `image` es una ruta con contenido después de `/images/categories/` o una URL HTTPS absoluta.
- `level` es `beginner`, `intermediate`, `advanced` o `pro`.
- `topics` siempre es un arreglo y puede ser vacío.
- Cada tema tiene `id` slug único en la categoría, `name` no vacío y `position` entera positiva.
- Una categoría referenciada por una nota no puede eliminarse.
- El ID de una categoría existente no se renombra en v1; se crea el nuevo destino y se reasignan dependencias de forma explícita.

## Nota escrita

`src/content/notes/{folder}/{noteId}.md` usa frontmatter YAML y un cuerpo Markdown no vacío:

```markdown
---
title: Título visible
description: Resumen editorial
tags: [astro, markdown]
category: ejemplo
durationMinutes: 8
position: 2
format: written
topic: fundamentos
---

# Contenido
```

- `folder` y `noteId` son slugs; la ruta tiene exactamente esos dos segmentos bajo la colección.
- En una nota nueva, `folder` es la categoría seleccionada y `noteId` se propone desde el título; ambos se confirman antes del primer guardado.
- En una nota existente, ruta e ID permanecen estables durante la edición ordinaria, incluso si cambia `category`, para conservar recursos relativos.
- `title`, `description` y `category` son textos no vacíos.
- `tags` contiene al menos un texto no vacío.
- `durationMinutes` y `position` son enteros positivos.
- `topic` es opcional y, si existe, resuelve dentro de `category`.
- `youtubeVideoId` no se serializa para `format: written`.
- Los campos reconocidos no editados conservan su valor. Las claves de frontmatter sintácticamente válidas que el formulario no administra se conservan al reserializar; un documento que no puede parsearse no se sobrescribe.

## Nota de video

```markdown
---
title: Título visible
description: Resumen editorial
tags: [video]
category: ejemplo
durationMinutes: 12
position: 3
format: video
youtubeVideoId: M7lc1UVf-VE
---
```

- `youtubeVideoId` tiene exactamente 11 caracteres `[A-Za-z0-9_-]`.
- El cuerpo debe quedar vacío y `topic` conserva las mismas reglas opcionales.
- Cambiar entre `written` y `video` exige confirmación si descartaría cuerpo o ID de video.

## Orden compartido

Para cada categoría, `position` es única en la unión de todos sus temas y notas activas. El administrador presenta una sola secuencia editorial:

1. “Subir” intercambia el elemento con su vecino anterior.
2. “Bajar” intercambia el elemento con su vecino siguiente.
3. Después de cada movimiento, el borrador asigna posiciones contiguas desde `1`.
4. “Guardar orden” actualiza el JSON de categoría y todos los frontmatters afectados en una sola transacción.
5. Una nota en papelera no participa en esta secuencia.

El agrupamiento visual de una nota bajo un tema no crea un segundo espacio de posiciones. El recorrido público anterior/siguiente continúa usando la posición global de las notas.

## Etiquetas

Las etiquetas no tienen archivo propio. Se derivan de `tags` de todas las notas activas, se sugieren sin duplicados y una etiqueta nueva se persiste únicamente en la nota que la usa. El administrador recorta espacios y rechaza valores vacíos; no cambia capitalización de valores existentes de forma silenciosa.

## Imágenes de notas

- Los formatos admitidos inicialmente son PNG, JPEG, WebP, GIF y SVG, verificados por extensión, tipo y contenido reconocible; el límite por archivo es 10 MiB.
- El upload se conserva temporalmente bajo `.content-admin/uploads/` y no modifica contenido activo.
- El nombre final se normaliza a un basename seguro, conserva una extensión compatible y se ubica en `src/content/notes/{folder}/assets/`.
- El cuerpo escrito referencia `assets/{safeFileName}` mediante sintaxis Markdown con texto alternativo editable.
- Los bytes y el SHA-256 del destino deben coincidir con el upload; no se redimensiona, recomprime ni convierte.
- Si el destino existe, la operación responde conflicto y no sobrescribe, incluso si el nombre proviene del mismo archivo local.
- Una nota de video principal no acepta imagen Markdown porque su cuerpo debe estar vacío.

## Guardado y compatibilidad

Antes de confirmar cualquier cambio, el servidor construye el snapshot propuesto y ejecuta las mismas reglas de `src/lib/validation.ts` que bloquean el build. Las escrituras se serializan con finales de línea y formato estable, pero solo los archivos incluidos en la operación pueden cambiar; todos los demás deben permanecer byte a byte idénticos.

Cada mutación requiere hashes de revisión base. El servidor vuelve a leerlos inmediatamente antes del commit; un cambio externo, destino preexistente, dependencia o posición incompatible produce `409` y cero cambios activos. Una validación de datos produce `400` y field issues. Un fallo técnico ejecuta rollback y devuelve un mensaje genérico.

## Papelera

- Eliminar una nota mueve su Markdown a `.content-admin/trash/notes/{trashId}/note.md` y crea `manifest.json`.
- El bundle copia los recursos locales referenciados necesarios para conservar los datos, pero no borra un asset activo cuando podría estar compartido.
- Al salir de `src/content/notes`, la nota deja de publicarse y de ocupar posición; la categoría se renumera en la misma transacción.
- Restaurar devuelve la nota a `originalPath`, repone un recurso faltante solo si no hay colisión y reabre su posición original desplazando de forma contigua los elementos activos.
- Si la ruta o un recurso requerido contiene bytes distintos, la restauración devuelve `409` y conserva la papelera.
- Eliminar definitivamente requiere una solicitud separada con confirmación explícita y revisión vigente del manifest.

## Contenido inválido

Un JSON, frontmatter o relación inválidos se identifica con ruta relativa, campo, código y mensaje accionable. El administrador puede mostrarlo en el explorador, pero no lo normaliza ni sobrescribe hasta que exista un borrador válido y la persona confirme el guardado. Nunca se muestran rutas absolutas, objetos de error o trazas en la interfaz.
