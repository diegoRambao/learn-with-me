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
---



## El estado cambia; la descripción se reconstruye

Guarda como estado únicamente la información que puede cambiar y que afecta la representación. Todo lo que pueda derivarse de otras variables debe calcularse, no duplicarse.

Cuando el estado crezca, mueve cada decisión cerca del widget responsable y conserva un flujo de datos predecible.
