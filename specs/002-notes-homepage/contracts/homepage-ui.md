# Contract: Portada de apuntes y muestra de rutas

## Ruta y disponibilidad

- `/` entrega HTML estático con propósito, CTA principal, muestra de categorías, instrucciones y beneficios.
- Todos los enlaces a categorías son URLs ordinarias y funcionan sin JavaScript.
- La acción central y la acción “Explorar más rutas” apuntan a `/categorias/`.
- La navegación principal conserva su enlace estable “Categorías”.

## Contrato de copy

El contenido principal comunica explícitamente, con lenguaje propio:

1. El sitio contiene notas o apuntes personales del autor.
2. Los apuntes proceden de temas que el autor va estudiando.
3. Otras personas pueden aprovecharlos para estudiar o repasar por su cuenta.
4. La forma de uso consiste en elegir un tema, recorrer sus notas y estudiar al ritmo propio.
5. Los beneficios incluyen organización, reutilización para repaso y aprendizaje compartido desde la experiencia.

El contenido visible de la portada no usa “clase”, “clases”, “curso” ni “cursos” para describir la oferta. Tampoco presenta el sitio como academia, certificación o formación formal. Esta restricción no altera citas o contenidos históricos fuera de `/`.

## Jerarquía y composición

- Existe un único encabezado principal que expresa el propósito.
- El CTA principal aparece centrado dentro de la composición del bloque inicial, tiene nombre descriptivo y no depende solo de icono o color.
- La muestra posee un encabezado propio y las tarjetas usan un nivel subordinado coherente.
- Se elimina de la portada el `<aside>` y la navegación lateral etiquetada “Categorías”.
- La secuencia de lectura y foco es introducción, CTA principal, rutas principales, rutas atenuadas, CTA de exploración y contenido complementario.

## Proyección de categorías

La UI consume [HomeCategoryPreview](../data-model.md#homecategorypreview):

- 0 categorías: estado vacío y CTA; cero tarjetas.
- 1–3 categorías: todas principales; no existe grupo atenuado vacío.
- 4–5 categorías: tres principales y una o dos atenuadas.
- 6 o más categorías: exactamente tres principales y tres atenuadas.
- Ninguna categoría se duplica y el orden coincide con el catálogo existente.
- Cada tarjeta conserva nombre, nivel, imagen o fallback y URL `/categorias/{categoryId}/`.

## Contrato del desvanecimiento

- El grupo `teaser` permanece visible, enfocable y presente para tecnologías de asistencia.
- No usa `aria-hidden`, `display: none`, `visibility: hidden` ni deshabilita sus enlaces.
- El efecto es decorativo y no comunica por sí solo la existencia de más contenido: el CTA aporta texto explícito.
- Toda capa superpuesta usa `pointer-events: none` y no intercepta selección, clic ni foco.
- El CTA está fuera de la atenuación o en una capa superior con contraste suficiente.
- Un enlace enfocado conserva anillo perceptible; el efecto puede reducirse bajo `:focus-within` para preservar legibilidad.
- El modo de movimiento reducido conserva la misma información y operabilidad.

## Responsive y accesibilidad

- El DOM es único y mantiene orden `primary → teaser → CTA` en todos los viewports.
- Las tarjetas usan una columna en anchuras estrechas y pueden crecer hasta tres columnas cuando exista espacio.
- No se requiere scroll horizontal para alcanzar tarjetas o CTA a 320 px de anchura o con reflow equivalente a 200%.
- Enlaces y selector conservan objetivos táctiles suficientes, nombres accesibles y foco visible.
- Texto normal mantiene contraste mínimo 4.5:1; texto grande, límites, iconos funcionales y foco mantienen al menos 3:1.
- El color, la posición o el fade nunca son la única forma de identificar una acción.

## Estados de resiliencia

- Sin categorías, el mensaje indica que aún no hay rutas disponibles y mantiene el acceso al catálogo.
- Una imagen fallida usa el fallback existente sin perder el nombre de la categoría.
- Sin JavaScript, copy, tarjetas y enlaces continúan disponibles; el tema usa Sistema y el selector no promete persistencia inoperable.
- Los fallos técnicos no se muestran a visitantes.

