# Learn with Me

Sitio estático de notas y rutas de aprendizaje construido con Astro, TypeScript y Tailwind CSS.

## Qué permite hacer

- Organizar notas dentro de categorías y temas.
- Publicar notas escritas en Markdown o notas basadas en un video de YouTube.
- Recorrer cada ruta de aprendizaje en un orden definido.
- Buscar categorías y notas por nombre, descripción o etiquetas.
- Filtrar categorías por nivel y elegir tema claro, oscuro o el del sistema.

## Ejecutar el proyecto

Necesitas Node.js 22.12 o una versión posterior.

```bash
npm install
npm run dev
```

Astro mostrará en la terminal la dirección local del sitio, normalmente
`http://localhost:4321`.

Para probar la versión de producción:

```bash
npm run build
npm run preview
```

## Crear y administrar contenido

La guía [Uso y administración del sitio](docs/GUIA_DE_USO.md) explica:

- cómo navegar y buscar contenido;
- cómo crear una categoría;
- cómo agregar y ordenar temas;
- cómo escribir notas Markdown;
- cómo publicar notas de video y videos complementarios;
- cómo usar imágenes y otros recursos;
- cómo configurar redes sociales;
- cómo validar los cambios y resolver errores frecuentes.

Todos los archivos válidos dentro de `src/content/` se incorporan
automáticamente en el siguiente build; no es necesario registrar rutas a mano.

## Comandos disponibles

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run validate:content` | Revisa la estructura y las relaciones del contenido. |
| `npm run check` | Ejecuta las comprobaciones de Astro y TypeScript. |
| `npm run test:unit` | Ejecuta las pruebas unitarias. |
| `npm run test:e2e` | Ejecuta las pruebas de navegador. |
| `npm run test` | Ejecuta todas las pruebas. |
| `npm run build` | Genera el sitio para producción. |
| `npm run preview` | Sirve localmente el build de producción. |

Antes de publicar, ejecuta:

```bash
npm run validate:content
npm run check
npm run test
npm run build
```

Los comandos de comprobación, pruebas y build también validan el contenido de
forma automática. Si encuentran un problema, informan el archivo y el campo que
se debe corregir.

## Estructura principal

```text
public/images/categories/   Imágenes públicas de las categorías
src/content/categories/     Definición de categorías y temas
src/content/notes/          Notas escritas y de video
src/data/site.ts            Configuración general y redes sociales
docs/GUIA_DE_USO.md         Manual completo de uso y contenido
```

Los contratos técnicos detallados están en
[`specs/006-note-topics-media/contracts/`](specs/006-note-topics-media/contracts/).
