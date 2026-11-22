# Informe de cambios — Bullet POS 2.3.1, 2.3.2 y 2.3.3

- **Fecha:** 21 de noviembre de 2026
- **Versión anterior:** 2.3.0 (commit `468895d`)
- **Commits:** 2.3.1 `7685810` · 2.3.2 `7b00640` · 2.3.3 `36c38b5`
- **Repositorio:** github.com/thebulletes-web/bullet-coffee-pos
- **Reglas de Firestore:** no cambian desde 2.3.0.

## Contexto

Estas versiones salen de problemas encontrados al usar la 2.3.0 en el negocio:
- el cierre de caja «no cerraba»;
- el PIN se pedía en cada recarga;
- un teléfono acumulaba ventas que Firebase rechazaba;
- los dispositivos revocados se quedaban en la lista;
- faltaban protecciones frente a copias de la app.

## 2.3.1 — Cierre de caja, PIN y rescate de ventas

### Cerrar caja sin abrir otra
- **Antes:** cada cierre abría automáticamente una caja nueva (comportamiento de la 1.9), por eso parecía que la caja no se cerraba.
- **Ahora:** «Cerrar caja» deja la caja cerrada. La casilla «Abrir una caja nueva al cerrar» recupera el comportamiento anterior.

### PIN al recargar
- Recargar la app mientras se usa ya no pide el PIN.
- Lo pide al abrirla después del tiempo de inactividad (2 minutos por defecto).
- Si el equipo estaba bloqueado, recargar no lo desbloquea.

### Rescate de ventas rechazadas
- **Problema:** un equipo de mesero (RedmiLuke) tenía 14 ventas que Firebase rechazaba en cada reintento.
- **Solución:** las ventas que Firebase rechaza de forma permanente se envían solas al PC Main como «Ventas por registrar». El Main las registra con sus permisos, conservando número, fecha, mesero y turno, sin duplicar. El equipo limpia su cola al confirmarse.

### Error corregido
El PC Main podía no recibir las solicitudes de cobro ni las entregas a caja si su rol de Main se cargaba unos segundos tarde.

## 2.3.2 — Eliminar dispositivos inactivos

- **Ajustes > Dispositivos:** botón «Eliminar» en los equipos revocados, perdidos o en solicitud pendiente, y «Limpiar dispositivos inactivos (N)» para quitarlos todos de una vez. Pide la contraseña administrativa y queda en la auditoría.
- **Límites:** no se puede eliminar un equipo activo (primero se revoca), un PC Main ni el propio equipo.
- **Advertencias:** la app avisa si el equipo aún no confirma el borrado de sus datos, si todavía puede enviar pendientes o si reportó ventas sin enviar. La limpieza masiva no toca esos casos.
- **Seguridad:** si el servidor confirma que un equipo ya no está autorizado, su plazo sin conexión se anula al instante.

## 2.3.3 — Licencia obligatoria y borrado preventivo

### Licencia obligatoria
- Con la clave pública del proveedor en la app, desaparece el «modo compatibilidad». Sin licencia firmada válida para el negocio y la dirección no hay ventas nuevas; sí historial, respaldos, Excel y cierres.
- **Con Firebase:** la licencia llega desde `licenses/{cafeId}`. Un proyecto Firebase ajeno no puede crear una licencia válida, porque no tiene la clave privada.
- **Sin Firebase:** se carga el archivo `.json` que descarga el emisor (botón nuevo «Descargar licencia (.json)»).
- **Copias:** una copia en otra dirección, o abierta como archivo local, muestra «Copia no autorizada» y no vende.

### Borrado preventivo
- **Revocar** permite borrar los datos del equipo; **eliminar** un equipo que ya operó tiene el mismo efecto.
- El borrado ocurre cuando al equipo ya no le queda nada por enviar. Nunca se borra lo que no llegó a Firebase: si quedan ventas sin enviar, el equipo las conserva y queda bloqueado.
- Al recibir el plazo para enviar pendientes, el equipo reintenta de inmediato.

## Configuraciones hechas fuera del código

Detalladas en la guía `Guia_Configuracion_Seguridad_Bullet_POS.md`:

| Configuración | Dónde |
|---|---|
| Quitar `localhost` de los dominios autorizados | Firebase Authentication |
| Restringir la clave de API a `thebulletes-web.github.io` y `bulletcoffeshop.firebaseapp.com` | Google Cloud |
| Licencia reemitida con titular «Bullet Coffee» y dirección `https://thebulletes-web.github.io` | Emisor de licencias |
| Limpieza de dispositivos y reinicio real de los datos de prueba | La app |

## Verificación

Se probó con Edge sin ventana y un Firebase simulado, en 14 escenarios:

| Escenario | Resultado |
|---|---|
| Cierre de caja | 5 de 5 |
| PIN con recargas | 26 de 26 |
| Rescate de ventas (mesero / Main) | 8 de 8 y 9 de 9 |
| Eliminar dispositivos | 11 de 11 |
| Equipo sin autorización | 9 de 9 |
| Licencia obligatoria | 12 de 12 |
| Borrado al revocar / al eliminar | 9 de 9 y 6 de 6 |
| Regresión 2.0 a 2.3 | sin fallas |

Las únicas diferencias en pruebas antiguas corresponden a comportamientos cambiados a propósito.

Las reglas de Firestore no se probaron en un emulador.

## Limitaciones
- Un equipo tiene que conectarse a internet al menos una vez para enterarse de una revocación o eliminación.
- Quien modifique el código puede saltarse las protecciones de la app. Los datos los protegen las reglas, la autorización de cada equipo y la restricción de la clave de API.
- App Check (reCAPTCHA) queda como mejora futura.
