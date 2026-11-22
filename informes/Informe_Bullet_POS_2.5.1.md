# Informe de cambios — Bullet POS 2.5.1

- **Fecha:** 22 de noviembre de 2026
- **Versión anterior:** 2.5.0
- **Archivos modificados:** `index.html`, `sw.js`, `firestore.rules`, `LEEME_Integracion.txt`
- **Reglas de Firestore:** **sí cambian**. Hay que publicarlas en Bullet Coffee y en cada negocio.

## Problema que resuelve

Había dos huecos en los turnos:
1. Cuando el mesero cerraba su turno, el equipo seguía en la pantalla de venta. No había un cierre claro ni un resumen para la persona que entregaba.
2. Cualquiera podía iniciar un turno por accidente o mucho antes de empezar a trabajar, y el tiempo quedaba contando.

## 1. Fin de turno con bloqueo

Al cerrar el turno, ya sea en el equipo o porque el PC Main lo cerró, el equipo secundario **queda bloqueado** con una pantalla de resumen que muestra:
- la persona, el equipo, el inicio, el cierre y la duración;
- las ventas (y las anuladas), los totales por medio de pago, las propinas y el total vendido;
- el efectivo cobrado y, si se registró, el entregado y la diferencia;
- **la lista de ventas del turno**: hora, detalle, medio de pago y total;
- el motivo, si el PC Main forzó el cierre.

Desde esa pantalla se puede:
- **Guardar PDF:** imprime en hoja A4. En la ventana de impresión se elige «Guardar como PDF».
- **Imprimir:** en el formato configurado (58 mm, 80 mm, carta o A4).
- **Pedir o iniciar un nuevo turno**, que requiere PIN.
- **Seguir sin turno:** solo si los turnos son opcionales en el negocio.

El bloqueo **sigue al recargar** la app y no se puede vender hasta iniciar otro turno. El reporte impreso del turno ahora también incluye la lista de ventas.

## 2. Turnos aprobados por el PC Main

En **Ajustes → Seguridad y operación** hay una casilla nueva: **«Iniciar turno requiere la aprobación del PC Main»**. Viene activada en el perfil «Negocio con meseros» y desactivada en «Negocio pequeño».

Con la casilla activada:
1. **El mesero** escribe su PIN y envía la solicitud («Pedir inicio de turno»). Su equipo muestra **«Esperando aprobación del turno»** y puede cancelar la solicitud.
2. **El PC Main** ve un aviso en la parte de arriba, en cualquier pestaña («Ana pide iniciar turno en Tablet 2 · hace 1 min»), y también en **Caja → Turnos**. Elige:
   - **Aprobar:** el turno empieza **en ese momento**, así que el tiempo cuenta desde la aprobación y no desde la solicitud. Queda asociado a la caja abierta.
   - **Rechazar:** pide un motivo, que el mesero ve en su equipo.
3. **El equipo del mesero** se desbloquea solo al recibir la aprobación.

**Necesita internet:** sin conexión, el turno no puede empezar porque el PC Main tiene que aprobarlo. En negocios con mala conexión conviene dejar la casilla desactivada (perfil «Negocio pequeño»).

**Seguridad (reglas):** cuando la aprobación está activada, un equipo secundario solo puede **pedir** el turno o cancelar su propia solicitud. Abrirlo directamente es rechazado por Firebase. Solo un PC Main puede pasarlo a «abierto» o a «rechazado».

## 3. Corrección (venía de 2.5.0)

Cuando la política llegaba desde Firebase a los demás equipos, la app solo conservaba los campos antiguos. Por eso se perdían el **perfil**, el **cobro directo por defecto** y, ahora, la **aprobación de turno**. Ya se conservan todos.

## Auditoría

Se registran estos eventos nuevos:
- `shiftRequested`: solicitud de turno.
- `shiftApproved` y `shiftRejected`: aprobación o rechazo, con el tiempo de espera o el motivo.
- `shiftRequestCancelled`: solicitud cancelada.
- `shiftReportPrinted`: reporte del turno guardado como PDF o impreso.

## Pruebas realizadas

Las pruebas se hicieron en un navegador automatizado con un Firebase simulado, sin tocar los datos reales.

- **Mesero (25 de 25 verificaciones correctas):**
  1. Sin turno no puede vender; el modal pide aprobación; la solicitud llega al servidor y el equipo muestra «Esperando aprobación».
  2. Al aprobarse, el turno se abre solo y cuenta desde la aprobación.
  3. Vende 2 veces y cierra el turno.
  4. El equipo queda bloqueado con el resumen y la lista de ventas, y el PDF sale en A4 con las ventas.
  5. Al recargar sigue bloqueado.
  6. Una nueva solicitud rechazada muestra el motivo y la pantalla vuelve al resumen; también se puede cancelar una solicitud.
  7. Todo queda en la auditoría.
- **PC Main (13 de 13):**
  1. Recibe las solicitudes, que no se mezclan con los turnos reales.
  2. Ve el aviso con «Aprobar» y «Rechazar», también en Caja → Turnos.
  3. Al aprobar, el turno se abre desde ese momento con la caja asociada; al rechazar se guarda el motivo.
  4. El aviso desaparece.
  5. La casilla y los perfiles funcionan.
- **Regresión:**
  - Pasan completas las pruebas de turnos sin aprobación (47 y 27), PIN (27 y 20), mesas (25), solicitudes de cobro (21), equipo nuevo tras eliminarlo (11), inventario (54), instalación (10) y varios negocios (29 de 30).
  - La que falta en varios negocios solo esperaba el texto «2.5.0» en el diagnóstico, que ahora dice 2.5.1.
  - En la prueba general (t1) siguen solo las 3 verificaciones conocidas: versión, hojas del Excel y una expectativa antigua de la política.
