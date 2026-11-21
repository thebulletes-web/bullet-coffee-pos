# Informe de cambios — Bullet POS 2.0.0

- **Fecha:** 21 de noviembre de 2026
- **Versión anterior:** 1.9.0 (commit `b243729`)
- **Versión nueva:** 2.0.0 (commit `0fa7b2c`, rama `main`)
- **Repositorio:** github.com/thebulletes-web/bullet-coffee-pos

## Resumen

La versión 2.0.0 prepara la transición de Bullet POS hacia un producto con control de dispositivos, turnos, licencias y una gestión de caja más completa. Se conserva todo lo de 1.9.0: IndexedDB (BulletStore), Firestore, BulletSync y la cola Outbox, PWA, modo offline, mesas, propinas, pago dividido, caja, PDF, Excel, respaldo JSON v2, roles, Dual Main, auditoría y control de concurrencia de mesas (rev/rev+1, paymentOperationId).

La implementación sigue el mismo patrón de las versiones anteriores: un módulo nuevo al final de `index.html` que envuelve las funciones existentes. Del código de 1.9.0 solo se cambiaron 10 líneas: ganchos para Excel, para el cierre de caja y para la categoría de movimientos, además de una corrección menor de foco.

## Los 8 objetivos

### 1. Reinicio global de historial
- El PC Main inicia un periodo nuevo en todos los dispositivos a la vez. La época compartida se guarda en `control/historyEpoch` y cada reinicio queda en `historyResets/`.
- No se borra ninguna venta. Las ventas anteriores se marcan como archivadas en Firebase e IndexedDB, como en el archivado mensual, y siguen en los respaldos.
- Antes del reinicio se descargan automáticamente un respaldo JSON y un Excel completos.
- **Requisitos:**
  - PC Main con internet;
  - contraseña y escribir REINICIAR;
  - ninguna mesa abierta;
  - ninguna operación pendiente en el equipo;
  - caja recién abierta y sin ventas.
- Las ventas de equipos que estaban desconectados llegan después, se archivan solas con el periodo anterior y quedan en la auditoría.
- Solo el Main que hizo el reinicio escribe el archivado en la nube, para que los dos Main no repitan las mismas escrituras.

### 2. Turnos de dispositivos secundarios
- El mesero inicia un turno con su nombre antes de vender. Funciona sin internet y se sincroniza por la cola Outbox (`shifts/{id}`).
- Cada venta queda asociada al turno (`shiftId`, `shiftOperator`).
- **Cierre del turno:** muestra lo cobrado por medio de pago, las propinas y el efectivo a entregar. Opcionalmente registra el efectivo entregado y la diferencia. El resumen se puede imprimir.
- **PC Main:** ve los turnos abiertos en vivo, puede hacer un cierre forzado (con contraseña y motivo) y confirma la entrega del efectivo. El cierre de caja avisa si quedan turnos abiertos.
- Los turnos son obligatorios por defecto y se pueden volver opcionales desde la política.

### 3. Revocación remota de dispositivos
- El equipo revocado se bloquea en cuanto se conecta: ya no puede vender ni modificar mesas.
- Envío de pendientes: si se permite, el equipo tiene 24 h (campo `drainUntil`) para terminar de enviar sus ventas, auditoría y turnos. Esas ventas nunca se pierden, y el plazo se puede ampliar.
- Si el equipo era PC Main, sale también de la lista de Main.

### 4. Dispositivo perdido
- Bloqueo sin plazo. Opcionalmente, borrado remoto de los datos del negocio cuando el equipo se conecta (IndexedDB, localStorage, caché de Firestore y sesión).
- Antes de borrar se muestran las ventas sin enviar según el último reporte del equipo.
- Si el equipo era PC Main, sale de la lista y se ofrece cambiar la contraseña administrativa.
- El PC Main ve cuándo el equipo recibió el bloqueo (`lockSeenAt`) y cuándo se borró (`wipedAt`).

### 5. Protección de licencias
- La licencia se guarda en `licenses/{cafeId}`. Según las reglas, solo la cuenta del proveedor puede escribirla (inicio de sesión con Google y correo verificado).
- La licencia va firmada con ECDSA P-256 y se verifica en el equipo con la clave pública incluida en `index.html`. Si alguien altera la copia guardada en el equipo, la firma lo detecta.
- **Estados:**
  - activa;
  - por vencer (desde 15 días antes);
  - en periodo de gracia;
  - vencida;
  - suspendida;
  - inválida;
  - origen no autorizado.
- **Si vence o se suspende:** se bloquean las ventas nuevas, la apertura de caja, los turnos nuevos y la autorización de equipos. El historial, los respaldos, el Excel, el cierre de caja, el cobro de mesas abiertas y el envío de lo ya registrado siguen funcionando.
- **Límites que define la licencia:** número de dispositivos activos y de PC Main (1 o 2).
- **Sin licencia:** modo compatibilidad, igual que 1.9.0.
- **Herramienta del proveedor (`herramientas/emisor-licencias.html`):** genera el par de claves, firma la licencia y la publica.

### 6. Protección frente a copias no autorizadas
- La licencia queda atada al negocio (`cafeId`) y a las direcciones web autorizadas. Desde otra dirección, o abierta como archivo local, la app no registra ventas, pero deja descargar los respaldos.
- Cada instalación se vincula a su equipo (`installId`). Si la identidad de un equipo aparece en otra instalación, ese equipo se bloquea. El PC Main lo ve como «Instalación distinta» y puede reconocer la instalación si el equipo es propio.
- Se recomienda restringir los dominios autorizados en Firebase y la API key en Google Cloud.

### 7. Seguridad Offline First controlada
- Sin conexión, cada equipo puede vender durante un tiempo máximo desde su última verificación con el servidor: 72 h los secundarios y 7 días los Main. El plazo es configurable de 24 h a 30 días en `control/policy`.
- Atrasar el reloj del equipo no alarga el plazo y queda registrado en la auditoría.
- Los cobros de mesas ya abiertas siempre se pueden terminar.
- El estado de bloqueo se guarda en localStorage y en IndexedDB, así que borrar solo uno de los dos no lo quita.
- Los equipos que ya sincronizaban con 1.9.0 reciben un primer plazo completo al actualizarse.

### 8. Gestión profesional de caja y cuadre diario
- Conteo por denominaciones al cerrar la caja, guardado con el cierre.
- Observación obligatoria cuando la diferencia supera el umbral configurado (5.000 COP por defecto).
- Arqueo parcial (corte X) sin cerrar la caja.
- Impresión del corte X y del reporte Z, con espacio para firma.
- Cuadre diario por fecha: ventas por medio de pago, propinas, anuladas, movimientos, cierres y ventas por persona.
- Categorías en los movimientos de caja.
- **Excel:** hojas nuevas «Turnos», «Cuadre diario» y «Arqueos parciales», y la columna «Categoría» en «Movimientos de Caja».
- **Respaldo JSON:** sigue en versión 2 y ahora incluye turnos, arqueos, política, época y estado de seguridad. La restauración solo agrega.

## Cambios de comportamiento frente a 1.9.0
- Turno obligatorio por defecto para los meseros (desactivable en Ajustes > Seguridad y operación).
- Un equipo nuevo pendiente de autorización ya no puede vender mientras espera.

## Archivos modificados
| Archivo | Cambio |
|---|---|
| `index.html` | Módulo 2.0.0 (unas 2 770 líneas), interfaz nueva, versión 2.0.0 |
| `firestore.rules` | Reglas 2.0.0: drenado, perdido, instalación, turnos, reinicios, licencias |
| `sw.js` | Caché `bullet-pos-v2.0.0` |
| `LEEME_Integracion.txt` | Sección 2.0.0 con pasos de actualización |
| `herramientas/emisor-licencias.html` | Nuevo: herramienta del proveedor |

## Pasos de despliegue
1. Hacer un respaldo JSON en el PC Main.
2. Publicar `firestore.rules` en Firebase Console > Firestore > Rules, antes de que los equipos se actualicen.
3. Esperar a que GitHub Pages publique y recargar la app con internet en todos los equipos.
4. Para usar licencias:
   - activar el inicio de sesión con Google en Firebase Authentication;
   - generar las claves con la herramienta del proveedor;
   - pegar la clave pública en `LICENSE_PUBLIC_KEYS` (en `index.html`);
   - guardar la clave privada fuera del repositorio.

## Verificación
Se probó con Edge sin ventana y un Firebase simulado en memoria. Pasaron 159 de 159 comprobaciones, sin errores de JavaScript, en tres escenarios:
- modo local;
- dispositivo secundario, incluido el borrado remoto con recarga;
- PC Main, con el reinicio global de punta a punta.

La firma de licencias se comprobó entre la herramienta del proveedor y la app. Las reglas de Firestore no se probaron en un emulador; conviene revisarlas después de publicarlas.

## Limitaciones conocidas
- Un equipo perdido que nunca vuelve a conectarse no se puede borrar a distancia. El plazo sin conexión limita cuánto tiempo sigue vendiendo.
- Las protecciones dentro de la app disuaden, pero quien modifique el código podría saltárselas en su copia. La protección real de los datos la dan las reglas de Firestore, la autorización de cada equipo y la restricción de dominios.
- El límite de dispositivos lo aplica la app del PC Main. Las reglas exigen que la licencia esté vigente, pero no cuentan los equipos.
