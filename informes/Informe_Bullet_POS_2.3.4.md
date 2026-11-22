# Informe de cambios — Bullet POS 2.3.4

- **Fecha:** 21 de noviembre de 2026
- **Versión anterior:** 2.3.3 (commit `36c38b5`)
- **Commit:** 2.3.4 `ebfcbf1`
- **Repositorio:** github.com/thebulletes-web/bullet-coffee-pos
- **Archivos modificados:** `index.html`, `sw.js`, `LEEME_Integracion.txt`
- **Reglas de Firestore:** no cambian desde 2.3.0. No hace falta publicar nada en Firebase.

## Contexto

Al usar la 2.3.3 en el negocio aparecieron dos problemas:
- un teléfono revocado y después eliminado no aparecía como pendiente en el PC Main cuando se intentaba conectar otra vez con «Preparar como equipo nuevo»; un equipo solo revocado y vuelto a autorizar sí funcionaba;
- las pantallas de PIN mostraban los nombres de las dos primeras personas creadas («Admin» y «Redmi»), y al configurar un equipo nuevo solo se podía elegir entre esos dos nombres.

## 1. Corrección: «Preparar como equipo nuevo»

### Problema
Al eliminar un equipo, la app borra sus datos y lo bloquea. La marca de bloqueo se guarda en dos lugares: el almacenamiento rápido del navegador (localStorage) y la base local (IndexedDB). El botón «Preparar como equipo nuevo» solo borraba la primera. Al recargar, la app recuperaba el bloqueo desde IndexedDB y el equipo seguía bloqueado. Nunca llegaba a conectarse con Firebase, así que su solicitud no se enviaba y el PC Main no podía verla.

### Solución
El botón ahora borra el bloqueo en los dos lugares antes de recargar. El equipo arranca limpio, se conecta con una identidad nueva y aparece como **Pendiente** en el PC Main para autorizarlo. Hay que asignarle otra vez su rol y sus permisos (por ejemplo, «Cobro directo»).

### Qué hacer con el teléfono que quedó bloqueado
Con la 2.3.4 publicada: abrir la app en el teléfono, pulsar «Preparar como equipo nuevo» y autorizarlo desde el PC Main (Ajustes > Dispositivos).

## 2. Identificación solo con PIN

### Antes
- La pantalla de bloqueo mostraba un botón por persona: primero se elegía el nombre y luego se escribía el PIN.
- El inicio de turno tenía una lista de nombres.
- Al configurar un equipo nuevo con «Ya tengo PIN», había que elegir el nombre en una lista.

### Ahora
- Ninguna pantalla de acceso muestra nombres. Solo hay un campo: «Escribe tu PIN (la app reconoce quién eres)».
- **Bloqueo:** la app busca a quién pertenece el PIN escrito y desbloquea con esa persona.
- **Inicio de turno:** solo pide el PIN y una nota opcional. El turno queda a nombre de quien escribió el PIN.
- **Equipo nuevo:** en «Ya tengo PIN» basta con escribir el PIN. En «Persona nueva» se escribe el nombre (para reportes) y el PIN.

### PIN único
Como el PIN identifica a la persona, dos personas activas no pueden tener el mismo PIN. La app lo comprueba al:
- crear una persona en Ajustes > Personal y PIN;
- restablecer el PIN de una persona;
- crear la primera persona al configurar un equipo nuevo.

Si el PIN ya está en uso, la app muestra el aviso «Ese PIN ya lo usa otra persona: elige otro» y no guarda nada.

### Reglas de seguridad que se mantienen
- En un PC Main solo desbloquea un PIN de una persona de administración, o la contraseña administrativa. Un PIN de mesero no abre el Main.
- Con un turno abierto, solo desbloquea quien lo abrió o un administrador. Si otro mesero escribe su PIN, la app muestra «El turno abierto es de …».
- Tras 5 intentos fallidos, hay que esperar antes de volver a intentar.
- El bloqueo por inactividad (2 minutos por defecto) y el comportamiento al recargar no cambian.
- Los PIN siguen guardados cifrados (PBKDF2); nunca se guardan en texto.

### Dónde siguen apareciendo los nombres
Los nombres no se eliminaron: siguen en los reportes, los cierres de turno y de caja, la auditoría y Ajustes > Personal y PIN, para saber quién hizo cada cosa. Solo dejaron de mostrarse en las pantallas de acceso.

### Recomendación
Si dos personas creadas antes de esta versión tienen el mismo PIN, la app reconoce primero a la dueña del turno abierto. Conviene restablecer el PIN de una de ellas desde Ajustes > Personal y PIN.

## Pruebas realizadas

Todas las pruebas se hicieron en un navegador automatizado con un Firebase simulado, sin tocar los datos reales.

| Prueba | Resultado |
|---|---|
| PIN en un equipo de mesero: configuración, turno, bloqueo, intentos fallidos, recarga, pantallas sin nombres | 27 de 27 correctas |
| PIN en el PC Main: administración, PIN repetido al crear y al restablecer, PIN de mesero no abre el Main, contraseña administrativa | 20 de 20 correctas |
| Equipo eliminado → «Preparar como equipo nuevo» → aparece pendiente → se autoriza y vuelve a operar | 11 de 11 correctas |

## Compatibilidad

- No se pierde ninguna función existente.
- Las personas y los PIN creados antes siguen funcionando sin cambios.
- La caché de la app (`sw.js`) pasa a `bullet-pos-v2.3.4`, así que los equipos se actualizan solos al abrir la app con conexión.
