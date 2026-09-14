# Contract: Fuentes de contenido

Este contrato es la interfaz pública para quienes añaden contenido al repositorio. Un cambio se publica únicamente si todos los archivos cumplen el esquema y las reglas relacionales.

## Categorías

Ubicación: `src/content/categories/{id}.json`

```json
{
  "name": "Flutter",
  "image": "/images/categories/flutter.webp",
  "level": "beginner"
}
```

- `{id}` es el ID canónico y debe ser un slug único (`flutter`, `aws-basics`).
- `name` no admite cadenas vacías.
- `image` admite una referencia local resoluble bajo `public/images/categories/` (escrita como `/images/categories/...`) o una URL HTTPS. Un fallo de carga en runtime muestra `category-fallback.svg` y conserva el nombre.
- `level` admite exclusivamente `beginner`, `intermediate`, `advanced`, `pro`.

## Notas escritas

Ubicación: `src/content/notes/{id}.md`

```md
---
title: Widgets fundamentales
description: Aprende composición, estado y ciclo de renderizado.
category: flutter
durationMinutes: 12
position: 1
format: written
---

# Widgets fundamentales

Contenido legible de la nota…
```

El cuerpo Markdown debe contener contenido significativo. `youtubeVideoId` está prohibido.

## Notas de video

Ubicación: `src/content/notes/{id}.md`

```md
---
title: Introducción visual a Flutter
description: Recorrido guiado por la estructura de una aplicación.
category: flutter
durationMinutes: 9
position: 2
format: video
youtubeVideoId: M7lc1UVf-VE
---
```

El cuerpo Markdown debe estar vacío y `youtubeVideoId` debe ser un ID, no una URL completa. La aplicación construye `https://www.youtube.com/embed/{youtubeVideoId}` y no inicia reproducción automática.

## Reglas globales

- IDs de categoría e IDs de nota son únicos dentro de su tipo.
- Cada `category` de nota debe existir.
- `durationMinutes` y `position` son enteros positivos.
- `position` no se repite dentro de una categoría; no necesita ser consecutiva.
- Una nota define exactamente un formato y su payload correspondiente.
- No existen `draft`, `published` ni fechas editoriales.

## Configuración pública del sitio

Ubicación: `src/data/site.ts`

```ts
export const siteConfig = {
  socialLinks: [
    {
      network: 'linkedin',
      label: 'Perfil de LinkedIn del autor',
      url: 'https://www.linkedin.com/in/perfil-del-autor',
    },
  ],
} as const;
```

- `socialLinks` es un array inmutable que puede estar vacío.
- `network` es una clave estable, no vacía y única dentro del array.
- `label` es texto no vacío que identifica la red y el destino sin depender del icono.
- `url` es una URL HTTPS absoluta y no se repite.
- Solo se incluyen perfiles reales proporcionados por el autor; los ejemplos se reemplazan o eliminan antes de publicar.
- Si el array está vacío, la portada omite los enlaces sociales sin mostrar placeholders.
- La validación es sintáctica y no depende de comprobar la disponibilidad remota del proveedor.

## Gate de publicación

`npm run validate:content` carga todas las entradas y la configuración pública, y acumula errores de esquema, cuerpo, relaciones y redes sociales. `npm run build` debe ejecutar esa validación antes de `astro build`. Ante cualquier issue:

1. El comando finaliza con código distinto de cero.
2. No se genera/publica un build parcial.
3. Se informa ruta de archivo, campo y mensaje accionable.
4. Los mensajes técnicos quedan en CI/consola y nunca llegan a la UI pública.

## Orden y publicación

Todo archivo válido se considera publicado automáticamente. Las consultas de una ruta filtran por `category` y ordenan por `position` ascendente. La primera entrada de ese resultado es la nota inicial.

El índice de categorías de la portada usa todas las categorías válidas ordenadas por `name` normalizado y, ante igualdad, por `id`. Las presentaciones amplia y compacta consumen este único resultado.
