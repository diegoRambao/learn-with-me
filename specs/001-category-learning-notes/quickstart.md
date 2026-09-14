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

Resultado esperado: todos los comandos terminan con código 0 y `dist/` contiene HTML estático para el catálogo, cada categoría y cada par categoría/nota válido.

## Ejecutar pruebas automatizadas

```bash
npm run test:unit
npm run test:e2e
```

Vitest debe cubrir las invariantes definidas en [data-model.md](./data-model.md). Playwright debe ejecutar los escenarios de [routes-and-ui.md](./contracts/routes-and-ui.md) tanto en viewport de escritorio como móvil.

## Validación manual end-to-end

Iniciar el build de producción:

```bash
npm run preview
```

### Escenario 1: Descubrir y filtrar categorías

1. Abrir `/` y comprobar que “Categorías” está visible en el menú.
2. Abrir `/categorias/` y verificar nombre, imagen/fallback y nivel en todas las tarjetas.
3. Activar cada nivel y comprobar que solo quedan coincidencias.
4. Elegir “Todos” y comprobar que reaparecen todas.
5. Verificar con teclado el foco visible y el estado anunciado del filtro.

### Escenario 2: Recorrer una categoría

1. Abrir una categoría con al menos tres notas en posiciones distintas.
2. Confirmar que `/categorias/{categoryId}/` conduce a la nota de menor posición.
3. Confirmar que el listado conserva el orden y marca la nota activa con texto/forma además de color.
4. Seleccionar otra nota y comprobar URL, contenido y permanencia del contexto de categoría.
5. Repetir con viewport móvil y usar el control compacto de la ruta.

### Escenario 3: Consumir formatos y deep links

1. Abrir una nota `written` y verificar título, descripción, duración y Markdown completo.
2. Abrir una nota `video` y verificar metadatos e iframe reproducible de YouTube.
3. Copiar y recargar `/categorias/{categoryId}/{noteId}/`; debe conservar la nota activa.
4. Abrir un par categoría/nota no relacionado y una URL de nota sin categoría; ambas deben terminar en `/categorias/` con explicación y sin mostrar la nota.

### Escenario 4: Estados de resiliencia

1. Probar fixture sin categorías: aparece estado vacío y no aparecen filtros.
2. Probar categoría sin notas: conserva la categoría, no selecciona nota y muestra estado vacío.
3. Probar filtro sin coincidencias: muestra mensaje y “Ver todas”.
4. Forzar fallo de imagen y bloqueo de video: aparece fallback/mensaje útil y la navegación sigue operable.

## Verificar bloqueo de publicación

Usar, uno por vez, los fixtures de `tests/fixtures/invalid-content/` para comprobar:

- campo requerido ausente;
- categoría inexistente;
- posición duplicada;
- nota escrita sin cuerpo o con `youtubeVideoId`;
- nota de video sin ID, con ID inválido o con cuerpo Markdown.

Para cada fixture:

```bash
npm run validate:content
npm run build
```

Resultado esperado: ambos comandos fallan, enumeran archivo y campo corregible, y no producen una publicación parcial. Restaurar contenido válido debe hacer que ambos vuelvan a finalizar correctamente.
