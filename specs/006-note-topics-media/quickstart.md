# Quickstart: Validación de temas, videos y panel

## Prerrequisitos

- Node.js 22.12 o superior.
- Dependencias del repositorio instaladas.
- Chromium de Playwright disponible para las pruebas E2E.

Los contratos que determinan el resultado esperado son [content-schema.md](./contracts/content-schema.md), [markdown-youtube.md](./contracts/markdown-youtube.md) y [note-sidebar-ui.md](./contracts/note-sidebar-ui.md).

## Validación automatizada

Desde la raíz del repositorio:

```bash
npm run validate:content
npm run check
npm run test:unit
npm run test:e2e
npm run build
```

Resultado esperado: todos terminan con código 0, el build sigue siendo estático y las rutas actuales se generan sin cambio.

## Escenario 1: Grafo editorial válido

1. Preparar una categoría de prueba con dos temas, uno vacío, y posiciones intercaladas con notas.
2. Asignar algunas notas a cada tema y dejar al menos una nota sin `topic`.
3. Ejecutar `npm run validate:content`.
4. Abrir una nota de la categoría.

Resultado esperado: validación exitosa; raíz ordenada por posición global; nota sin tema al nivel raíz; notas agrupadas bajo su tema; tema vacío presente y `No hay notas` visible al expandirlo. La ruta de categoría y anterior/siguiente siguen el orden global de notas.

## Escenario 2: Errores editoriales accionables

Ejecutar los casos de fixture que cubren por separado:

- dos temas con el mismo ID;
- tema y nota con la misma posición;
- dos notas con la misma posición;
- nota que referencia tema ausente;
- nota que referencia un tema declarado en otra categoría;
- slug, nombre o posición de tema inválidos.

Resultado esperado: `npm run validate:content` falla, identifica archivo/campo y elementos en conflicto, y no publica contenido parcialmente corregido.

## Escenario 3: Estado inicial y expansión por navegación

1. En una pestaña nueva, abrir directamente una nota agrupada.
2. Verificar que solo su tema está expandido.
3. Expandir manualmente otro tema mediante teclado.
4. Navegar con Anterior/Siguiente o un enlace del panel hacia una nota de un tercer tema cerrado.

Resultado esperado: el tema de destino se abre automáticamente; el tema abierto manualmente permanece abierto; la nota activa usa `aria-current="page"`; el recorrido anterior/siguiente no cambia.

## Escenario 4: Ocultar y restaurar el panel

1. Desplazar el panel y dejar varios temas expandidos.
2. En escritorio, activar `Ocultar panel` con teclado.
3. Verificar que el contenido gana el espacio de la columna y que el control anuncia `Mostrar panel` con `aria-expanded="false"`.
4. Mostrar el panel, navegar a otra nota de la misma categoría y volver a ocultarlo/mostrarlo.

Resultado esperado: ancho, temas expandidos y posición de scroll se restauran durante la visita; el foco queda en el toggle; la nota activa no cambia al ocultar. Repetir a 320 px y comprobar que panel, toggle y contenido siguen alcanzables sin overflow horizontal.

## Escenario 5: Formatos de YouTube admitidos

En una nota escrita, colocar como párrafos independientes URLs HTTP(S) de un mismo video en formatos `watch`, `youtu.be`, `shorts` y `embed`, además de dos videos consecutivos.

Resultado esperado: cada URL válida ocupa su lugar como iframe 16:9 con `youtube-nocookie.com`, atributos seguros y fallback canónico visible; los consecutivos no se superponen; a 320 px ningún marco excede `.note-prose` ni amplía el documento.

## Escenario 6: URLs que no deben transformarse

Incluir en el fixture Markdown:

- URL de video dentro de un párrafo con texto;
- enlace etiquetado `[ver video](...)`;
- URL dentro de lista y cita;
- canal, perfil y playlist;
- `watch` con parámetro `list`;
- protocolo no web, host engañoso, ID corto y ruta extra.

Resultado esperado: todos permanecen como enlaces; el resto del Markdown conserva orden y legibilidad; no se genera iframe para ninguno.

## Escenario 7: Resiliencia y regresiones

1. Corromper temporalmente la clave de estado de la categoría en `sessionStorage` y recargar.
2. Simular almacenamiento no disponible.
3. Bloquear la solicitud externa del iframe.
4. Recorrer notas escritas y notas cuyo formato principal es video.

Resultado esperado: la página usa defaults seguros, lectura y navegación continúan, el fallback del video complementario permanece visible, los videos principales conservan su comportamiento, y las URLs públicas existentes siguen abriendo el mismo contenido.
