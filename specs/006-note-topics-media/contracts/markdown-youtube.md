# Contract: Videos de YouTube dentro de Markdown

## Entrada reconocida

Una nota con `format: written` convierte una dirección en video complementario solo cuando:

1. ocupa por sí sola un párrafo de nivel raíz del documento;
2. GFM produce un único enlace cuyo texto visible es exactamente el mismo URL del `href`;
3. usa HTTP o HTTPS y uno de estos formatos con un ID individual válido de 11 caracteres (los ejemplos muestran la forma HTTPS canónica):
   - `https://www.youtube.com/watch?v={id}`;
   - `https://youtu.be/{id}`;
   - `https://www.youtube.com/shorts/{id}`;
   - `https://www.youtube.com/embed/{id}`;
4. el host es `youtube.com`, `www.youtube.com`, `m.youtube.com` para las rutas admitidas, o `youtu.be` para la ruta corta;
5. no incluye `list` ni segmentos de ruta adicionales.

Parámetros inocuos distintos de `list` no se copian al embed ni al fallback. El ID validado es la única entrada usada para construir destinos.

## Entrada que permanece como enlace

No se transforma:

- una dirección acompañada de texto en el mismo párrafo;
- un enlace Markdown etiquetado, aunque sea el único hijo del párrafo;
- una dirección dentro de lista, cita, tabla u otro contenedor;
- canal, perfil, playlist o enlace `watch` con `list`;
- protocolo no HTTP(S), host engañoso, formato no admitido, ID inválido o ruta con segmentos extra;
- proveedor distinto de YouTube.

La transformación inválida nunca elimina el resto del Markdown.

## Salida renderizada

Cada dirección reconocida se reemplaza en su posición por un bloque que contiene:

- marco con proporción 16:9, `width` máximo del contenido y sin overflow horizontal;
- iframe `https://www.youtube-nocookie.com/embed/{id}`;
- `title` descriptivo, `loading="lazy"`, `allowfullscreen` y permisos limitados a reproducción;
- texto comprensible con enlace permanente a `https://www.youtube.com/watch?v={id}`;
- fallback con `target="_blank"` y `rel="noopener noreferrer"`.

Dos o más direcciones consecutivas producen bloques independientes en el mismo orden. Un video complementario no modifica `note.format` ni usa `youtubeVideoId`.

## Resiliencia

- El HTML se construye como nodos HAST, no desde HTML interpolado proveniente del URL.
- Si YouTube no carga o no permite reproducir, la nota, el panel y el resto del Markdown permanecen operables y el fallback ya está disponible.
- No se muestran códigos, excepciones ni detalles cross-origin a la persona visitante.
- Sin JavaScript del navegador, el iframe y el fallback siguen presentes porque la transformación ocurre durante el build.

## Compatibilidad

El contrato de las notas con `format: video` no cambia: siguen usando `youtubeVideoId`, su reproductor principal y su fallback actuales. El plugin actúa únicamente sobre cuerpos Markdown renderizados.
