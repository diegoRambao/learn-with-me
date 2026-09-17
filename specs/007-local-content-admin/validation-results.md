# Resultados de validación: Administrador local de contenido

**Fecha**: 2026-09-17  
**Entorno**: macOS, Node.js 24, Chromium de Playwright  
**Datos**: fixtures aislados bajo `.content-admin/e2e-repository` y directorios temporales; no se usó contenido activo para las mutaciones.

## Escenarios del quickstart

| # | Escenario | Resultado | Evidencia reproducible |
| --- | --- | --- | --- |
| 1 | Crear una nota escrita completa | PASS | `admin-content.spec.ts` crea metadatos, Markdown e imagen byte a byte, comprueba preview y path; `create-note-api.test.ts` cubre además la variante video. |
| 2 | Validación sin efectos parciales | PASS | `admin-content.spec.ts`, `create-note-api.test.ts` y `uploads-api.test.ts` conservan el borrador y rechazan grafo, tipo, tamaño, colisión y destino existentes sin escritura activa parcial. |
| 3 | Categorías, temas y orden global | PASS | `admin-structure.spec.ts`, `structure-api.test.ts` y `order-draft.test.ts` crean/editan estructura, mueven con controles nativos y persisten una secuencia única. |
| 4 | Dependencias de eliminación | PASS | El recorrido de estructura y sus contratos API obtienen `topic_has_notes`/`category_has_notes`, conservan archivos y permiten continuar tras resolver dependencias. |
| 5 | Edición existente y cambio externo | PASS | `admin-maintenance.spec.ts` conserva el borrador, retorna foco desde el diálogo y rechaza una revisión obsoleta sin sobrescribir el cambio externo. |
| 6 | Fallo durante una transacción | PASS | `file-transaction.test.ts` inyecta fallo después del primer rename, verifica rollback byte a byte y simula reinicio para recuperar y limpiar un journal `committing`. |
| 7 | Papelera, restauración y purga | PASS | `admin-trash.spec.ts` y `trash-api.test.ts` verifican bundle exacto con recursos, exclusión activa, restore no destructivo, colisión y confirmación exacta de purga. |
| 8 | Búsqueda, estados vacíos y contenido inválido | PASS | `admin-maintenance.spec.ts`, `content-filters.test.ts` y `content-repository.test.ts` cubren filtros combinados, cero resultados, repositorio parcial e issues por ruta/campo. |
| 9 | Accesibilidad crítica | PASS | `admin-accessibility.spec.ts` recorre teclado, toolbar, foco visible, error anunciado, captura/retorno del diálogo y ausencia de overflow horizontal a 320 px. |
| 10 | Aislamiento de la entrega pública | PASS | `public-build-isolation.spec.ts`, `local-boundary.test.ts` y `verify-public-build.ts` comprueban 404 de `/admin`, rutas públicas, loopback/Origin/token y ausencia de runtime o identificadores admin en `dist/`. |

## Ajustes reproducibles realizados durante la validación

- Playwright inicia Astro mediante sus APIs `dev` y `preview` en procesos que controla directamente. Esto conserva el comportamiento del 404 público y garantiza el cierre de los puertos 4321/4322 al finalizar.
- La suite administrativa desactiva paralelismo entre archivos para que la medición de inventario no compita con otras pruebas intensivas de filesystem. Con 100 categorías y 1.000 notas, la carga medida fue de aproximadamente 570 ms; filtro y mutación permanecieron por debajo de 1 s y el debounce se verificó en 300 ms exactos.
- Las mutaciones E2E se ejecutan una vez en el proyecto desktop contra el fixture reinicializado. Los recorridos públicos continúan en desktop, mobile y reduced-motion.

## Gates finales

Los comandos normativos se ejecutaron desde la raíz con Node.js 24:

```text
npm run validate:content       PASS
npm run check                  PASS (0 errores)
npm run test:unit              PASS (78 pruebas)
npm run test:admin             PASS (53 pruebas)
npm run test:e2e               PASS (154 pruebas; 14 skips intencionales de duplicados admin)
npm run build                  PASS
npm run verify:public-build    PASS
```
