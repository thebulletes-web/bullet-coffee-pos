# Informe de cambios — Bullet POS 2.5.2

- **Fecha:** 22 de noviembre de 2026
- **Versión anterior:** 2.5.1
- **Archivos modificados:** `index.html`, `sw.js`, `LEEME_Integracion.txt`
- **Archivo nuevo:** `.gitignore`
- **Reglas de Firestore:** no cambian. Siguen las de 2.5.1.

## Problema que resuelve

Todos los negocios usan la misma dirección de la app. Si alguien abría esa dirección **sin el link de activación**, la app se conectaba sola al Firebase de Bullet Coffee, que es el que figura en `firebase-config.js`. Ese equipo aparecía como «Pendiente» en el PC Main de Bullet Coffee. No veía datos, porque no estaba autorizado, pero llenaba la lista de equipos.

## Cambios

### 1. Un equipo nuevo pregunta a qué negocio pertenece
Un equipo que nunca se ha conectado y no tiene activación muestra primero **«Activa este equipo»**, tanto en el navegador como en la app instalada. Tiene dos opciones:
- **Pegar el código o el link de activación**, o abrir el link que envió el proveedor.
- **«Es un equipo de bullet-coffee»:** pide confirmar y avisa: «Si te enviaron un link de activación de otro negocio, cancela y abre ese link».

Mientras no elija, el equipo no se conecta a ningún Firebase.

**No cambia nada para los equipos que ya trabajaban** (Bullet Coffee y los negocios activados): no ven esa pantalla.

### 2. El borrado preventivo conserva el negocio
Cuando se revoca o se elimina un equipo, se borran sus datos locales. Ahora ese borrado **conserva a qué negocio pertenece** (la activación no contiene ventas ni datos de clientes). Así, al usar «Preparar como equipo nuevo», el equipo vuelve a pedir autorización **en su negocio** y no en el de Bullet Coffee.

### 3. Vincular el segundo PC Main sin la pestaña Ajustes
- **Problema:** al generar el código, el PC Main decía «En el otro equipo: Ajustes → Administración principal → Vincular como segundo Main». Los equipos secundarios **no ven Ajustes**, así que no había por dónde escribir el código.
- **Ahora, en el PC Main:** en Ajustes → «Autorizar segundo Main» aparece una ventana con el **código en grande** (por ejemplo `SEFQ-FM2Z`), la **cuenta regresiva** de los 10 minutos, el botón **Copiar código** y los pasos.
- **Ahora, en el otro equipo:**
  1. Toca el **indicador de sincronización** de arriba.
  2. La **primera tarjeta** del panel es «Vincular como segundo PC Main». Escribe el código, con o sin guion y en mayúsculas o minúsculas, y pulsa **Vincular**.
  3. El equipo se recarga como PC Main y ya ve Ajustes.
- **No cambia:** los equipos secundarios siguen sin ver la pestaña Ajustes, el código sigue siendo de un solo uso y válido 10 minutos, y las reglas de Firebase siguen comprobándolo.

### 4. `.gitignore`
Es un archivo nuevo que impide que Git suba **por error** al repositorio público estos archivos:
- la clave privada del emisor (`*CLAVE-PRIVADA*`, `bullet-licencias-*.json`);
- la lista de clientes exportada (`bullet-clientes-*.json`);
- las licencias descargadas y los respaldos JSON.

Se revisó el historial del repositorio y **la clave privada nunca se subió**: solo aparecen el código del emisor y el nombre del archivo en la documentación.

## Recomendaciones de seguridad para GitHub

El repositorio de GitHub es **la app de todos los negocios**. Quien controle la cuenta podría publicar una versión alterada, por eso protegerla es lo más importante. En orden de prioridad:

1. **Verificación en dos pasos en la cuenta de GitHub.** Ve a Settings → Password and authentication. Usa una app de autenticación o una llave de acceso (passkey) y guarda los **códigos de recuperación** junto a la clave privada, fuera del computador.
2. **Correo de la cuenta protegido.** El Gmail asociado a GitHub también debe tener verificación en dos pasos. Quien entre a ese correo puede recuperar GitHub.
3. **Proteger la rama `main`.** En el repositorio, ve a Settings → Rules → Rulesets → New branch ruleset para `main`, y marca **«Block force pushes»** y **«Restrict deletions»**. Así nadie puede reescribir ni borrar el historial.
4. **Revisar los accesos.** En Settings → Applications y Settings → Developer settings → Personal access tokens, quita las aplicaciones y los tokens que no uses. Si necesitas un token, que sea «fine-grained», solo para este repositorio y con vencimiento.
5. **Escaneo de secretos.** En el repositorio, ve a Settings → Code security y activa **Secret scanning** y **Push protection**. Son gratis en repositorios públicos y bloquean subidas que contengan claves.
6. **Marcar cada versión.** Crea una etiqueta por versión (por ejemplo `v2.5.2`) en Releases. Si una versión sale mal, se vuelve a la anterior en minutos.
7. **Copia del repositorio fuera de GitHub.** La carpeta del proyecto en tu PC ya es una copia completa. Guarda otra de vez en cuando en una memoria o en la nube.
8. **Más adelante, si quieres ocultar el código:** usa un repositorio privado con publicación en Firebase Hosting o Cloudflare Pages (gratis), o GitHub Pro para Pages privado. Implica cambiar la dirección de la app. Hazlo **antes** de tener muchos clientes, porque obliga a volver a emitir las licencias y a volver a activar los equipos.

## Pruebas realizadas

Las pruebas se hicieron en un navegador automatizado con un Firebase simulado, sin tocar los datos reales.

- **Equipo nuevo sin activar (8 de 8 verificaciones correctas):**
  - Pregunta a qué negocio pertenece y no se conecta solo al de la instalación.
  - Avisa si el código no es válido.
  - Pide confirmar antes de usar el negocio de la instalación; al confirmar, se conecta y pide autorización.
  - Al recargar no vuelve a preguntar.
- **Segundo PC Main (12 de 12):**
  - El PC Main genera el código y muestra la ventana con la cuenta regresiva y los pasos correctos, sin mencionar Ajustes.
  - En el equipo secundario, que no tiene Ajustes, la tarjeta aparece arriba del panel de sincronización. El código escrito en minúsculas y con guion se acepta sin volver a pedirlo.
  - El equipo queda como PC Main y, al recargar, ve Ajustes.
- **Regresión:** pasan completas las pruebas de varios negocios (30), instalación (10), equipo eliminado y preparado como nuevo (11), PIN (27) y turnos con aprobación (25).
