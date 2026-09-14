# Quickstart Validation: Portada de notas y selector de tema

Esta guía se ejecutará después de implementar las tareas de la feature.

## Prerequisitos

- Node.js 22 o superior
- npm compatible con `package-lock.json`
- Navegadores de Playwright instalados

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

Resultado esperado: todos los comandos terminan con código 0 y `dist/` conserva la salida estática de la portada, catálogo y notas.

## Cobertura automatizada

### Proyección de categorías con Vitest

Ejecutar:

```bash
npm run test:unit
```

La suite debe cubrir entradas de 0, 1, 2, 3, 4, 5, 6 y 7 categorías según [data-model.md](./data-model.md): máximos 3+3, orden estable, IDs únicos, cero placeholders, URLs canónicas y ausencia de mutación.

### Portada y tema con Playwright

Ejecutar:

```bash
npm run test:e2e -- tests/e2e/homepage.spec.ts
```

Con las cuatro categorías actuales, debe comprobar:

- tres tarjetas principales y una atenuada, todas únicas y en el orden esperado;
- ausencia de sidebar de categorías;
- CTA principal y “Explorar más rutas” con destino `/categorias/`;
- copy sobre apuntes personales, estudio y utilidad compartida;
- ausencia en el contenido principal de las palabras clase/clases/curso/cursos como oferta;
- tarjeta atenuada y CTA enfocables, clicables y visibles;
- reflow móvil sin scroll horizontal y contenido íntegro con movimiento reducido;
- selector etiquetado Tema con Sistema, Claro y Oscuro;
- apariencia del sistema en una visita limpia, override explícito, recarga, retorno a Sistema, valor inválido y almacenamiento bloqueado;
- contraste del texto en ambos temas y foco visible.

Los proyectos configurados de escritorio, móvil y movimiento reducido deben continuar pasando.

## Validación manual end-to-end

Iniciar la salida de producción:

```bash
npm run build
npm run preview
```

### Escenario 1: Posicionamiento y acceso principal

1. Abrir `/` en una sesión limpia.
2. Confirmar que el primer bloque explica que el autor guarda y comparte apuntes de lo que estudia y que pueden ayudar a otras personas a estudiar o repasar.
3. Revisar todo el contenido principal y confirmar que no presenta academia, clases ni cursos como oferta.
4. Confirmar que el CTA central es visualmente prioritario, tiene texto comprensible y abre `/categorias/`.
5. Verificar que propósito, instrucciones y beneficios siguen presentes.

### Escenario 2: Muestra de cuatro categorías reales

1. Confirmar que aparecen tres rutas principales y una ruta en el grupo atenuado.
2. Verificar que no hay nombres repetidos y que los destinos coinciden con el catálogo.
3. Navegar con Tab por la tarjeta atenuada y el CTA; el foco debe permanecer visible y el gradiente no debe bloquear clics.
4. Activar “Explorar más rutas” y confirmar que abre `/categorias/`.

### Escenario 3: Límites visuales de contenido

Validar mediante un fixture de build o una copia controlada del contenido, sin alterar datos de producción:

- 0 categorías: estado vacío, cero tarjetas y CTA conservado;
- 1–3: solo grupo principal;
- 4–5: tres principales y una o dos atenuadas;
- 6: tres principales y tres atenuadas;
- 7 o más: la portada mantiene seis y el catálogo contiene todas.

La regla funcional ya debe estar cubierta automáticamente por Vitest; esta revisión confirma únicamente la composición visual de los extremos.

### Escenario 4: Tema Sistema

1. Eliminar la preferencia local del sitio.
2. configurar el dispositivo en Claro y abrir cualquier página: el selector indica Sistema y la apariencia es clara.
3. Cambiar el dispositivo a Oscuro sin recargar: la apariencia cambia y el selector continúa en Sistema.
4. Repetir en portada, catálogo y una nota para confirmar cobertura completa.

### Escenario 5: Temas explícitos y persistencia

1. Elegir Claro, configurar el dispositivo en Oscuro y recargar: la interfaz sigue clara y el selector indica Claro.
2. Elegir Oscuro, configurar el dispositivo en Claro y recargar: la interfaz sigue oscura y el selector indica Oscuro.
3. Elegir Sistema y cambiar nuevamente el dispositivo: la interfaz vuelve a seguirlo.
4. Bloquear almacenamiento local: seleccionar Claro u Oscuro funciona en la página actual, no muestra un error técnico y una visita nueva puede volver a Sistema.

### Escenario 6: Accesibilidad y responsive

1. Recorrer el encabezado y la portada solo con teclado; el skip link sigue siendo el primer foco y el selector se opera con teclas nativas.
2. Verificar en Claro y Oscuro contraste mínimo 4.5:1 para texto y 3:1 para foco, bordes e iconos funcionales.
3. Revisar a 320 px y con reflow equivalente a 200%: no hay desplazamiento horizontal obligatorio.
4. Activar movimiento reducido: no se pierde contenido ni funcionalidad y las transiciones no esenciales desaparecen.

## Validación de resultados de usabilidad

- **SC-001**: Mostrar la portada 20 segundos; al menos 90% identifica apuntes personales compartidos y no academia/cursos.
- **SC-002**: Al menos 95% abre el catálogo en menos de 10 segundos.
- **SC-005**: Al menos 90% interpreta que el fade anticipa más categorías.
- **SC-009**: Al menos 90% cambia entre los tres modos y reconoce el activo en menos de 15 segundos.

## Revisión constitucional final

Confirmar que la implementación conserva Astro/Tailwind/TypeScript, fuentes versionadas, salida estática, navegación por categorías, identidad propia, mensajes no técnicos, nombres `camelCase`/`PascalCase`, funciones inmutables y ausencia de backend, base de datos, clases o capas preventivas.

