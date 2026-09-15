# Quickstart Validation: Lectura mejorada y navegación entre notas

Esta guía se ejecutará después de implementar las tareas de la feature.

## Prerequisitos

- Node.js 22.12.0 o superior
- npm compatible con `package-lock.json`
- Chromium de Playwright instalado

## Preparación y gate completo

```bash
npm install
npx playwright install chromium
npm run validate:content
npm run check
npm run test:unit
npm run test:e2e
npm run build
```

Resultado esperado: todos los comandos terminan con código 0 y `dist/` contiene páginas estáticas para notas escritas y de video. No se modifica ningún archivo bajo `src/content/notes/`.

## Cobertura automatizada

### Vecinos del recorrido con Vitest

```bash
npm run test:unit -- tests/unit/content-ordering.test.ts
```

Debe verificar las invariantes de [LearningRoute](./data-model.md#learningroute):

- aislamiento por categoría y orden `position` seguido de `id`;
- vecino de primera, intermedia y última nota;
- ausencia de ambos vecinos con una única nota, recorrido vacío o ID activo inválido;
- posiciones discontinuas y empate defensivo sin calcular `position ± 1`;
- una nota de video como vecina válida;
- ausencia de mutación del array de entrada.

### Contrato del componente de navegación con Astro Container

```bash
npm run test:unit -- tests/unit/note-navigation.test.ts
```

Vitest debe cargar la configuración Astro mediante `getViteConfig` y renderizar `NoteNavigation.astro` con la Container API incluida en Astro. Debe demostrar que:

- dos vecinos nulos no producen `<nav>` ni enlaces;
- solo anterior o solo siguiente producen exactamente un destino, sin control vacío;
- ambos vecinos producen dos enlaces en orden Anterior/Siguiente;
- cada enlace contiene dirección, título completo y URL canónica de la misma categoría.

### Contenido y copia con Playwright

```bash
npm run test:e2e -- tests/e2e/note-content.spec.ts
```

Sobre `/categorias/dart/dart-function/` y notas reales equivalentes debe comprobar:

- marcadores y sangría de listas simples/anidadas;
- jerarquía de encabezados, párrafos, separadores, código inline y bloques;
- `pre` contenido en el área de lectura y overflow local para líneas largas a 320 px;
- una acción nativa por bloque con nombre accesible y foco visible;
- copia exacta del bloque activado, incluidos saltos, espacios y caracteres;
- confirmación visual y `aria-live` asociada solo al bloque activado;
- rechazo o ausencia de Clipboard con mensaje no técnico, código intacto y selección manual;
- enlaces interno y externo con acento y subrayado permanente en claro y oscuro, sin cambiar sus `href`;
- ausencia de scroll horizontal en la página.

Las formas Markdown que no existen hoy en las notas publicadas —una cita, una línea garantizadamente larga y un enlace interno— se inyectan por Playwright como markup semántico exclusivo de prueba dentro del alcance `note-prose`; así se validan estilos y destinos sin crear rutas ni modificar contenido versionado.

### Navegación final con Playwright

```bash
npm run test:e2e -- tests/e2e/learning-route.spec.ts
```

La secuencia Dart existente permite validar los tres estados principales:

1. `dart-types` muestra solo Siguiente hacia la nota de video.
2. `dart-video` muestra Anterior hacia `dart-types` y Siguiente hacia `dart-function`.
3. `dart-function` muestra solo Anterior hacia la nota de video.

Cada enlace debe mostrar dirección y título completo, permanecer en `/categorias/dart/`, operar con teclado y no causar overflow móvil. El caso de una sola nota se cubre renderizando el componente con Astro Container, sin añadir contenido ficticio al repositorio.

## Validación manual end-to-end

```bash
npm run build
npm run preview
```

### Escenario 1: Lectura editorial responsive

1. Abrir `/categorias/dart/dart-function/` a anchura amplia y luego a 320 px para revisar encabezados, párrafos, separadores y código.
2. Abrir `/categorias/terminal/terminal-basic-commands/` para revisar listas anidadas: los marcadores permanecen visibles y cada nivel es reconocible.
3. Confirmar en ambas rutas que la jerarquía y el ritmo son consistentes.
4. Usar la prueba automatizada indicada arriba para `blockquote` y una línea garantizadamente larga, formas que no están publicadas hoy.
5. Repetir en Claro y Oscuro y comprobar que la paleta y tipografía siguen siendo las existentes.

### Escenario 2: Copia exitosa de varios bloques

1. Alcanzar cada botón de copia mediante Tab y confirmar foco visible.
2. Activar un bloque que contenga varias líneas e indentación.
3. Pegar en un editor de texto y comparar exactamente con el código visible.
4. Confirmar que el estado “copiado” aparece y se anuncia solo junto al bloque elegido.
5. Activar dos bloques consecutivos y comprobar que cada resultado corresponde al último control usado.

### Escenario 3: Copia no disponible

1. Bloquear el permiso de portapapeles o simular el rechazo de `navigator.clipboard.writeText`.
2. Activar Copiar.
3. Confirmar un mensaje comprensible sin detalles técnicos.
4. Verificar que el código sigue visible, intacto y seleccionado para copia manual.
5. Confirmar que enlaces, navegación final e índice lateral continúan operables.

### Escenario 4: Enlaces reconocibles

1. Abrir `/categorias/dart/dart-function/` para revisar sus enlaces externos.
2. Confirmar acento y subrayado permanente en Claro y Oscuro.
3. Recorrerlos con teclado y puntero; deben conservar identificación y foco visible.
4. Activarlos y confirmar que sus destinos y forma de apertura no cambiaron.
5. Ejecutar la prueba automatizada con el enlace interno inyectado para verificar que ambos tipos comparten presentación sin reescribir el `href`.

### Escenario 5: Recorrido escrito–video–escrito

1. Abrir `/categorias/dart/dart-types/`: solo aparece Siguiente con el título de `dart-video`.
2. Activarlo y confirmar la página de video dentro de Dart.
3. En la nota de video confirmar ambos destinos, con títulos y direcciones correctos.
4. Avanzar a `dart-function`: solo aparece Anterior hacia el video.
5. Repetir a 320 px y con teclado; títulos completos, foco y navegación permanecen disponibles sin scroll horizontal.

## Validación de resultados de usabilidad

- **SC-003**: En una prueba cronometrada, al menos 90% identifica y usa Copiar en menos de 10 segundos.
- **SC-005**: Al menos 95% identifica los enlaces como interactivos en menos de 3 segundos en ambos temas.
- **SC-007**: Al menos 90% usa Anterior/Siguiente en menos de 10 segundos al terminar la lectura.
- **SC-009**: La revisión visual confirma que todas las superficies modificadas usan exclusivamente tokens, tipografías y lenguaje visual existentes.

## Revisión constitucional final

Confirmar que la implementación conserva Astro/Tailwind/TypeScript, Markdown versionado, salida estática, navegación por categoría, identidad propia, mensajes de fallo no técnicos, funciones y datos inmutables, nomenclatura `camelCase`/`PascalCase` y ausencia de backend, base de datos, clases o capas preventivas.
