# Informe de cambios — Bullet POS 2.1.0

- **Fecha:** 21 de noviembre de 2026
- **Versión anterior:** 2.0.0 (commit `0fa7b2c`)
- **Versión nueva:** 2.1.0 (pendiente de subir a `main`)
- **Repositorio:** github.com/thebulletes-web/bullet-coffee-pos

## Resumen

La versión 2.1.0 hace dos correcciones de fondo sobre 2.0.0:

1. **Reinicio real de datos.** El «Reinicio global de historial» de 2.0.0 solo archivaba las ventas. Ahora borra de verdad los datos de operación en Firebase y en todos los dispositivos. Una «generación de datos» impide que un equipo antiguo vuelva a subir lo borrado y evita los reintentos infinitos con «Permiso denegado».
2. **Cobro separado de la entrega a caja.** El cobro de un mesero ya no cuenta como dinero en caja hasta que el PC Main confirma que lo recibió.

Se mantienen todas las funcionalidades de 2.0.0: IndexedDB, Firestore, BulletSync, Offline First, turnos, revocación remota, licencias, mesas, propinas, caja, auditoría, PDF, Excel y respaldo y restauración JSON.

## Corrección 1: reinicio real de datos

### Qué se borra y qué se conserva
- **Se borra** (en Firebase y en cada equipo):
  - ventas, cajas (abiertas y cerradas) y movimientos de caja;
  - turnos, entregas a caja y mesas;
  - estados temporales de los dispositivos;
  - la cola de sincronización (Outbox), el estado de sincronización y la auditoría local.
- **Se conserva:** productos, categorías, licencia, roles, PC Main, dispositivos, seguridad, configuración, medios de pago, configuración de caja y de mesas, y la auditoría en Firebase.

### Flujo
1. Muestra el resumen de lo que se borrará y lo que se conserva.
2. Pide la contraseña del PC Main y el texto exacto `REINICIAR`.
3. Descarga un respaldo JSON y un Excel completos.
4. Crea la nueva generación en `control/generation` y borra en Firebase.
5. Limpia el equipo y recarga. La caja queda cerrada para abrirla con la base inicial.

### Mensajes de error
Ningún error pasa en silencio. Cada caso tiene su mensaje:
- contraseña incorrecta;
- texto incorrecto;
- mesas abiertas;
- caja abierta (con ventas o movimientos);
- turnos abiertos;
- operaciones pendientes;
- error de sincronización.

Si la limpieza en Firebase se corta, queda marcada como incompleta y se termina con «Reintentar limpieza».

### Generación de datos
- Cada venta, caja, movimiento, turno y entrega guarda su generación (`gen`).
- Las reglas de Firestore rechazan crear datos de una generación anterior. Además, el PC Main solo puede borrar documentos de generaciones anteriores, así que los datos de la generación vigente siguen siendo imborrables.
- Cada equipo compara su generación con la del servidor al conectarse y en cada sincronización. Si está atrasado, se limpia solo, sin intervención del usuario, y muestra: «Se detectó un reinicio global. Los datos pendientes del periodo anterior fueron limpiados correctamente.»
- Las ventas hechas sin conexión **después** del reinicio se conservan y se suben con la generación nueva.
- Las ventas **anteriores** al reinicio se retiran de la cola y quedan guardadas aparte en el equipo (cuarentena). Nunca se reintentan.
- Las operaciones de periodos anteriores que queden en la cola se purgan automáticamente, así que ya no hay reintentos infinitos.

### Reparar sincronización (solo PC Main)
El botón está en Ajustes y en el panel de sincronización. Hace lo siguiente:
- comprueba la generación del servidor;
- vacía la cola del equipo;
- retira las operaciones de periodos anteriores y los errores permanentes (quedan guardados aparte);
- recalcula el estado de las ventas;
- vuelve a enviar los datos válidos.

Queda en la auditoría con fecha, hora, usuario y dispositivo.

## Corrección 2: cobro separado de la entrega a caja

### Estados
Mesa ocupada → Pago recibido → Pendiente de entrega a caja → Entregado a caja → Venta cerrada.

### Funcionamiento
- **Cobro del mesero:** registra medio de pago, valor, fecha, hora, mesero y turno. La mesa se libera para el cliente, pero el dinero no cuenta todavía en la caja.
- **PC Main, Caja > «Cobros pendientes de entrega a caja»:** muestra mesa, mesero, turno, valor, método, hora y equipo.
- **«Confirmar entrega»:** se hace por cobro o por todo lo de un mesero. Pide el valor recibido y registra quién recibió, la hora, el equipo y la diferencia. Solo entonces la venta entra en la caja abierta. Si se confirma en una caja posterior, cuenta en esa caja.
- **Medios de pago:** el efectivo siempre requiere entrega. Datáfono, Nequi, Daviplata y Transferencia se configuran uno por uno: requieren entrega o se confirman automáticamente. La separación completa se puede desactivar.
- **Cierre de turno:** muestra ventas, propinas, cobros pendientes, entregas realizadas y diferencias. Si hay pendientes, avisa al mesero y el PC Main lo ve en Caja.
- **Cierre de caja:** antes de cerrar muestra los cobros pendientes. Se puede cancelar para resolverlos o continuar, y la decisión queda registrada.
- **Informes:** el cuadre diario muestra recibidas, entregadas y pendientes por mesero y turno. El Excel agrega las hojas «Entregas a caja» y «Entregas por mesero».
- **Auditoría:** registra:
  - pago recibido;
  - entrega confirmada;
  - diferencia en la entrega (modificación administrativa);
  - cierre de caja con cobros pendientes;
  - cobros conciliados en el cierre;
  - turno cerrado con cobros pendientes.

En esta versión, la «Caja» es la sección Caja del PC Main.

## Error corregido de 2.0.0
Al cerrar el turno con internet, el equipo podía tomar su propio cierre como «cerrado por el PC Main». Si se abría otro turno enseguida, ese turno nuevo se cerraba solo.

## Archivos modificados
| Archivo | Cambio |
|---|---|
| `index.html` | Módulo 2.1.0, generación en cajas, movimientos y turnos, nuevas tarjetas y ventanas |
| `firestore.rules` | Generación de datos, borrado de generaciones anteriores, `cashReceipts` |
| `sw.js` | Caché `bullet-pos-v2.1.0` |
| `LEEME_Integracion.txt` | Sección 2.1.0 |

## Pasos de despliegue
1. Hacer un respaldo JSON en el PC Main.
2. Publicar `firestore.rules` (2.1.0).
3. Subir los archivos.
4. Actualizar **todos** los dispositivos antes de hacer un reinicio. Un equipo que siga en 2.0.0 no puede subir ventas después de un reinicio hasta actualizarse.

## Verificación
Se probó con Edge sin ventana y un Firebase simulado en memoria, que incluye la regla de generación:

| Escenario | Resultado |
|---|---|
| PC Main 2.1 | 47 de 47 |
| Mesero 2.1 | 27 de 27 |
| Regresión 2.0: dispositivo secundario | 45 de 45 |
| Regresión 2.0: PC Main (sin la parte del reinicio antiguo) | 22 de 22 |
| Regresión 2.0: modo local | 75 de 77 |

En modo local, las 2 diferencias son cambios previstos: la versión ahora es 2.1.0 y el Excel tiene dos hojas nuevas. No hubo errores de JavaScript.

Las reglas de Firestore no se probaron en un emulador.

## Limitaciones
- Un equipo que siga en 2.0.0 o anterior no sabe limpiarse solo. Tras un reinicio, Firebase rechaza sus ventas hasta que se actualice.
- Las ventas de antes del reinicio que estaban sin enviar en un equipo desconectado no se suben (es lo que pide el reinicio). Quedan guardadas aparte en ese equipo y en sus respaldos JSON.
