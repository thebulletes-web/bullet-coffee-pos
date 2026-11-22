# Informe de cambios — Bullet POS 2.5.0

- **Fecha:** 22 de noviembre de 2026
- **Versión anterior:** 2.4.1
- **Archivos modificados:** `index.html`, `sw.js`, `firestore.rules`, `herramientas/emisor-licencias.html`, `LEEME_Integracion.txt`
- **Documento nuevo:** `informes/Guia_Alta_Nuevo_Negocio_Bullet_POS.md`
- **Reglas de Firestore:** **sí cambian**. Hay que publicarlas en Bullet Coffee y en cada negocio nuevo.

## Objetivo

Preparar Bullet POS para una prueba piloto con negocios pequeños (trailers y locales con 2 a 4 personas). Cada negocio tiene su propio Firebase y su licencia, todos usan **la misma app**, y nada de lo que ya funciona en Bullet Coffee cambia.

## Principio de compatibilidad

- **Sin código de activación, la app funciona exactamente como antes:** usa `firebase-config.js`, que es el caso de Bullet Coffee.
- **Lo nuevo solo se activa** con un link de activación o si el dueño lo elige (el perfil de operación o el asistente).
- **Una licencia sin el campo nuevo** («projects») se verifica igual que antes.
- **Las reglas nuevas solo agregan un permiso al proveedor**, y solo mientras un negocio no tenga PC Main.

## 1. Varios negocios con una sola app: código de activación

- **El link:** en el emisor, cada cliente obtiene un link `…/#activar=CÓDIGO`. El código trae la configuración de su proyecto de Firebase y su identificador de negocio (`cafeId`), y va **firmado con la clave del proveedor**, la misma de las licencias. Nadie puede crear uno falso ni modificarlo: la app lo rechaza.
- **Al abrir el link:** la app pide confirmar «Activar este equipo para…». Desde ese momento se conecta al Firebase de ese negocio. La configuración se aplica antes de que la app arranque y la firma se vuelve a verificar al abrirla.
- **Cambio de negocio:** si el equipo ya tenía datos de otro negocio, se borran **del equipo** (nunca de la nube) y queda como equipo nuevo, pendiente de autorización. Si tiene operaciones sin enviar, no lo permite hasta que se sincronicen. En un PC Main pide la contraseña administrativa.
- **iPhone:** como la app instalada no comparte datos con Safari, la pantalla de instalación ofrece **«Copiar código de activación»**, y la app instalada lo pide al abrirse («Activa este equipo»).
- **Ajustes, «Negocio de este equipo»:** muestra la activación (negocio, proyecto y fecha), permite activar con un código y copiar el link para otro equipo.

## 2. Licencia atada al proyecto de Firebase

- La licencia puede llevar el campo `projects` con el proyecto de Firebase del negocio. **Una copia de la licencia en otro proyecto no vale.** La app muestra «La licencia pertenece a otro proyecto de Firebase».
- El campo está dentro de la firma, así que no se puede quitar ni cambiar.
- El emisor lo marca por defecto para los clientes nuevos. Para Bullet Coffee queda desmarcado, por compatibilidad con equipos que aún no tengan la 2.5.0.

## 3. Negocio nuevo con Firebase vacío

- **Error corregido:** el primer equipo de un negocio sin datos se quedaba en **«Esperando respaldo inicial»** y nunca llegaba a ser PC Main. En Bullet Coffee no pasaba porque ya tenía datos.
- **Ahora:** aparece **«Negocio nuevo»**, con las opciones «Empezar desde cero» y «Restaurar un respaldo».
- **Primer equipo:** el proveedor puede autorizarlo desde el emisor (paso 6), solo mientras el negocio no tenga PC Main. Después, todos los equipos los autoriza el PC Main, como siempre.

## 4. Perfil de operación: «Negocio pequeño»

En **Ajustes → Seguridad y operación** hay dos botones que llenan el formulario, y luego se pulsa «Guardar política»:

| | Negocio pequeño (2 a 4 personas) | Negocio con meseros (control estricto) |
|---|---|---|
| Quién cobra | Todos los equipos (cobro directo) | El PC Main; los meseros envían solicitudes |
| Turno | Opcional | Obligatorio |
| Entrega a caja | Automática | Separada |
| Sin conexión | 72 h en secundarios / 168 h en el Main | 8 h / 24 h |
| Bloqueo con PIN | 5 minutos | 2 minutos |

- Hay una casilla nueva: **«Los equipos nuevos se autorizan con Cobro directo»**.
- Todo sigue editable a mano. El cambio pide la contraseña administrativa y queda en la auditoría.

## 5. Asistente de primer uso (PC Main)

Se abre solo en un PC Main nuevo, es decir, con la contraseña inicial o con el catálogo vacío. No aparece en Bullet Coffee. Tiene cinco pasos:

1. **Negocio:** nombre, NIT, teléfono y dirección.
2. **Contraseña:** reemplaza la inicial (`setup`) por una propia de al menos 8 caracteres.
3. **Forma de trabajo:** «Negocio pequeño» o «con meseros».
4. **Productos:** la app trae un catálogo de ejemplo. Se puede ir a Productos o importar un Excel; si el catálogo está vacío, ofrece cargar productos de ejemplo.
5. **Caja:** «Abrir caja ahora».

Se puede dejar para después y abrir de nuevo desde **Ajustes → Soporte → «Asistente de configuración»**.

## 6. Soporte: «Reportar un problema»

En **Ajustes → Soporte**, la persona escribe qué pasó y se adjunta un diagnóstico:
- versión, negocio, proyecto y equipo;
- si la app está instalada y si hay conexión;
- estado de la sincronización y de la cola (con los errores);
- licencia, turno, caja y errores recientes.

No incluye ventas ni datos de clientes. Se envía por **WhatsApp** (al número de soporte del negocio, si el link lo trae), por **correo** a thebulletes@gmail.com o se copia.

## 7. Emisor de licencias

- **Paso 2, Cliente:** cada negocio con su nombre, `cafeId`, WhatsApp de soporte y la configuración de Firebase (se pega tal cual de la consola). Los clientes se pueden exportar e importar.
- **Paso 3, Licencia:** casilla «Atar la licencia al proyecto». La dirección autorizada viene llena por defecto.
- **Paso 4, Publicar:** publica en el Firebase **del cliente elegido**.
- **Paso 5, Activación:** genera, copia o envía por WhatsApp el link de activación.
- **Paso 6, Primer equipo:** ver los equipos pendientes y autorizar el primero.

## Seguridad (firestore.rules)

Se agregó la función `vendorBootstrap`. Solo mientras **no existe PC Main** (`control/admin`), la cuenta del proveedor puede:
- ver los equipos;
- autorizar uno: `active`, `name`, `role`, `approvedAt` y `approvedBy`, con una licencia válida.

En cuanto el negocio tiene PC Main, ese permiso desaparece. El resto de las reglas no cambia.

## Pruebas realizadas

Las pruebas se hicieron en un navegador automatizado con un Firebase simulado, sin tocar los datos reales.

- **Varios negocios (30 de 30 verificaciones correctas):**
  - Sin activación arranca con `firebase-config.js`.
  - Una licencia atada a otro proyecto se rechaza.
  - Se rechazan un código alterado y un texto que no es un código.
  - Al abrir el link:
    - la app se activa y borra los datos del negocio anterior;
    - el equipo pide autorización;
    - aparece «Empezar desde cero» y la licencia del proyecto queda válida.
  - Configuración del primer equipo:
    - queda como primer PC Main;
    - el asistente guarda los datos, rechaza contraseñas distintas, guarda una contraseña propia y aplica el perfil «Negocio pequeño»;
    - un equipo nuevo queda con cobro directo;
    - los botones de perfil llenan el formulario.
  - Soporte y comprobaciones finales:
    - el diagnóstico de soporte sale completo y el WhatsApp va al número del negocio;
    - un equipo instalado sin activar pide el código;
    - la firma se revisa de nuevo al abrir la app;
    - no hay errores.
- **Emisor ↔ app (4 de 4):** la app acepta el link y la licencia generados por el emisor (con tildes y «Ñ»), rechaza un link alterado y detecta que se quitó el campo `projects`.
- **Bullet Coffee sin cambios:**
  - pasan completas las pruebas de PIN (27 y 20), solicitudes de cobro (21), equipo nuevo tras eliminarlo (11), inventario (54) e instalación (10);
  - en la prueba general (t1) solo fallan las 3 verificaciones conocidas: el número de versión, las hojas del Excel y una expectativa antigua de la política.
