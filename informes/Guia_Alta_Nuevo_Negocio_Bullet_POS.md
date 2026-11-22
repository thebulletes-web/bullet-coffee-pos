# Guía: dar de alta un negocio nuevo en Bullet POS

Guía para el proveedor (tú). Explica cómo preparar el Firebase de un negocio nuevo, emitir su licencia y su link de activación, y dejar su primer equipo funcionando como PC Main.

- **Requiere:** Bullet POS **2.5.0 o superior** y el emisor de licencias actualizado.
- **App (una sola para todos los negocios):** `https://thebulletes-web.github.io/bullet-coffee-pos/`
- **Emisor de licencias:** `https://thebulletes-web.github.io/bullet-coffee-pos/herramientas/emisor-licencias.html`
- **Cuenta del proveedor:** thebulletes@gmail.com
- **Tiempo aproximado:** 30 a 40 minutos la primera vez y unos 15 después.

> **Bullet Coffee no necesita nada de esto.** Sigue usando `firebase-config.js` como hasta ahora. Esta guía es para los negocios nuevos.

---

## Resumen del proceso

1. Crear el **proyecto de Firebase** del negocio.
2. Configurarlo: base de datos, inicio de sesión, dominio autorizado, reglas y clave de API.
3. En el **emisor**: registrar al cliente, firmar y publicar su **licencia**, y generar su **link de activación**.
4. Abrir el link en el **primer equipo** y autorizarlo desde el emisor.
5. En ese equipo: **empezar desde cero**, **configurar como PC Main**, crear el **PIN** y seguir el **asistente**.
6. Sumar los demás equipos con el mismo link.

---

## 0. Antes de empezar: ¿de quién es la cuenta?

| Opción | Cómo | Cuándo |
|---|---|---|
| **A. El proyecto es tuyo** (recomendado para el piloto) | Creas el proyecto con tu cuenta, o con una cuenta tuya exclusiva para clientes. Más adelante puedes agregar al cliente como miembro o traspasarlo. | Tienes el control completo mientras pruebas. |
| **B. El proyecto es del cliente** | El dueño crea su Gmail **él mismo, contigo presente**, con su propio teléfono de recuperación, y te agrega como **Editor** del proyecto (Configuración del proyecto → Usuarios y permisos). | Cuando el cliente quiere ser dueño de sus datos desde el inicio. |

- **No guardes contraseñas ajenas.** Si el dueño necesita ayuda, que te agregue como miembro del proyecto.
- **Quien es dueño del proyecto puede ver y borrar todo desde la consola de Firebase**, porque la consola no pasa por las reglas de seguridad.
- **La licencia sigue protegida por tu firma:** aunque el dueño borre o edite su licencia, no puede fabricar una válida. Si la borra, la app deja de vender.

---

## 1. Crear el proyecto de Firebase

1. Entra a **https://console.firebase.google.com** con la cuenta elegida.
2. Pulsa **«Crear un proyecto»** (o «Agregar proyecto»).
3. **Nombre:** algo claro, por ejemplo `bullet-trailer-la-esquina`. Anota el **ID del proyecto** que propone Firebase.
4. **Google Analytics:** no es necesario. Puedes desactivarlo.
5. Pulsa **«Crear proyecto»** y espera a que termine.

## 2. Configurar el proyecto

### 2.1 Base de datos (Firestore)
1. En el menú: **Compilación → Firestore Database → Crear base de datos**.
2. Elige el **modo de producción**.
3. **Ubicación:** la más cercana, por ejemplo `southamerica-east1` (São Paulo). No se puede cambiar después.
4. Pulsa **«Crear»**.

### 2.2 Inicio de sesión (Authentication)
1. **Compilación → Authentication → Comenzar**.
2. En **Método de acceso**, habilita estos dos proveedores:
   - **Anónimo**: lo usan los equipos del negocio.
   - **Google**: lo usas tú en el emisor para publicar la licencia. Elige tu correo como correo de asistencia.
3. En **Configuración → Dominios autorizados**, agrega `thebulletes-web.github.io`. Si quieres, quita `localhost`.

### 2.3 Reglas de seguridad
1. **Firestore Database → Reglas**.
2. Borra todo el texto, pega **todo** el contenido de `firestore.rules` del repositorio (versión **2.5.0 o superior**) y pulsa **«Publicar»**.
3. Comprueba que el comentario del principio diga «Bullet POS 2.5.0» (o la versión vigente).

> **Cada vez que cambien las reglas** en una versión nueva, hay que publicarlas **en el proyecto de cada negocio**, no solo en el de Bullet Coffee.

### 2.4 Registrar la app web y copiar la configuración
1. Pulsa el engranaje → **Configuración del proyecto → General**.
2. En **«Tus apps»**, pulsa el ícono web **`</>`**.
3. **Apodo:** `Bullet POS`. **No** marques Firebase Hosting.
4. Pulsa **«Registrar app»**.
5. Copia el bloque **`const firebaseConfig = { … }`**: apiKey, authDomain, projectId, storageBucket, messagingSenderId y appId. Lo vas a pegar en el emisor.

### 2.5 Restringir la clave de API (Google Cloud)
1. Entra a **https://console.cloud.google.com**, elige el proyecto del negocio y ve a **APIs y servicios → Credenciales**.
2. Abre la clave que dice **«Browser key (auto created by Firebase)»**.
3. En **Restricciones de aplicaciones**, elige **Sitios web** y agrega:
   - `https://thebulletes-web.github.io/*`
   - `https://<ID-del-proyecto>.firebaseapp.com/*`
4. Pulsa **«Guardar»**.

> **Plan:** el plan gratuito (Spark) alcanza para un negocio pequeño. Si el negocio crece mucho, revisa el uso en **Firestore → Uso**.

---

## 3. En el emisor de licencias

Abre el emisor: `…/herramientas/emisor-licencias.html`.

### 3.1 Paso 1: tu clave
Pulsa **«Cargar clave privada guardada (.json)»** y elige tu archivo de clave. **No generes una nueva.** Para más detalle, consulta la «Guía de licencias».

### 3.2 Paso 2: el cliente
1. Pulsa **«Nuevo cliente»**.
2. Llena los datos:
   - **Nombre del negocio:** por ejemplo «Trailer La Esquina». Sale en la app y en la licencia.
   - **cafeId:** un identificador **sin espacios**, por ejemplo `trailer-la-esquina`. No lo cambies después.
   - **WhatsApp de soporte** (opcional): tu número con indicativo, por ejemplo `573001234567`. El botón «Reportar un problema» del negocio enviará el reporte a ese número.
   - **Configuración web de Firebase:** pega el bloque `firebaseConfig` del punto 2.4.
3. Pulsa **«Guardar cliente»**.
4. Pulsa **«Exportar clientes»** y guarda el archivo junto a tu clave privada. Los clientes se guardan solo en ese navegador; con el archivo los recuperas en otro equipo usando «Importar clientes».

### 3.3 Paso 3: la licencia
1. Revisa los datos que se llenaron solos (cafeId y titular) y completa:
   - **Plan:** por ejemplo `piloto`.
   - **Máximo de dispositivos activos:** para un trailer, 3 o 4.
   - **Máximo de PC Main:** 1 o 2.
   - **Vence el:** fin del piloto (por ejemplo, dentro de 60 días).
   - **Días de gracia:** 7.
   - **Estado:** Activa.
   - **Direcciones autorizadas:** `https://thebulletes-web.github.io` (ya viene puesta). **No la dejes vacía.**
2. Deja marcada **«Atar la licencia al proyecto de Firebase del cliente»**. Así, una copia de la licencia en otro proyecto no sirve.
3. Pulsa **«Firmar licencia»**. Debe decir «Firmada y verificada».

### 3.4 Paso 4: publicar la licencia
1. Pulsa **«Iniciar sesión con Google»** y entra con **thebulletes@gmail.com**. La sesión es en el proyecto **de este cliente**.
2. Pulsa **«Publicar licencia firmada»**.
3. (Opcional) Pulsa **«Leer licencia actual»** para confirmar.

### 3.5 Paso 5: el link de activación
1. Pulsa **«Generar link de activación»**.
2. Pulsa **«Copiar link»** o **«Enviar por WhatsApp»**.

Sobre el link:
- **Va firmado con tu clave:** nadie puede crear uno falso ni cambiarlo.
- **Trae la conexión al Firebase del negocio.** No contiene contraseñas, pero solo envíalo al negocio.
- **Sirve para todos los equipos de ese negocio:** el primero y los que vengan después.

---

## 4. Primer equipo (será el PC Main)

### 4.1 En el equipo
1. Abre el link de activación. En iPhone, ábrelo en **Safari**.
2. La app pregunta: **«¿Activar este equipo para «Trailer La Esquina»?»**. Acepta.
3. Sale **«Instala Bullet POS»**:
   - **PC o Android:** pulsa **Instalar** y confirma. Después abre la app desde el ícono.
   - **iPhone:** pulsa **«Copiar código de activación»**, sigue los pasos de Compartir → «Agregar a inicio», abre la app desde el ícono y **pega el código** cuando lo pida.
4. El equipo queda **«Pendiente»** de autorización.

### 4.2 Autorizarlo desde el emisor
1. En el emisor, **paso 6**, pulsa **«Ver equipos pendientes»**. Hace falta haber iniciado sesión con Google (paso 4).
2. Escribe un nombre, por ejemplo «PC Caja», y pulsa **«Autorizar este equipo»**.

Esto solo funciona mientras el negocio **no tenga PC Main**. Después, todos los equipos los autoriza el PC Main.

> **Plan B:** también puedes autorizarlo en la consola de Firebase. Ve a **Firestore → `cafeterias/<cafeId>/devices/<ID>`** y cambia `active` a `true`.

### 4.3 Dejarlo como PC Main
1. En el equipo aparece **«Negocio nuevo»**: pulsa **«Empezar desde cero»**. Si el negocio viene de otro equipo con datos, usa «Restaurar un respaldo».
2. Ve a **Ajustes → «Configurar como PC Main»** y escribe la contraseña inicial: **`setup`**.
3. **Crea el PIN** de la persona administradora.
4. Se abre el **asistente de configuración**:
   1. **Negocio:** nombre, NIT, teléfono y dirección.
   2. **Contraseña:** una propia de al menos 8 caracteres. **Anótala en un lugar seguro.**
   3. **Forma de trabajo:** «Negocio pequeño (2 a 4 personas)» o «Negocio con meseros (control estricto)».
   4. **Productos:** la app trae un catálogo de ejemplo. Cámbialo por el del negocio en la pestaña Productos, o importa su Excel.
   5. **Caja:** pulsa «Abrir caja ahora» y escribe la base del día.

---

## 5. Los demás equipos

1. Envía el **mismo link de activación** a cada celular o tablet. En iPhone, ábrelo en Safari.
2. Instala la app y ábrela. El equipo queda «Pendiente».
3. En el **PC Main**, ve a **Ajustes → Dispositivos** y autorízalo.
   - Con el perfil «Negocio pequeño», el equipo queda **con cobro directo**.
   - Con el perfil «con meseros», queda **sin cobro directo**: el cobro lo hace el PC Main.
4. Si el negocio tendrá un segundo PC Main, autorízalo como en Bullet Coffee (código de vinculación del segundo Main).
5. Cada persona crea su **PIN** al usar el equipo por primera vez.

---

## 6. Renovar, suspender o cambiar la licencia

Haz lo mismo que en el punto 3, con el **cliente elegido en el paso 2**:
1. Carga la clave.
2. Elige el cliente.
3. Cambia lo necesario: fecha, estado o límites.
4. Firma y publica.

Los equipos reciben el cambio solos.

---

## 7. Si algo no funciona

| Problema | Qué revisar |
|---|---|
| El emisor dice «permiso denegado» al publicar | ¿Entraste con thebulletes@gmail.com? ¿Está habilitado el acceso con **Google** en Authentication de **ese** proyecto? ¿Están publicadas las reglas 2.5.0? |
| «Ver equipos pendientes» da permiso denegado | ¿El negocio ya tiene PC Main? (Entonces se autoriza desde el PC Main.) ¿Reglas 2.5.0 publicadas? ¿Licencia publicada? |
| La app dice «Sin licencia» o «otro proyecto» | Publica la licencia **en el proyecto del cliente**, con el **cafeId** correcto y atada a **su** proyecto. Abre la app con internet. |
| «El código no está firmado por el proveedor» | El link se cortó al copiarlo. Vuelve a enviarlo completo, o usa «Enviar por WhatsApp» del emisor. |
| El equipo no se conecta (`auth/...` o `api-key`) | Revisa el dominio autorizado (2.2) y la restricción de la clave de API (2.5). |
| Se queda en «Esperando respaldo inicial» | Debe aparecer «Negocio nuevo → Empezar desde cero». Si no aparece, recarga la app. |
| El cliente tiene un problema | Pídele **Ajustes → Soporte → «Reportar un problema»**. Te llega el diagnóstico del equipo por WhatsApp o correo. |

---

## 8. Lista rápida por negocio

- [ ] Proyecto de Firebase creado y anotado su ID.
- [ ] Firestore creado (modo producción, ubicación cercana).
- [ ] Authentication: **Anónimo** y **Google** habilitados.
- [ ] Dominio autorizado `thebulletes-web.github.io`.
- [ ] Reglas `firestore.rules` (2.5.0 o superior) **publicadas en ese proyecto**.
- [ ] App web registrada y `firebaseConfig` copiado.
- [ ] Clave de API restringida a `thebulletes-web.github.io/*` y `<ID>.firebaseapp.com/*`.
- [ ] Emisor: cliente guardado y **clientes exportados** (copia).
- [ ] Licencia firmada, **atada al proyecto** y **publicada**.
- [ ] Link de activación enviado.
- [ ] Primer equipo autorizado, como PC Main, con PIN y asistente completo.
- [ ] Contraseña administrativa del negocio anotada por el dueño.
