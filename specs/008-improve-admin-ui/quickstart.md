# Quickstart: Validación de la interfaz administrativa renovada

## Prerrequisitos

- Node.js 22.12 o superior y dependencias instaladas desde la raíz.
- Chromium, Firefox y WebKit de Playwright disponibles; Chrome y Edge branded instalados para sus proyectos.
- macOS/Safari y las instalaciones o VMs necesarias para la matriz N/N−1 de release.
- Una copia de trabajo limpia o el fixture aislado de administración.
- Baseline pre-migración capturado con el protocolo de [quality-gates.md](./contracts/quality-gates.md).

Los resultados de UI se definen en [admin-ui.md](./contracts/admin-ui.md); el estado temporal y la evidencia se definen en [data-model.md](./data-model.md). Los contratos funcionales de `007-local-content-admin` siguen vigentes.

## Gates automatizados

Desde la raíz:

```bash
npm run validate:content
npm run check
npm run test:unit
npm run test:admin
npm run test:e2e
npm run build
npm run verify:public-build
```

Resultado esperado: todos terminan con código 0; los proyectos de navegador ejecutan los flujos críticos sin skips por engine; los scans axe no reportan violations; y el build público no contiene runtime, componentes ni rutas del administrador.

Para aislar la suite administrativa durante desarrollo:

```bash
npm run test:admin -- --reporter=verbose
npx playwright test tests/e2e/admin-*.spec.ts
```

Resultado esperado: categorías, temas, notas, orden, preview y papelera conservan el contrato previo en todos los proyectos configurados.

## Inicio local

```bash
npm run admin
```

Abrir la dirección `http://127.0.0.1:<puerto>/` indicada por Astro.

Resultado esperado: se muestra el shell administrativo, luego el estado de carga y finalmente “Inventario listo”. React/shadcn solo se carga para este entrypoint; el sitio público continúa independiente.

## Escenario 1: Coherencia de componentes y estados

1. Recorrer explorer, outline, editor, preview, orden y papelera.
2. Comparar botones, campos, selects, menús, badges, alerts y estados vacíos de igual función.
3. Forzar normal, focus, disabled, busy, success y error donde apliquen.
4. Revisar el inventario de controles y sus excepciones especializadas.

Resultado esperado: el 100% de controles equivalentes usa la misma primitive, variante, terminología y comportamiento. Cada control especializado tiene una razón documentada y compone controles compartidos.

## Escenario 2: Crear y editar categorías, temas y notas

1. Crear una categoría, editarla y crear/editar un tema.
2. Crear una nota escrita con metadata, Markdown e imagen.
3. Crear o editar una nota de video.
4. Buscar, filtrar, cambiar tema y guardar orden.
5. Confirmar los archivos del fixture y ejecutar `npm run validate:content`.

Resultado esperado: la UI presenta confirmación visible, mantiene contexto y produce exactamente los mismos documentos y respuestas que antes de la renovación. No cambia ningún schema ni ruta autorizada.

## Escenario 3: Validación y recuperación

1. Enviar formularios de categoría, tema y nota con campos inválidos.
2. Forzar una respuesta 409 por revisión externa.
3. Simular operación lenta y fallo recuperable.
4. Corregir y reintentar.

Resultado esperado: cada error está junto al campo/grupo, explica corrección, se incluye en resumen enfocado y es anunciado. El borrador y uploads se conservan; `busy` evita duplicados; ningún detalle técnico crudo aparece.

## Escenario 4: Diálogos y acciones destructivas

1. Abrir formularios estructurales, cambios sin guardar y todas las confirmaciones destructivas.
2. Recorrer cada overlay con Tab/Shift+Tab y cerrar con Escape/cancelar.
3. Verificar foco inicial y retorno al trigger.
4. Mover una nota a papelera, restaurarla y luego probar purga con confirmación incorrecta/correcta.

Resultado esperado: el fondo queda inerte, el foco no escapa, cancelar recibe foco inicial en decisiones destructivas y los errores no cierran el overlay. Papelera y purga siguen siendo pasos separados.

## Escenario 5: Orden con y sin drag

1. Reordenar tema/notas mediante drag.
2. Repetir solo con botones “Subir”/“Bajar” y select de tema.
3. Completar el mismo flujo con teclado.
4. Guardar y descartar borradores distintos.

Resultado esperado: las tres modalidades producen la misma secuencia, anuncian posición y mantienen foco. Ninguna función depende exclusivamente del movimiento de arrastre.

## Escenario 6: Responsive, zoom y contenido extremo

1. Repetir flujos críticos a 768, 1024, 1280 y 1440 px.
2. Auditar 200% de texto y 400% zoom/reflow equivalente a 320 CSS px.
3. Cargar títulos, IDs, labels y errores largos, caracteres especiales y texto multilingüe.
4. Probar listas vacías, con un elemento y con muchos.

Resultado esperado: no hay scroll horizontal global, superposición, foco recortado ni acción esencial perdida. Contenido largo hace wrap/truncado perceptible y los estados vacíos ofrecen salida clara.

## Escenario 7: WCAG 2.2 AA

1. Ejecutar los scans axe en cada estado requerido.
2. Completar categorías, temas y notas solo con teclado.
3. Revisar foco no oculto, contraste, labels, name/role/value, live regions y targets.
4. Activar `prefers-reduced-motion: reduce`.
5. Realizar smoke tests con VoiceOver + Safari y NVDA + Chrome/Firefox.

Resultado esperado: cero violations automatizadas, todos los `incomplete` resueltos manualmente y 100% de criterios WCAG 2.2 AA aplicables aprobados. Ninguna señal depende solo de color o movimiento.

## Escenario 8: Matriz de navegadores

Ejecutar los recorridos completos en Playwright Chromium, Firefox y WebKit, además de Chrome/Edge stable. Para la aceptación de release, repetirlos en N y N−1 reales de Chrome, Firefox, Safari y Edge, registrando navegador, versión, OS, fecha y evidencia.

Resultado esperado: todas las combinaciones aprueban categorías, temas, notas y estados compartidos. Los resultados WebKit/Firefox de Playwright no se presentan como sustitutos de Safari/Firefox branded.

## Escenario 9: Presupuesto de rendimiento

1. Ejecutar baseline y candidato en el mismo entorno, build, fixture y viewport.
2. Aplicar 5 warmups y al menos 30 muestras por métrica.
3. Comparar carga, LCP, selección, filtro, formulario, diálogo, preview, guardado y confirmación destructiva.
4. Conservar trazas y muestras de cualquier fallo.

Resultado esperado: mediana y p95 de cada métrica candidata son como máximo 110% del baseline. Los límites existentes menores a 1 segundo y debounce de 300 ms también continúan aprobando.

## Escenario 10: Aislamiento público

1. Detener el administrador.
2. Ejecutar `npm run build` y `npm run verify:public-build`.
3. Inspeccionar `dist/` y recorrer homepage, categorías, búsqueda y notas.

Resultado esperado: no existe `/admin`, API local, bundle React/shadcn administrativo, estilos o strings exclusivas del administrador en la entrega pública; las rutas públicas mantienen su comportamiento.
