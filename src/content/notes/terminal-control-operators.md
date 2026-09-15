---
title: Operadores de control en la terminal.
description: Algunos de los operadores mas utilizados para controlar el flujo de ejecución de comandos en la terminal.
category: terminal
durationMinutes: 2
position: 3
format: written
---

Los operadores de control en la terminal son herramientas poderosas para automatizar tareas. Aquí algunos ejemplos de uso en el día a día:

1. **Secuencial**: `comando1; comando2` ejecuta ambos comandos uno tras otro. Si necesitas hacer un respaldo y luego limpiar archivos temporales.

2. **Condicional**: `comando1 && comando2` solo ejecuta `comando2` si `comando1` es exitoso. Ideal para instalar un software y verificar su éxito antes de proceder a configuraciones adicionales.

3. **Or**: `comando1 || comando2` ejecuta `comando2` solo si `comando1` falla. Útil para manejar errores, como crear un log si un archivo no se encuentra.

Estos ejemplos muestran cómo estos operadores pueden simplificar tareas y mejorar la eficiencia en la línea de comandos.
