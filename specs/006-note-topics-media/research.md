# Research: Temas, videos y panel de notas

## Decisión 1: Declarar los temas dentro de cada categoría

**Decision**: Añadir `topics` como arreglo de objetos `{ id, name, position }` en cada JSON de categoría y `topic` como slug opcional en el frontmatter de cada nota. `topics` admite un arreglo vacío y cada tema se convierte en un valor de dominio que incluye el ID de su categoría propietaria.

**Rationale**: La categoría es dueña natural de sus temas, la configuración queda junto a sus demás metadatos y un tema vacío puede existir sin inventar una nota. Una referencia corta desde la nota evita duplicar nombres y posiciones. El esquema Zod valida forma local y el validador de grafo resuelve relaciones entre archivos.

**Alternatives considered**: Una tercera colección de temas añade archivos, loader y categoría repetida sin aportar persistencia distinta; derivar temas desde las notas no representa temas vacíos; incluir el objeto completo del tema en cada nota duplica metadatos y permite divergencias.

## Decisión 2: Separar la secuencia de aprendizaje de la proyección visual agrupada

**Decision**: Mantener `LearningRoute.notes` filtrada y ordenada únicamente por la posición global de las notas para elegir la nota inicial y calcular anterior/siguiente. Añadir una proyección de panel cuyo nivel raíz contiene temas y notas sin tema, ordenados por la misma posición global, y cuyos temas contienen sus notas ordenadas por esa posición.

**Rationale**: Agrupar cambia el nivel visual pero FR-025 exige conservar rutas y recorrido anterior/siguiente. Dos proyecciones inmutables del mismo grafo hacen explícita esa diferencia sin alterar URLs ni crear posiciones locales.

**Alternatives considered**: Aplanar el árbol agrupado para anterior/siguiente mezclaría temas no navegables con notas; dar posiciones independientes a hijos contradice la secuencia única; cambiar el destino inicial de categoría según el primer tema modificaría el comportamiento público actual.

## Decisión 3: Validar la integridad completa antes de publicar

**Decision**: Extender Zod y el validador puro para exigir slug, nombre y entero positivo por tema; IDs de tema únicos dentro de su categoría; referencia de nota existente en esa misma categoría; y posición única en la unión de todos los temas y notas de cada categoría. Cada conflicto debe informar ambos elementos y sus rutas. `scripts/validate-content.ts` cargará explícitamente `topics` y `topic`.

**Rationale**: Zod protege cada entrada, pero las reglas relacionales requieren ver el grafo completo. El script ya bloquea check, test y build, por lo que es el límite editorial correcto para impedir publicar relaciones o posiciones ambiguas.

**Alternatives considered**: Resolver silenciosamente por ID escondería errores editoriales; desempatar posiciones solo en la UI violaría FR-010; validar únicamente con el schema de Astro no puede comparar archivos ni categorías.

## Decisión 4: Transformar URLs de YouTube con un plugin rehype local

**Decision**: Registrar un plugin local en `unified({ gfm: true, rehypePlugins: [...] })`. Transformar solo un párrafo raíz cuyo único hijo sea un enlace y cuyo texto visible sea idéntico al `href`, con protocolo HTTP(S), host permitido e ID exacto de 11 caracteres en `watch`, `youtu.be`, `shorts` o `embed`; toda salida se canonicaliza a HTTPS. Rechazar `list`, rutas extra, protocolos no web, hosts engañosos, canales, perfiles, enlaces etiquetados y enlaces anidados en listas o citas.

**Rationale**: GFM ya convierte una URL desnuda en `<p><a>URL</a></p>`, y rehype puede sustituir ese nodo por HAST estructurado durante el build. Así el contenido llega listo, no depende de JavaScript y evita interpolar HTML no confiable.

**Alternatives considered**: Reemplazar nodos en el navegador produce cambios tardíos y vuelve el contenido dependiente de JavaScript; un plugin genérico suele reconocer más casos de los permitidos; HTML crudo amplía la superficie de inyección; un transformador remark requiere un puente más complejo para el bloque compuesto.

## Decisión 5: Canonicalizar embeds y mostrar siempre un fallback

**Decision**: Generar el iframe con `https://www.youtube-nocookie.com/embed/{id}`, título descriptivo, carga diferida, `allowfullscreen` y permisos conservadores. Renderizar siempre debajo una alternativa al `https://www.youtube.com/watch?v={id}` canónico con nueva pestaña y `noopener noreferrer`. El marco reutiliza el lenguaje visual actual y una proporción 16:9.

**Rationale**: El ID se extrae y valida antes de construir ambas URLs. Un documento no puede detectar de forma fiable todos los fallos de reproducción cross-origin; un fallback permanente garantiza una salida comprensible incluso cuando YouTube niega el embed.

**Alternatives considered**: Conservar parámetros arbitrarios no aporta valor y puede introducir comportamiento inesperado; ocultar el fallback hasta un supuesto evento de error no cubre políticas, bloqueadores ni respuestas cross-origin; incrustar el URL original dificulta garantizar seguridad y consistencia.

## Decisión 6: Usar controles HTML nativos para temas y panel

**Decision**: Renderizar cada tema como `<details>` con `<summary>` y el panel como un `<aside>` controlado por un botón nativo externo con `aria-controls` y `aria-expanded`. Los temas no forman un acordeón exclusivo: varios pueden permanecer abiertos. Las notas usan su posición real y `aria-current="page"`; un tema vacío muestra exactamente “No hay notas”.

**Rationale**: `details/summary` aporta activación por teclado y semántica expandida sin sincronización ARIA manual. El botón queda accesible cuando el aside está oculto y permite que el layout cambie de dos columnas a una. Los tokens, foco y estilos existentes cubren el lenguaje visual.

**Alternatives considered**: Botones personalizados para cada tema requieren administrar `aria-expanded` y `hidden`; un acordeón exclusivo contradice conservar varios temas abiertos; poner el toggle dentro del panel lo hace inaccesible al ocultarlo; un drawer modal móvil añade foco, backdrop y bloqueo no requeridos.

## Decisión 7: Conservar el estado durante la visita con `sessionStorage`

**Decision**: Guardar por categoría `{ visible, expandedTopicIds, navigationScrollTop }`. Sin estado válido, el servidor abre solo el tema de la nota activa. Al restaurar, se conserva el conjunto previo y se añade el tema de la nueva nota activa si estaba cerrado. Persistir toggles y desplazamiento, y tolerar almacenamiento ausente o corrupto manteniendo los defaults renderizados.

**Rationale**: La navegación actual recarga documentos estáticos, por lo que el estado DOM se perdería. `sessionStorage` coincide con “durante la misma visita”, no contamina URLs y aísla categorías. La nota activa ya queda representada por la URL canónica.

**Alternatives considered**: `localStorage` sobrevive más allá del alcance; query/hash cambia direcciones públicas y expone estado de presentación; memoria local desaparece en cada navegación; cookies o estado de servidor son innecesarios para un sitio estático.

## Decisión 8: Mantener el panel dentro del flujo en todos los tamaños

**Decision**: En escritorio, conservar el ancho vigente de 19rem cuando está visible y expandir el contenido a una columna cuando se oculta. En pantallas estrechas, mostrar u ocultar el panel arriba del contenido con el mismo control compacto, sin overlay. El área navegable puede tener scroll local para poder restaurar `scrollTop`.

**Rationale**: El layout en flujo evita bloquear el contenido o requerir focus trap, mantiene el control siempre alcanzable y satisface el viewport mínimo de 320 px. Reutiliza la cuadrícula y `min-width: 0` existentes.

**Alternatives considered**: Un drawer fijo agrega complejidad y riesgo de bloqueo; dejar el summary del panel ocupando su columna no libera todo el ancho; redimensionamiento manual está fuera de alcance.
