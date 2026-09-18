---
title: Estado y actualización de la interfaz
description: >-
  Distingue el estado efímero y actualiza solo la parte necesaria de una
  pantalla.
tags:
  - flutter
  - estado
  - interfaz
category: flutter-basic
topic: fundamentos
durationMinutes: 14
position: 4
format: written
id: flutter-basic-state
body: >
  ## El estado cambia; la descripción se reconstruye


  Guarda como estado únicamente la información que puede cambiar y que afecta la
  representación. Todo lo que pueda derivarse de otras variables debe
  calcularse, no duplicarse.


  Cuando el estado crezca, mueve cada decisión cerca del widget responsable y
  conserva un flujo de datos predecible.
uploadTokens: []
revision: c9b3940011ddb432aeb6ed9aba9b45ef407945bf27dbd409c0a700aa7001be0d
---

## El estado cambia; la descripción se reconstruye

Guarda como estado únicamente la información que puede cambiar y que afecta la representación. Todo lo que pueda derivarse de otras variables debe calcularse, no duplicarse.

Cuando el estado crezca, mueve cada decisión cerca del widget responsable y conserva un flujo de datos predecible.
