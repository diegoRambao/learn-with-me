# Phase 0 Research: Portada de notas y selector de tema

## Decisión 1: Conservar la arquitectura Astro estática

**Decision**: Resolver la feature con los componentes Astro existentes, Tailwind/CSS y scripts TypeScript pequeños en el navegador, sin framework cliente, backend ni dependencias nuevas.

**Rationale**: El contenido y las rutas ya se prerenderizan correctamente. La muestra es una transformación de un array y el tema es una preferencia local; ninguna necesidad requiere hidratación compleja o servicios. La decisión cumple el stack constitucional y reduce superficie de fallo.

**Alternatives considered**:

- Incorporar React, Vue o un store global: añade estado y JavaScript innecesarios.
- Resolver tema en servidor o con cookies: la salida es estática y la preferencia es anónima y local.
- Añadir una librería de temas: duplica capacidades pequeñas disponibles con CSS y APIs del navegador.

## Decisión 2: Proyección pura de tres rutas principales y hasta tres atenuadas

**Decision**: Añadir una función pura `createHomeCategoryPreview` que recibe las categorías ya ordenadas y devuelve `primary` con posiciones 0–2 y `teaser` con posiciones 3–5. Nunca muta la entrada, duplica categorías, crea placeholders ni devuelve más de seis.

**Rationale**: Centraliza FR-008 y FR-011, hace explícitos los casos 0–6+ y permite probar exhaustivamente los conteos sin cambiar archivos de contenido usados por el build E2E.

**Alternatives considered**:

- Cortar arrays directamente dentro del componente: funciona visualmente, pero reduce la prueba de límites y mezcla reglas con presentación.
- Añadir un campo editorial `featured`: amplía el esquema de categoría fuera del alcance.
- Clonar o eliminar nodos durante Playwright: probaría DOM artificial, no la lógica de producción.

## Decisión 3: Reutilizar la tarjeta del catálogo con jerarquía semántica configurable

**Decision**: Usar `CategoryCard.astro` para ambos contextos y permitir que el consumidor elija el nivel de encabezado válido; el catálogo conserva su nivel actual y la muestra usa el nivel subordinado al título de sección.

**Rationale**: Mantiene imagen, fallback, nivel, nombre y URL canónica en una sola presentación sin romper la jerarquía de encabezados.

**Alternatives considered**:

- Duplicar el marcado para la portada: crea divergencias de accesibilidad y estilo.
- Reutilizar `HomeCategoryIndex`: sus semánticas de sidebar/disclosure no corresponden a una muestra de tarjetas.
- Usar texto sin encabezado en las tarjetas: dificulta explorar la estructura con tecnología de asistencia.

## Decisión 4: Sustituir el sidebar por un flujo central content-first

**Decision**: `index.astro` deja de renderizar `HomeCategoryIndex` y compone, en una sola columna amplia, introducción, CTA central, muestra de rutas y contenido complementario. `HomeIntroduction.astro` se reescribe para hablar de apuntes personales, cómo usarlos y sus beneficios, sin describir la oferta como clases, cursos o academia.

**Rationale**: Cumple el posicionamiento solicitado y mantiene la obligación constitucional de explicar propósito, forma de uso y beneficios. Un enlace HTML ordinario a `/categorias/` sigue funcionando sin JavaScript.

**Alternatives considered**:

- Restilizar el índice lateral: conserva una estructura que la spec elimina explícitamente.
- Reducir la portada a hero y tarjetas: omite información exigida por la constitución.
- Copiar composición, textos o activos de midu.dev: contradice la identidad propia establecida en spec y constitución.

## Decisión 5: Fade decorativo sin reducir la accesibilidad del contenido

**Decision**: Atenuar el grupo `teaser` mediante un gradiente decorativo que no recibe eventos de puntero. Las tarjetas continúan en el árbol accesible y son enfocables; el CTA se coloca en una capa separada y legible. Cuando el grupo recibe foco, el efecto se relaja si fuera necesario para preservar contraste y foco.

**Rationale**: Aplicar opacidad al grupo completo degradaría texto, imágenes y foco. El gradiente comunica continuidad sin convertir tarjetas reales en controles inaccesibles.

**Alternatives considered**:

- `opacity` sobre toda la segunda fila: puede incumplir contraste y debilitar el foco.
- Ocultar las tarjetas con `aria-hidden`, `visibility` o `display`: contradice la muestra solicitada y bloquea navegación.
- Deshabilitar enlaces atenuados: presenta rutas reales que no pueden abrirse y crea una experiencia inconsistente.

## Decisión 6: Responsive por flujo, no por duplicación

**Decision**: Mantener el orden DOM `primary → teaser → CTA`, usar una columna en pantallas estrechas y hasta tres columnas cuando haya espacio, sin carrusel ni desplazamiento horizontal.

**Rationale**: La misma estructura funciona con teclado, lectores de pantalla y distintos viewports. “Fila” es una agrupación conceptual; no se fuerza una cuadrícula de tres columnas en móvil.

**Alternatives considered**:

- Carrusel horizontal móvil: dificulta descubrir contenido y puede ocultar el CTA.
- Dos árboles de tarjetas para desktop y móvil: duplica enlaces y rutas de foco.

## Decisión 7: Preferencia de tema de tres estados en el elemento raíz

**Decision**: Representar la elección mediante `data-theme="system|light|dark"` en `<html>`. Sistema es el valor inicial; Claro y Oscuro son overrides explícitos. Un valor persistido ausente o inválido se normaliza a Sistema.

**Rationale**: Un único atributo permite que todos los tokens compartidos respondan de forma consistente y hace observable el estado para pruebas sin crear un store cliente.

**Alternatives considered**:

- Botón binario claro/oscuro: no representa Sistema.
- Clases `dark` dispersas por componente: facilita temas parciales y multiplica variantes.
- Guardar únicamente el tema efectivo: impediría distinguir Sistema y seguir cambios del dispositivo.

## Decisión 8: Sistema resuelto por CSS y tokens semánticos

**Decision**: Definir tokens semánticos de fondo, superficie, borde, texto, texto atenuado, acento y foco. Claro y Oscuro asignan valores explícitos; Sistema usa `prefers-color-scheme` para escogerlos. Los colores literales actuales se migran donde impidan que toda la interfaz compartida cambie.

**Rationale**: CSS responde automáticamente a cambios del sistema mientras esa opción está activa y mantiene las elecciones explícitas aisladas. Los tokens semánticos evitan invertir nombres oscuros como `ink-950` y romper texto sobre acentos.

**Alternatives considered**:

- Escuchar `matchMedia` y recalcular todos los estilos con JavaScript: duplica capacidades nativas y añade ciclo de vida.
- Mantener tokens oscuros y sobrescribir componentes individuales: eleva el riesgo de contraste inconsistente.
- Tema claro como simple inversión: produce colores e imágenes impredecibles.

## Decisión 9: Arranque temprano y persistencia local tolerante a fallos

**Decision**: Ejecutar en el `<head>` de `BaseLayout.astro` un script inline mínimo que valida la preferencia local y fija `data-theme` antes del contenido visual. El control aplica el cambio inmediatamente e intenta persistirlo dentro de `try/catch`; si el almacenamiento falla, conserva el estado durante la página actual y una nueva visita vuelve a Sistema.

**Rationale**: Evita el destello de una apariencia incorrecta, satisface persistencia en el mismo navegador y trata almacenamiento bloqueado como degradación esperada, no como error visible.

**Alternatives considered**:

- Script de módulo diferido: puede ejecutarse después del primer pintado.
- Fallar cuando `localStorage` no está disponible: contradice el edge case definido.
- Sincronización entre pestañas: no está requerida y añade listeners/estado adicional.

## Decisión 10: Selector nativo accesible en el encabezado

**Decision**: Usar un `<select>` etiquetado “Tema” con opciones Sistema, Claro y Oscuro dentro del encabezado compartido. Su valor se sincroniza con `data-theme`; el cambio conserva el foco y no necesita anuncios adicionales.

**Rationale**: El control nativo ofrece selección, teclado y anuncio por lector de pantalla sin reconstruir patrones de menú, radio o gestión de foco.

**Alternatives considered**:

- Menú desplegable personalizado: exige apertura, cierre, Escape, click-outside y foco administrado.
- Tres botones genéricos: necesitan estado presionado y agrupación comprensible.
- Radios: son válidos, pero ocupan más espacio en el menú principal sin aportar valor funcional adicional.

## Decisión 11: Pruebas por capas con contenido real estable

**Decision**: Probar con Vitest la matriz de conteos 0–7 y las invariantes de la proyección; usar Playwright sobre las cuatro categorías actuales para integración, copy, DOM, URLs, fade, CTA, tema, persistencia, responsive, teclado y contraste. Documentar pruebas manuales o por fixture de build para el estado visual vacío y seis o más rutas.

**Rationale**: El servidor E2E se construye una vez desde contenido real y no dispone de un loader de fixtures. La separación comprueba toda la regla de conteo sin introducir una puerta de pruebas en producción.

**Alternatives considered**:

- Infraestructura Astro separada para cada conteo: aumenta desproporcionadamente el alcance.
- Modificar contenido versionado antes de cada build: hace las pruebas frágiles y arriesga el workspace.
- Limitarse a Playwright con cuatro categorías: deja sin verificar los límites puros de FR-008 y FR-011.

## Resolución de incógnitas

No quedan decisiones técnicas pendientes. El stack, archivos afectados, orden, conteos, semántica, tema, precedencia, persistencia, fallbacks, responsive y estrategia de pruebas están definidos sin excepciones constitucionales.
