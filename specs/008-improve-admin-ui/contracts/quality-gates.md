# Contract: Gates de calidad de la interfaz administrativa

## Gate 1: Paridad y cobertura de controles

Antes de retirar la UI anterior debe existir un inventario completo con:

- pantalla/superficie y función actual;
- primitive shadcn destino o excepción especializada;
- estados normal, foco, disabled, busy, success y error cuando apliquen;
- prueba automatizada por rol/nombre/estado;
- comprobación manual necesaria.

El gate pasa cuando el 100% de controles equivalentes está migrado, toda excepción tiene razón verificable y los flujos de categorías, temas y notas conservan sus efectos. Los tests no deben depender solo de clases visuales; prefieren roles, labels, estados y resultados en fixture.

## Gate 2: WCAG 2.2 AA

### Automatizado

- `@axe-core/playwright` escanea estado inicial, carga, vacío, sin resultados, error de formulario, éxito, error de operación, filtros/menús abiertos, cada diálogo, orden, preview y papelera.
- Se evalúan tags WCAG A/AA disponibles, incluido WCAG 2.2, y se revisa explícitamente target size si la regla no viene habilitada.
- Resultado requerido: cero violations. Todo `incomplete` se resuelve manualmente y se documenta; no se admiten exclusiones amplias.

### Manual

- Recorrido solo teclado de crear/editar/buscar/ordenar/eliminar/restaurar categoría, tema y nota.
- Foco visible, no oculto y en orden lógico; retorno correcto de overlays.
- Names/roles/values, labels visibles, errores asociados y live announcements.
- Contraste de texto/no texto en todos los estados y temas.
- Resize de texto 200% y zoom/reflow equivalente a 320 CSS px.
- Movimiento reducido, target size mínimo y alternativa de un solo pointer al drag.
- Smoke tests VoiceOver + Safari y NVDA + Chrome/Firefox.

El gate pasa solo con 100% de criterios WCAG 2.2 AA aplicables satisfechos; pasar axe no basta.

## Gate 3: Matriz de navegadores

### Regresión continua

Playwright ejecuta todos los recorridos críticos, sin skips por proyecto, sobre:

- Chromium;
- Firefox de Playwright;
- WebKit de Playwright;
- Chrome estable branded cuando esté instalado;
- Edge estable branded cuando esté instalado.

Cada proyecto recibe un fixture de repositorio reinicializado; las mutaciones no comparten estado.

### Aceptación de release

Se registra la ejecución completa en las versiones N y N−1 estables de:

- Chrome;
- Firefox;
- Safari sobre macOS;
- Edge.

El registro incluye navegador, versión, OS, fecha, resultado de cada flujo y evidencia. WebKit no se etiqueta como Safari ni Firefox de Playwright como Firefox branded. El gate pasa con 100% de recorridos aplicables en todos los registros.

## Gate 4: Responsive y contenido extremo

Los flujos críticos se prueban en 768, 1024, 1280 y 1440 px, más 400% zoom/reflow. Fixtures incluyen:

- labels, títulos, IDs y errores largos;
- caracteres especiales y texto multilingüe;
- cero, uno y muchos elementos;
- formulario con todos los tipos de campo y upload;
- operación lenta y fallo recuperable.

El gate pasa sin scroll horizontal de página completa, superposición, clipping de foco o pérdida de acción esencial.

## Gate 5: Rendimiento relativo

### Protocolo

1. Capturar baseline en el commit pre-migración.
2. Usar mismo equipo/container, OS, Node, browser, fixture, viewport, servidor de producción, workers y política de caché.
3. Ejecutar 5 warmups y al menos 30 muestras por métrica.
4. Medir carga con caché fría e interacciones en sesión warm.
5. Guardar datos crudos, mediana y p95 en JSON.

### Métricas primarias

- navegación → `Inventario listo` visible/anunciado;
- LCP inicial;
- selección de categoría → outline/editor estable;
- filtro → lista estable;
- selección de nota → formulario completo;
- trigger de diálogo → visible con foco inicial correcto;
- request de preview → preview lista, separando el debounce fijo de 300 ms;
- guardar → éxito visible/anunciado;
- confirmación destructiva → estado final estable.

Para cada métrica:

```text
candidate.median <= baseline.median × 1.10
candidate.p95    <= baseline.p95 × 1.10
```

También se registran bytes JavaScript transferidos, requests y long tasks como diagnóstico. El gate falla si una sola métrica primaria supera el umbral; un score Lighthouse o bundle size favorable no compensa el fallo.

## Gate 6: Regresión de dominio y aislamiento

Los siguientes comandos deben finalizar con código 0:

```bash
npm run validate:content
npm run check
npm run test:unit
npm run test:admin
npm run test:e2e
npm run build
npm run verify:public-build
```

Además:

- los archivos antes/después de recorridos equivalentes conservan schema y semántica;
- respuestas y status codes del API local no cambian;
- conflictos 409 preservan borradores;
- preview continúa sandboxed;
- `dist/` público no contiene rutas, strings, bundles ni capacidades administrativas.
