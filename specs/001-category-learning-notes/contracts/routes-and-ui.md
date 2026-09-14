# Contract: Rutas e interfaz

## Rutas públicas

| Método | Ruta | Resultado |
|---|---|---|
| GET | `/` | Portada informativa con navegación principal, índice responsive de categorías y redes sociales válidas |
| GET | `/categorias/` | Catálogo completo, filtros de nivel y avisos contextuales |
| GET | `/categorias/{categoryId}/` | Redirección estática a la primera nota o estado vacío de la categoría |
| GET | `/categorias/{categoryId}/{noteId}/` | Ruta de la categoría con esa nota activa, solo si la relación es válida |

Las URLs canónicas usan IDs tipo slug y barra final consistente. Los enlaces del listado de ruta siempre incluyen ambos IDs.

## Contextos inválidos

- Una ruta con categoría inexistente, nota inexistente, nota sin categoría o par no relacionado no muestra contenido de nota.
- La página `404.astro` detecta paths con forma de aprendizaje inválida y redirige con `location.replace('/categorias/?notice=invalid-note-context')` como fallback del hosting estático.
- `/categorias/` interpreta únicamente la clave conocida `notice=invalid-note-context`, muestra “No pudimos abrir esa nota porque la categoría no es válida. Elige una categoría para continuar.” y permite descartarlo.
- Con JavaScript deshabilitado, el 404 contiene enlace y explicación equivalentes, sin detalles técnicos.

## Catálogo de categorías

- Si existen categorías, cada tarjeta expone nombre, imagen o fallback y etiqueta visible de nivel.
- Los controles son botones con estado accesible (`aria-pressed`) para Todos y los cuatro niveles.
- Aplicar un nivel oculta solo las tarjetas no coincidentes, actualiza el conteo y mueve el anuncio a una región `aria-live="polite"`.
- Cero coincidencias muestra un estado con acción “Ver todas”.
- Cero categorías muestra un estado vacío y no renderiza filtros.

## Ruta de aprendizaje

- En viewport amplio, la navegación ordenada aparece a la izquierda y el contenido a la derecha.
- La nota activa usa diferenciación visual, `aria-current="page"` y no depende solo del color.
- En viewport estrecho, la misma lista aparece dentro de un control compacto con nombre accesible; conserva orden, enlaces y estado activo.
- Seleccionar un elemento navega a su URL jerárquica sin salir del contexto de categoría.
- Una categoría sin notas muestra sus datos y un estado vacío; no crea una nota activa ni un enlace inexistente.

## Detalle de nota

Todas las notas muestran título, descripción y duración en minutos.

- `written`: renderiza el cuerpo Markdown dentro de una región de artículo con tipografía legible.
- `video`: renderiza iframe responsive con `title` descriptivo, `loading="lazy"`, `allowfullscreen` y origen `youtube.com/embed/{id}`.
- Toda nota de video muestra junto al iframe un enlace externo siempre visible y descriptivo para abrir el recurso en YouTube; no depende de detectar un fallo cross-origin del iframe.
- Si el contenido no puede mostrarse en el navegador, se ofrece un mensaje contextual y una acción útil; la navegación de ruta permanece operable.

## Imágenes y errores

- Las imágenes incluyen `alt` útil basado en la categoría, dimensiones o aspect ratio reservados y fallback visual.
- Ningún estado público imprime excepciones, paths internos, stack traces o payloads de validación.
- El foco visible, el orden de tabulación y el contraste deben cumplir WCAG 2.2 AA en controles y texto esencial.

El contrato detallado de la portada, su índice, redes, tema oscuro y movimiento se define en [homepage-ui.md](./homepage-ui.md).
