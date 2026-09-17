# Quickstart: Validación del administrador local

## Prerrequisitos

- Node.js 22.12 o superior.
- Dependencias instaladas con `npm install` desde la raíz.
- Chromium de Playwright disponible.
- Una copia de trabajo limpia o contenido fixture para no mezclar las pruebas manuales con notas reales.

Los resultados esperados se definen en [content-files.md](./contracts/content-files.md), [local-admin-api.md](./contracts/local-admin-api.md) y [admin-ui.md](./contracts/admin-ui.md).

## Gates automatizados

Desde la raíz del repositorio:

```bash
npm run validate:content
npm run check
npm run test:unit
npm run test:admin
npm run test:e2e
npm run build
npm run verify:public-build
```

Resultado esperado: todos terminan con código 0; el contenido permanece válido; los tests de fallo prueban rollback; y `dist/` no contiene administración, endpoints de escritura ni runtime local.

## Inicio local

```bash
npm run admin
```

Abrir la dirección `http://127.0.0.1:<puerto>/` que imprime el proceso.

Resultado esperado: el administrador carga únicamente mientras el comando está activo. Intentar acceder desde otra interfaz de red, Host u Origin se rechaza. Detener el comando elimina toda disponibilidad administrativa sin afectar al sitio público.

## Escenario 1: Crear una nota escrita completa

1. Seleccionar una categoría con tema disponible y activar “Nueva nota”.
2. Completar título, descripción, duración, categoría, tema, posición y al menos una etiqueta.
3. Escribir Markdown mediante teclado y toolbar, añadir una imagen válida y texto alternativo.
4. Confirmar que la preview refleja metadatos, contenido e imagen antes de guardar.
5. Guardar y ejecutar `npm run validate:content`.

Resultado esperado: se crea un único Markdown válido en la ruta informada y una copia byte a byte de la imagen bajo `assets/`; el archivo usa la referencia relativa; la nota aparece en el explorador y en el sitio público después del build.

## Escenario 2: Validación sin efectos parciales

1. Preparar un borrador con campo obligatorio vacío, topic de otra categoría o posición ya ocupada.
2. Adjuntar una imagen válida.
3. Intentar guardar.
4. Repetir con imagen de tipo no admitido y con una imagen cuyo destino colisiona.

Resultado esperado: cada intento muestra el error junto al campo, conserva el formulario y no cambia ningún archivo activo. El upload staged puede corregirse o descartarse; nunca sobrescribe un recurso.

## Escenario 3: Categorías, temas y orden global

1. Crear una categoría con sus campos obligatorios y dos temas.
2. Crear notas con y sin tema.
3. Abrir la vista de orden y mover temas/notas solo con Tab, Enter y Space.
4. Guardar el orden.

Resultado esperado: cada movimiento anuncia la posición y mantiene el foco; el resultado persiste posiciones contiguas y únicas en la unión de temas/notas; solo cambian el JSON y frontmatters informados; el sitio público conserva su secuencia global.

## Escenario 4: Dependencias de eliminación

1. Intentar eliminar un tema que una nota referencia.
2. Intentar eliminar una categoría con notas.
3. Reasignar explícitamente las dependencias y repetir.

Resultado esperado: los dos primeros intentos responden conflicto, enumeran contenido relacionado y no modifican archivos. Tras reasignar y validar, la eliminación permitida cambia solo el archivo correspondiente.

## Escenario 5: Edición existente y cambio externo

1. Abrir una nota existente y modificar etiqueta/cuerpo sin guardar.
2. Verificar advertencia al seleccionar otro elemento y elegir “Seguir editando”.
3. Modificar el mismo Markdown por fuera del administrador.
4. Intentar guardar el borrador.

Resultado esperado: se recibe un conflicto de revisión; la versión externa no se sobrescribe y el borrador permanece visible para comparar o copiar. Al recargar, el administrador muestra la versión externa.

## Escenario 6: Fallo durante una transacción

1. Ejecutar la prueba de integración que inyecta un fallo después del primer rename de un reordenamiento multifichero.
2. Reiniciar el administrador contra ese fixture.
3. Ejecutar `npm run validate:content` sobre el fixture recuperado.

Resultado esperado: rollback o recuperación de startup restaura una versión completa; no queda archivo parcial presentado como válido y el journal finalizado se limpia.

## Escenario 7: Papelera, restauración y purga

1. Mover una nota con imagen local a papelera.
2. Confirmar que ya no aparece en contenido activo ni ocupa posición.
3. Restaurarla y verificar Markdown, metadatos, posición e imagen.
4. Volver a enviarla a papelera e intentar la eliminación definitiva sin la confirmación requerida; después confirmar correctamente.

Resultado esperado: el primer borrado es recuperable; restaurar conserva todos los datos y renumera sin colisiones; la purga incompleta se bloquea; la confirmada elimina solo el bundle y no destruye assets activos compartidos.

## Escenario 8: Búsqueda, estados vacíos y contenido inválido

1. Buscar por título y por etiqueta, combinando categoría/tema.
2. Usar una consulta sin resultados y limpiar filtros.
3. Ejecutar contra un fixture sin categorías/notas.
4. Abrir un fixture con JSON o frontmatter inválido.

Resultado esperado: los filtros conservan contexto; el vacío ofrece salida clara; el repositorio vacío dirige a crear categoría; el archivo inválido se identifica por ruta/campo sin sobreescritura ni detalle técnico crudo.

## Escenario 9: Accesibilidad crítica

Recorrer solo con teclado: crear categoría/tema/nota, usar toolbar, seleccionar/crear etiqueta, mover orden, corregir error, previsualizar y guardar. Repetir los diálogos de cambios sin guardar y papelera.

Resultado esperado: foco siempre perceptible y en orden; labels/estados/errores se anuncian; los diálogos atrapan y devuelven foco; ninguna operación depende de puntero o color; no aparece overflow horizontal en el ancho mínimo soportado.

## Escenario 10: Aislamiento de la entrega pública

1. Detener `npm run admin`.
2. Ejecutar `npm run build` y `npm run verify:public-build`.
3. Servir el `dist/` público y probar `/admin`, endpoints administrativos y rutas públicas existentes.

Resultado esperado: no existe capacidad administrativa ni archivos exclusivos en la entrega; `/admin` no resuelve; categorías, búsqueda, notas escritas/videos y navegación actual continúan funcionando.
