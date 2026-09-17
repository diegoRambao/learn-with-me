# Contract: API local de administración

## Límite de ejecución

El API existe únicamente dentro del entrypoint `admin/` y solo mientras se ejecuta `npm run admin` en `127.0.0.1`. No hay endpoint equivalente en el sitio público ni en su `dist/`.

Todas las solicitudes deben:

- llegar por el host y puerto locales configurados;
- usar un `Origin` local permitido cuando el navegador lo envía;
- recibir respuestas sin CORS permisivo;
- incluir `Content-Type: application/json` o `multipart/form-data` según el endpoint;
- incluir `X-Content-Admin-Token` en cada operación mutante; el token aleatorio vive solo durante el proceso y se entrega a la página inicial.

Host/origin inválido se rechaza sin leer contenido. Token ausente o inválido responde `401`. El cliente nunca envía rutas de filesystem.

## Formato de respuestas

Respuesta exitosa:

```json
{
  "data": {},
  "message": "Nota guardada.",
  "changedPaths": ["src/content/notes/dart/example.md"]
}
```

Error esperado:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Revisa los campos marcados antes de guardar.",
    "issues": [
      {
        "sourcePath": "src/content/notes/dart/example.md",
        "field": "durationMinutes",
        "code": "invalid_duration",
        "message": "Usa un entero mayor que cero."
      }
    ]
  }
}
```

Un error inesperado usa un mensaje genérico y un ID de incidente local. La excepción, stack y ruta absoluta solo se registran en stderr.

## Códigos de estado

| Estado | Uso |
|---|---|
| `200` | Lectura, preview, edición, orden, trash o restore exitosos. |
| `201` | Categoría, tema, nota o upload staged creado. |
| `204` | Eliminación definitiva o de entidad sin body. |
| `400` | JSON/form-data malformado, campo inválido o grafo propuesto inválido. |
| `401` | Token local ausente o inválido. |
| `403` | Host/origin no permitido o destino fuera de raíces autorizadas. |
| `404` | Entidad, upload o entrada de papelera inexistente. |
| `409` | Revisión obsoleta, destino existente, dependencia, orden o restore en conflicto. |
| `413` | Imagen por encima del límite permitido. |
| `415` | Tipo de imagen no admitido. |
| `500` | Fallo interno después de rollback o recuperación segura. |

## Bootstrap y lectura

### `GET /api/bootstrap`

Devuelve `ContentSnapshot`, papelera resumida, capacidades y token CSRF del proceso. Categorías y notas incluyen `revision`, pero solo rutas relativas autorizadas. Los archivos inválidos aparecen como issues y descriptores mínimos sin ser omitidos silenciosamente.

### `GET /api/trash`

Devuelve `trashId`, título, categoría original, ruta original, fecha, revisión del manifest y disponibilidad de restauración. No devuelve paths absolutos.

## Vista previa

### `POST /api/preview`

Request:

```json
{
  "title": "Título",
  "description": "Resumen",
  "tags": ["astro"],
  "durationMinutes": 8,
  "format": "written",
  "body": "# Contenido"
}
```

Devuelve HTML de documento para el iframe sandboxed y metadatos normalizados. Una nota de video devuelve el reproductor/fallback correspondientes al `youtubeVideoId`. El endpoint no escribe archivos, no resuelve rutas arbitrarias y limita el tamaño del Markdown recibido.

## Upload staged

### `POST /api/uploads`

Recibe multipart con un único campo `image`. Devuelve:

```json
{
  "data": {
    "uploadToken": "opaque-token",
    "safeFileName": "diagram.png",
    "markdownReference": "assets/diagram.png",
    "mediaType": "image/png",
    "byteSize": 24567,
    "sha256": "..."
  }
}
```

El archivo queda bajo `.content-admin/uploads/`, no bajo contenido activo. El token expira al cerrar el proceso o después del TTL de limpieza. Guardar una nota incluye los tokens que el cuerpo referencia; el servidor rechaza tokens ajenos, expirados, no referenciados o con hash diferente.

## Categorías

### `POST /api/categories`

Body: `{ id, name, description, image, level }`. `topics` comienza vacío salvo que el mismo payload incluya una lista válida. El destino debe estar libre. Devuelve `201`, documento con revisión y la ruta creada.

### `PUT /api/categories/{categoryId}`

Body: `{ revision, name, description, image, level }`. Conserva `id` y temas no editados. Una revisión distinta produce `409 stale_revision`.

### `DELETE /api/categories/{categoryId}`

Body: `{ revision, confirmCategoryId }`. Solo procede si no existen notas; si hay dependencias devuelve `409 category_has_notes` con IDs accionables. La confirmación debe coincidir exactamente.

## Temas

### `POST /api/categories/{categoryId}/topics`

Body: `{ categoryRevision, id, name, position }`. Valida ID único y espacio global de posición. Devuelve categoría actualizada, revisión y path JSON.

### `PUT /api/categories/{categoryId}/topics/{topicId}`

Body: `{ categoryRevision, name }`. El ID permanece estable; posición cambia mediante el endpoint de orden.

### `DELETE /api/categories/{categoryId}/topics/{topicId}`

Body: `{ categoryRevision }`. Si una nota lo referencia devuelve `409 topic_has_notes` y no cambia el JSON.

## Notas

### `POST /api/notes`

Body:

```json
{
  "id": "intro-astro",
  "title": "Introducción a Astro",
  "description": "Resumen",
  "tags": ["astro"],
  "category": "frontend",
  "topic": "fundamentos",
  "durationMinutes": 8,
  "position": 2,
  "format": "written",
  "body": "# Contenido",
  "uploadTokens": ["opaque-token"]
}
```

El servidor deriva `folder = category` y el destino. Para video, `body` está vacío, se envía `youtubeVideoId` y `uploadTokens` queda vacío. Devuelve `201`, revisión y todos los paths creados. Un destino o recurso existente produce `409` y conserva los uploads staged.

### `PUT /api/notes/{folder}/{noteId}`

Body: campos editables, `revision` y `uploadTokens`. La ruta, folder e ID permanecen estables. Cambiar categoría/topic/posición se valida contra el snapshot completo. Solo se consumen uploads y se escribe Markdown si toda la transacción es válida.

### `POST /api/notes/{folder}/{noteId}/trash`

Body: `{ revision }`. Mueve la nota al bundle recuperable, copia recursos referenciados, renumera su categoría y devuelve `trashId`, paths cambiados y revisiones nuevas.

## Orden

### `POST /api/categories/{categoryId}/order`

```json
{
  "items": [
    { "kind": "topic", "id": "fundamentos" },
    { "kind": "note", "folder": "dart", "id": "dart-types" }
  ],
  "baseRevisions": {
    "src/content/categories/dart.json": "sha256...",
    "src/content/notes/dart/dart-types.md": "sha256..."
  }
}
```

`items` debe contener exactamente una vez todos los temas y notas activos de la categoría. El servidor asigna `position = index + 1`, vuelve a verificar todas las revisiones y confirma los archivos afectados como una transacción. El response identifica cada path modificado.

## Restaurar y eliminar definitivamente

### `POST /api/trash/{trashId}/restore`

Body: `{ manifestRevision }`. Restaura en la ruta original, repone recursos faltantes compatibles e inserta la nota en su posición original, desplazando y renumerando elementos activos. Un destino con bytes distintos produce `409 restore_destination_conflict` sin alterar papelera ni contenido activo.

### `DELETE /api/trash/{trashId}`

Body: `{ manifestRevision, confirmTrashId }`. La confirmación debe coincidir exactamente. Elimina solo el bundle de papelera y responde `204`; no elimina recursos activos potencialmente compartidos.

## Garantías de mutación

1. Una cola en proceso permite una sola mutación simultánea.
2. Se releen y comparan todos los hashes base justo antes de preparar.
3. Se materializa un snapshot staged y se ejecuta `validateContent` completo.
4. Se escriben archivos temporales, se cierran y se registra el journal/backups.
5. Se aplican renames/moves; ante cualquier fallo se restaura el estado previo.
6. El response se emite solo después del commit y contiene los paths exactos afectados.
7. Al arrancar, la recuperación de journals termina antes de servir `GET /api/bootstrap`.
