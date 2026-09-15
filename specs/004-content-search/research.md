# Research: Búsqueda transversal de contenido

## Decisión 1: Ejecución estática en el navegador

**Decision**: Generar durante el build un índice inmutable con los campos buscables de ambas colecciones y prerenderizar una entrada HTML por entidad en `/buscar/`. TypeScript compilado por Astro evalúa esos registros a partir de `window.location.search` y alterna `hidden`; no crea tarjetas con HTML dinámico.

**Rationale**: El sitio ya usa `output: 'static'`; la consulta no se conoce al prerenderizar, pero el corpus es pequeño y versionado. Entradas e índice build-time mantienen el despliegue estático, reutilizan componentes Astro para escapar metadatos y construir rutas seguras, reproducen la consulta desde una URL, evitan solicitudes posteriores y respetan la prohibición constitucional de añadir backend por defecto.

**Alternatives considered**: Una función server-side permitiría renderizar por consulta, pero exige abandonar o complementar la salida estática sin necesidad. Un proveedor de búsqueda externo añade red, coste, privacidad y sincronización fuera de alcance. Generar una página por término no es posible para consultas arbitrarias.

## Decisión 2: URL y envío del formulario

**Decision**: Usar un formulario HTML `method="get"`, `action="/buscar/"`, con un input nombrado `q`. La representación canónica es `/buscar/?q=<valor codificado>`; la página lee exactamente un parámetro `q`, conserva el valor visible y no añade parámetros de estado internos.

**Rationale**: GET ofrece navegación nativa, historial, recarga y enlaces copiables. `URLSearchParams` aporta codificación y lectura estándar sin dependencia. El mismo contrato funciona desde cualquier página que monte el header.

**Alternatives considered**: Guardar la consulta solo en estado cliente rompe recarga y enlaces compartidos. Codificarla en un segmento dinámico multiplica rutas y complica espacios/caracteres. Usar hash no representa una consulta de recurso tan claramente como GET.

## Decisión 3: Normalización y semántica de coincidencia

**Decision**: Recortar la consulta, separarla por una o más unidades de espacio, normalizar cada token y cada campo con Unicode NFD, retirar marcas diacríticas Unicode y convertir a minúsculas con locale español. Un elemento coincide si cada token normalizado está incluido parcialmente en al menos uno de sus campos buscables normalizados. Los tokens repetidos se deduplican y el elemento se evalúa una vez.

**Rationale**: Implementa literalmente FR-005 y los casos `CSS`, `categoria`/`categoría`, orden libre y tokens distribuidos entre campos. La inclusión literal evita interpretar regex u operadores. Separar consulta y campos impide coincidencias accidentales creadas al concatenar el final de un campo con el inicio de otro.

**Alternatives considered**: `Intl.Collator` ayuda a comparar cadenas completas pero no resuelve inclusión parcial ni AND multi-token por sí solo. Una librería fuzzy introduciría ranking y tolerancias no solicitadas. Remover caracteres distintos de diacríticos cambiaría el requisito de tratarlos literalmente.

## Decisión 4: Orden y deduplicación

**Decision**: Construir un registro único por `type + id`. Mantener categorías en el orden canónico alfabético ya producido por `createHomeCategoryIndex`; mantener notas agrupadas por ese orden de categorías y, dentro de cada categoría, por `position` y `id`. El filtrado preserva ese orden y no calcula relevancia.

**Rationale**: El spec exige una aparición por elemento y conservar el orden estable vigente. Las claves tipadas evitan colisiones entre una categoría y una nota con el mismo slug sin añadir una segunda fase de deduplicación visible.

**Alternatives considered**: Ordenar por cantidad de campos coincidentes introduciría relevancia no solicitada. Confiar en el orden del filesystem no constituye un contrato estable. Usar un `Set` después de producir una coincidencia por campo hace trabajo y complejidad innecesarios.

## Decisión 5: Contrato editorial y significado de “publicado”

**Decision**: Añadir `description: nonEmptyText` a categorías y `tags` como arreglo no vacío de strings recortados y no vacíos a ambas variantes de nota. Ampliar los tipos, cargadores y `validateContent`; migrar todo archivo existente. En este repositorio, “publicado” significa que el archivo pertenece a una colección, supera la validación y entra al build; no se añade un flag draft.

**Rationale**: La colección actual no modela borradores. Hacer obligatorios los campos en Astro y en el validador explícito bloquea `validate:content`, tests y build con mensajes por archivo, cumpliendo FR-013–FR-015 sin crear un nuevo ciclo editorial.

**Alternatives considered**: Campos opcionales con fallback dejarían publicar resultados incompletos. Un flag `published` o `draft` ampliaría el dominio sin petición. Inferir etiquetas desde texto o categoría no satisface metadatos editoriales explícitos.

## Decisión 6: Presentación segura, accesible y resiliente

**Decision**: Prerenderizar resultados mediante componentes Astro con contenido tratado como texto, enlaces producidos por `categoryUrl`/`noteUrl` e imágenes con el fallback existente; el script cliente solo lee campos normalizados y alterna visibilidad. El área de resultados tendrá un encabezado de estado perceptible (`role="status"`, `aria-live="polite"`) y encabezados semánticos para “Categorías” y “Notas”. Consulta inicial, inválida, sección vacía y cero resultados tendrán mensajes distintos. El formulario usa label accesible, submit nativo, validación trim y foco visible.

**Rationale**: Los metadatos son contenido editorial, no HTML confiable. Las primitivas nativas reducen superficie de error y hacen operables envío y enlaces con teclado. Los estados explícitos cumplen FR-010–FR-012 y FR-016.

**Alternatives considered**: `innerHTML` es innecesario y arriesga interpretar contenido. Un componente interactivo de framework añade hidratación y dependencia. Ocultar completamente secciones vacías contradice FR-010 cuando la otra clase sí tiene resultados.

## Decisión 7: Estrategia de pruebas y rendimiento

**Decision**: Cubrir las funciones puras con Vitest (tildes, caja, parciales, AND entre campos, literalidad, consulta inválida, deduplicación y orden), la validación con fixtures incompletos y el flujo publicado con Playwright. Medir en E2E 50 consultas representativas con `performance.now()` alrededor de la actualización y verificar que la navegación total observada queda bajo 2 segundos en el entorno de prueba.

**Rationale**: La corrección del matching se prueba sin navegador, mientras Playwright valida integración real de URL, DOM, foco, fallback y viewport. El corpus se recorre linealmente y no requiere optimización especulativa.

**Alternatives considered**: Solo E2E dificulta localizar fallos algorítmicos. Benchmarks sintéticos aislados no prueban SC-008 desde confirmación. Añadir un motor indexado es desproporcionado al corpus actual.
