# Contract: Portada e identidad visual

## Propósito y jerarquía de contenido

La ruta `/` entrega HTML completo sin depender de JavaScript y presenta, en este orden conceptual:

1. Una introducción que explica que el sitio comparte conocimientos adquiridos en la maestría en didáctica de las matemáticas con enfoque en educación de personas adultas, guiados por educación popular y aprendizaje significativo.
2. Una explicación de uso: elegir una categoría según su nivel, recorrer las notas en el orden propuesto y consumir cada nota escrita o de video.
3. Tres beneficios visibles: aprendizaje estructurado y organizado, contenido de calidad y actualizado, y aprendizaje desde la experiencia del autor.
4. Un índice navegable de categorías.
5. Los enlaces sociales reales configurados por el autor, cuando existan.

Los títulos y landmarks permiten saltar directamente al contenido principal y reconocer cada sección. La portada no incluye administración, registro, perfiles de estudiante ni capacidades ajenas al aprendizaje.

## Índice responsive de categorías

- Se construye desde todas las categorías válidas, ordenadas por nombre normalizado y luego por ID.
- Cada elemento usa un enlace ordinario a `/categorias/{categoryId}/` y muestra nombre y nivel.
- En pantallas amplias aparece en un landmark `<nav>` lateral etiquetado “Categorías”, a la izquierda del contenido introductorio.
- En pantallas estrechas, un botón disclosure con nombre accesible y `aria-expanded` revela la misma lista; Enter y Espacio alternan su estado.
- Ambas presentaciones conservan exactamente el mismo orden, etiquetas y destinos, sin duplicar rutas de foco.
- La navegación no usa roles `menu` o `menubar`; esos patrones se reservan para interfaces de aplicación.

## Enlaces sociales

- Solo se renderizan entradas válidas de `siteConfig.socialLinks`; si el array está vacío, se omite la región social.
- Cada enlace identifica la red y el destino mediante texto descriptivo o icono con nombre accesible equivalente.
- Los enlaces se abren en la misma pestaña de forma predeterminada. Si una decisión posterior exige nueva pestaña, el texto visible y accesible debe advertirlo y el enlace debe incluir `rel="noopener"`.
- Ningún icono, color o tooltip es la única fuente del nombre del enlace.

## Sistema visual

- La referencia a Vercel se limita a claridad, contraste, jerarquía, espacio, bordes sutiles y composición moderna; el sitio conserva tipografía, paleta, contenido, ilustraciones e identidad propios.
- La base es oscura, con superficies casi negras diferenciables y una paleta restringida de acentos para acciones, foco y elementos destacados.
- El texto normal mantiene contraste mínimo 4.5:1; texto grande, límites de controles, iconos funcionales, foco y estados esenciales mantienen al menos 3:1 respecto de colores adyacentes.
- Estado activo, error, nivel o destino no dependen solo del color; se combinan con texto, forma, icono, peso o subrayado.
- Existe foco visible, orden de tabulación lógico, enlace “Saltar al contenido” y objetivos interactivos de al menos 24 × 24 píxeles CSS o separación equivalente.

## Movimiento

- El estado estático es la base funcional y visual.
- Solo bajo `prefers-reduced-motion: no-preference` se habilitan transiciones cortas de opacidad, color y transformaciones pequeñas en hover, foco o disclosures.
- Bajo `prefers-reduced-motion: reduce` se eliminan desplazamiento, escalado, parallax, scroll suave y movimiento no esencial; los cambios de estado son inmediatos.
- No existen animaciones automáticas continuas, flashes, movimiento ligado al scroll ni contenido que espere una animación para estar disponible.
- El movimiento nunca comunica información por sí solo ni bloquea enlaces, controles o lectura.

## Estados de resiliencia

- Sin categorías: la introducción, instrucciones y beneficios permanecen visibles; el índice muestra un estado vacío y no crea enlaces inexistentes.
- Sin redes configuradas: se omite la región social sin mensajes de error ni placeholders.
- Con JavaScript deshabilitado: contenido, enlaces sociales y navegación a categorías siguen disponibles; solo las mejoras de disclosure o filtrado pueden perder comportamiento dinámico.
