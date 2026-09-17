# Research: Administración local de contenido

## Decisión 1: Aislar el administrador como un segundo entrypoint Astro

**Decision**: Crear un root Astro bajo `admin/`, con páginas y endpoints propios, iniciado únicamente mediante `npm run admin` y enlazado a `127.0.0.1`. El `astro.config.ts`, `src/pages` y `dist/` públicos no importarán ni copiarán el árbol administrativo.

**Rationale**: La escritura necesita ejecución Node local, pero Astro ya puede resolver endpoints durante `astro dev`; no hace falta introducir Express. La separación por entrypoint es una garantía estructural y comprobable de que la ruta, JavaScript, estilos y operaciones de escritura no entran en la entrega estática pública.

**Alternatives considered**: Una ruta condicional dentro de `src/pages` puede filtrarse al build; una SPA servida por Express duplica servidor y routing; un CMS o base de datos crea una segunda fuente de verdad y contradice el alcance.

## Decisión 2: Reutilizar el contrato de dominio vigente

**Decision**: Leer categorías y notas con `node:fs` y `gray-matter`, mapearlas a los inputs inmutables existentes y ejecutar `validateContent` sobre el snapshot completo propuesto antes de escribir. Los endpoints solo traducen HTTP a funciones de dominio y resultados tipados.

**Rationale**: El esquema real exige más que el mínimo narrativo: descripción y al menos una etiqueta por nota, variantes discriminadas escrita/video, temas embebidos y posición única entre temas y notas. Reutilizar el validador impide divergencia entre el administrador y los gates de check, test y build.

**Alternatives considered**: Duplicar Zod o validaciones en formularios deriva con el tiempo; escribir mediante APIs internas de `astro:content` usa una abstracción de lectura como repositorio mutable; migrar contenido rompe compatibilidad.

## Decisión 3: Hacer de “solo local” una invariante de red y solicitud

**Decision**: Enlazar únicamente a `127.0.0.1`, aceptar `Host` y `Origin` locales conocidos, no emitir CORS permisivo y exigir en cada mutación un token CSRF aleatorio del proceso, entregado por la misma página y enviado en un header personalizado. Una solicitud sin sesión local válida responde `401` sin datos ni escritura.

**Rationale**: El loopback evita exposición de red, mientras Host/Origin y CSRF bloquean DNS rebinding y formularios cruzados contra servicios locales. Esto respeta el supuesto de un único propietario sin introducir cuentas.

**Alternatives considered**: Confiar solo en `localhost` no protege el límite HTTP; CORS por sí solo no evita solicitudes simples; autenticación y cuentas están excluidas en v1.

## Decisión 4: Derivar todas las rutas en servidor

**Decision**: El API recibirá IDs, datos y operaciones tipadas, nunca rutas arbitrarias. El servidor derivará destinos dentro de `src/content/categories`, `src/content/notes/{category}/`, su carpeta `assets` y `.content-admin/`; verificará slugs, extensiones, MIME, tamaño, contención canónica y ausencia de symlinks o traversal.

**Rationale**: Una whitelist de raíces y destinos derivados cumple FR-023 y reduce la superficie de lectura/escritura. El navegador no decide dónde se guarda un archivo.

**Alternatives considered**: Sanitizar una ruta libre es frágil; confiar solo en el nombre o MIME del navegador permite archivos disfrazados; permitir rutas absolutas excede el alcance.

## Decisión 5: Usar hashes optimistas y transacciones pequeñas con journal

**Decision**: Calcular SHA-256 de cada archivo leído y exigir sus revisiones base en toda edición, reordenamiento, envío a papelera o restauración. Serializar mutaciones en el proceso; preparar cambios en el mismo filesystem, validar el grafo staged, registrar manifest y backups, aplicar renames atómicos y ejecutar rollback ante error. Al iniciar, recuperar cualquier journal incompleto.

**Rationale**: `mtime` y tamaño pueden omitir cambios, y reordenar toca varios documentos. Un journal mínimo permite detectar edición externa, evitar sobrescritura y devolver el repositorio a su versión previa incluso cuando una operación multifichero falla.

**Alternatives considered**: `writeFile` directo puede truncar; temp más rename solo cubre un archivo; commits Git automáticos sustituyen un flujo editorial excluido; una base de datos contradice la persistencia requerida.

## Decisión 6: Modelar el orden como una secuencia global por categoría

**Decision**: Representar el borrador de orden como la unión de temas y notas de una categoría. “Subir” y “bajar” intercambian elementos adyacentes y recalculan posiciones contiguas `1..N`; “Guardar orden” confirma en una sola transacción el JSON de categoría y los frontmatters afectados.

**Rationale**: El contrato público ya exige unicidad global en `topics ∪ notes`, aunque la navegación visual agrupe notas bajo un tema. Renumerar toda la secuencia elimina huecos y duplicados sin redefinir el orden de anterior/siguiente.

**Alternatives considered**: Ordenar por tema crea espacios de posición incompatibles; resolver duplicados con un desempate oculta errores; persistir cada pulsación aumenta escrituras y hace difícil cancelar un borrador.

## Decisión 7: Copiar imágenes sin transformación mediante staging local

**Decision**: Aceptar uploads multipart hacia `.content-admin/uploads`, verificar formato admitido y límite de tamaño, conservar los bytes exactos y devolver un token efímero y un destino relativo propuesto `assets/{nombre-seguro}`. Al guardar una nota escrita, mover en la misma transacción los uploads referenciados a `src/content/notes/{category}/assets/` y persistir sus referencias Markdown. Rechazar colisiones con `409`.

**Rationale**: El staging permite vista previa y conserva el formulario si falla la validación sin publicar un recurso huérfano. Una comparación de hash prueba que el recurso final es idéntico al seleccionado.

**Alternatives considered**: Base64 en Markdown infla y desversiona el contenido; transformar o comprimir contradice FR-027; copiar antes de confirmar deja cambios parciales; sobrescribir por nombre destruye recursos.

## Decisión 8: Usar textarea Markdown, toolbar TypeScript y preview del mismo procesador

**Decision**: Implementar un `<textarea>` nativo con comandos pequeños para selección, encabezados, listas, enlaces, código, imágenes y videos. Tras un debounce, enviar título, metadatos y cuerpo a un endpoint de preview que usa `@astrojs/markdown-remark`, GFM y el plugin YouTube vigente. Mostrar el documento resultante dentro de un iframe con `sandbox` sin scripts, formularios ni navegación superior.

**Rationale**: Cumple edición directa, teclado y fidelidad suficiente sin añadir CodeMirror, Monaco ni otro motor Markdown. El sandbox impide que HTML escrito en una nota obtenga acceso a operaciones administrativas.

**Alternatives considered**: Un editor WYSIWYG contradice edición directa; un renderer cliente puede divergir del sitio; un iframe sin sandbox amplía el impacto de HTML no confiable.

## Decisión 9: Mantener la papelera fuera de las colecciones activas

**Decision**: Mover cada nota a `.content-admin/trash/notes/{trashId}/`, con manifest que conserva ruta original, hash, fecha y recursos referenciados. La restauración verifica que el destino siga libre; la eliminación permanente requiere confirmación separada. Los recursos activos solo se retiran cuando el administrador puede demostrar propiedad exclusiva; de lo contrario se conservan y el bundle de papelera registra la referencia.

**Rationale**: Fuera de `src/content`, la nota deja de publicarse y de ocupar posición sin exigir cambios a cada consumidor público. El manifest permite restaurarla con contexto y evita eliminar un recurso compartido.

**Alternatives considered**: Un flag `trashed` en frontmatter seguiría entrando en loaders existentes; la papelera del sistema operativo no es portable ni consultable; `unlink` inmediato incumple recuperación.

## Decisión 10: Verificar dominio, filesystem, UI y frontera de publicación

**Decision**: Cubrir funciones puras con Vitest; probar endpoints contra copias temporales del repositorio con fallos inyectados; recorrer creación, edición, búsqueda, preview, cambios sin guardar, orden y papelera con Playwright; y añadir una aserción que inspeccione `dist/` después del build público para comprobar ausencia de rutas, assets y cadenas administrativas.

**Rationale**: Los riesgos principales —corrupción, traversal, conflictos, accesibilidad y filtración al build— no pueden demostrarse con una sola capa de pruebas. Los fixtures temporales permiten validar igualdad de bytes, rollback y recuperación sin tocar contenido real.

**Alternatives considered**: Solo E2E vuelve opacos los fallos de transacción; solo unitarias no prueban escritura real ni exclusión del bundle; revisión manual no garantiza SC-002–SC-009.
