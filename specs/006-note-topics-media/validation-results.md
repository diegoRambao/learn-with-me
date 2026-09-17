# Resultados de validación: temas, videos y panel de notas

**Fecha:** 2026-09-16  
**Zona horaria:** America/Bogota  
**Build evaluado:** sitio estático local de la rama de trabajo

## Gates automatizados

| Gate | Resultado |
| --- | --- |
| `npm run validate:content` | Aprobado |
| `npm run check` | Aprobado: 0 errores, 0 advertencias y 0 hints |
| `npm run test:unit` | Aprobado: 57 pruebas en 9 archivos |
| Playwright desktop/mobile/reduced-motion | Aprobado: 141 pruebas |
| `npm run build` | Aprobado: 23 páginas estáticas generadas |

El puerto por defecto `4321` estaba ocupado por un servidor Vite ajeno a esta ejecución y la configuración ordinaria de Playwright lo reutilizó. Para evitar validar una aplicación distinta, la matriz completa se ejecutó contra el build estático en el puerto aislado `4399`, con los mismos proyectos desktop, mobile y reduced-motion. No se detuvo ni modificó el proceso externo.

## Escenarios del quickstart

1. **Grafo editorial válido — aprobado.** Los fixtures incluyen temas con notas, un tema vacío y una nota raíz. La validación, el orden global, `No hay notas` y la navegación anterior/siguiente están cubiertos por pruebas unitarias y E2E.
2. **Errores editoriales accionables — aprobado.** Se verificaron IDs repetidos, referencias ausentes o de otra categoría, posiciones compartidas y campos de tema inválidos. Los mensajes identifican los elementos y fuentes en conflicto.
3. **Estado inicial y expansión — aprobado.** El tema activo abre inicialmente, los disclosures funcionan con teclado, varios temas permanecen abiertos y la nota activa expone `aria-current="page"`.
4. **Ocultar y restaurar el panel — aprobado.** Se verificaron foco, `aria-controls`, `aria-expanded`, cambio de ancho, persistencia por categoría, navegación y ausencia de overflow a 320 px. La regresión también exige `window.scrollX === 0` después de ocultar el panel.
5. **Formatos YouTube admitidos — aprobado.** `watch`, `youtu.be`, `shorts` y `embed` válidos se convierten a `youtube-nocookie.com`, conservan 16:9, atributos seguros, fallback permanente y ancho acotado.
6. **URLs que no se transforman — aprobado.** Párrafos ordinarios, enlaces etiquetados, listas, citas, canales, perfiles, playlists, parámetros `list`, hosts engañosos, IDs inválidos y rutas extra permanecen sin iframe.
7. **Resiliencia y regresiones — aprobado.** Estado corrupto o storage no disponible usa defaults seguros; el fallback permanece en el documento aunque falle la solicitud del iframe; las notas de video principal y las rutas públicas existentes conservan su comportamiento.

## Revisión visual comparativa

Se inspeccionó la ruta `/categorias/flutter-basic/flutter-basic-intro/` en el navegador integrado, con el panel visible y oculto, en temas **Claro** y **Oscuro**. El viewport de captura fue de 592 × 858 px. Resultado:

- Los temas, estados abierto/cerrado, nota activa y toggle reutilizan bordes, radios, tipografía, espaciado y colores existentes.
- El contraste y la jerarquía visual se mantienen en ambos temas.
- Al ocultar el panel, el contenido usa el ancho liberado; al restaurarlo vuelve la columna de navegación.
- Un paneo horizontal transitorio del visor de captura al seguir el foco no se reprodujo en Playwright; la página reportó `scrollX = 0` y sin overflow en escritorio ni a 320 px.

SC-010 queda aprobado por esta comparación. Las capturas se realizaron en la sesión de auditoría del navegador integrado; la herramienta no expuso una ruta de archivo local reutilizable.

## Métricas manuales con participantes

No se realizaron sesiones con participantes humanos en esta ejecución (**participantes: 0**). Por tanto, no existen tiempos reales ni porcentajes que puedan registrarse honestamente para:

- **SC-003:** localizar y abrir una nota indicada en menos de 15 segundos.
- **SC-006:** iniciar un video integrado en menos de 10 segundos.
- **SC-008:** ocultar o recuperar el panel en menos de 5 segundos en pantalla amplia y estrecha.

Estas tres métricas quedan **pendientes de una prueba de usabilidad con participantes reales**. No se sustituyeron por tiempos automatizados ni se inventaron resultados.
