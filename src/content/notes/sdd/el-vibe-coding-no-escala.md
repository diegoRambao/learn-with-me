---
id: el-vibe-coding-no-escala
title: El vibe coding no escala
description: >-
  El Vibe Coding es puede ser rápido y ver resultado al instante, pero entre mas
  feature y feature puede que no escale
tags:
  - sdd
  - vibe coding
  - spec
category: sdd
durationMinutes: 5
position: 1
format: written
body: >

  https://youtu.be/T7jUQ2_9V0I


  El *vibe coding* puede llevarte de cero a una aplicación funcional en pocas
  horas. El problema comienza cuando esa aplicación debe sobrevivir a nuevos
  requisitos, nuevos desarrolladores y usuarios reales.


  La inteligencia artificial ha cambiado la manera en que escribimos software.
  Ahora es posible describir una funcionalidad en lenguaje natural, recibir una
  implementación completa, ejecutarla y solicitar ajustes hasta que el resultado
  parezca correcto.


  Esta forma de trabajar reduce enormemente la distancia entre una idea y un
  primer prototipo. Sin embargo, que una aplicación funcione hoy no significa
  que esté preparada para crecer mañana.


  El *vibe coding* funciona para comenzar rápido, pero no escala por sí solo
  porque reemplaza decisiones explícitas de ingeniería por contexto implícito,
  intuición y validaciones superficiales.


  El problema no es utilizar inteligencia artificial para programar. El problema
  aparece cuando dejamos de entender, evaluar y asumir la responsabilidad sobre
  el código que estamos construyendo.


  ## ¿Qué es realmente el vibe coding?


  El *vibe coding* es una manera de desarrollar en la que una persona describe
  lo que quiere, permite que una inteligencia artificial genere el código y
  continúa iterando principalmente según el resultado visible.


  El flujo suele parecerse a este:


  1. Se solicita una funcionalidad.

  2. La IA genera o modifica varios archivos.

  3. Se ejecuta la aplicación.

  4. Si aparece un error, se copia el mensaje y se le pide a la IA que lo
  corrija.

  5. Si la funcionalidad parece operar correctamente, se continúa con la
  siguiente.


  En este proceso no siempre se comprende por completo el código generado, las
  decisiones tomadas o sus efectos sobre el resto del sistema. La principal
  medida de éxito es que el resultado inmediato funcione.


  Eso no es lo mismo que utilizar IA como herramienta de ingeniería.


  Un desarrollador puede apoyarse en un agente para generar código, pruebas,
  documentación o refactorizaciones y, al mismo tiempo, mantener el control de
  la arquitectura, revisar las decisiones y verificar el comportamiento.


  La diferencia no está en quién escribe cada línea, sino en quién entiende y
  gobierna el sistema.


  ## Por qué funciona tan bien al comienzo


  El *vibe coding* resulta especialmente atractivo porque, durante las primeras
  etapas de un proyecto, realmente puede funcionar muy bien.


  En una aplicación pequeña existe poco contexto, hay pocas dependencias y los
  errores suelen ser visibles. Si un botón no responde, una pantalla no carga o
  una petición falla, normalmente es posible detectar el problema rápidamente.


  Además, todavía hay pocas decisiones anteriores con las cuales mantener
  coherencia.


  Esto lo convierte en una herramienta muy útil para:


  - Prototipos y pruebas de concepto.

  - Demostraciones rápidas.

  - Herramientas personales.

  - Automatizaciones pequeñas.

  - Exploraciones de interfaces.

  - Experimentos técnicos que podrían descartarse.


  En estos escenarios, la velocidad tiene un valor enorme y el costo de
  equivocarse suele ser bajo. El objetivo es descubrir si una idea merece
  continuar, no necesariamente construir desde el primer día el sistema que
  funcionará durante los próximos cinco años.


  La dificultad aparece cuando confundimos un prototipo exitoso con una base
  preparada para producción.


  ## Un prototipo es una línea; un producto es una red


  Una demostración normalmente presenta el camino ideal: el usuario entra,
  realiza una acción y obtiene un resultado. Un producto real debe contemplar
  muchos otros caminos.


  ¿Qué ocurre si la conexión se interrumpe? ¿Si el usuario no tiene permisos?
  ¿Si envía dos veces la misma solicitud? ¿Si cambia el formato de los datos?
  ¿Si una dependencia deja de responder? ¿Si es necesario migrar información
  existente? ¿Cómo se investigará un error que solamente ocurre en producción?


  A medida que el proyecto crece aparecen autenticación, autorización, estados
  intermedios, reintentos, concurrencia, integraciones, analítica,
  accesibilidad, compatibilidad, seguridad y observabilidad.


  Una funcionalidad deja de ser un bloque aislado y pasa a formar parte de una
  red de decisiones.


  La IA puede generar cada pieza por separado. El verdadero reto es garantizar
  que todas esas piezas formen un sistema coherente.


  ## Las cuatro dimensiones en las que deja de escalar


  ### 1. El código


  En proyectos pequeños, una solución local puede ser suficiente. En proyectos
  grandes, cada cambio debe respetar contratos, capas, patrones, modelos de
  datos y comportamientos existentes.


  Si cada funcionalidad se genera únicamente a partir del prompt del momento,
  empiezan a aparecer varias maneras de resolver el mismo problema: validaciones
  repetidas, servicios con responsabilidades similares, diferentes formatos de
  errores y componentes que se comportan de forma inconsistente.


  Cada implementación puede funcionar de manera individual y, aun así,
  deteriorar el sistema en conjunto.


  El código crece, pero la arquitectura no necesariamente evoluciona con él.


  ### 2. El equipo


  Un proyecto no escala solo porque soporte más usuarios. También debe permitir
  que más personas trabajen en él sin bloquearse ni introducir comportamientos
  contradictorios.


  Cuando las decisiones viven únicamente en conversaciones con una IA, el resto
  del equipo no sabe por qué se eligió determinada estructura, qué alternativas
  se descartaron o qué restricciones debían respetarse.


  Dos desarrolladores pueden solicitar la misma funcionalidad y recibir
  soluciones completamente diferentes.


  Sin convenciones compartidas, contratos claros y revisiones, el repositorio se
  convierte en una colección de respuestas correctas de manera aislada, pero
  incompatibles entre sí.


  ### 3. El tiempo


  El código no solo debe funcionar el día en que se genera. También debe poder
  entenderse y modificarse meses después.


  En ese momento, la conversación original puede haber desaparecido, el modelo
  puede haber cambiado y la persona que impulsó la funcionalidad quizá ya no
  esté en el equipo.


  Si las razones detrás de las decisiones nunca se documentaron, quien mantenga
  el sistema tendrá que reconstruirlas leyendo una implementación que
  posiblemente nadie revisó con profundidad.


  El costo no desaparece: simplemente se traslada desde la escritura inicial
  hacia la comprensión, la depuración y el mantenimiento futuro.


  ### 4. El riesgo


  En una aplicación real, los errores no siempre producen una pantalla rota.
  Algunos duplican pagos, exponen datos, conceden permisos incorrectos,
  corrompen información o fallan silenciosamente.


  Una validación visual no puede detectar todos esos problemas. Que una
  funcionalidad complete el camino feliz tampoco demuestra que sea segura,
  resistente o correcta bajo condiciones inesperadas.


  Cuanto mayor sea el impacto posible de un fallo, menos razonable resulta
  aceptar código únicamente porque “parece funcionar”.


  ## La ilusión de productividad


  El *vibe coding* produce una sensación muy fuerte de velocidad: aparecen
  pantallas, endpoints y funcionalidades completas en minutos. Pero producir más
  código no equivale necesariamente a producir más valor ni a avanzar de forma
  sostenible.


  La IA reduce considerablemente el costo de escribir código. Al mismo tiempo,
  puede aumentar el volumen que debe revisarse, probarse y comprenderse.


  Si el equipo genera cambios más rápido de lo que puede validarlos, el cuello
  de botella no desaparece; simplemente se desplaza.


  Esta es una de las razones por las que un proyecto puede avanzar de manera
  impresionante durante sus primeras semanas y luego volverse cada vez más
  difícil de modificar.


  Cada nueva funcionalidad interactúa con decisiones anteriores que se tomaron
  rápidamente, y corregir un comportamiento puede provocar otros dos problemas.


  La velocidad inicial crea una deuda que no siempre es visible en una
  demostración.


  ## El contexto implícito no es arquitectura


  Un agente de IA puede analizar muchos archivos y recibir una gran cantidad de
  contexto. Aun así, disponer de información no equivale a conocer todas las
  razones detrás de un sistema.


  Hay restricciones que no aparecen en el repositorio: acuerdos con otros
  equipos, reglas del negocio, decisiones regulatorias, incidentes anteriores,
  limitaciones operativas o funcionalidades que todavía no se han desarrollado.


  Una IA solo puede razonar sobre el contexto que tiene disponible, y ese
  contexto suele ser parcial.


  Además, un prompt es una instrucción momentánea, no una fuente duradera de
  verdad. Si una decisión importante solo existe dentro de una conversación, es
  difícil aplicarla de forma consistente en futuras sesiones o compartirla con
  todo el equipo.


  Por eso, los sistemas que escalan convierten las decisiones importantes en
  artefactos explícitos: especificaciones, contratos, pruebas, convenciones,
  diagramas y registros de decisiones arquitectónicas.


  ## El peligro de optimizar cada tarea de forma aislada


  La inteligencia artificial suele ser muy efectiva resolviendo el problema que
  tiene delante. Sin embargo, una buena solución local no siempre es una buena
  solución global.


  Imaginemos que se solicita agregar una validación a un formulario. La IA puede
  implementarla directamente en el componente y resolver la necesidad en pocos
  minutos.


  Más adelante, la misma regla se necesita en otras cuatro pantallas. Si cada
  petición se atiende de forma aislada, la validación puede terminar duplicada
  cinco veces y comportarse de manera distinta en cada lugar.


  El problema no está en ninguna de las respuestas individuales. Está en la
  ausencia de una visión del sistema que determine cuándo reutilizar, cuándo
  abstraer y dónde debe vivir realmente una regla del negocio.


  Con cinco funcionalidades, estas inconsistencias parecen pequeñas. Con
  cincuenta, comienzan a definir la arquitectura accidental del producto.


  ## Si nadie entiende el código, nadie puede revisarlo


  La revisión de código no consiste únicamente en comprobar que la aplicación
  compile. Requiere evaluar si la solución satisface el requisito correcto,
  respeta la arquitectura, maneja casos límite y no introduce riesgos
  innecesarios.


  Cuando una persona acepta una implementación que no puede explicar, también
  pierde la capacidad de revisarla de manera crítica.


  En ese punto, pedirle a otra IA que valide el código puede ser útil, pero no
  resuelve completamente el problema: ambos agentes pueden compartir supuestos
  equivocados o validar el mismo camino incompleto.


  Incluso las pruebas generadas automáticamente pueden dar una falsa sensación
  de seguridad si se construyen a partir de los mismos supuestos de la
  implementación.


  Una prueba que confirma el comportamiento equivocado sigue siendo una prueba
  que pasa.


  La IA puede ampliar nuestra capacidad de revisión, pero no reemplaza la
  necesidad de definir qué significa que una solución sea correcta.


  ## El problema no es la inteligencia artificial


  Rechazar el *vibe coding* no significa regresar a escribir manualmente cada
  línea de código.


  La inteligencia artificial es demasiado útil para ignorarla: puede acelerar
  tareas repetitivas, explicar bases de código, proponer alternativas, generar
  pruebas, detectar inconsistencias y facilitar refactorizaciones.


  La diferencia está en el modelo de trabajo.


  | Vibe coding | Ingeniería asistida por IA |

  | --- | --- |

  | El prompt contiene la intención del momento. | La especificación define
  objetivos, restricciones y criterios de aceptación. |

  | Se aceptan cambios grandes porque parecen funcionar. | Los cambios se
  dividen en unidades pequeñas y revisables. |

  | El resultado visual es la principal validación. | Se combinan pruebas,
  revisión, análisis y verificación del comportamiento. |

  | Las decisiones permanecen en el chat. | Las decisiones importantes se
  documentan junto al proyecto. |

  | La IA dirige la implementación sin límites claros. | La IA trabaja dentro de
  una arquitectura y unas convenciones conocidas. |

  | El desarrollador reacciona a los errores. | El equipo anticipa casos límite,
  riesgos y operación en producción. |


  En ambos enfoques la IA puede escribir gran parte del código. Lo que cambia es
  la disciplina alrededor de esa generación.


  ## De vibe coding a desarrollo guiado por especificaciones


  Cuando un proyecto comienza a crecer, el siguiente paso no es dejar de usar
  agentes, sino proporcionarles mejores límites, contexto y mecanismos de
  verificación.


  Un flujo más sólido puede seguir estas etapas:


  ### 1. Definir el problema antes de solicitar la solución


  La especificación debe explicar qué se busca conseguir, para quién, qué
  comportamientos son obligatorios y qué queda fuera del alcance.


  Esto evita que la implementación se base en suposiciones invisibles.


  ### 2. Hacer explícitos los contratos y restricciones


  Antes de modificar el código deben estar claros los modelos de datos, las
  interfaces, las reglas del negocio, las dependencias permitidas y los
  requisitos de seguridad o compatibilidad.


  ### 3. Pedir un plan antes de generar cambios


  Un plan permite revisar la dirección de la solución cuando corregirla todavía
  es barato. También ayuda a identificar archivos afectados, riesgos,
  migraciones y pruebas necesarias.


  ### 4. Dividir la implementación


  Los cambios pequeños son más fáciles de comprender, revisar y revertir.
  También reducen la posibilidad de que el agente modifique partes del sistema
  que no necesitaban cambiar.


  ### 5. Verificar con criterios objetivos


  La comprobación debe incluir pruebas automatizadas, casos límite, análisis
  estático, revisión del código y, cuando corresponda, validaciones de
  seguridad, rendimiento y accesibilidad.


  ### 6. Revisar las decisiones, no solo la sintaxis


  El objetivo no es comprobar si el código se ve elegante, sino confirmar que la
  solución pertenece a la capa correcta, reutiliza los mecanismos existentes y
  seguirá siendo comprensible para el equipo.


  ### 7. Conservar el conocimiento


  Las decisiones relevantes deben quedar en el repositorio o en la documentación
  del proyecto.


  El chat puede ayudar a llegar a una conclusión, pero no debería ser el único
  lugar donde esa conclusión exista.


  Este enfoque permite conservar la velocidad de la IA sin renunciar a la
  previsibilidad que necesita un producto serio.


  ## ¿Cuándo sí tiene sentido hacer vibe coding?


  El *vibe coding* no tiene que desaparecer. Es una herramienta válida cuando su
  uso coincide con el nivel de riesgo y la vida útil esperada del proyecto.


  Puede ser una excelente opción cuando:


  - Queremos validar rápidamente una idea.

  - Estamos creando un prototipo descartable.

  - Necesitamos explorar varias alternativas de interfaz.

  - Construimos una herramienta personal de bajo riesgo.

  - Realizamos un experimento para aprender sobre una tecnología.

  - El costo de rehacer la solución es menor que el costo de diseñarla por
  adelantado.


  También puede utilizarse al comienzo de un producto para descubrir requisitos.


  La condición es reconocer que el resultado puede necesitar revisión,
  refactorización o incluso una implementación nueva antes de convertirse en la
  base definitiva.


  El error no es experimentar rápido. El error es tratar el experimento como si
  ya fuera ingeniería terminada.


  ## Escalar significa poder cambiar con confianza


  Con frecuencia pensamos que escalar consiste únicamente en soportar más
  tráfico. Pero un sistema también escala cuando puede incorporar
  funcionalidades, desarrolladores y años de mantenimiento sin que cada cambio
  se convierta en una apuesta.


  La verdadera señal de madurez no es cuánto código puede generar un equipo en
  una semana. Es cuánta confianza tiene al modificarlo.


  Esa confianza proviene de contratos claros, pruebas útiles, límites
  arquitectónicos, observabilidad, documentación y personas capaces de explicar
  cómo funciona el sistema.


  Ninguno de esos elementos impide utilizar inteligencia artificial. Al
  contrario: hacen que la IA pueda trabajar de manera más precisa y consistente.


  ## Conclusión


  El *vibe coding* democratiza la creación de software y acorta de manera
  extraordinaria el camino entre una idea y un prototipo. Su valor es real.


  Sin embargo, su velocidad inicial puede ocultar decisiones incompletas,
  inconsistencias y riesgos que solo se hacen visibles cuando el proyecto crece.


  La IA puede generar una primera versión, pero la ingeniería es lo que permite
  mantenerla, extenderla y confiar en ella.


  Por eso, la pregunta importante no es si el código fue escrito por una persona
  o por una inteligencia artificial. La pregunta es si el equipo puede
  explicarlo, probarlo, operarlo y modificarlo sin depender de la conversación
  que lo produjo.


  El futuro del desarrollo no consiste en elegir entre programar manualmente o
  delegarlo todo a una IA. Consiste en utilizar agentes dentro de procesos que
  conviertan la intención en especificaciones, las especificaciones en cambios
  verificables y esos cambios en conocimiento compartido.


  La inteligencia artificial reduce el costo de producir código, pero no elimina
  el costo de comprenderlo. Cuando el software crece, ese segundo costo es el
  que realmente determina si un proyecto escala.
uploadTokens: []
revision: faf03f2e51bbac371f4ecb32d3e4554844cc1fadc7c2aaacaf3294d41d01cf8a
---


https://youtu.be/T7jUQ2_9V0I

El *vibe coding* puede llevarte de cero a una aplicación funcional en pocas horas. El problema comienza cuando esa aplicación debe sobrevivir a nuevos requisitos, nuevos desarrolladores y usuarios reales.

La inteligencia artificial ha cambiado la manera en que escribimos software. Ahora es posible describir una funcionalidad en lenguaje natural, recibir una implementación completa, ejecutarla y solicitar ajustes hasta que el resultado parezca correcto.

Esta forma de trabajar reduce enormemente la distancia entre una idea y un primer prototipo. Sin embargo, que una aplicación funcione hoy no significa que esté preparada para crecer mañana.

El *vibe coding* funciona para comenzar rápido, pero no escala por sí solo porque reemplaza decisiones explícitas de ingeniería por contexto implícito, intuición y validaciones superficiales.

El problema no es utilizar inteligencia artificial para programar. El problema aparece cuando dejamos de entender, evaluar y asumir la responsabilidad sobre el código que estamos construyendo.

## ¿Qué es realmente el vibe coding?

El *vibe coding* es una manera de desarrollar en la que una persona describe lo que quiere, permite que una inteligencia artificial genere el código y continúa iterando principalmente según el resultado visible.

El flujo suele parecerse a este:

1. Se solicita una funcionalidad.
2. La IA genera o modifica varios archivos.
3. Se ejecuta la aplicación.
4. Si aparece un error, se copia el mensaje y se le pide a la IA que lo corrija.
5. Si la funcionalidad parece operar correctamente, se continúa con la siguiente.

En este proceso no siempre se comprende por completo el código generado, las decisiones tomadas o sus efectos sobre el resto del sistema. La principal medida de éxito es que el resultado inmediato funcione.

Eso no es lo mismo que utilizar IA como herramienta de ingeniería.

Un desarrollador puede apoyarse en un agente para generar código, pruebas, documentación o refactorizaciones y, al mismo tiempo, mantener el control de la arquitectura, revisar las decisiones y verificar el comportamiento.

La diferencia no está en quién escribe cada línea, sino en quién entiende y gobierna el sistema.

## Por qué funciona tan bien al comienzo

El *vibe coding* resulta especialmente atractivo porque, durante las primeras etapas de un proyecto, realmente puede funcionar muy bien.

En una aplicación pequeña existe poco contexto, hay pocas dependencias y los errores suelen ser visibles. Si un botón no responde, una pantalla no carga o una petición falla, normalmente es posible detectar el problema rápidamente.

Además, todavía hay pocas decisiones anteriores con las cuales mantener coherencia.

Esto lo convierte en una herramienta muy útil para:

- Prototipos y pruebas de concepto.
- Demostraciones rápidas.
- Herramientas personales.
- Automatizaciones pequeñas.
- Exploraciones de interfaces.
- Experimentos técnicos que podrían descartarse.

En estos escenarios, la velocidad tiene un valor enorme y el costo de equivocarse suele ser bajo. El objetivo es descubrir si una idea merece continuar, no necesariamente construir desde el primer día el sistema que funcionará durante los próximos cinco años.

La dificultad aparece cuando confundimos un prototipo exitoso con una base preparada para producción.

## Un prototipo es una línea; un producto es una red

Una demostración normalmente presenta el camino ideal: el usuario entra, realiza una acción y obtiene un resultado. Un producto real debe contemplar muchos otros caminos.

¿Qué ocurre si la conexión se interrumpe? ¿Si el usuario no tiene permisos? ¿Si envía dos veces la misma solicitud? ¿Si cambia el formato de los datos? ¿Si una dependencia deja de responder? ¿Si es necesario migrar información existente? ¿Cómo se investigará un error que solamente ocurre en producción?

A medida que el proyecto crece aparecen autenticación, autorización, estados intermedios, reintentos, concurrencia, integraciones, analítica, accesibilidad, compatibilidad, seguridad y observabilidad.

Una funcionalidad deja de ser un bloque aislado y pasa a formar parte de una red de decisiones.

La IA puede generar cada pieza por separado. El verdadero reto es garantizar que todas esas piezas formen un sistema coherente.

## Las cuatro dimensiones en las que deja de escalar

### 1. El código

En proyectos pequeños, una solución local puede ser suficiente. En proyectos grandes, cada cambio debe respetar contratos, capas, patrones, modelos de datos y comportamientos existentes.

Si cada funcionalidad se genera únicamente a partir del prompt del momento, empiezan a aparecer varias maneras de resolver el mismo problema: validaciones repetidas, servicios con responsabilidades similares, diferentes formatos de errores y componentes que se comportan de forma inconsistente.

Cada implementación puede funcionar de manera individual y, aun así, deteriorar el sistema en conjunto.

El código crece, pero la arquitectura no necesariamente evoluciona con él.

### 2. El equipo

Un proyecto no escala solo porque soporte más usuarios. También debe permitir que más personas trabajen en él sin bloquearse ni introducir comportamientos contradictorios.

Cuando las decisiones viven únicamente en conversaciones con una IA, el resto del equipo no sabe por qué se eligió determinada estructura, qué alternativas se descartaron o qué restricciones debían respetarse.

Dos desarrolladores pueden solicitar la misma funcionalidad y recibir soluciones completamente diferentes.

Sin convenciones compartidas, contratos claros y revisiones, el repositorio se convierte en una colección de respuestas correctas de manera aislada, pero incompatibles entre sí.

### 3. El tiempo

El código no solo debe funcionar el día en que se genera. También debe poder entenderse y modificarse meses después.

En ese momento, la conversación original puede haber desaparecido, el modelo puede haber cambiado y la persona que impulsó la funcionalidad quizá ya no esté en el equipo.

Si las razones detrás de las decisiones nunca se documentaron, quien mantenga el sistema tendrá que reconstruirlas leyendo una implementación que posiblemente nadie revisó con profundidad.

El costo no desaparece: simplemente se traslada desde la escritura inicial hacia la comprensión, la depuración y el mantenimiento futuro.

### 4. El riesgo

En una aplicación real, los errores no siempre producen una pantalla rota. Algunos duplican pagos, exponen datos, conceden permisos incorrectos, corrompen información o fallan silenciosamente.

Una validación visual no puede detectar todos esos problemas. Que una funcionalidad complete el camino feliz tampoco demuestra que sea segura, resistente o correcta bajo condiciones inesperadas.

Cuanto mayor sea el impacto posible de un fallo, menos razonable resulta aceptar código únicamente porque “parece funcionar”.

## La ilusión de productividad

El *vibe coding* produce una sensación muy fuerte de velocidad: aparecen pantallas, endpoints y funcionalidades completas en minutos. Pero producir más código no equivale necesariamente a producir más valor ni a avanzar de forma sostenible.

La IA reduce considerablemente el costo de escribir código. Al mismo tiempo, puede aumentar el volumen que debe revisarse, probarse y comprenderse.

Si el equipo genera cambios más rápido de lo que puede validarlos, el cuello de botella no desaparece; simplemente se desplaza.

Esta es una de las razones por las que un proyecto puede avanzar de manera impresionante durante sus primeras semanas y luego volverse cada vez más difícil de modificar.

Cada nueva funcionalidad interactúa con decisiones anteriores que se tomaron rápidamente, y corregir un comportamiento puede provocar otros dos problemas.

La velocidad inicial crea una deuda que no siempre es visible en una demostración.

## El contexto implícito no es arquitectura

Un agente de IA puede analizar muchos archivos y recibir una gran cantidad de contexto. Aun así, disponer de información no equivale a conocer todas las razones detrás de un sistema.

Hay restricciones que no aparecen en el repositorio: acuerdos con otros equipos, reglas del negocio, decisiones regulatorias, incidentes anteriores, limitaciones operativas o funcionalidades que todavía no se han desarrollado.

Una IA solo puede razonar sobre el contexto que tiene disponible, y ese contexto suele ser parcial.

Además, un prompt es una instrucción momentánea, no una fuente duradera de verdad. Si una decisión importante solo existe dentro de una conversación, es difícil aplicarla de forma consistente en futuras sesiones o compartirla con todo el equipo.

Por eso, los sistemas que escalan convierten las decisiones importantes en artefactos explícitos: especificaciones, contratos, pruebas, convenciones, diagramas y registros de decisiones arquitectónicas.

## El peligro de optimizar cada tarea de forma aislada

La inteligencia artificial suele ser muy efectiva resolviendo el problema que tiene delante. Sin embargo, una buena solución local no siempre es una buena solución global.

Imaginemos que se solicita agregar una validación a un formulario. La IA puede implementarla directamente en el componente y resolver la necesidad en pocos minutos.

Más adelante, la misma regla se necesita en otras cuatro pantallas. Si cada petición se atiende de forma aislada, la validación puede terminar duplicada cinco veces y comportarse de manera distinta en cada lugar.

El problema no está en ninguna de las respuestas individuales. Está en la ausencia de una visión del sistema que determine cuándo reutilizar, cuándo abstraer y dónde debe vivir realmente una regla del negocio.

Con cinco funcionalidades, estas inconsistencias parecen pequeñas. Con cincuenta, comienzan a definir la arquitectura accidental del producto.

## Si nadie entiende el código, nadie puede revisarlo

La revisión de código no consiste únicamente en comprobar que la aplicación compile. Requiere evaluar si la solución satisface el requisito correcto, respeta la arquitectura, maneja casos límite y no introduce riesgos innecesarios.

Cuando una persona acepta una implementación que no puede explicar, también pierde la capacidad de revisarla de manera crítica.

En ese punto, pedirle a otra IA que valide el código puede ser útil, pero no resuelve completamente el problema: ambos agentes pueden compartir supuestos equivocados o validar el mismo camino incompleto.

Incluso las pruebas generadas automáticamente pueden dar una falsa sensación de seguridad si se construyen a partir de los mismos supuestos de la implementación.

Una prueba que confirma el comportamiento equivocado sigue siendo una prueba que pasa.

La IA puede ampliar nuestra capacidad de revisión, pero no reemplaza la necesidad de definir qué significa que una solución sea correcta.

## El problema no es la inteligencia artificial

Rechazar el *vibe coding* no significa regresar a escribir manualmente cada línea de código.

La inteligencia artificial es demasiado útil para ignorarla: puede acelerar tareas repetitivas, explicar bases de código, proponer alternativas, generar pruebas, detectar inconsistencias y facilitar refactorizaciones.

La diferencia está en el modelo de trabajo.

| Vibe coding | Ingeniería asistida por IA |
| --- | --- |
| El prompt contiene la intención del momento. | La especificación define objetivos, restricciones y criterios de aceptación. |
| Se aceptan cambios grandes porque parecen funcionar. | Los cambios se dividen en unidades pequeñas y revisables. |
| El resultado visual es la principal validación. | Se combinan pruebas, revisión, análisis y verificación del comportamiento. |
| Las decisiones permanecen en el chat. | Las decisiones importantes se documentan junto al proyecto. |
| La IA dirige la implementación sin límites claros. | La IA trabaja dentro de una arquitectura y unas convenciones conocidas. |
| El desarrollador reacciona a los errores. | El equipo anticipa casos límite, riesgos y operación en producción. |

En ambos enfoques la IA puede escribir gran parte del código. Lo que cambia es la disciplina alrededor de esa generación.

## De vibe coding a desarrollo guiado por especificaciones

Cuando un proyecto comienza a crecer, el siguiente paso no es dejar de usar agentes, sino proporcionarles mejores límites, contexto y mecanismos de verificación.

Un flujo más sólido puede seguir estas etapas:

### 1. Definir el problema antes de solicitar la solución

La especificación debe explicar qué se busca conseguir, para quién, qué comportamientos son obligatorios y qué queda fuera del alcance.

Esto evita que la implementación se base en suposiciones invisibles.

### 2. Hacer explícitos los contratos y restricciones

Antes de modificar el código deben estar claros los modelos de datos, las interfaces, las reglas del negocio, las dependencias permitidas y los requisitos de seguridad o compatibilidad.

### 3. Pedir un plan antes de generar cambios

Un plan permite revisar la dirección de la solución cuando corregirla todavía es barato. También ayuda a identificar archivos afectados, riesgos, migraciones y pruebas necesarias.

### 4. Dividir la implementación

Los cambios pequeños son más fáciles de comprender, revisar y revertir. También reducen la posibilidad de que el agente modifique partes del sistema que no necesitaban cambiar.

### 5. Verificar con criterios objetivos

La comprobación debe incluir pruebas automatizadas, casos límite, análisis estático, revisión del código y, cuando corresponda, validaciones de seguridad, rendimiento y accesibilidad.

### 6. Revisar las decisiones, no solo la sintaxis

El objetivo no es comprobar si el código se ve elegante, sino confirmar que la solución pertenece a la capa correcta, reutiliza los mecanismos existentes y seguirá siendo comprensible para el equipo.

### 7. Conservar el conocimiento

Las decisiones relevantes deben quedar en el repositorio o en la documentación del proyecto.

El chat puede ayudar a llegar a una conclusión, pero no debería ser el único lugar donde esa conclusión exista.

Este enfoque permite conservar la velocidad de la IA sin renunciar a la previsibilidad que necesita un producto serio.

## ¿Cuándo sí tiene sentido hacer vibe coding?

El *vibe coding* no tiene que desaparecer. Es una herramienta válida cuando su uso coincide con el nivel de riesgo y la vida útil esperada del proyecto.

Puede ser una excelente opción cuando:

- Queremos validar rápidamente una idea.
- Estamos creando un prototipo descartable.
- Necesitamos explorar varias alternativas de interfaz.
- Construimos una herramienta personal de bajo riesgo.
- Realizamos un experimento para aprender sobre una tecnología.
- El costo de rehacer la solución es menor que el costo de diseñarla por adelantado.

También puede utilizarse al comienzo de un producto para descubrir requisitos.

La condición es reconocer que el resultado puede necesitar revisión, refactorización o incluso una implementación nueva antes de convertirse en la base definitiva.

El error no es experimentar rápido. El error es tratar el experimento como si ya fuera ingeniería terminada.

## Escalar significa poder cambiar con confianza

Con frecuencia pensamos que escalar consiste únicamente en soportar más tráfico. Pero un sistema también escala cuando puede incorporar funcionalidades, desarrolladores y años de mantenimiento sin que cada cambio se convierta en una apuesta.

La verdadera señal de madurez no es cuánto código puede generar un equipo en una semana. Es cuánta confianza tiene al modificarlo.

Esa confianza proviene de contratos claros, pruebas útiles, límites arquitectónicos, observabilidad, documentación y personas capaces de explicar cómo funciona el sistema.

Ninguno de esos elementos impide utilizar inteligencia artificial. Al contrario: hacen que la IA pueda trabajar de manera más precisa y consistente.

## Conclusión

El *vibe coding* democratiza la creación de software y acorta de manera extraordinaria el camino entre una idea y un prototipo. Su valor es real.

Sin embargo, su velocidad inicial puede ocultar decisiones incompletas, inconsistencias y riesgos que solo se hacen visibles cuando el proyecto crece.

La IA puede generar una primera versión, pero la ingeniería es lo que permite mantenerla, extenderla y confiar en ella.

Por eso, la pregunta importante no es si el código fue escrito por una persona o por una inteligencia artificial. La pregunta es si el equipo puede explicarlo, probarlo, operarlo y modificarlo sin depender de la conversación que lo produjo.

El futuro del desarrollo no consiste en elegir entre programar manualmente o delegarlo todo a una IA. Consiste en utilizar agentes dentro de procesos que conviertan la intención en especificaciones, las especificaciones en cambios verificables y esos cambios en conocimiento compartido.

La inteligencia artificial reduce el costo de producir código, pero no elimina el costo de comprenderlo. Cuando el software crece, ese segundo costo es el que realmente determina si un proyecto escala.
