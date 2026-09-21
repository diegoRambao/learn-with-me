# Research: Mejora de la interfaz administrativa

## Decisión 1: Adoptar shadcn/ui oficial con Base UI y React solo en admin

**Decision**: Configurar shadcn/ui en el paquete raíz con `rsc: false`, TypeScript, Tailwind CSS 4 y Base UI fijado explícitamente. Instalar React 19 y `@astrojs/react`, pero registrar `react()` únicamente en `admin/astro.config.ts`. Generar componentes en `admin/src/components/ui` y apuntar `components.json` a `admin/src/styles/admin.css` y aliases `@admin/*`.

**Rationale**: La guía oficial de shadcn para Astro exige Tailwind y la integración React en proyectos existentes. Desde julio de 2026 Base UI es la base predeterminada y recomendada por shadcn para proyectos nuevos. Limitar la integración al segundo entrypoint mantiene el runtime fuera del sitio público.

**Alternatives considered**: Radix sigue siendo maduro y compatible, pero no existe una instalación previa que justifique apartarse del default recomendado; React Aria añadiría otra API sin una necesidad del alcance; ports comunitarios para Astro divergen del shadcn oficial solicitado.

**Sources**: [shadcn para Astro](https://ui.shadcn.com/docs/installation/astro), [integración React de Astro](https://docs.astro.build/en/guides/integrations-guide/react/), [Base UI como default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default).

## Decisión 2: Usar un único workspace React para toda la interacción coordinada

**Decision**: Mantener el documento y shell estático en Astro y montar un `AdminWorkspace` con `client:load` que posea explorador, árbol, formularios, editor, preview, orden, papelera y overlays. Los componentes shadcn compuestos no se dividen entre Astro y React. Tras migrar una región, los scripts imperativos dejan de consultar o mutar su DOM.

**Rationale**: La UI vigente es una sola aplicación coordinada mediante IDs, mutaciones DOM y eventos globales. Dividir controles compuestos o conservar doble ownership produciría estados desincronizados, hidratación frágil y pérdida de foco. Un árbol cliente comparte snapshot, selección, borradores y estado de operaciones, mientras sigue usando API y funciones puras existentes.

**Alternatives considered**: Muchas islas pequeñas duplican estado y complican diálogos/portals; envolver botones aislados en React no entrega el comportamiento de shadcn; reescribir endpoints o introducir un store externo excede el cambio visual.

**Sources**: [arquitectura de islas de Astro](https://docs.astro.build/en/concepts/islands/), [renderizado e hidratación React en Astro](https://docs.astro.build/en/guides/integrations-guide/react/).

## Decisión 3: Tratar los componentes generados como código del producto

**Decision**: Versionar `components.json`, `admin/src/components/ui/*.tsx` y `admin/src/lib/utils.ts`. Dejar que el CLI resuelva dependencias por componente, usar `cn` para composición de clases y revisar cambios futuros con `shadcn add --dry-run` o `--diff`; nunca sobrescribir personalizaciones sin revisión.

**Rationale**: shadcn es un sistema de distribución de código, no una caja negra. Tener las fuentes permite adaptar labels, foco, tamaños y tokens a WCAG y a la identidad del administrador. El archivo de configuración mantiene destinos y tema reproducibles.

**Alternatives considered**: Importar una biblioteca precompilada reduce control; copiar snippets manualmente pierde trazabilidad de CLI; regenerar con `--overwrite` puede borrar ajustes accesibles.

**Sources**: [CLI de shadcn](https://ui.shadcn.com/docs/cli), [components.json](https://ui.shadcn.com/docs/components-json), [instalación manual](https://ui.shadcn.com/docs/installation/manual).

## Decisión 4: Construir el tema desde tokens semánticos propios

**Decision**: Conservar la identidad actual de papel/tinta/acento y mapearla a roles shadcn como `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input` y `ring`, con valores claro/oscuro en OKLCH o equivalentes medidos. Importar Tailwind, las utilidades shadcn y animaciones desde `admin.css`; respetar `prefers-color-scheme` y `prefers-reduced-motion`.

**Rationale**: Los roles semánticos hacen consistentes variantes y estados sin convertir la interfaz en un tema genérico. Los componentes comparten contraste, ring de foco, radios y espaciado, y los cambios futuros quedan centralizados.

**Alternatives considered**: Adoptar los colores default sin ajuste pierde identidad; mantener clases globales por selector perpetúa inconsistencias; un tema independiente por componente dificulta verificar contraste.

**Sources**: [shadcn con Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4), [configuración y variables](https://ui.shadcn.com/docs/components-json).

## Decisión 5: Migrar todos los controles equivalentes y conservar los especializados

**Decision**: Usar los componentes shadcn apropiados para botones, grupos, inputs, textarea, select, field/label/error, card, badge, alert, empty, skeleton/spinner, tabs o toggle group, dropdown menu, tooltip, dialog y alert dialog. Mantener como lógica propia el editor Markdown, upload/preview, iframe sandboxed y algoritmo de orden, pero componerlos con esos controles compartidos.

**Rationale**: Satisface la migración completa de equivalentes sin forzar abstracciones inadecuadas sobre capacidades específicas del dominio. Los patrones de igual función comparten nombre, variantes, tamaños y estados.

**Alternatives considered**: Reemplazar solo botones/inputs no alcanza FR-021; sustituir el editor por un WYSIWYG cambia el flujo; un data grid o framework de formularios nuevo añade peso y comportamiento fuera de alcance.

## Decisión 6: Sustituir prompts nativos y diálogos ad hoc por overlays controlados

**Decision**: Usar `Dialog` para edición estructural y entrada auxiliar, y `AlertDialog` para descartar cambios, mover a papelera y eliminaciones. Cada overlay declara título/descripción, acción segura inicial, estado pendiente, cierre por Escape cuando sea seguro y retorno de foco al disparador. Las confirmaciones fuertes siguen exigiendo el ID cuando el contrato vigente lo requiere.

**Rationale**: El código actual mezcla `<dialog>`, `confirm()` y `prompt()`, lo que produce jerarquía y mensajes inconsistentes. Los primitives gestionan semántica, teclado y foco, pero la aplicación sigue siendo responsable de labels, contenido y política destructiva.

**Alternatives considered**: Conservar APIs nativas limita composición, testing y mensajes; usar toast para confirmar acciones destructivas no exige decisión explícita; crear un modal propio duplica comportamiento complejo.

**Sources**: [accesibilidad de Base UI](https://base-ui.com/react/overview/accessibility), [Alert Dialog de shadcn](https://ui.shadcn.com/docs/components/base/alert-dialog).

## Decisión 7: Verificar WCAG 2.2 AA en estados, no solo en la pantalla inicial

**Decision**: Ejecutar `@axe-core/playwright` sobre estados normal, vacío, carga, éxito, error, formulario inválido, menús abiertos y cada diálogo; complementar con recorridos manuales de teclado, lector de pantalla, zoom/reflow, contraste, foco no oculto, target size, movimiento reducido y alternativas al drag. Mantener botones subir/bajar además del arrastre.

**Rationale**: Los primitives resuelven parte de ARIA, teclado y foco, pero no certifican la composición completa ni WCAG. Axe detecta errores comunes, mientras criterios como orden lógico, claridad, reflow y calidad de mensajes requieren revisión manual.

**Alternatives considered**: Solo axe deja criterios manuales sin probar; solo revisión visual no es repetible; confiar en shadcn como certificación confunde accesibilidad de primitive con conformidad del producto.

**Sources**: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [novedades WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), [pruebas de accesibilidad Playwright](https://playwright.dev/docs/accessibility-testing).

## Decisión 8: Separar pruebas automatizadas de la matriz exacta de navegadores

**Decision**: Añadir proyectos Playwright para Chromium, Firefox, WebKit y canales estables instalados de Chrome/Edge. Ejecutar los flujos críticos en esos motores en cada gate. Para certificar literalmente las dos versiones estables más recientes de Chrome, Firefox, Safari y Edge, mantener una matriz de release fechada y ejecutar el mismo checklist en instalaciones/VMs de esas versiones; WebKit es señal temprana, no sustituto nominal de Safari.

**Rationale**: Playwright automatiza motores y canales de Chrome/Edge, pero documenta que Firefox y WebKit son builds propios y que no controla Safari branded. La combinación ofrece regresión continua y evidencia exacta de compatibilidad antes de liberar.

**Alternatives considered**: Solo Chromium incumple el alcance; considerar WebKit idéntico a Safari sobredeclara cobertura; añadir un proveedor externo obligatorio introduce costo y cuenta remota que la especificación no exige.

**Sources**: [navegadores de Playwright](https://playwright.dev/docs/browsers).

## Decisión 9: Comparar rendimiento contra un baseline reproducible pre-migración

**Decision**: Antes de reemplazar markup, medir en el commit anterior y guardar medianas, p95, fixture, equipo, build, navegador, cantidad de warmups y muestras. Medir navegación hasta “Inventario listo” y latencia de abrir categoría, seleccionar nota, cambiar editor/preview, abrir/cerrar diálogo, filtrar y mostrar validación. El gate falla si mediana o p95 de una métrica excede 110% del baseline bajo el mismo protocolo.

**Rationale**: Los límites absolutos vigentes cubren servidor y dominio, pero SC-012 exige comparación relativa de la UI. Metadatos y varias muestras evitan atribuir ruido del entorno a la migración. Tamaño de JS y requests se registran como diagnósticos, no sustituyen la experiencia medida.

**Alternatives considered**: Solo Lighthouse no representa operaciones internas; comparar un único run es inestable; usar únicamente tamaño de bundle no mide respuesta; relajar el umbral por componente contradice el criterio global.

## Decisión 10: Preservar contratos y migrar por recorridos verticales

**Decision**: Mantener `admin-api.ts`, `contracts.ts`, endpoints, schemas de contenido, hashes/revisiones, sandbox de preview y aislamiento público. Implementar primero foundation/tokens y el shell, luego explorer/outline, edición de notas, estructura, orden/papelera y finalmente retirar controladores/CSS obsoletos. Cada tramo debe cerrar con tests del recorrido correspondiente.

**Rationale**: La feature es visual y no autoriza redefinir persistencia o reglas. Recorridos verticales reducen el tiempo con dos UIs, permiten medir performance desde temprano y hacen localizables las regresiones.

**Alternatives considered**: Un big-bang sin gates dificulta identificar fallos; conservar indefinidamente ambas implementaciones crea código sombra; rediseñar API y UI juntos amplía riesgo sin valor requerido.
