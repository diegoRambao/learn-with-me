# Data Model: Mejora de la interfaz administrativa

## Alcance del modelo

Esta feature no modifica el modelo persistente. `CategoryDocument`, `Topic`, `NoteDocument`, `ManagedAsset`, `TrashSummary`, `OrderDraft`, revisiones y formatos de archivo continúan definidos por [007-local-content-admin/data-model.md](../007-local-content-admin/data-model.md) y sus contratos. Los modelos siguientes describen únicamente estado de presentación y evidencia de aceptación; ninguno se escribe en `src/content/`.

## AdminUiState

Estado inmutable compartido por el workspace React.

| Campo | Tipo | Reglas |
|---|---|---|
| `bootstrap` | `BootstrapData \| null` | `null` hasta completar la carga; utiliza los DTO existentes sin cambiar su forma. |
| `phase` | `UiPhase` | Estado global visible y anunciado. |
| `activeCategoryId` | `string \| null` | Debe resolver dentro del snapshot actual. |
| `activeNote` | `{ folder: string; id: string } \| null` | Debe identificar una nota del snapshot o ser `null` para nueva nota. |
| `workspace` | `WorkspaceMode` | Una sola región principal activa. |
| `notePane` | `'editor' \| 'preview'` | Controlado por tabs/toggle y preservado al entrar/salir de enfoque. |
| `focusMode` | `boolean` | Oculta navegación no esencial sin perder borrador ni preview. |
| `filters` | `ContentFilters` | Query, categoría, tema y etiqueta; se normalizan con la función existente. |
| `draft` | `EditingDraft \| null` | Reutiliza el contrato vigente; nunca se descarta implícitamente. |
| `orderDraft` | `OrderDraft \| null` | Reutiliza posiciones y revisiones vigentes. |
| `overlay` | `OverlayState` | Como máximo un diálogo modal activo. |
| `announcement` | `UiAnnouncement \| null` | Último mensaje relevante para live region; no sustituye errores visibles. |

### UiPhase

```text
booting -> ready
booting -> failed
ready -> mutating -> ready
ready -> mutating -> failed
failed -> booting                 # reintento seguro
```

Cada transición conserva el contexto que no resulte inválido. `mutating` deshabilita únicamente acciones duplicables relacionadas y debe exponer texto de progreso.

### WorkspaceMode

Valores: `note`, `order`, `trash`, `empty`.

- `note` requiere categoría o borrador de nota activo.
- `order` requiere categoría activa y usa el `OrderDraft` correspondiente.
- `trash` puede abrirse sin categoría.
- `empty` explica la ausencia de selección o contenido y presenta una siguiente acción pertinente.

## OverlayState

Unión discriminada que reemplaza `<dialog>`, `confirm()` y `prompt()` dispersos.

| Variante | Datos mínimos | Regla de cierre/confirmación |
|---|---|---|
| `none` | — | No hay contenido modal montado. |
| `categoryForm` | modo, categoría opcional, trigger | Valida campos antes de cerrar. |
| `topicForm` | modo, categoría, topic opcional, trigger | Valida campos antes de cerrar. |
| `unsavedChanges` | destino pendiente, trigger | Foco inicial en “Seguir editando”; descartar es explícito. |
| `destructiveConfirmation` | entidad, nombre, consecuencias, confirmación requerida, trigger | Foco inicial en cancelar; no cierra mientras la mutación está pendiente. |
| `markdownInput` | comando, valor inicial, trigger | Cancela sin modificar selección; confirma y devuelve foco al editor. |

Todos los overlays tienen título visible, descripción, control de cierre seguro y referencia lógica al disparador. Al cerrar, el foco vuelve al disparador o al siguiente elemento lógico si aquel dejó de existir.

## ControlContract

Inventario de migración de cada familia de control.

| Campo | Tipo | Reglas |
|---|---|---|
| `surface` | `string` | Explorer, outline, editor, estructura, orden, preview o papelera. |
| `existingControl` | `string` | Nombre funcional, no selector CSS. |
| `targetPrimitive` | `string \| 'specialized'` | Componente shadcn seleccionado o excepción explícita. |
| `states` | `ReadonlyArray<ControlState>` | Incluye cada estado aplicable. |
| `accessibleName` | `string` | Coincide con el texto visible cuando existe. |
| `exceptionRationale` | `string \| undefined` | Obligatorio si `targetPrimitive` es `specialized`. |
| `automatedEvidence` | `ReadonlyArray<string>` | IDs/nombres de tests por rol/estado. |
| `manualEvidence` | `ReadonlyArray<string>` | Checks que axe/Playwright no pueden probar. |

### ControlState

Valores aplicables: `normal`, `hover`, `focus-visible`, `disabled`, `busy`, `success`, `warning`, `error`, `selected`, `expanded`, `empty`.

- El estado nunca se comunica solo por color.
- `busy` evita duplicación, mantiene nombre/purpose comprensible y anuncia progreso.
- `error` se asocia al campo o grupo con texto de corrección.
- Los targets interactivos miden al menos 24×24 CSS px o cumplen una excepción de espaciado válida.

## SemanticTheme

Contrato de tokens consumido por componentes shadcn y layout propio.

| Rol | Propósito |
|---|---|
| `background` / `foreground` | Superficie general y texto principal. |
| `card` / `card-foreground` | Paneles y agrupaciones elevadas. |
| `popover` / `popover-foreground` | Menús, selects y overlays no modales. |
| `primary` / `primary-foreground` | Acción principal única por contexto. |
| `secondary` / `secondary-foreground` | Acciones ordinarias alternativas. |
| `muted` / `muted-foreground` | Contexto secundario que conserva contraste AA. |
| `accent` / `accent-foreground` | Hover/selección no destructiva. |
| `destructive` | Acción o mensaje destructivo, acompañado de texto/icono. |
| `border`, `input`, `ring` | Límites, controles y foco visible. |
| `success`, `warning` | Feedback semántico adicional, siempre con texto. |

Cada rol tiene valor claro y oscuro, contraste documentado y señal equivalente cuando `prefers-reduced-motion: reduce` desactiva transiciones.

## UiAnnouncement

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | `string` | Cambia para anuncios consecutivos incluso si el texto coincide. |
| `kind` | `'status' \| 'error'` | `status` es no interruptivo; `error` se usa solo para fallo que requiere atención. |
| `message` | `string` | Claro, contextual, sin stack, ruta absoluta ni detalle interno. |
| `relatedControlId` | `string \| undefined` | Permite llevar foco a la acción correctiva cuando aplica. |

Los cambios de conteo por búsqueda, carga, guardado, fallo y reordenamiento usan live regions. No se anuncia cada pulsación ordinaria ni cada actualización automática de preview.

## PerformanceBaseline

Artefacto versionado de medición anterior a la migración.

| Campo | Tipo | Reglas |
|---|---|---|
| `sourceRevision` | `string` | Commit exacto de la UI anterior. |
| `capturedAt` | `string` ISO-8601 | Fecha/hora de captura. |
| `environment` | `PerformanceEnvironment` | Equipo, OS, Node, navegador, viewport, build y fixture. |
| `warmupRuns` | `number` | Exactamente 5 salvo justificación registrada. |
| `sampleRuns` | `number` | Al menos 30 por métrica primaria. |
| `metrics` | `ReadonlyArray<PerformanceMetric>` | Una entrada por carga/interacción crítica. |

### PerformanceMetric

| Campo | Tipo | Reglas |
|---|---|---|
| `name` | `string` | Identificador estable de escenario. |
| `unit` | `'ms'` | Comparación de tiempo bruto. |
| `cacheMode` | `'cold' \| 'warm'` | Carga inicial es cold; interacciones usan sesión warm. |
| `median` | `number` | Mediana del baseline. |
| `p95` | `number` | Percentil 95 del baseline. |
| `samples` | `ReadonlyArray<number>` | Datos crudos para diagnosticar dispersión. |

La versión candidata pasa cuando, para cada métrica, `candidate.median <= baseline.median * 1.10` y `candidate.p95 <= baseline.p95 * 1.10`. Bytes JS, requests y long tasks se guardan como diagnóstico, no sustituyen estas condiciones.

## BrowserAcceptanceRecord

| Campo | Tipo | Reglas |
|---|---|---|
| `browser` | `'Chrome' \| 'Firefox' \| 'Safari' \| 'Edge'` | Navegador real, no solo motor equivalente. |
| `version` | `string` | Debe ser N o N−1 estable en la fecha registrada. |
| `operatingSystem` | `string` | Incluye versión; Safari se valida en macOS. |
| `executedAt` | `string` ISO-8601 | Evidencia fechada por release. |
| `criticalFlows` | `Readonly<Record<string, 'pass' \| 'fail'>>` | Categorías, temas, notas y estados compartidos. |
| `wcagManualChecks` | `Readonly<Record<string, 'pass' \| 'fail' \| 'not-applicable'>>` | No se omiten criterios aplicables. |
| `evidence` | `ReadonlyArray<string>` | Reportes, trazas o capturas sin datos sensibles. |

Una release solo cumple SC-010 cuando existen registros `pass` para las dos versiones estables más recientes de cada navegador objetivo.
