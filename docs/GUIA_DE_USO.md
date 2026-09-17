# Uso y administración del sitio

Esta guía reúne tanto el uso público de **Learn with Me** como el proceso para
crear y mantener su contenido. Las categorías, los temas y las notas se definen
con archivos; no existe un panel de administración.

## Navegar por el sitio

### Inicio y categorías

La portada presenta una selección de rutas de aprendizaje. La opción
**Categorías** abre el catálogo completo, donde se puede filtrar por nivel:
Principiante, Intermedio, Avanzado o Pro.

Al abrir una categoría con notas, el sitio lleva directamente a la primera nota
de su ruta. Si todavía no tiene notas, muestra un estado vacío.

### Leer una ruta de aprendizaje

En una nota, el panel lateral muestra los temas y las notas de la categoría. Los
temas pueden contraerse o expandirse, y el botón **Ocultar panel** deja más
espacio para leer. Los enlaces **Anterior** y **Siguiente** recorren las notas
según su posición global dentro de la categoría.

En las notas escritas también se puede:

- pulsar una imagen para verla ampliada y cerrarla con el botón correspondiente;
- usar el botón **Copiar** de cada bloque de código;
- abrir los enlaces del contenido en una pestaña nueva.

### Buscar

El buscador del encabezado encuentra:

- categorías por nombre y descripción;
- notas por título, descripción y etiquetas.

La búsqueda ignora mayúsculas, minúsculas y tildes. Cuando se escriben varias
palabras, el resultado debe coincidir con todas ellas.

### Cambiar el tema visual

El selector **Tema** permite usar el aspecto del sistema, claro u oscuro. La
preferencia queda guardada en el navegador.

## Modelo de contenido

El contenido sigue esta jerarquía:

```text
Categoría
├── Tema opcional
│   ├── Nota escrita
│   └── Nota de video
└── Nota sin tema
```

- Una **categoría** representa una ruta de aprendizaje.
- Un **tema** agrupa notas dentro del panel lateral de una categoría.
- Una **nota** es la unidad que se lee o reproduce. Puede pertenecer a un tema o
  aparecer directamente en la raíz de la ruta.

Los identificadores de archivos, carpetas, categorías y temas deben ser *slugs*:
solo minúsculas, números y guiones, sin espacios, tildes ni guiones al inicio o
al final. Ejemplos válidos: `dart`, `flutter-basico`, `aws-101`.

## Crear una categoría

1. Crea `src/content/categories/{id}.json`.
2. Usa el nombre del archivo como identificador canónico de la categoría.
3. Añade una imagen y, si los necesitas, sus temas.

Ejemplo: `src/content/categories/dart.json`.

```json
{
  "name": "Dart",
  "description": "Fundamentos del lenguaje Dart.",
  "image": "/images/categories/dart.svg",
  "level": "beginner",
  "topics": [
    { "id": "fundamentos", "name": "Fundamentos", "position": 1 },
    { "id": "practica", "name": "Práctica", "position": 4 }
  ]
}
```

Campos disponibles:

| Campo | Regla |
| --- | --- |
| `name` | Nombre visible, no vacío. |
| `description` | Resumen visible, no vacío. También se usa en la búsqueda. |
| `image` | Ruta bajo `/images/categories/` o URL HTTPS absoluta. |
| `level` | `beginner`, `intermediate`, `advanced` o `pro`. |
| `topics` | Lista de temas; usa `[]` cuando la categoría no tenga temas. |

Para una imagen local, guarda el archivo en `public/images/categories/` y usa
una ruta como `/images/categories/dart.svg`. Si la imagen no está disponible,
las tarjetas utilizan la imagen de respaldo del sitio.

## Agregar y editar temas

Los temas se declaran en el arreglo `topics` de la categoría; no se crean en un
archivo separado.

```json
{
  "id": "fundamentos",
  "name": "Fundamentos",
  "position": 1
}
```

Cada tema necesita:

- un `id` en formato slug, único dentro de la categoría;
- un `name` visible;
- una `position` entera mayor que cero.

Un tema puede estar vacío y aun así aparecerá en el panel lateral. Para cambiar
su nombre sin romper las notas, modifica solo `name`. Si cambias `id`, actualiza
también el campo `topic` de todas las notas asociadas.

## Entender el orden de temas y notas

La posición es global dentro de cada categoría. Ningún tema ni nota de esa
categoría puede repetir el mismo número.

```text
1  Tema "Fundamentos"
2    Nota "Introducción"
3    Nota "Tipos"
4  Tema "Práctica"
5    Nota "Ejercicio guiado"
6  Nota sin tema
```

Las notas dentro de un tema se ordenan por su propia `position`. La navegación
**Anterior/Siguiente** también ordena todas las notas por ese número, sin importar
si tienen tema. Los números no necesitan ser consecutivos, aunque dejarlos así
hace que la ruta sea más fácil de mantener.

## Crear una nota escrita

1. Crea el archivo `src/content/notes/{carpeta}/{id}.md`.
2. Copia el siguiente frontmatter y adapta sus valores.
3. Escribe Markdown debajo del segundo `---`.

```md
---
title: Tipos que explican la intención
description: Usa el sistema de tipos para expresar estados válidos con claridad.
tags: [dart, tipos, null-safety]
category: dart
topic: fundamentos
durationMinutes: 10
position: 2
format: written
---

## Modelar antes de implementar

El contenido de la nota se escribe aquí con **Markdown**.
```

Reglas del archivo:

- Debe estar exactamente a un nivel de carpeta: `{carpeta}/{id}.md`.
- `{carpeta}` y `{id}` deben ser slugs.
- La carpeta solo organiza archivos; no tiene que llamarse igual que la
  categoría.
- `category` debe coincidir con el archivo de una categoría existente.
- `topic` es opcional. Si se incluye, debe existir en esa misma categoría.
- Una nota `written` necesita contenido Markdown y no admite
  `youtubeVideoId`.

Campos comunes de las notas:

| Campo | Regla |
| --- | --- |
| `title` | Título visible, no vacío. |
| `description` | Resumen no vacío usado también en la búsqueda y metadatos. |
| `tags` | Lista con al menos una etiqueta no vacía; también alimenta la búsqueda. |
| `category` | ID de una categoría existente. |
| `topic` | ID opcional de un tema de esa categoría. |
| `durationMinutes` | Duración estimada, como entero mayor que cero. |
| `position` | Orden global, como entero mayor que cero y no repetido. |
| `format` | `written` o `video`. |

La URL se genera como `/categorias/{category}/{id}/`. Mover el archivo a otra
carpeta o asignarlo a otro tema no cambia esa URL. El mismo `{id}` puede usarse
en categorías diferentes, pero no dos veces dentro de la misma categoría.

## Crear una nota de video

Una nota de video no lleva contenido debajo del frontmatter. Usa solamente el
ID de YouTube de 11 caracteres, no la URL completa.

```md
---
title: Dart en una sesión práctica
description: Recorre los fundamentos de Dart mediante una demostración guiada.
tags: [dart, fundamentos, video]
category: dart
topic: fundamentos
durationMinutes: 15
position: 3
format: video
youtubeVideoId: M7lc1UVf-VE
---
```

En `https://www.youtube.com/watch?v=M7lc1UVf-VE`, el ID es
`M7lc1UVf-VE`.

## Insertar videos complementarios en una nota escrita

Una nota `written` puede convertir automáticamente una URL de YouTube en un
reproductor. Coloca la URL sin texto adicional en un párrafo independiente:

```md
Antes del video puedes añadir una explicación.

https://www.youtube.com/watch?v=M7lc1UVf-VE

Después del video puedes continuar la nota.
```

Se admiten enlaces individuales en los formatos `watch`, `youtu.be`, `shorts` y
`embed`, con un ID válido. Los enlaces con texto, los canales, los perfiles, las
listas de reproducción y las URLs que incluyen `list` se mantienen como enlaces
normales.

## Agregar imágenes y recursos a una nota

Guarda los recursos en una carpeta `assets` junto al grupo de notas que los usa:

```text
src/content/notes/design-patterns/
├── assets/
│   └── factory-method.png
└── factory-method.md
```

Luego usa una ruta relativa en Markdown:

```md
![Diagrama de Factory Method](assets/factory-method.png)
```

Escribe siempre un texto alternativo que describa la imagen. Evita usar para
contenido nuevo los archivos sueltos en `public/`; las imágenes propias de una
nota quedan mejor organizadas junto a ella.

## Configurar redes sociales

Edita `src/data/site.ts` y agrega únicamente perfiles reales del autor:

```ts
export const siteConfig = {
  socialLinks: [
    {
      network: 'github',
      label: 'GitHub de Diego Rambao',
      url: 'https://github.com/usuario',
    },
  ],
} as const satisfies Readonly<{ socialLinks: ReadonlyArray<SocialLink> }>;
```

Cada entrada necesita un `network` único, un `label` descriptivo y una `url`
HTTPS única. Usa `socialLinks: []` si no hay perfiles confirmados; en ese caso la
portada oculta toda la sección.

## Editar o eliminar contenido

- Para renombrar lo que ve el lector, cambia `name` o `title`; la URL no cambia.
- Cambiar el nombre de un archivo de categoría cambia su ID y las URLs. También
  exige actualizar el `category` de todas sus notas.
- Cambiar el nombre de una nota cambia su URL.
- Antes de eliminar un tema, elimina o reasigna el `topic` de sus notas.
- Antes de eliminar una categoría, elimina o reasigna todas sus notas.

Revisa enlaces externos o compartidos antes de cambiar IDs, porque el sitio no
crea redirecciones automáticamente.

## Validar y publicar cambios

Mientras editas contenido, puedes mantener abierto el servidor de desarrollo:

```bash
npm run dev
```

Antes de publicar, ejecuta el conjunto completo de comprobaciones:

```bash
npm run validate:content
npm run check
npm run test
npm run build
```

La validación indica la ruta del archivo, el campo y la causa del error. Algunos
problemas frecuentes son:

| Error | Solución |
| --- | --- |
| Categoría desconocida | Corrige `category` o crea su JSON. |
| Tema desconocido | Corrige `topic` o decláralo en la categoría. |
| Posición duplicada | Asigna otro número al tema o nota en conflicto. |
| ID o carpeta inválidos | Usa únicamente minúsculas, números y guiones. |
| Nota escrita sin cuerpo | Añade Markdown después del frontmatter. |
| Nota de video con cuerpo | Elimina todo el contenido posterior al frontmatter. |
| ID de YouTube inválido | Usa solo los 11 caracteres del ID. |
| Imagen de categoría inválida | Usa `/images/categories/...` o una URL HTTPS. |

Cuando `npm run build` termina correctamente, el directorio `dist/` contiene el
sitio estático listo para desplegar.
