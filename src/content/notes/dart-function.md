---
title: Funciones
description: Usa funciones para no repetir codigo en tu app de dart.
category: dart
durationMinutes: 10
position: 3
format: written
---

Las funciones en Dart son bloques de código reutilizables que ejecutan una tarea específica. Dart es un lenguaje orientado a objetos, pero trata a las funciones como ciudadanos de primera clase: puedes asignarlas a variables, pasarlas como parámetros y devolverlas como resultado.

---

## Sintaxis Básica

<br/>

```dart
tipo nombreFuncion(parámetros) {
  // cuerpo de la función
  return valor;
}
```

<br/>

### Ejemplo:

```dart
int sumar(int a, int b) {
  return a + b;
}
```

---

## Funciones con Tipado Inferido

Si no se especifica un tipo de retorno, Dart lo infiere automáticamente.

```dart
sumar(a, b) {
  return a + b;
}
```

---

## Funciones Flecha (Arrow Functions)

Usadas para funciones de una sola línea.

```dart
int multiplicar(int a, int b) => a * b;
```

---

## Funciones con Parámetros Opcionales

### 1. Parámetros Posicionales Opcionales

```dart
void saludar(String nombre, [String? saludo]) {
  print('${saludo ?? "Hola"}, $nombre');
}
```

### 2. Parámetros Nombrados Opcionales

```dart
void saludar({String? nombre, String? saludo}) {
  print('${saludo ?? "Hola"}, ${nombre ?? "amigo"}');
}
```

### 3. Parámetros Nombrados con Valores por Defecto

```dart
void saludar({String nombre = 'amigo', String saludo = 'Hola'}) {
  print('$saludo, $nombre');
}
```

---

## Funciones como Parámetros

```dart
void ejecutarOperacion(int a, int b, int Function(int, int) operacion) {
  print('Resultado: ${operacion(a, b)}');
}

int sumar(int a, int b) => a + b;

ejecutarOperacion(3, 4, sumar); // Resultado: 7
```

---

## Funciones Anónimas (Lambdas)

```dart
var duplicar = (int x) => x * 2;
print(duplicar(4)); // 8
```

También se usan en funciones de orden superior:

```dart
var lista = [1, 2, 3];
var nuevaLista = lista.map((x) => x * 2).toList();
```

---

## Funciones Recursivas

```dart
int factorial(int n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
```

---

## Funciones Asíncronas

```dart
Future<String> obtenerDatos() async {
  await Future.delayed(Duration(seconds: 1));
  return 'Datos obtenidos';
}
```

Uso:

```dart
void main() async {
  String datos = await obtenerDatos();
  print(datos);
}
```

---

## Function Typedefs

Puedes definir un alias para un tipo de función:

```dart
typedef Operacion = int Function(int, int);

int ejecutar(Operacion op, int a, int b) => op(a, b);
```

---

## Referencias

- [Documentación oficial de Dart](https://dart.dev/guides/language/language-tour#functions)
- [DartPad para probar funciones](https://dartpad.dev/)
