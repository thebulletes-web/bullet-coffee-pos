# Informe de cambios — Bullet POS 2.4.1

- **Fecha:** 21 de noviembre de 2026
- **Versión anterior:** 2.4.0
- **Archivos modificados:** `index.html`, `sw.js`, `manifest.webmanifest`, `LEEME_Integracion.txt`
- **Reglas de Firestore:** no cambian. Siguen las de 2.4.0.
- **Documentos agregados:** `informes/Guia_Licencias_Bullet_POS.md` (guía de licencias para el proveedor).

## Objetivo

Que un equipo nuevo use Bullet POS como **app instalada** y no en el navegador. Al abrir el link de la app, la instalación se ofrece de entrada en lugar de quedar escondida en Ajustes.

## Límite de los navegadores

Ningún navegador permite que una página web se instale sola: la persona siempre tiene que tocar un botón y confirmar. Además:

- **Android y PC (Chrome/Edge):** la app puede mostrar su propio botón «Instalar», que abre la ventana de instalación del sistema.
- **iPhone/iPad:** Apple no permite que una página muestre esa ventana. Solo se pueden mostrar los pasos de Safari.

## Cambios

### 1. Pantalla «Instala Bullet POS» en equipos nuevos
Aparece cuando un equipo **nunca ha sincronizado** abre la app en el navegador:

- **Android y PC:** botón **«Instalar Bullet POS»**. Mientras el navegador no lo habilite, se muestran los pasos del menú ⋮ → «Instalar aplicación».
- **iPhone/iPad:** tres pasos con dibujos: Compartir ⬆ → «Agregar a inicio» → «Agregar». Si se abrió en otro navegador del iPhone, la pantalla avisa que hay que usar Safari.
- **«Continuar en el navegador»:** para quien no pueda o no quiera instalarla.

### 2. La autorización se pide desde la app instalada
La solicitud al PC Main se envía cuando la persona abre la app instalada, o cuando elige continuar en el navegador.

Esto importa en el iPhone: allí la app instalada guarda sus datos **aparte de Safari**. Si se vinculaba primero en Safari y después se instalaba, el PC Main veía dos solicitudes del mismo teléfono y había que autorizarlo dos veces. En Android y PC no pasa, porque el navegador y la app comparten los datos.

### 3. Después de instalar
La pantalla cambia a **«¡Listo, Bullet POS quedó instalada!»** e indica que hay que abrirla desde el ícono de la pantalla de inicio (o del escritorio) y que ya se puede cerrar la pestaña del navegador.

### 4. Equipos que ya trabajan en el navegador
- Ven un aviso discreto abajo: «Usa Bullet POS como app en este equipo» con el botón «Instalar». Se puede cerrar y no vuelve a salir por 7 días.
- Si el navegador detecta que la app ya está instalada (Chrome en Android y PC), el aviso dice «Bullet POS ya está instalada en este equipo: ábrela desde tu pantalla de inicio».
- La tarjeta «Instalar como app» de Ajustes sigue igual. En iPhone ahora explica que la app instalada guarda sus datos aparte de Safari.

### 5. Links que abren la app (manifest)
- En Android, con la app instalada, un link enviado por WhatsApp u otra app se abre **directamente en la app** y reutiliza la ventana que ya estaba abierta.
- Se fijó la identidad de la app (`id`). Coincide con la que ya tenían las instalaciones existentes, así que no se duplican.

### 6. Corrección (inventario)
Un lote de producción crea varios movimientos. Si llegaba una actualización de Firebase justo entre el envío de uno y otro, uno de ellos (por ejemplo, la entrada de la preparación) podía desaparecer de la pantalla. Ahora todos quedan registrados como pendientes antes del primer envío.

## Cómo vincular un equipo nuevo (paso a paso)

1. Envía el link de la app al equipo: `https://thebulletes-web.github.io/bullet-coffee-pos/`.
2. Ábrelo en el equipo. En iPhone, ábrelo en **Safari**.
3. Sigue la pantalla «Instala Bullet POS»: en Android o PC toca **Instalar** y confirma; en iPhone, Compartir → Agregar a inicio.
4. Abre **Bullet POS** desde el ícono nuevo.
5. En el PC Main, ve a **Ajustes > Dispositivos** y autoriza el equipo pendiente.

## Pruebas realizadas

Las pruebas se hicieron en un navegador automatizado con un Firebase simulado, sin tocar los datos reales.

- **Equipo nuevo (10 de 10 verificaciones correctas):**
  - Aparece la pantalla de instalación y no se pide autorización mientras la persona no elija.
  - Sin el evento del navegador se muestran los pasos del menú; con el evento aparece el botón «Instalar», que pide permiso al sistema y muestra «¡Listo…!».
  - En iPhone se muestran los 3 pasos de Safari.
  - Al elegir «Continuar en el navegador» la pantalla se oculta y recién entonces llega la solicitud al PC Main.
  - Al recargar, un equipo ya vinculado no vuelve a ver la pantalla.
- **Inventario (2.4.0):** 54 de 54 correctas en tres corridas seguidas.
- **Regresión:** las pruebas de PIN (27 de 27) y de «equipo nuevo tras eliminarlo» (11 de 11) pasan completas.
