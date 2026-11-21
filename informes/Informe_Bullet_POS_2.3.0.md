# Informe de cambios — Bullet POS 2.3.0

- **Fecha:** 21 de noviembre de 2026
- **Versión anterior:** 2.2.0 (commit `4a853ce`)
- **Repositorio:** github.com/thebulletes-web/bullet-coffee-pos

## Resumen

Por defecto, solo los PC Main finalizan pagos. Un equipo secundario toma el pedido y envía una **solicitud de cobro**; un PC Main la acepta (registra la venta, calcula los vueltos y libera la mesa) o la rechaza con un motivo.

El permiso **«Cobro directo»**, por equipo, devuelve a un secundario la capacidad de cobrar como antes. Las reglas de Firestore lo hacen cumplir en el servidor.

## Funcionamiento

### Solicitud (mesero)
- Funciona en mesa y en mostrador.
- El mesero indica el método que propone el cliente: efectivo, tarjeta, transferencia, Nequi, Daviplata o mixto. La propina sugerida va con el pedido, y puede agregar una nota.
- Se guarda en `chargeRequests/{id}` a través de la cola persistente, así que también funciona sin conexión.
- Una solicitud de mesa congela la mesa con el mecanismo de «cobro iniciado» y guarda el número de operación. Así la venta no se puede duplicar.

### Recepción (PC Main)
- Llega en tiempo real, con sonido, un contador en el encabezado y un aviso en Venta.
- **Cobrar:** carga el pedido (o abre la mesa) con el método y la propina propuestos, y el pago se confirma con el flujo de siempre.
- **Rechazar:** pide un motivo, y la mesa vuelve a quedar editable para el mesero.

### Estados
Pendiente, aceptada, rechazada o cancelada. El mesero las ve y puede:
- cancelar una solicitud pendiente;
- recuperar un pedido de mostrador rechazado.

### La venta
- Queda a nombre del mesero: su dispositivo, su persona y su turno.
- Guarda qué PC Main la cobró (`chargeMode: "main"`, `chargedBy`).
- En el turno del mesero, lo cobrado por el Main aparece aparte y no cuenta como efectivo a entregar.

### Cobro directo
- Se activa o desactiva por equipo desde Ajustes > Dispositivos. Por defecto está desactivado.
- Cada cambio queda en la auditoría.
- Cada venta con cobro directo guarda el equipo y la persona que cobró.
- Al quitar el permiso, el equipo tiene 24 h para enviar lo que ya cobró.

### Migración
Al abrir el PC Main 2.3.0, los equipos secundarios existentes pasan a «sin cobro directo», con 24 h de gracia.

## Reglas de Firestore (2.3.0)
- **Sin «Cobro directo»**, un equipo que no es Main no puede crear ventas, agregar abonos a una mesa ni liberar una mesa por cobro.
- **Solicitudes:** el mesero solo puede crear y cancelar las suyas mientras estén pendientes. Aceptarlas o rechazarlas: solo un PC Main.
- **El permiso:** solo lo puede cambiar un PC Main.

## Errores corregidos
Las escuchas de solicitudes de cobro y de entregas a caja se registraban con el rol que tenía el equipo en ese momento. Si el rol de Main se cargaba después, el PC Main no recibía nada. Ahora la escucha se rehace cuando cambia el rol.

## Verificación
Se probó con Edge sin ventana y un Firebase simulado:

| Escenario | Resultado |
|---|---|
| Mesero con solicitudes | 25 de 25 |
| PC Main con solicitudes | 21 de 21 |
| Regresión 2.2 (PIN) | 23 de 23 y 16 de 16 |
| Regresión 2.1 | 47 de 47 y 27 de 27 |
| Regresión 2.0 | 45 de 45 y 22 de 22 |
| Plazos 2.1.1 | 9 de 9 |

Las pruebas antiguas de mesero se corrieron con «Cobro directo» activo, porque sin él el comportamiento cambió a propósito.

Las reglas de Firestore no se probaron en un emulador.

## Pasos de despliegue
1. Publicar `firestore.rules` (2.3.0).
2. Subir los archivos.
3. Abrir el PC Main con internet (hace la migración).
4. Actualizar todos los equipos de meseros.

## Limitaciones
- La «Caja» que recibe las solicitudes es el PC Main. No hay un rol de cajero aparte.
- Un equipo de mesero que no se actualice no puede registrar ventas cuando terminen las 24 h de gracia.
