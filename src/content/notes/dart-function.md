---
title: Funciones
description: Usa funciones para no repetir codigo en tu app de dart.
category: dart
durationMinutes: 10
position: 3
format: written
---

Las funciones en Dart son bloques de código reutilizables que realizan una tarea específica. Como las funciones son **objetos de primera clase**, pueden asignarse a variables, enviarse como argumentos y devolverse desde otras funciones.

### Sintaxis básica

Una función puede declarar un tipo de retorno, un nombre, una lista de parámetros y un cuerpo:

```dart
int sumar(int a, int b) {
  return a + b;
}
```

En este ejemplo:

- `int` es el tipo de retorno.
- `sumar` es el nombre de la función.
- `a` y `b` son parámetros de tipo `int`.
- `return` devuelve el resultado.

Si la función no devuelve un valor, se utiliza `void`:

```dart
void mostrarMensaje(String mensaje) {
  print(mensaje);
}
```

### Omisión de tipos

Dart permite omitir algunas anotaciones de tipo:

```dart
sumar(a, b) {
  return a + b;
}
```

Aunque este código es válido, los parámetros sin anotación se tratan como `dynamic`, lo que reduce la ayuda del analizador estático. Por claridad y seguridad, es recomendable declarar los tipos, especialmente en APIs públicas.

### Funciones flecha

Cuando una función contiene una sola expresión, puede escribirse con la sintaxis flecha (`=>`):

```dart
int multiplicar(int a, int b) => a * b;
```

Esta sintaxis equivale a:

```dart
int multiplicar(int a, int b) {
  return a * b;
}
```

> Después de `=>` solo puede existir una expresión, no un bloque de instrucciones.

### Parámetros de una función

Los parámetros pueden ser posicionales o nombrados. Además, pueden ser obligatorios, opcionales o tener valores predeterminados.

#### Parámetros posicionales obligatorios

Se escriben directamente entre paréntesis y deben enviarse en el orden definido:

```dart
void saludar(String nombre, String saludo) {
  print('$saludo, $nombre');
}

void main() {
  saludar('Ana', 'Hola');
}
```

### Parámetros posicionales opcionales

Se escriben entre corchetes (`[]`). Si no tienen un valor predeterminado, deben aceptar `null`:

```dart
void saludar(String nombre, [String? saludo]) {
  print('${saludo ?? 'Hola'}, $nombre');
}

void main() {
  saludar('Ana');
  saludar('Ana', 'Buenos días');
}
```

También pueden tener un valor predeterminado:

```dart
void saludar(String nombre, [String saludo = 'Hola']) {
  print('$saludo, $nombre');
}
```

### Parámetros nombrados opcionales

Se escriben entre llaves (`{}`). Al invocar la función, se indica el nombre de cada argumento:

```dart
void saludar({String? nombre, String? saludo}) {
  print('${saludo ?? 'Hola'}, ${nombre ?? 'amigo'}');
}

void main() {
  saludar(nombre: 'Ana', saludo: 'Buenas tardes');
}
```

### Parámetros nombrados con valores predeterminados

```dart
void saludar({String nombre = 'amigo', String saludo = 'Hola'}) {
  print('$saludo, $nombre');
}

void main() {
  saludar();
  saludar(nombre: 'Ana');
}
```

### Parámetros nombrados obligatorios

La palabra clave `required` obliga a proporcionar el argumento:

```dart
void crearUsuario({required String nombre, required String correo}) {
  print('Usuario: $nombre — $correo');
}

void main() {
  crearUsuario(
    nombre: 'Ana',
    correo: 'ana@ejemplo.com',
  );
}
```

### Funciones como objetos de primera clase

Una función puede asignarse a una variable, pasarse como argumento o devolverse desde otra función.

#### Asignar una función a una variable

```dart
int Function(int) duplicar = (int numero) => numero * 2;

void main() {
  print(duplicar(4)); // 8
}
```

#### Pasar una función como argumento

```dart
void ejecutarOperacion(
  int a,
  int b,
  int Function(int, int) operacion,
) {
  print('Resultado: ${operacion(a, b)}');
}

int sumar(int a, int b) => a + b;

void main() {
  ejecutarOperacion(3, 4, sumar); // Resultado: 7
}
```

#### Devolver una función

```dart
int Function(int) crearMultiplicador(int factor) {
  return (int numero) => numero * factor;
}

void main() {
  final triplicar = crearMultiplicador(3);
  print(triplicar(5)); // 15
}
```

### Funciones anónimas

Las funciones anónimas, también llamadas _lambdas_ o _closures_, no tienen nombre y suelen utilizarse como argumentos de otras funciones:

```dart
void main() {
  final numeros = [1, 2, 3];
  final duplicados = numeros.map((numero) => numero * 2).toList();

  print(duplicados); // [2, 4, 6]
}
```

### Funciones recursivas

Una función recursiva se invoca a sí misma hasta alcanzar una condición de salida:

```dart
int factorial(int numero) {
  if (numero < 0) {
    throw ArgumentError('El número no puede ser negativo');
  }

  if (numero <= 1) {
    return 1;
  }

  return numero * factorial(numero - 1);
}

void main() {
  print(factorial(5)); // 120
}
```

### Funciones asíncronas

Las funciones asíncronas utilizan `async` y normalmente devuelven un `Future<T>`. La palabra clave `await` permite esperar el resultado de una operación asíncrona:

```dart
Future<String> obtenerDatos() async {
  await Future.delayed(const Duration(seconds: 1));
  return 'Datos obtenidos';
}

Future<void> main() async {
  final datos = await obtenerDatos();
  print(datos);
}
```

### Tipos de función y `typedef`

Un tipo de función describe los parámetros que recibe una función y el valor que devuelve:

```dart
int Function(int, int) operacion = (int a, int b) => a + b;
```

Si el mismo tipo se utiliza varias veces, puede declararse un alias con `typedef`:

```dart
typedef Operacion = int Function(int a, int b);

int ejecutar(Operacion operacion, int a, int b) {
  return operacion(a, b);
}

int sumar(int a, int b) => a + b;

void main() {
  print(ejecutar(sumar, 3, 4)); // 7
}
```

### Buenas prácticas

- Declara tipos explícitos en las APIs públicas.
- Usa nombres que describan la acción realizada, como `obtenerUsuario` o `calcularTotal`.
- Mantén cada función enfocada en una sola responsabilidad.
- Prefiere funciones flecha únicamente para expresiones cortas y fáciles de leer.
- Utiliza parámetros nombrados cuando mejoren la claridad de la llamada.
- Agrega `required` cuando un parámetro nombrado sea indispensable.

### Referencias

- [Funciones en Dart](https://dart.dev/language/functions)
- [Typedefs en Dart](https://dart.dev/language/typedefs)
- [Programación asíncrona: `Future`, `async` y `await`](https://dart.dev/libraries/async/async-await)
- [DartPad](https://dartpad.dev/)
