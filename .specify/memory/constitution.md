<!--
Sync Impact Report
- Version change: documento sin versión -> 1.0.0
- Modified principles:
  - Naturaleza del Proyecto -> I. Aprendizaje Abierto y Reutilizable
  - Reglas de Dominio y Lógica de Negocio -> II. Descubrimiento por Categorías
  - Reglas de Dominio y Lógica de Negocio -> III. Contrato de las Notas
  - Stack Tecnológico -> IV. Stack TypeScript Basado en Contenido
  - Estructura y Estilo de Código -> V. Simplicidad y Código Funcional
- Added sections:
  - Restricciones de Interfaz, Errores y Validación
  - Flujo de Desarrollo Dirigido por Especificaciones
  - Governance
- Removed sections: ninguna; el contenido vigente fue reorganizado en la plantilla activa.
- Follow-up TODOs: ninguno.
-->
# Constitución de la Página Web de Notas de Estudio

## Core Principles

### I. Aprendizaje Abierto y Reutilizable

El producto DEBE publicar notas personales de estudio para que otras personas puedan aprender con
ellas y para que su autor pueda utilizarlas como material de repaso. La página principal DEBE
explicar con claridad este propósito, los beneficios del sitio y la forma de usarlo. Todo contenido
o flujo incluido DEBE contribuir directamente a descubrir, estudiar o repasar las notas; cualquier
capacidad ajena a esos objetivos requiere una enmienda de esta constitución o una justificación
explícita en la especificación correspondiente.

### II. Descubrimiento por Categorías

La navegación principal DEBE incluir un acceso a las categorías. La vista de categorías DEBE
mostrar los temas disponibles, como Flutter, AWS, SDD o Dart. Al seleccionar una categoría, el
sistema DEBE listar únicamente sus notas y presentarlas como una secuencia de aprendizaje similar
a un curso cuyas notas funcionan como clases. Este modelo es obligatorio porque convierte una
colección creciente de archivos en una ruta de estudio comprensible.

### III. Contrato de las Notas

Cada nota DEBE declarar, como mínimo, un título, una categoría y una duración estimada de lectura.
El título DEBE ser el identificador visible en los listados de categoría. El contenido escrito DEBE
almacenarse como un archivo Markdown versionado en el mismo repositorio; añadir una nota implica
añadir su archivo al repositorio. Una nota PUEDE representar un video y, en ese caso, DEBE declarar
el recurso de YouTube necesario y mostrar el reproductor en la página de detalle. Los campos
adicionales solo se incorporan cuando una especificación aprobada demuestra su necesidad.

### IV. Stack TypeScript Basado en Contenido

La interfaz DEBE implementarse con Astro, Tailwind CSS y TypeScript. TypeScript DEBE utilizarse en
todo código del proyecto. Los archivos Markdown constituyen la fuente persistente de las notas y
DEBEN renderizarse desde el repositorio, sin introducir una base de datos externa. No se DEBE crear
un backend por defecto. Si una especificación demuestra que una capacidad no puede resolverse de
forma estática o con Astro, el backend DEBE limitarse a Node.js con Express y documentar por qué es
necesario.

### V. Simplicidad y Código Funcional

La solución DEBE evitar la sobreingeniería, Clean Architecture y patrones complejos que no estén
exigidos por una necesidad documentada. Cuando existan esas responsabilidades, la estructura DEBE
mantenerse plana y reconocible mediante `/frontend`, `/backend` y `/db`; no se crearán directorios
vacíos para capas que el producto no necesite. La implementación DEBE priorizar funciones y datos
inmutables. Las clases solo se permiten cuando una API del stack las exige o cuando la
especificación justifica su ventaja. Las funciones y variables DEBEN usar `camelCase`; las
interfaces y los tipos DEBEN usar `PascalCase`.

## Restricciones de Interfaz, Errores y Validación

- La experiencia visual completa DEBE tomar como referencia la claridad, el contraste, la
  composición y el acabado del sitio de Vercel, manteniendo identidad y contenido propios.
- La página principal DEBE ser llamativa sin sacrificar legibilidad, navegación ni acceso al
  contenido educativo.
- La interfaz NUNCA DEBE exponer errores técnicos crudos, detalles internos ni trazas de pila. Cada
  fallo visible DEBE traducirse a un mensaje claro, contextual y accionable para la persona usuaria.
- Si existe un backend, sus respuestas DEBEN emplear códigos HTTP semánticos. Como mínimo, debe
  usar `400` para entradas inválidas, `401` para solicitudes no autenticadas y `409` para conflictos
  de estado cuando esos casos sean aplicables.
- Las validaciones DEBEN ejecutarse en el límite donde ingresan los datos y DEBEN conservar el
  detalle técnico en canales internos, nunca en el contenido presentado al usuario.

## Flujo de Desarrollo Dirigido por Especificaciones

- `spec.md` es la fuente de verdad para el alcance funcional de cada cambio. La implementación
  DEBE limitarse estrictamente al comportamiento documentado y aprobado allí.
- Está prohibido crear código sombra o capacidades preventivas. Pagos, perfiles complejos y
  cualquier función no solicitada NO DEBEN implementarse "por si acaso".
- Antes de modificar código, el agente o la persona implementadora DEBE comprobar que el cambio
  respeta esta constitución y la especificación vigente.
- Si una solicitud contradice esta constitución o presenta una falla lógica que impide cumplirla,
  el trabajo DEBE detenerse antes de tocar el código. La contradicción DEBE comunicarse y resolverse
  mediante una actualización explícita de la especificación o una enmienda constitucional.
- Toda revisión DEBE verificar el contrato de contenido, el stack autorizado, la experiencia de
  errores, la nomenclatura y la ausencia de complejidad no justificada.

## Governance

Esta constitución prevalece sobre especificaciones, planes, tareas y decisiones de implementación.
Una enmienda DEBE documentar el cambio, su razón, su impacto sobre artefactos existentes y cualquier
plan de migración necesario. La enmienda entra en vigor únicamente después de la aprobación explícita
del responsable del proyecto y de la actualización de este archivo.

Las versiones siguen Semantic Versioning: MAJOR para eliminar o redefinir de forma incompatible un
principio; MINOR para añadir principios, secciones o ampliar materialmente las obligaciones; PATCH
para aclaraciones sin cambio normativo. Toda especificación y revisión de código DEBE comprobar el
cumplimiento constitucional. Las excepciones temporales DEBEN quedar justificadas, delimitadas y
fechadas en la especificación afectada; una excepción permanente requiere enmendar esta constitución.

**Version**: 1.0.0 | **Ratified**: 2026-09-14 | **Last Amended**: 2026-09-14
