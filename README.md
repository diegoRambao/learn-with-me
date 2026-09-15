# Learn with Me

Sitio estático de notas y rutas de aprendizaje construido con Astro, TypeScript y Tailwind CSS.

## Requisitos y comandos

Usa Node.js LTS 22 o superior.

```bash
npm install
npm run dev
```

Antes de publicar, ejecuta el gate completo:

```bash
npm run validate:content
npm run check
npm run test:unit
npm run test:e2e
npm run build
```

Los comandos `check`, `test:unit`, `test:e2e` y `build` ejecutan primero la validación de contenido. Cualquier problema bloquea el proceso e informa el archivo y el campo que se debe corregir.

## Añadir una categoría

Crea `src/content/categories/{id}.json`. El nombre del archivo es el ID canónico: usa minúsculas, números y guiones. Declara `name`, una imagen local bajo `/images/categories/` o una URL HTTPS, y uno de los niveles `beginner`, `intermediate`, `advanced` o `pro`. Guarda las ilustraciones locales en `public/images/categories/`.

## Añadir una nota

Crea `src/content/notes/{carpeta}/{id}.md` con `title`, `description`, `category`, `durationMinutes`, `position` y `format`. La nota debe estar exactamente dentro de una carpeta: no se admiten archivos Markdown sueltos ni carpetas más profundas. Tanto `{carpeta}` como `{id}` usan minúsculas, números y guiones.

La carpeta solo organiza los archivos y no tiene que coincidir con `category`. La categoría debe existir y la posición no puede repetirse dentro de ella. La URL pública se deriva de `category` y `{id}`, por lo que mover una nota entre carpetas no cambia su dirección. Un mismo `{id}` puede repetirse en categorías distintas, pero no dentro de la misma categoría.

- Una nota `written` contiene Markdown no vacío después del frontmatter y no declara `youtubeVideoId`.
- Una nota `video` deja vacío el cuerpo y declara un ID válido de YouTube de 11 caracteres, no una URL.

Guarda recursos relativos en una carpeta `assets` junto al grupo de notas que los utiliza; por ejemplo, `src/content/notes/design-patterns/assets/diagram.png` se referencia desde una nota del mismo grupo como `assets/diagram.png`.

Cada nota usa exactamente uno de esos formatos. Todo contenido válido se publica automáticamente en el siguiente build.

## Configurar redes sociales

Edita `src/data/site.ts` únicamente con perfiles reales del autor. Cada entrada requiere una clave `network` única, una `label` descriptiva y una `url` HTTPS única. Conserva `socialLinks: []` si todavía no hay perfiles confirmados; la portada omitirá la región completa.
