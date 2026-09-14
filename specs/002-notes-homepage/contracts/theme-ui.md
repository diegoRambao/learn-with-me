# Contract: Selector y aplicación de tema

## Control compartido

- El encabezado de todas las páginas incluye un control nativo etiquetado “Tema”.
- El control expone exactamente estas opciones y valores:

| Texto | Valor | Efecto |
|---|---|---|
| Sistema | `system` | Sigue el esquema claro u oscuro del dispositivo |
| Claro | `light` | Aplica tema claro sin atender cambios del sistema |
| Oscuro | `dark` | Aplica tema oscuro sin atender cambios del sistema |

- El valor visible del control coincide siempre con el modo activo.
- El control se alcanza y opera con teclado, conserva el foco después del cambio y cuenta con foco perceptible.
- No necesita un anuncio `aria-live`; la semántica nativa comunica la selección.

## Inicialización y precedencia

- El documento está declarado inicialmente como `system`.
- Antes de mostrar el contenido visual, se intenta leer y validar la preferencia guardada.
- Un valor válido se aplica al elemento raíz antes del primer render perceptible.
- Sin valor válido o ante error de lectura, continúa `system` sin mostrar error.
- `system` se resuelve mediante la preferencia vigente del dispositivo.
- `light` y `dark` prevalecen sobre el dispositivo hasta que la persona elige otro modo.

## Persistencia y degradación

- El navegador intenta conservar los tres valores válidos bajo una única clave local estable del sitio.
- Una recarga o visita posterior en el mismo navegador recupera la selección cuando el almacenamiento está disponible.
- Elegir `system` sustituye cualquier override anterior y vuelve a seguir cambios del dispositivo.
- Si la escritura falla, el cambio se mantiene durante la página actual; una visita nueva puede regresar a `system`.
- La preferencia no se sincroniza entre cuentas, dispositivos o pestañas y no requiere cookies.

## Tokens visuales

Cada modo define de forma coherente tokens semánticos para:

- fondo de página;
- superficie y superficie elevada;
- borde y separadores;
- texto principal y texto atenuado;
- acento y texto sobre acento;
- foco y estados interactivos.

Los componentes compartidos no dependen de nombres que impliquen exclusivamente oscuridad. El `color-scheme` del documento coincide con el esquema resuelto para que los controles nativos sean coherentes.

## Cobertura visual

- La selección afecta portada, encabezado, pie, catálogo, filtros, tarjetas, navegación de ruta, contenido de nota, estados vacíos y página de error.
- Ningún contenido desaparece ni cambia de significado entre temas.
- En ambos esquemas, texto normal mantiene 4.5:1 y controles, foco y elementos no textuales esenciales mantienen 3:1 como mínimo.
- Cambiar de tema no introduce animación obligatoria; con movimiento reducido el cambio es inmediato.

## Casos observables

1. Sin preferencia + sistema claro → control Sistema, apariencia clara.
2. Sin preferencia + sistema oscuro → control Sistema, apariencia oscura.
3. Preferencia Claro + sistema oscuro → control Claro, apariencia clara.
4. Preferencia Oscuro + sistema claro → control Oscuro, apariencia oscura.
5. Sistema activo + cambio del SO → apariencia actualizada sin perder el modo Sistema.
6. Claro/Oscuro activo + cambio del SO → apariencia sin cambios.
7. Valor local inválido o storage bloqueado → fallback no técnico y sitio operable.

