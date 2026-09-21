# Contract: Interfaz administrativa renovada

## Compatibilidad funcional

Este contrato especializa, pero no reemplaza, [007-local-content-admin/contracts/admin-ui.md](../../007-local-content-admin/contracts/admin-ui.md), [local-admin-api.md](../../007-local-content-admin/contracts/local-admin-api.md) y [content-files.md](../../007-local-content-admin/contracts/content-files.md). En cualquier discrepancia sobre contenido, seguridad local, revisiones, mutaciones o archivos, prevalecen esos contratos y la especificación 008.

La renovación no añade ni elimina capacidades. Crear, consultar, editar, buscar, filtrar, ordenar, previsualizar, eliminar, restaurar y resolver conflictos conserva los mismos efectos observables y DTOs.

## Shell y jerarquía

- La página expone un skip link, banner identificable, navegación de categorías y un `main` enfocable.
- Cada vista tiene un único título principal contextual y una acción primaria visualmente distinguible.
- Acciones secundarias y destructivas usan variantes semánticas consistentes; destructive siempre incluye texto o nombre accesible explícito.
- La advertencia “Guardar modifica archivos del repositorio” permanece visible en el rango 768–1440 px.
- No existe scroll horizontal de página completa entre 768 y 1440 px ni en el audit equivalente a 320 CSS px por zoom/reflow.

## Mapa obligatorio de componentes

| Superficie existente | Primitive/patrón requerido | Estados mínimos |
|---|---|---|
| Acciones primarias, secundarias, iconos y destructivas | `Button` / `ButtonGroup` con variantes | normal, focus, disabled, busy |
| Campos de texto, número, búsqueda y archivo | `Field`, `Label`, `Input`, `Textarea` | normal, focus, disabled, invalid |
| Categoría, tema, formato, nivel y filtros | `Select` o control nativo documentado cuando aporte mejor semántica | closed, open, selected, disabled, invalid |
| Editor/vista previa y vistas del workspace | `Tabs` o `ToggleGroup` | selected, focus, disabled |
| Menús de categoría, tema y nota | `DropdownMenu` | closed, open, keyboard navigation |
| Ajustes y archivos con problemas | `Collapsible`/`Accordion` | collapsed, expanded, focus |
| Estado global y errores | `Alert`, live region, `Badge`, `Spinner`/`Skeleton` | loading, success, warning, error |
| Estado sin categorías, notas, resultados o trash | `Empty` | reason, next action |
| Formulario de categoría/tema y entrada de comando Markdown | `Dialog` | open, validating, submitting, error |
| Cambios sin guardar, papelera y eliminación | `AlertDialog` | open, safe initial focus, pending, error |
| Ayuda suplementaria de iconos | `Tooltip` con label persistente o accesible | hover, focus, dismissed |
| Toolbar Markdown, upload, iframe preview y drag order | Control especializado compuesto con primitives compartidos | todos los estados aplicables |

Una excepción `specialized` debe quedar registrada en el inventario, explicar por qué no existe equivalente adecuado y cumplir el resto del contrato.

## Explorador de categorías

- “Nueva categoría”, búsqueda, colapso, tarjetas, menú de acciones y acceso a papelera comparten componentes y tamaños estándar.
- La categoría activa comunica selección mediante estado programático y señal visual no dependiente solo del color.
- Buscar muestra conteo o estado vacío y ofrece limpiar la consulta.
- Colapsar categorías conserva la preferencia vigente y mantiene el trigger enfocado; en layouts donde el panel es esencial, permanece alcanzable.
- Nombres largos hacen wrap o truncado perceptible sin cubrir el menú de acciones.

## Temas, notas y orden

- Crear tema/nota, filtros y menús tienen nombres accesibles específicos del elemento.
- El orden por drag conserva botones “Subir”/“Bajar”, select para cambiar tema y anuncios de nueva posición; ninguna función depende de arrastrar.
- Guardar/descartar orden solo aparece o se habilita al existir un borrador, y `busy` bloquea duplicación.
- Los estados cero, uno y muchos elementos preservan encabezados, acciones y navegación comprensibles.
- Filtros abiertos gestionan Escape y retorno de foco sin ocultar la selección actual.

## Formulario y editor de nota

- Toda label visible se asocia con su control; el nombre accesible contiene el mismo texto visible.
- Campos inválidos declaran `aria-invalid`, enlazan explicación de corrección y aparecen en un resumen enfocable al enviar.
- El borrador y los uploads sobreviven a errores de validación/API y a cambios de vista.
- Guardar presenta estado pendiente textual y evita un segundo envío; éxito anuncia el elemento y paths relativos.
- La toolbar Markdown conserva selección y devuelve foco al textarea.
- Cambiar formato o insertar datos que requieren confirmación usa overlay controlado, no `window.confirm`/`prompt`.
- El modo enfoque mantiene editor, preview, guardado y estado de borrador; Escape restaura vista y foco.

## Preview

- El iframe conserva `sandbox` vacío, `referrerpolicy="no-referrer"` y título accesible.
- El debounce sigue siendo 300 ms; la actualización manual siempre está disponible.
- La última preview válida permanece mientras se carga una nueva.
- Loading, éxito y error se anuncian sin interrumpir cada edición.

## Diálogos y confirmaciones

Todo `Dialog` o `AlertDialog` debe:

1. Exponer role correcto y título visible como nombre accesible.
2. Volver inerte el fondo mientras es modal.
3. Recibir foco inicial lógico; una acción destructiva enfoca inicialmente cancelar.
4. Contener el ciclo Tab/Shift+Tab.
5. Cerrar con Escape cuando no haya una mutación no cancelable en curso.
6. Tener botón visible de cancelar/cerrar.
7. Devolver foco al trigger o a un sucesor lógico si fue eliminado.
8. Permitir scroll de contenido largo sin perder título ni acciones.
9. Conservar y anunciar errores sin cerrar.

Las eliminaciones que hoy exigen ID lo siguen exigiendo. “Mover a papelera” y “Eliminar definitivamente” permanecen decisiones separadas.

## Estados y anuncios

- Bootstrap usa skeleton o mensaje de carga y anuncia al terminar.
- Éxito, warning y error tienen icono/texto además de color.
- Las regiones `status` se usan para progreso y confirmaciones no bloqueantes; `alert` se reserva para fallos que requieren atención.
- Mensajes nunca muestran stack, rutas absolutas ni detalles internos.
- Un error de red/API ofrece reintento cuando es seguro y conserva contexto.
- Estado vacío explica causa y ofrece siguiente acción pertinente si existe.

## Responsive, movimiento y targets

- Los anchos contractuales 768, 1024, 1280 y 1440 px muestran acciones esenciales sin overlay ni recorte.
- El audit de 400% zoom/320 CSS px preserva contenido y operación crítica mediante reflow.
- Targets cumplen 24×24 CSS px o una excepción WCAG válida de espaciado/equivalencia.
- `prefers-reduced-motion: reduce` elimina movimiento no esencial y conserva señal estática.
- Focus ring tiene contraste suficiente, no queda oculto por toolbars sticky y funciona en temas claro/oscuro.

## Límite de runtime

- React y componentes shadcn solo se importan desde `admin/`.
- Un nodo propiedad de React no puede ser creado, reordenado o mutado por los antiguos controladores DOM.
- Al cerrar la migración no quedan dos implementaciones activas del mismo control.
- `npm run build` público y `verify:public-build` prueban que `dist/` no contiene admin, React/shadcn administrativo ni endpoints locales.
