# Informe de cambios — Bullet POS 2.1.1 y 2.2.0

- **Fecha:** 21 de noviembre de 2026
- **Versión anterior:** 2.1.0
- **Repositorio:** github.com/thebulletes-web/bullet-coffee-pos

## Corrección previa: herramienta de licencias (commit `256381d`)

**Problema.** Al iniciar sesión con Google en `herramientas/emisor-licencias.html`, esa sesión reemplazaba la identidad del POS en el mismo navegador. El PC Main quedó como «Pendiente» y perdió su rol.

**Corrección.** La herramienta ahora usa su propia conexión de Firebase, con una sesión que dura solo mientras la pestaña está abierta.

**Recuperación.** Se registró la nueva identidad del PC Main en `control/admin`. Además, el panel de seguridad ahora muestra el ID del equipo con un botón para copiarlo.

## 2.1.1 — Plazos cortos sin conexión (commit `35f732e`)
- Opciones nuevas de 1, 2, 4, 8 y 12 horas, además de 1 a 30 días.
- La verificación con el servidor ocurre cada cuarto del plazo, entre 5 y 30 minutos.
- El aviso «debe conectarse» aparece solo si el equipo de verdad lleva rato sin poder verificar.
- Recomendado: meseros de 4 a 8 h; PC Main 24 h.

## 2.2.0 — PIN por persona y bloqueo por inactividad

### Decisiones del negocio
- Un PIN por cada mesero.
- Bloqueo a los 2 minutos sin actividad.
- El PC Main y el segundo Main también se bloquean.
- Iniciar turno exige el PIN.
- El PIN se configura cuando un equipo se sincroniza.

### Funcionamiento
- **Personal:** se guarda en `staff/{id}`, con el PIN cifrado con PBKDF2. Hay copia en cada equipo para desbloquear sin internet.
- **Configuración al sincronizar:** aparece una ventana obligatoria: «Crear mi PIN» o «Ya tengo PIN». En un PC Main se crea personal de administración.
- **Bloqueo:** ocurre al abrir la app y tras N minutos sin actividad (1, 2, 5, 10 o desactivado). Se desbloquea eligiendo el nombre y escribiendo el PIN.
- **PC Main:** solo desbloquea el personal de administración, o la contraseña administrativa como respaldo.
- **Turno abierto:** solo su dueño o un administrador puede desbloquear ese equipo.
- **Iniciar turno:** exige persona y PIN, y el turno guarda `staffId`. El nombre de quien atiende ya no se escribe a mano.
- **Intentos fallidos:** después de 5, espera de 1 minuto y registro en la auditoría.
- **Ajustes > Personal y PIN (PC Main):** permite agregar personas, restablecer PIN y desactivar. Siempre queda al menos una persona de administración activa.
- **Reglas:** `staff` es legible por los equipos autorizados. Un equipo secundario solo registra a su propio mesero; lo demás lo hace el PC Main.

## Verificación
Se probó con Edge sin ventana y un Firebase simulado:

| Escenario | Resultado |
|---|---|
| Mesero con PIN | 23 de 23 |
| PC Main con PIN | 16 de 16 |
| Plazos cortos | 9 de 9 |
| Regresión 2.1 | 47 de 47 y 27 de 27 |
| Regresión 2.0 | 45 de 45 y 22 de 22 |

Las pruebas de licencias de 2.0 usan licencias sin firma, así que se corrieron sin la clave pública del negocio. Con la clave instalada, la app rechaza esas licencias, que es lo correcto.

Las reglas de Firestore no se probaron en un emulador.

## Pasos de despliegue
1. Publicar `firestore.rules` (2.2.0).
2. Subir `index.html`, `sw.js`, `firestore.rules` y el LEEME.
3. Abrir primero el PC Main y crear el PIN de administración.
4. Abrir luego cada equipo de mesero y crear su PIN.

## Limitaciones
- Un PIN de 4 a 6 dígitos protege el uso diario, pero es más débil que la contraseña administrativa.
- Para un equipo robado, lo efectivo es marcarlo como «Perdido».
