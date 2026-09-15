---
title: Comandos GREP y FIND para busquedas avanzadas.
description: Algunos de los comandos mas utilizados para realizar busquedas avanzadas en la terminal.
tags: [terminal, grep, find, búsqueda]
category: terminal
durationMinutes: 5
position: 2
format: written
---

El comando `grep` (Global Regular Expression Print) es una herramienta poderosa para buscar patrones de texto en archivos.

- **Sintaxis básica:** `grep [opciones] patrón [archivo(s)]`
- **Opciones comunes:**
  - `-i`: Ignora mayúsculas/minúsculas
  - `-r`: Búsqueda recursiva en directorios
  - `-l`: Solo muestra nombres de archivos (no el contenido)
  - `-n`: Muestra números de línea
  - `-v`: Muestra líneas que NO coinciden con el patrón
  - `-c`: Cuenta el número de coincidencias
  - `-A n`: Muestra n líneas después de la coincidencia
  - `-B n`: Muestra n líneas antes de la coincidencia
- **Casos de uso comunes:**
  - Búsqueda de texto en archivos: `grep "error" archivo.log`
  - Búsqueda recursiva en directorios: `grep -r "función" /ruta/proyecto`
  - Filtrar salida de otros comandos: `ls -la | grep ".txt"`
  - Contar ocurrencias: `grep -c "warning" archivo.log`

El comando `find` se utiliza para buscar archivos y directorios en una jerarquía de directorios basándose en diversos criterios.

- **Sintaxis básica:** `find [ruta] [expresión]`
- **Opciones comunes:**
  - `-name`: Busca por nombre de archivo (acepta wildcards)
  - `-type`: Busca por tipo (f=archivo, d=directorio)
  - `-size`: Busca por tamaño
  - `-mtime`: Busca por tiempo de modificación
  - `-user`: Busca por propietario
  - `-exec`: Ejecuta un comando sobre los archivos encontrados
  - `-not`, `-and`, `-or`: Operadores lógicos
- **Casos de uso comunes:**
  - Buscar archivos por nombre: `find /home -name "*.txt"`
  - Buscar directorios: `find /var -type d -name "log*"`
  - Buscar archivos modificados en los últimos 7 días: `find /home -mtime -7`
  - Buscar archivos grandes: `find /var -size +10M`
  - Ejecutar comando en archivos encontrados: `find . -name "*.tmp" -exec rm {} \\;`
  - Buscar archivos con permisos específicos: `find /etc -perm 644`
