---
id: que-es-una-spec
title: ¿Que es una Spec?
description: >-
  Aprende porque una spec suele ser mucho mas escalable que solamente ir
  iterando solo con prompts
tags:
  - sdd
  - spec
  - especificacion
  - promt
category: sdd
durationMinutes: 5
position: 2
format: written
body: >





  Imagina que como desarrollador alguien te pide la siguiente tarea: "Agrega una
  forma de organizar las notas por temas" mientras estas desarrollando la tarea
  de esta forma, pueden surgir preguntar como: ¿Se puede crear temas vacíos? ¿se
  pueden mover después? ¿Que pasa con las notas que no tienen temas? si estas
  preguntas aparecen mientras desarrollas, se podría volver un reproceso. ¿Como
  nos puede ayudar una spec a solucionar estos reprocesos que pudieran surgir en
  el desarrollo?


  ### ¿Que es una spec?


  Una **Spec**, abreviatura de *specification* o *especificación*, es un
  documento que describe el comportamiento esperado de una funcionalidad. Su
  objetivo es dejar claro **qué necesita el usuario**, **por qué lo necesita** y
  **cómo sabremos que funciona.**


  Siguiendo el ejemplo de arriba, una spec puede estar lo siguiente:


  - El usuario puede crear temas para agrupar sus notas.

  - Las notas sin tema siguen apareciendo en el listado.

  - Un tema vacío muestra el mensaje "No hay notas".

  - El usuario puede cambiar una nota de tema sin perder su contenido.


  Cada punto describe un resultado que se puede comprobar. Todavía no hace falta
  decidir qué componentes crear o cómo guardar los datos: esas decisiones
  corresponden al plan de implementación.



  ### ¿Que deberia incluir una buena spec?


  No existe una extensión obligatoria. Para una funcionalidad pequeña, puede
  bastar con una página que responda estas preguntas:


  - ¿Qué problema resolvemos?

  - ¿Quién usará la funcionalidad y qué podrá hacer?

  - ¿Qué comportamientos y casos especiales debemos contemplar?

  - ¿Qué queda fuera del alcance?

  - ¿Cómo comprobaremos que está terminada?


  Escribirla ayuda a descubrir dudas mientras todavía son fáciles de resolver.
  También da al equipo una referencia común para conversar, implementar y
  revisar el resultado.


  ### Una Spec + IA


  Cuando trabajamos con un agente de programación, una petición vaga puede
  producir código que funciona, pero que interpreta los requisitos de otra
  manera. Una spec ofrece contexto y criterios concretos para orientar el
  trabajo y evaluar lo que el agente construyó.


  Herramientas como **GitHub Spec Kit** organizan este proceso en una
  especificación, un plan técnico y una lista de tareas. Su plantilla de spec
  incluye escenarios de usuario, requisitos, casos límite y criterios de éxito.



  ### En resumen


  Una spec no tiene que ser un documento enorme ni perfecto desde el primer
  intento. Debe ser lo bastante clara para que otra persona pueda entender la
  funcionalidad y comprobar si el resultado cumple lo acordado. Antes de
  preguntar "¿cómo lo programamos?", nos ayuda a responder una pregunta más
  importante: **"¿qué queremos construir exactamente?"**
uploadTokens: []
revision: e28b9249fcd9e12d6421ca03ecf7818c3a9c11c0012159e16bfccfb1dfece33d
---






Imagina que como desarrollador alguien te pide la siguiente tarea: "Agrega una forma de organizar las notas por temas" mientras estas desarrollando la tarea de esta forma, pueden surgir preguntar como: ¿Se puede crear temas vacíos? ¿se pueden mover después? ¿Que pasa con las notas que no tienen temas? si estas preguntas aparecen mientras desarrollas, se podría volver un reproceso. ¿Como nos puede ayudar una spec a solucionar estos reprocesos que pudieran surgir en el desarrollo?

### ¿Que es una spec?

Una **Spec**, abreviatura de *specification* o *especificación*, es un documento que describe el comportamiento esperado de una funcionalidad. Su objetivo es dejar claro **qué necesita el usuario**, **por qué lo necesita** y **cómo sabremos que funciona.**

Siguiendo el ejemplo de arriba, una spec puede estar lo siguiente:

- El usuario puede crear temas para agrupar sus notas.
- Las notas sin tema siguen apareciendo en el listado.
- Un tema vacío muestra el mensaje "No hay notas".
- El usuario puede cambiar una nota de tema sin perder su contenido.

Cada punto describe un resultado que se puede comprobar. Todavía no hace falta decidir qué componentes crear o cómo guardar los datos: esas decisiones corresponden al plan de implementación.


### ¿Que deberia incluir una buena spec?

No existe una extensión obligatoria. Para una funcionalidad pequeña, puede bastar con una página que responda estas preguntas:

- ¿Qué problema resolvemos?
- ¿Quién usará la funcionalidad y qué podrá hacer?
- ¿Qué comportamientos y casos especiales debemos contemplar?
- ¿Qué queda fuera del alcance?
- ¿Cómo comprobaremos que está terminada?

Escribirla ayuda a descubrir dudas mientras todavía son fáciles de resolver. También da al equipo una referencia común para conversar, implementar y revisar el resultado.

### Una Spec + IA

Cuando trabajamos con un agente de programación, una petición vaga puede producir código que funciona, pero que interpreta los requisitos de otra manera. Una spec ofrece contexto y criterios concretos para orientar el trabajo y evaluar lo que el agente construyó.

Herramientas como **GitHub Spec Kit** organizan este proceso en una especificación, un plan técnico y una lista de tareas. Su plantilla de spec incluye escenarios de usuario, requisitos, casos límite y criterios de éxito.


### En resumen

Una spec no tiene que ser un documento enorme ni perfecto desde el primer intento. Debe ser lo bastante clara para que otra persona pueda entender la funcionalidad y comprobar si el resultado cumple lo acordado. Antes de preguntar "¿cómo lo programamos?", nos ayuda a responder una pregunta más importante: **"¿qué queremos construir exactamente?"**
