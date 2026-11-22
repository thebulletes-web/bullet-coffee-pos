# Guía de configuración y seguridad — Bullet POS

- **Versión de la app:** 2.3.3
- **Proyecto Firebase:** `bulletcoffeshop` · negocio (`cafeId`): `bullet-coffee`
- **Dirección de la app:** https://thebulletes-web.github.io/bullet-coffee-pos/
- **Correo del proveedor y de soporte:** thebulletes@gmail.com

Esta guía reúne lo que se configuró fuera del código (Firebase, Google Cloud y el emisor de licencias) y los procedimientos para mantener el sistema.

---

## 1. Publicar las reglas de Firestore

**Cuándo:** cada vez que una versión cambia `firestore.rules`, **antes** de actualizar los equipos.

1. Abre https://console.firebase.google.com y entra al proyecto **BulletCoffeShop**.
2. Ve a **Firestore Database > Reglas**.
3. Borra todo el texto y pega el contenido completo de `firestore.rules` (desde GitHub o la carpeta del proyecto).
4. Pulsa **Publicar**.
5. **Comprueba:** la segunda línea debe decir `// Bullet POS 2.3.0 — Reglas de seguridad de Firestore.`. Las versiones 2.3.1, 2.3.2 y 2.3.3 no cambiaron las reglas.

---

## 2. Dominios autorizados (Firebase Authentication)

**Ruta:** Firebase Console > **Authentication > Configuración > Dominios autorizados**.

| Dominio | Estado | Motivo |
|---|---|---|
| `localhost` | **Eliminado** | Solo sirve para pruebas en un computador. |
| `bulletcoffeshop.firebaseapp.com` | Se conserva | Dominio de inicio de sesión; lo usa el emisor de licencias para entrar con Google. |
| `bulletcoffeshop.web.app` | Se conserva | Hosting de Firebase del proyecto; solo el dueño puede publicar ahí. |
| `thebulletes-web.github.io` | Se conserva | Donde vive la app. |

> **Nota:** esta lista controla el inicio de sesión con Google. **No** limita el inicio de sesión anónimo de los equipos del POS. Eso lo hace la restricción de la clave de API (sección 3).

---

## 3. Restricción de la clave de API (Google Cloud)

Es la medida que impide que una copia de la app en otra dirección se conecte al proyecto.

1. Abre https://console.cloud.google.com con la misma cuenta y elige el proyecto **bulletcoffeshop**.
2. Ve a **APIs y servicios > Credenciales**.
3. En «Claves de API», abre la clave que empieza con `AIzaSyBcU5…` (la misma de `firebase-config.js`).
4. En **Restricciones de aplicaciones**, elige **Sitios web** y deja estas dos entradas:
   - `https://thebulletes-web.github.io/*`
   - `https://bulletcoffeshop.firebaseapp.com/*`
5. Guarda. El cambio tarda unos minutos.

**Comprobación:** la app en el PC Main y en un teléfono debe mostrar «Sincronización activa».

**Si algo deja de funcionar:** si aparece un error que menciona «referer» o «API key», vuelve a esa pantalla y elige **Ninguna** para deshacerlo.

**Si cambias de dirección** (por ejemplo, a un dominio propio):
- agrégala aquí y en los dominios autorizados (sección 2);
- reemite la licencia con la dirección nueva (sección 4).

---

## 4. Licencias (emisor del proveedor)

**Herramienta:** https://thebulletes-web.github.io/bullet-coffee-pos/herramientas/emisor-licencias.html

### 4.1 Claves (ya hecho; no repetir)
- Se generaron una sola vez. La clave pública (`keyId` **1f602859**) está en `index.html`, dentro de `LICENSE_PUBLIC_KEYS`.
- La clave privada está en el archivo `bullet-licencias-CLAVE-PRIVADA-1f602859.json`.
  - **Guárdala fuera del repositorio**, con al menos una copia de respaldo (por ejemplo, una memoria USB y un almacenamiento privado).
  - **No la compartas.** Quien la tenga puede emitir licencias válidas.
  - Si se pierde, hay que generar claves nuevas, cambiar la clave pública en `index.html` y reemitir todas las licencias.

### 4.2 Licencia vigente del negocio

| Campo | Valor |
|---|---|
| Titular | Bullet Coffee |
| Negocio | `bullet-coffee` |
| Número | `BP-MWQX10QT` |
| Plan | profesional |
| Dispositivos / PC Main | 5 / 2 |
| Vence | 22/11/2027, con 7 días de gracia |
| Dirección autorizada | `https://thebulletes-web.github.io` |

**Comprobación:** en la app, Ajustes > Licencia > «Verificar licencia». Debe decir «firma del proveedor verificada».

### 4.3 Renovar o modificar la licencia

Hazlo antes del vencimiento, o al cambiar límites o direcciones:

1. Abre el emisor (de preferencia en una ventana de incógnito).
2. **«1. Clave del proveedor»:** carga el archivo de clave privada.
3. **«2. Datos de la licencia»:** llena los mismos datos de la tabla anterior, con la nueva fecha de vencimiento. Escribe la dirección solo con esquema y dominio, sin `/bullet-coffee-pos` ni barra final.
4. **«Firmar licencia»:** debe decir «Firmada y verificada con la clave 1f602859».
5. **«3. Publicar en Firebase»:** inicia sesión con Google (la cuenta del proveedor) y pulsa **«Publicar licencia firmada»**.
6. En la app: Ajustes > Licencia > «Verificar licencia».

### 4.4 Equipo sin Firebase (instalación de un solo equipo)
1. En el emisor, firma la licencia y pulsa **«Descargar licencia (.json)»**.
2. En la app de ese equipo: Ajustes > Licencia > **«Cargar licencia»** y elige el archivo.

### 4.5 Qué hace la app con la licencia (desde 2.3.3)
- Sin licencia válida, o en una dirección no autorizada, **no permite ventas nuevas**.
- Siguen disponibles el historial, los respaldos, el Excel y los cierres de caja.
- La licencia solo la puede escribir la cuenta del proveedor (lo exigen las reglas).

---

## 5. Contraseña administrativa

- La inicial es `setup`. **Debe cambiarse** en Ajustes > Administración principal > «Cambiar contraseña» (mínimo 8 caracteres).
- **Cámbiala también si** un PC Main se pierde o es reportado como perdido.

---

## 6. Recuperar el PC Main si pierde su identidad

**Síntoma:** el PC aparece como «Pendiente: ID…» o como dispositivo secundario. Ocurre si se borran los datos del navegador o se cambia de navegador o perfil. Desde la versión que corrigió el emisor, iniciar sesión en la herramienta de licencias ya no lo provoca.

1. Anota el ID nuevo del PC: es el que aparece en «Pendiente: …» o en el panel de sincronización > «ID de este equipo».
2. En Firebase Console > Firestore > `cafeterias` > `bullet-coffee` > `devices` > ese ID:
   - `active` = `true` (tipo booleano);
   - opcional: `name` = `PC Main` y `role` = `main`.
3. En `control` > `admin`:
   - en `mainDeviceIds`, agrega el ID (máximo 2) y quita los que ya no existan;
   - en `mainDeviceId`, pon el mismo ID;
   - **no toques** `passwordHash` ni `passwordSalt`.
4. Recarga la app en el PC.
5. Revoca y elimina la identidad vieja en Ajustes > Dispositivos.

**Comprobación:** Ajustes dice «Este equipo es el PC Main» y el plazo sin conexión es el del PC Main.

---

## 7. Dispositivos: revocar, perdido y eliminar

**Ruta:** Ajustes > Dispositivos (solo PC Main).

| Acción | Cuándo usarla | Qué pasa |
|---|---|---|
| **Revocar** | El equipo ya no se usa. | Se bloquea al conectarse. Opcional: plazo de 24 h para enviar pendientes y **borrar sus datos** (recomendado). |
| **Perdido** | Robo o pérdida. | Bloqueo sin plazo. Opcional: borrado al conectarse. Si era Main, cambia la contraseña. |
| **Eliminar** | Equipos revocados o pendientes que ya no quieres en la lista. | Se quita de la lista. Si ya había operado, se bloquea y borra sus datos al conectarse. |
| **Limpiar dispositivos inactivos** | Limpieza general. | Elimina de una vez los que no tienen advertencias. |
| **Permitir / Quitar cobro directo** | Equipos de mesero que deben cobrar solos. | Por defecto, los meseros envían solicitudes de cobro al PC Main. |

**Regla de borrado:** nunca se borra nada que no haya llegado a Firebase.

---

## 8. Reinicio real de datos

**Ruta:** Ajustes > Reinicio global de historial (solo PC Main).

**Antes de empezar:**
1. Todos los equipos actualizados a la última versión.
2. Sin mesas abiertas ni turnos abiertos (se cierran en Caja > Turnos de meseros).
3. Caja cerrada.
4. Sin operaciones pendientes en el PC Main (si las hay, usa «Reparar sincronización», sección 9).

**Pasos:**
1. Escribe la contraseña y el texto `REINICIAR`.
2. La app descarga un respaldo JSON y un Excel completos.
3. Borra los datos de operación en Firebase y en todos los equipos.

**Qué se conserva:** productos, licencia, roles, PC Main, dispositivos, personal y PIN, y la configuración.

---

## 9. Sincronización: reparar y ventas rechazadas

- **PC Main — «Reparar sincronización»:** está en el panel de sincronización y en Ajustes > Almacenamiento. Retira las operaciones de periodos anteriores y los errores permanentes (guardándolos aparte), y vuelve a enviar lo válido.
- **Equipo de mesero con ventas rechazadas:** las envía solo al PC Main como «Ventas por registrar»; el Main las registra desde las solicitudes. También existe el botón «Enviar al PC Main ahora» en el panel de sincronización del equipo.

---

## 10. Orden para publicar una versión nueva

1. Respaldo JSON desde el PC Main.
2. Si la versión cambia `firestore.rules`, publicarlas (sección 1).
3. Subir los archivos a GitHub y esperar a que GitHub Pages publique.
4. Abrir el **PC Main** con internet y recargar.
5. Abrir **cada equipo de mesero** con internet, cerrar la app por completo y volver a abrirla.
6. Revisar en cada equipo el panel de sincronización: licencia activa, «ID de este equipo» visible, sin errores.

---

## 11. Calendario de mantenimiento

| Cuándo | Qué |
|---|---|
| Cada semana | Respaldo JSON desde el PC Main (indicador de último respaldo). |
| Cada mes | Ajustes > Dispositivos: revocar y limpiar equipos que ya no se usen. |
| Antes del 22/11/2027 | Renovar la licencia (sección 4.3). |
| Si se pierde un equipo | Marcarlo «Perdido» con borrado y, si era Main, cambiar la contraseña. |

---

## 12. Mejora pendiente (opcional)

**Firebase App Check (reCAPTCHA):** haría que Firebase acepte solicitudes solo de la app en su dominio. Requiere registrar el sitio en reCAPTCHA y activarlo en Firebase, primero en modo de monitoreo.
