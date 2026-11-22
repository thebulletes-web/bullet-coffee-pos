# Guía de licencias — Bullet POS

Guía de consulta para el proveedor (tú). Explica quién crea la licencia, cómo llega a los equipos y qué hacer en cada situación.

- **Herramienta:** `herramientas/emisor-licencias.html`, publicada en `https://thebulletes-web.github.io/bullet-coffee-pos/herramientas/emisor-licencias.html`.
- **Cuenta del proveedor:** thebulletes@gmail.com (Google, con el correo verificado).
- **Clave pública en la app:** `1f602859`, en `LICENSE_PUBLIC_KEYS` dentro de `index.html`. No se debe tocar.

---

## 1. La idea en una frase

**La licencia la creas y la publicas tú, desde el emisor. Los equipos (PC Main y secundarios) solo la reciben y la verifican.** Ningún PC Main puede crear, cambiar ni borrar una licencia.

## 2. Por qué nadie más puede hacerla

Hay dos candados independientes:

1. **La firma.** Cada licencia se firma con tu **clave privada**. La app la verifica con la clave pública `1f602859`. Una licencia hecha por otra persona no tiene una firma válida y la app la rechaza («la firma no corresponde al proveedor»).
2. **Las reglas de Firebase.** En `firestore.rules`, la sección `licenses/{cafeId}` solo deja escribir a la cuenta del proveedor (`isVendor()`: thebulletes@gmail.com con el correo verificado). Ni un PC Main, ni un secundario, ni otra cuenta pueden escribirla.

Además, la licencia indica el **negocio** (`cafeId`) y las **direcciones autorizadas**. Una copia de la app en otra dirección o para otro negocio no funciona con tu licencia.

## 3. Lo más importante: tu clave privada

- Se generó **una sola vez** con «Generar par de claves nuevo» y quedó en un archivo `.json` descargado.
- **Guárdala en un lugar seguro y con copia** (por ejemplo, una memoria USB y una carpeta privada en la nube). **No la subas a GitHub ni se la envíes a nadie.**
- **Si la pierdes,** no podrás firmar licencias nuevas con la clave `1f602859`. Habría que generar otro par de claves, poner la nueva clave pública en `index.html` y volver a emitir todas las licencias.
- **Si alguien la obtiene,** podría firmar licencias falsas. En ese caso: genera un par nuevo, cambia la clave pública en `index.html` y vuelve a emitir las licencias.
- **No uses «Generar par de claves nuevo» por error.** Para firmar, usa siempre «Cargar clave privada guardada (.json)».

## 4. Emitir o renovar una licencia (paso a paso)

1. Abre el emisor: `https://thebulletes-web.github.io/bullet-coffee-pos/herramientas/emisor-licencias.html`.
2. **1. Clave del proveedor:** pulsa **«Cargar clave privada guardada (.json)»** y elige tu archivo de clave privada. Si no cargas la clave, la licencia saldría sin firma y la app la rechazaría.
3. **2. Cliente:** elige el negocio. «Instalación principal (firebase-config.js)» es Bullet Coffee. Para un negocio nuevo, sigue la «Guía: dar de alta un negocio nuevo».
4. **3. Datos de la licencia:**

   | Campo | Qué poner |
   |---|---|
   | Negocio (cafeId) | Se llena solo con el del cliente. Para Bullet Coffee: `bullet-coffee`. |
   | Titular | Nombre del negocio, p. ej. «Bullet Coffee». |
   | Número de licencia | Un identificador tuyo, p. ej. `BC-2026-001`. |
   | Plan | El nombre del plan contratado. |
   | Máximo de dispositivos activos | Cuántos equipos puede tener autorizados (0 = sin límite). |
   | Máximo de PC Main | 1 o 2. |
   | Vence el | Fecha de vencimiento. |
   | Días de gracia | Días extra después del vencimiento antes de bloquear (p. ej. 7). |
   | Estado | «Activa» (o «Suspendida» para bloquear). |
   | Direcciones autorizadas | `https://thebulletes-web.github.io` (una por línea; ya viene puesta). **Si lo dejas vacío, sirve en cualquier dirección: no lo dejes vacío.** |
   | Atar al proyecto de Firebase | **Marcada** para negocios nuevos: una copia en otro proyecto no vale. En Bullet Coffee déjala **desmarcada** hasta que todos sus equipos tengan la 2.5.0. |

5. Pulsa **«Firmar licencia»**.
6. **4. Publicar en Firebase:** pulsa **«Iniciar sesión con Google»** y entra con **thebulletes@gmail.com**. La sesión es en el proyecto del cliente elegido.
7. Pulsa **«Publicar licencia firmada»**.
8. (Opcional) Pulsa **«Leer licencia actual»** para confirmar lo que quedó publicado.
9. En el PC Main, ve a **Ajustes > Licencia** y comprueba el estado, el vencimiento y que diga **firma verificada**.

> **Renovar** es lo mismo: carga la clave, cambia «Vence el», firma y publica. Los equipos reciben la renovación solos.

> **Ojo con la sesión de Google:** el emisor usa su propia sesión (independiente de la app), así que entrar con Google allí no le quita el rol al PC Main. Aun así, ciérrala al terminar si el equipo es compartido.

## 5. Cómo llega la licencia a los equipos

### Con Firebase (el caso de Bullet Coffee)
- Llega **sola**. Todos los equipos autorizados, PC Main y secundarios, la leen del servidor y la guardan para trabajar sin internet.
- No hay que hacer nada en los equipos. Basta con abrir la app con conexión.

### Sin Firebase (un negocio con un solo equipo)
1. En el emisor, después de «Firmar licencia», pulsa **«Descargar licencia (.json)»**.
2. Envía ese archivo al cliente.
3. En su equipo: **Ajustes > Licencia > «Cargar licencia»** y elige el archivo. El botón solo aparece cuando la app no está conectada a Firebase.

## 6. Qué pasa en la app según el estado

| Situación | Qué ve el negocio |
|---|---|
| Licencia vigente y firmada | Todo funciona con normalidad. |
| Faltan pocos días para el vencimiento | Funciona normal, con el aviso «Licencia por vencer»: es el momento de renovar. |
| Vencida, dentro de los días de gracia | Sigue funcionando, con aviso de vencimiento. |
| Vencida, pasados los días de gracia | **No permite ventas nuevas.** Sí deja ver el historial, sacar respaldos, exportar a Excel y hacer cierres de caja. Con Firebase, tampoco deja autorizar equipos nuevos ni abrir turnos. |
| Suspendida | Igual que vencida: bloquea las ventas nuevas. |
| Sin licencia, o firma inválida | Bloquea las ventas nuevas («Sin licencia»). |
| Dirección no autorizada o de otro negocio | La licencia no es válida en esa copia. |

## 7. Qué hace el PC Main con la licencia

**Solo verla.** En **Ajustes > Licencia** muestra el estado, el titular, el vencimiento, los límites y si la firma está verificada. El PC Main no la crea, no la edita y no la renueva.

## 8. Situaciones frecuentes

- **El cliente dice «sin licencia» aunque la publiqué.**
  1. En el emisor, pulsa «Leer licencia actual» y revisa el negocio, la fecha y las direcciones.
  2. Comprueba que la publicaste **firmada** (con la clave cargada).
  3. Abre la app con internet y recarga.
- **«La firma no corresponde al proveedor».** Se firmó sin clave o con una clave distinta de `1f602859`. Carga la clave privada correcta, firma y publica de nuevo.
- **«Esa licencia es de otro negocio».** El campo «Negocio (cafeId)» no coincide con el de `firebase-config.js`.
- **Quiero bloquear a un cliente que no pagó.** Cambia el estado a «Suspendida» (o pon una fecha pasada), firma y publica.
- **El cliente necesita más equipos o un segundo PC Main.** Sube «Máximo de dispositivos activos» o «Máximo de PC Main», firma y publica.
- **Cambié de dirección web** (otro dominio). Agrega la nueva dirección en «Direcciones autorizadas», firma y publica, **antes** de mover la app.

## 9. Lista rápida (para cada emisión)

- [ ] Abrí el emisor y cargué mi **clave privada** (no generé una nueva).
- [ ] Negocio = `bullet-coffee` (o el `cafeId` del cliente).
- [ ] Fecha de vencimiento y días de gracia correctos.
- [ ] Direcciones autorizadas **no vacías**.
- [ ] Firmé la licencia.
- [ ] Entré con **thebulletes@gmail.com** y publiqué (o descargué el `.json` si el cliente no usa Firebase).
- [ ] En el PC Main, Ajustes > Licencia dice **vigente** y **firma verificada**.
