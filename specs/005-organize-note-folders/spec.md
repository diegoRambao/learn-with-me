# Feature Specification: Organización de notas en carpetas

**Feature Branch**: `main`

**Created**: 2026-09-15

**Status**: Approved

**Input**: User description: "Organizar los archivos Markdown de notas en varias carpetas sin cambiar sus URLs públicas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organizar notas por grupos (Priority: P1)

Como autor del sitio, quiero guardar cada nota dentro de una carpeta organizativa para mantener una colección creciente de Markdown fácil de explorar.

**Why this priority**: La organización del contenido es el objetivo principal y debe funcionar antes de cualquier compatibilidad adicional.

**Independent Test**: Se puede añadir una nota válida bajo una carpeta y comprobar que se publica en la categoría declarada.

**Acceptance Scenarios**:

1. **Given** una nota dentro de una carpeta válida, **When** se publica el contenido, **Then** aparece en la categoría indicada por su metadata.
2. **Given** una nota movida entre carpetas sin cambiar su nombre ni categoría, **When** se vuelve a publicar, **Then** conserva la misma dirección pública.

---

### User Story 2 - Detectar ubicaciones inválidas (Priority: P2)

Como autor del sitio, quiero recibir errores claros si una nota está suelta o demasiado anidada para corregir su ubicación antes de publicar.

**Why this priority**: Una regla verificable evita que la organización vuelva a degradarse con el tiempo.

**Independent Test**: Se puede validar contenido ubicado en la raíz, a un nivel y a varios niveles, y comprobar que solo el nivel permitido es aceptado.

**Acceptance Scenarios**:

1. **Given** una nota directamente en la raíz de notas, **When** se valida, **Then** la publicación se bloquea indicando la ubicación inválida.
2. **Given** una nota con más de una carpeta padre, **When** se valida, **Then** la publicación se bloquea indicando la profundidad inválida.
3. **Given** una carpeta cuyo nombre no es un slug, **When** se valida, **Then** la publicación se bloquea con un mensaje accionable.

---

### User Story 3 - Reutilizar nombres entre categorías (Priority: P3)

Como autor del sitio, quiero poder usar el mismo nombre de archivo en categorías diferentes cuando represente una nota distinta, sin crear conflictos entre sus direcciones públicas.

**Why this priority**: Permite nombres breves y naturales sin perder la identidad contextual de cada ruta de aprendizaje.

**Independent Test**: Se pueden validar dos notas homónimas en categorías diferentes y confirmar que cada una tiene una dirección distinta.

**Acceptance Scenarios**:

1. **Given** dos notas con el mismo nombre de archivo y categorías diferentes, **When** se publican, **Then** ambas quedan disponibles bajo sus respectivas categorías.
2. **Given** dos notas con el mismo nombre de archivo y la misma categoría, **When** se validan, **Then** la publicación se bloquea por producir la misma dirección.

### Edge Cases

- Una carpeta puede tener cualquier nombre semántico, pero debe ser un slug no vacío.
- El nombre de archivo continúa siendo el identificador público y también debe ser un slug.
- Imágenes y recursos dentro de una subcarpeta de recursos no se interpretan como notas.
- Mover una nota no modifica su orden: la posición declarada continúa gobernando la ruta de aprendizaje.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada nota DEBE residir exactamente dentro de una carpeta bajo el directorio de notas.
- **FR-002**: El nombre de la carpeta y el nombre de la nota DEBEN ser slugs no vacíos.
- **FR-003**: La carpeta DEBE servir únicamente para organización y NO DEBE determinar la categoría visible.
- **FR-004**: La categoría declarada por la nota DEBE continuar determinando su ruta de aprendizaje.
- **FR-005**: La dirección pública de una nota DEBE depender de su categoría declarada y del nombre del archivo, no de su carpeta.
- **FR-006**: Mover una nota entre carpetas DEBE conservar su dirección pública mientras no cambien su categoría ni su nombre.
- **FR-007**: Dos notas PUEDEN compartir nombre cuando declaran categorías diferentes.
- **FR-008**: Dos notas con el mismo nombre y categoría DEBEN bloquear la publicación con un error accionable.
- **FR-009**: Las notas sueltas o con más de una carpeta padre DEBEN bloquear la publicación.
- **FR-010**: Las notas existentes DEBEN migrarse a carpetas organizadas por sus categorías actuales sin alterar metadata, orden ni contenido.
- **FR-011**: Los recursos relativos de una nota migrada DEBEN continuar mostrándose correctamente.
- **FR-012**: La navegación, búsqueda y direcciones existentes DEBEN conservar su comportamiento observable.

### Key Entities

- **Carpeta de notas**: Agrupación editorial de un solo nivel cuyo nombre es libre y no afecta la experiencia pública.
- **Nota**: Contenido Markdown cuyo identificador público es el nombre del archivo y cuya categoría proviene de su metadata.
- **Identidad pública**: Par formado por categoría e identificador de nota; debe ser único porque determina una dirección pública.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las notas existentes queda organizado dentro de una carpeta y conserva su dirección pública anterior.
- **SC-002**: El 100% de las ubicaciones inválidas contempladas bloquea la publicación con la ruta del archivo y una corrección accionable.
- **SC-003**: Dos notas homónimas en categorías distintas se publican correctamente en dos direcciones independientes.
- **SC-004**: Todas las rutas de aprendizaje, resultados de búsqueda y recursos visuales existentes continúan disponibles después de la migración.
- **SC-005**: Un autor puede determinar la ubicación válida de una nota a partir de la documentación en menos de un minuto.

## Assumptions

- Solo se admite un nivel obligatorio de carpetas para archivos Markdown de notas.
- Las carpetas son organizativas y no tienen que coincidir con la categoría declarada.
- Las carpetas iniciales usarán los identificadores de categoría actuales.
- No se añade una interfaz para crear, mover o mostrar carpetas.
- Cambiar el nombre del archivo o la categoría puede cambiar la dirección pública y queda fuera de la garantía de compatibilidad de esta funcionalidad.
