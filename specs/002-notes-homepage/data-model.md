# Data Model: Portada de notas y selector de tema

Esta feature no añade datos editoriales persistentes ni modifica `Category` o `Note`. Define dos modelos derivados o locales sobre datos existentes.

## HomeCategoryPreview

Proyección inmutable de las categorías ordenadas que se presentan en `/`.

| Campo | Tipo | Derivación y reglas |
|---|---|---|
| `primary` | `ReadonlyArray<Category>` | Primeras tres categorías como máximo |
| `teaser` | `ReadonlyArray<Category>` | Categorías cuarta a sexta como máximo |

### Invariantes

1. `primary.length` está entre 0 y 3.
2. `teaser.length` está entre 0 y 3.
3. `primary.length + teaser.length` nunca supera 6.
4. Si la entrada tiene tres categorías o menos, `teaser` está vacío.
5. Si la entrada tiene cuatro o más, `primary` contiene exactamente tres.
6. Ningún `Category.id` aparece más de una vez en la proyección.
7. El orden relativo de entrada se conserva en ambos grupos.
8. No se crean categorías, tarjetas ni destinos ficticios.
9. La entrada no se muta.

### Tabla de estados por conteo

| Categorías publicadas | Principal | Atenuada | Omitidas de portada |
|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 |
| 1 | 1 | 0 | 0 |
| 2 | 2 | 0 | 0 |
| 3 | 3 | 0 | 0 |
| 4 | 3 | 1 | 0 |
| 5 | 3 | 2 | 0 |
| 6 | 3 | 3 | 0 |
| 7 o más | 3 | 3 | total menos 6 |

### Relaciones

- Cada elemento referencia una `Category` válida del modelo existente.
- Cada tarjeta usa el destino canónico derivado por `categoryUrl(category.id)`.
- Las categorías omitidas continúan disponibles en `/categorias/`; no se eliminan ni despublican.

## ThemePreference

Estado local que expresa cómo se elige la apariencia.

| Campo | Tipo | Valores y reglas |
|---|---|---|
| `mode` | enum | `system`, `light`, `dark`; `system` es el fallback |
| `resolvedScheme` | valor derivado | `light` o `dark`; proviene del sistema cuando `mode=system`, o del modo explícito |
| `persisted` | boolean derivado | Indica si el navegador aceptó guardar la preferencia; no se muestra como estado de negocio |

`resolvedScheme` no se persiste: es una consecuencia visual del modo y de la preferencia vigente del dispositivo.

### Validación

- Solo `system`, `light` y `dark` son valores válidos.
- Ausencia, cadena vacía, valor desconocido o error de lectura se interpreta como `system`.
- Un error al escribir no revierte el cambio de la visita actual.
- La preferencia no contiene identidad, datos personales ni información de cuenta.

### Transiciones

```text
sin valor / inválido / lectura fallida
              └──> system ── cambio del SO ──> resolvedScheme actualizado
                     │
                     ├── elegir light ──> light ── cambio del SO ──> sin efecto
                     │                        └── elegir system ──> system
                     │
                     └── elegir dark ───> dark ── cambio del SO ──> sin efecto
                                              └── elegir system ──> system
```

### Precedencia

1. Una selección válida `light` o `dark` prevalece sobre el sistema.
2. `system` delega siempre en la preferencia actual del dispositivo.
3. Si no se puede recuperar una selección, se usa `system`.

## Estado de presentación de la portada

El componente de muestra deriva su estado únicamente de `HomeCategoryPreview`:

- **empty**: ambos grupos vacíos; muestra mensaje comprensible y CTA al catálogo.
- **primary-only**: `primary` contiene 1–3 y `teaser` está vacío; no renderiza fade vacío.
- **with-teaser**: `primary` contiene 3 y `teaser` contiene 1–3; renderiza gradiente decorativo y CTA elevado.

El estado visual no se persiste y no modifica las categorías fuente.

