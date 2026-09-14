# Quickstart Validation: Categorías y rutas de aprendizaje

Esta guía se ejecutará después de implementar las tareas del feature.

## Prerequisitos

- Node.js LTS 22 o superior
- npm compatible con el lockfile del proyecto
- Navegadores de Playwright instalados

## Preparación

```bash
npm install
npx playwright install
npm run validate:content
npm run check
npm run test
npm run build
```

Resultado esperado: todos los comandos terminan con código 0 y `dist/` contiene HTML estático completo para la portada, el catálogo, cada categoría y cada par categoría/nota válido.

## Ejecutar pruebas automatizadas

```bash
npm run test:unit
npm run test:e2e
```

Vitest debe cubrir las invariantes definidas en [data-model.md](./data-model.md). Playwright debe ejecutar los escenarios de [homepage-ui.md](./contracts/homepage-ui.md) y [routes-and-ui.md](./contracts/routes-and-ui.md) tanto en viewport de escritorio como móvil, incluida la emulación de movimiento reducido.

## Validación manual end-to-end

Iniciar el build de producción:

```bash
npm run preview
```

### Escenario 1: Comprender la portada y comenzar

1. Abrir `/` y verificar que explica el propósito ligado a la maestría en didáctica de las matemáticas, educación de personas adultas, educación popular y aprendizaje significativo.
2. Confirmar que explica cómo elegir categorías por nivel, recorrer notas ordenadas y consumir una nota escrita o de video.
3. Confirmar los tres beneficios: aprendizaje estructurado, contenido de calidad y actualizado, y experiencia del autor.
4. Verificar que el índice lateral amplio contiene todas las categorías en orden por nombre/ID y que cada URL abre `/categorias/{categoryId}/`.
5. Repetir en viewport estrecho mediante el control compacto y confirmar el mismo orden, etiquetas y destinos.
6. Verificar que cada red configurada muestra nombre y destino comprensibles; con `socialLinks` vacío, no aparece una región ni enlaces de ejemplo.
7. Confirmar que “Categorías” permanece visible en la navegación principal y que “Saltar al contenido” funciona con teclado.

### Escenario 2: Descubrir y filtrar categorías

1. Abrir `/categorias/` y verificar nombre, imagen/fallback y nivel en todas las tarjetas.
2. Activar cada nivel y comprobar que solo quedan coincidencias.
3. Elegir “Todos” y comprobar que reaparecen todas.
4. Verificar con teclado el foco visible, `aria-pressed` y el estado anunciado del filtro.
5. Ejecutar 20 cambios de filtro sobre un fixture de 100 tarjetas, medir desde el evento hasta el estado visible y confirmar p95 menor a 100 ms; si el entorno CI es inestable, registrar este protocolo como perfil local repetible y mantener en CI la prueba de exactitud.

### Escenario 3: Recorrer una categoría

1. Abrir una categoría con al menos tres notas en posiciones distintas.
2. Confirmar que `/categorias/{categoryId}/` conduce a la nota de menor posición.
3. Confirmar que el listado conserva el orden y marca la nota activa con texto/forma además de color.
4. Seleccionar otra nota y comprobar URL, contenido y permanencia del contexto de categoría.
5. Repetir con viewport móvil y usar el control compacto de la ruta.

### Escenario 4: Consumir formatos y deep links

1. Preparar dentro de la misma categoría una nota `written` y una nota `video`, ambas con título, descripción, duración y posiciones enteras positivas distintas.
2. Abrir la nota `written` y verificar título, descripción, duración y Markdown completo.
3. Abrir la nota `video` y verificar metadatos, iframe reproducible y enlace externo siempre visible y operable para abrir el recurso en YouTube.
4. Copiar y recargar `/categorias/{categoryId}/{noteId}/`; debe conservar la nota activa.
5. Abrir un par categoría/nota no relacionado y una URL de nota sin categoría; ambas deben terminar en `/categorias/` con explicación y sin mostrar la nota.

### Escenario 5: Estados de resiliencia

1. Probar fixture sin categorías: aparece estado vacío y no aparecen filtros.
2. Probar categoría sin notas: conserva la categoría, no selecciona nota y muestra estado vacío.
3. Probar filtro sin coincidencias: muestra mensaje y “Ver todas”.
4. Forzar fallo de imagen: aparece el fallback y se conserva el nombre de la categoría.
5. Bloquear el embed de video: el enlace externo a YouTube sigue visible y operable, y la navegación de ruta continúa disponible.

### Escenario 6: Identidad visual, contraste y movimiento

1. Verificar base oscura, superficies distinguibles, acentos consistentes e identidad propia sin marca, textos ni activos copiados de Vercel.
2. Comprobar contraste de texto normal (mínimo 4.5:1), texto grande y elementos no textuales esenciales (mínimo 3:1) en estados default, hover, foco y activo.
3. Recorrer la portada solo con teclado y a 200% de zoom; confirmar orden lógico, foco visible, reflow y objetivos interactivos suficientes.
4. Confirmar que las transiciones no retrasan ni bloquean lectura, enlaces o controles y que ninguna información depende solo de color o movimiento.
5. Ejecutar Playwright con `reducedMotion: 'reduce'` y comprobar que desaparece o se reduce todo movimiento no esencial sin perder contenido ni funcionalidad.

## Validación de resultados de usabilidad

- **SC-009**: Mostrar la portada durante 30 segundos; al menos 90% de participantes debe expresar correctamente el propósito, cómo comenzar y dos de los tres beneficios.
- **SC-010**: La prueba automatizada debe encontrar el 100% de bloques requeridos, categorías ordenadas y redes sociales válidas configuradas.
- **SC-011**: En escritorio y móvil, al menos 95% de participantes debe localizar desde el índice una categoría apropiada en menos de 15 segundos.
- **SC-012**: La prueba con movimiento reducido debe conservar el 100% del contenido y controles, eliminando o reduciendo las transiciones no esenciales.

## Verificar bloqueo de publicación

Usar, uno por vez, los fixtures de `tests/fixtures/invalid-content/` para comprobar:

- campo requerido ausente;
- categoría inexistente;
- posición duplicada;
- nota escrita sin cuerpo o con `youtubeVideoId`;
- nota de video sin ID, con ID inválido o con cuerpo Markdown;
- red social con etiqueta vacía, URL no HTTPS o red/URL duplicada.

Para cada fixture:

```bash
npm run validate:content
npm run build
```

Resultado esperado: ambos comandos fallan, enumeran archivo y campo corregible, y no producen una publicación parcial. Restaurar contenido válido debe hacer que ambos vuelvan a finalizar correctamente.
