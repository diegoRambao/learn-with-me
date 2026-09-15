# Quickstart: Validar búsqueda transversal de contenido

## Prerrequisitos

- Rama `004-content-search` activa.
- Node.js 22.12 o posterior y dependencias del proyecto instaladas.
- Consultar [data-model.md](./data-model.md) para campos y reglas, y [contracts/search-ui.md](./contracts/search-ui.md) para el comportamiento observable.

## 1. Validar contrato editorial

```bash
npm run validate:content
```

Resultado esperado: todas las categorías tienen descripción; todas las notas tienen descripción y al menos una etiqueta no vacía; el comando termina con “Contenido y configuración válidos.”

Prueba negativa dirigida:

1. Usar los fixtures inválidos automatizados, sin modificar contenido publicado.
2. Ejecutar `npm run test:unit -- validation.test.ts`.
3. Confirmar que los problemas identifican archivo y campo para categoría sin descripción, nota sin etiquetas, arreglo vacío y etiqueta vacía.

## 2. Verificar tipos, unidad y build

```bash
npm run check
npm run test:unit
npm run build
```

Resultados esperados:

- No hay errores de Astro ni TypeScript.
- Normalización iguala `CSS`/`css` y `categoría`/`categoria`.
- Las consultas parciales funcionan.
- Una consulta multi-token exige todos los tokens, permite distribuirlos entre campos y no depende del orden.
- Caracteres distintos de tildes se tratan literalmente.
- Una coincidencia en varios campos o etiquetas genera un solo resultado.
- El filtrado conserva el orden canónico de categorías y notas.
- El build sigue siendo estático y no requiere backend ni servicio externo.

## 3. Ejecutar flujo end-to-end

```bash
npm run test:e2e -- search.spec.ts
```

Resultados esperados:

1. Desde home, categorías y detalle de nota existe un control “Buscar categorías y notas”.
2. Buscar `css` navega a `/buscar/?q=css`, conserva el valor y separa coincidencias en “Categorías” y “Notas”.
3. Recargar y abrir directamente esa URL reproduce los mismos resultados.
4. Buscar términos distribuidos, por ejemplo uno en título y otro en etiqueta de la misma nota, incluye esa nota; faltar un token la excluye.
5. Variantes con mayúsculas y tildes devuelven los mismos IDs.
6. Un resultado que coincide por título, descripción y etiqueta aparece una vez.
7. Cada categoría muestra nombre, descripción e imagen; cada nota muestra título, descripción, todas sus etiquetas e imagen de categoría.
8. Cada enlace abre su ruta canónica publicada.
9. Si solo coincide un tipo, la otra sección comunica cero coincidencias; si no coincide ninguno, aparece el estado vacío sin tarjetas ficticias.
10. Consulta vacía o de espacios no ejecuta matching, presenta orientación y permite corregirla.
11. Forzar una imagen inexistente activa `/category-fallback.svg` sin perder texto ni destino.

## 4. Validar teclado, anuncios y responsive

Con Playwright o una sesión local:

```bash
npm run dev
```

- Recorrer con Tab desde el enlace de salto hasta input, submit, navegación y resultados; confirmar foco visible y orden lógico.
- Confirmar con Enter y verificar que el estado actualizado es anunciado sin salto de foco arbitrario.
- A 320 px, comprobar que header, consulta, descripciones, etiquetas y enlaces envuelven y que `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- Repetir en temas claro, oscuro y sistema; texto, foco y estados conservan contraste y significado.

## 5. Validar presupuesto de respuesta

La prueba E2E ejecuta al menos 50 consultas representativas y registra cada duración desde la confirmación del formulario —incluida la navegación— hasta la actualización visible. Ordenar las duraciones y verificar que el percentil 95 sea menor de 2000 ms. La prueba no debe observar solicitudes de contenido o servicios externos después de cargar `/buscar/`.

## Criterio de aprobación

La feature está lista para implementación completada cuando `validate:content`, `check`, unitarias, E2E y build aprueban; las URLs reproducen resultados; los contratos de ambos tipos se cumplen; los estados inválidos/vacíos son comprensibles; y el recorrido de teclado funciona sin overflow a 320 px.
