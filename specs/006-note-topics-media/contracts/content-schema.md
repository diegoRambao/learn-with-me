# Contract: Contenido de temas y notas

## Fuente de categoría

Cada archivo `src/content/categories/{categoryId}.json` conserva sus campos actuales y declara `topics`:

```json
{
  "name": "Nombre de categoría",
  "description": "Descripción",
  "image": "/images/categories/example.svg",
  "level": "beginner",
  "topics": [
    { "id": "fundamentos", "name": "Fundamentos", "position": 1 }
  ]
}
```

- `topics` es un arreglo; `[]` es válido.
- `id` es un slug URL-safe, no vacío y único en ese archivo.
- `name` no queda vacío después de recortar espacios.
- `position` es un entero mayor que cero.
- Un tema no crea ruta pública, no contiene otros temas y pertenece implícitamente a la categoría del archivo.

## Fuente de nota

Una nota escrita o de video puede añadir al frontmatter:

```yaml
topic: fundamentos
```

- `topic` es opcional y acepta un único slug.
- Si se declara, debe coincidir con un tema de la categoría indicada en la misma nota.
- Omitirlo mantiene la nota en el nivel raíz del panel.
- `format`, `youtubeVideoId`, cuerpo Markdown y los demás campos conservan las reglas actuales.

## Posición global

- Para cada categoría, `position` es única en la unión de todos sus temas y notas.
- Una nota agrupada conserva su posición global para el orden editorial, pero el panel inicia una numeración visual local desde `01` dentro de cada tema.
- Las notas siguen ordenándose globalmente por `position` para elegir la primera y calcular anterior/siguiente.
- El nivel raíz del panel combina temas y notas no agrupadas en posición ascendente; dentro de cada tema, las notas también aparecen por su posición global.

## Gate editorial

`npm run validate:content` debe bloquear la publicación cuando encuentre:

- tema con ID, nombre o posición inválidos;
- ID de tema duplicado en una categoría;
- posición repetida entre dos notas, dos temas o una nota y un tema de la misma categoría;
- nota que referencia un tema ausente, inválido o perteneciente a otra categoría.

Cada issue indica el archivo y campo afectados y nombra el elemento relacionado cuando exista un conflicto. El validador no corrige ni descarta contenido silenciosamente.

## Compatibilidad pública

- Las rutas siguen siendo `/categorias/{categoryId}/` y `/categorias/{categoryId}/{noteId}/`.
- `categoryId` y `noteId` no cambian por asignar un tema.
- La ruta de categoría continúa abriendo su primera nota global, no el primer tema.
- Las notas de video principal conservan su esquema y presentación.
