# Informe de cambios — Bullet POS 2.4.0

- **Fecha:** 21 de noviembre de 2026
- **Versión anterior:** 2.3.4
- **Archivos modificados:** `index.html`, `firestore.rules`, `sw.js`, `LEEME_Integracion.txt`
- **Reglas de Firestore:** **sí cambian**. Hay que publicarlas en Firebase.

## Objetivo

Que el POS no solo cobre, sino que diga cuánto se gasta, cuánto se produce y cuánto se gana realmente. Para eso, la versión agrega un módulo de **inventario y costos** y un botón para **imprimir el cierre de caja**.

## Qué existía y se reutilizó

| Área | Antes de 2.4.0 | En 2.4.0 |
|---|---|---|
| Catálogo | Productos con nombre, categoría y precio. Sin tamaños ni adiciones. | Son los mismos «productos de venta» del inventario. No hay catálogo nuevo. |
| Ventas | Cada línea guarda nombre, precio y cantidad. | Cada venta guarda además su consumo y su costo (`sale.inv`). |
| Anulación | Solo un PC Main anula; la venta queda marcada como anulada. | Anular devuelve el consumo al inventario, sin escribir nada más. |
| Impresión | Corte X y Reporte Z en 58 mm, 80 mm y carta; reimpresión desde el historial. | Botón «Imprimir cierre», formato A4 y detalle de los movimientos de caja. |
| Excel | Ventas, caja, turnos, entregas, etc. | Se suman las hojas Inventario, Movimientos inventario y Recetas, y cada reporte se exporta por separado. |

## 1. Pestaña «Inventario»

Solo aparece en los PC Main. Usa tarjetas parecidas a las de la venta de mostrador, con un color por tipo y filtros:

- **Materia prima** (café, leche, panela, hielo, agua…).
- **Insumos / consumibles** (vasos, tapas, filtros, servilletas…).
- **Preparaciones** (sub-recetas): por ejemplo, el concentrado de cold brew. «Producir lote» descuenta los ingredientes y entra el stock de la preparación a su costo.
- **Reventa**: un producto sin receta, como una botella de agua, que se descuenta 1 a 1.
- **Productos de venta**: los mismos del catálogo, con su receta, costo y margen.

Cada elemento tiene:
- nombre, tipo y categoría;
- unidad base (g, ml o unidades) y unidad de compra con su equivalencia. Por ejemplo, 1 kg entra como 1.000 g y un paquete de 50 vasos entra como 50 u;
- stock mínimo, proveedor y costo de compra.

El stock y el **costo promedio ponderado** se calculan solos.

Arriba de la pestaña hay una línea con el valor del inventario, los productos con receta y las alertas de stock negativo o bajo el mínimo.

## 2. Recetas estandarizadas

- Cada producto puede tener una receta. Ejemplo, Cold Brew 12 oz: 20 g de café, 250 ml de agua, 150 g de hielo, 1 vaso y 1 tapa.
- Por producto se ven el costo de producción, el precio, el margen en pesos y en %, y cuántas unidades se pueden preparar con el stock actual y qué ingrediente lo limita (por ejemplo: «Quedan 20 Cold Brew 12 oz; limita Agua»).
- **Tamaños y adiciones:** hoy cada tamaño ya es un producto del catálogo, así que cada uno tiene su propia receta. Las adiciones (shot extra, cambio a leche vegetal) se crean como productos de una categoría «Adiciones». Su receta admite cantidades negativas para restar un ingrediente, por ejemplo +200 ml de avena y −200 ml de leche.
- **Versiones:** cada cambio de receta crea una versión nueva con fecha y nota. Las ventas nuevas usan la versión vigente. Las ventas pasadas conservan la receta y el costo con que se vendieron, así que los reportes históricos no cambian.
- **Simulación:** un reporte recalcula un periodo pasado con las recetas actuales, sin modificar nada.

## 3. Descuento automático al vender

- **Cómo se descuenta:** el consumo de cada venta no se guarda como un movimiento aparte. Viaja dentro de la propia venta. El stock se calcula con los movimientos más las ventas no anuladas. Así:
  - no se pierde ni se duplica ningún descuento, aunque se trabaje sin conexión o con varios equipos;
  - anular una venta devuelve su consumo automáticamente;
  - el consumo solo puede existir junto con una venta válida.
- **Costo de cada venta:** cada venta guarda el costo de lo vendido en ese momento.
- **Equipos con «Cobro directo»:** también guardan el consumo, porque leen los elementos y las recetas.
- **Ventas sin ese dato** (anteriores a 2.4.0 o de equipos sin recetas): se calculan con la receta que estaba vigente en su fecha.
- **Falta de stock:** nunca bloquea una venta. El stock queda negativo, se marca en rojo y el PC Main recibe un aviso. La pestaña también muestra un contador rojo.

## 4. Movimientos de inventario

- **Compra / entrada:** proveedor, cantidad en unidad de compra o en unidad base, costo total, fecha y número de factura opcional. Antes de guardar se muestra el nuevo costo promedio.
- **Merma:** cantidad, motivo (vencido, dañado, derramado, prueba/calibración, cortesía u otro) y nota.
- **Ajuste manual:** entrada o salida, con motivo obligatorio.
- **Conteo físico:** el Main escribe lo que realmente hay. La app muestra la diferencia con el inventario teórico y su valor, y la registra como ajuste.
- **Producción de lotes:** descuenta los ingredientes y entra la preparación a su costo.
- **Registro de cada movimiento:** todos guardan quién, cuándo y desde qué equipo, y quedan en la auditoría.
- **Correcciones:** los movimientos no se borran. «Corregir» registra un movimiento contrario; en un lote de producción se corrige el lote completo.

## 5. Reportes

Todos tienen filtro de fechas y exportación a Excel:

1. Inventario actual y valor total.
2. Stock bajo el mínimo y negativo.
3. Consumo de materia prima e insumos por periodo (ventas, producción y mermas).
4. Costo por producto y margen.
5. Costo de ventas vs. ingresos (ganancia bruta). Separa los ingresos de productos sin receta para que el margen no engañe.
6. Inventario teórico vs. conteo físico.
7. Compras y entradas.
8. Mermas y pérdidas, en cantidad y en dinero, por motivo.
9. Ajustes manuales.
10. Simulación de un periodo pasado con las recetas actuales.

## 6. Calculadora

- Calculadora flotante en la pestaña y dentro de cada ventana de inventario. Se usa con el teclado (Enter para calcular, Esc para cerrar) o con toques.
- Conversiones rápidas: kg↔g, L↔ml, oz↔ml y lb↔g.
- El botón «Pasar resultado al campo» llena el último campo numérico que se tocó.

## 7. Imprimir cierre de caja

- En Caja, el botón **«Imprimir cierre»** permite elegir el cierre (el último, uno anterior o el corte X de la caja abierta) y el formato: ticket térmico de 58 mm, 80 mm, hoja carta o A4.
- El reporte incluye fecha, responsable, base inicial, ventas por método de pago, propinas, **el detalle de cada movimiento de caja** (nuevo), efectivo esperado vs. contado, diferencia y firma.
- Los botones «Reporte Z» del historial también imprimen el detalle de movimientos.

## Seguridad (firestore.rules)

- `invItems` y `invRecipes`: todos los equipos autorizados los leen; solo un PC Main los crea o modifica. No se pueden borrar. Una receta no puede perder versiones.
- `invMovements`: solo un PC Main los lee y los crea, siempre de la generación vigente. No se modifican (solo se acepta el reintento idéntico). Únicamente el reinicio global borra los de generaciones anteriores.
- El consumo por venta vive dentro de la venta, así que solo se genera junto con una venta válida.
- El sistema de licencias y la clave `1f602859` no se tocaron.

## Decisiones tomadas

1. **El consumo va dentro de la venta, no en un movimiento aparte.** Es la forma más segura de no perder ni duplicar descuentos sin conexión y de devolverlos al anular.
2. **Saldos:** el stock se recalcula en memoria con los movimientos y las ventas guardadas en el equipo, incluidas las archivadas. Con miles de ventas tarda milisegundos y no depende de cortes manuales.
3. **Tamaños y adiciones como productos del catálogo**, con receta propia y cantidades negativas para las sustituciones. No cambia cómo se vende.
4. **Reinicio global:** borra los movimientos de inventario (son historial) y conserva los elementos y las recetas. Después conviene hacer un conteo físico.
5. **Respaldo JSON:** incluye elementos, recetas y movimientos.
6. **Sin contraseña administrativa para cada compra o merma:** el PC Main ya está protegido con PIN. Todo queda en la auditoría.

## Pasos para publicar

1. Subir `index.html`, `sw.js`, `firestore.rules` y `LEEME_Integracion.txt` a GitHub (rama `main`).
2. En Firebase: **Firestore Database → Reglas**, pegar todo el contenido de `firestore.rules` y pulsar **Publicar**.
3. Abrir la app en cada equipo con internet. Se actualiza sola (caché `bullet-pos-v2.4.0`).

## Pruebas realizadas

Las pruebas se hicieron en un navegador automatizado con un Firebase simulado, sin tocar los datos reales.

**Ejemplo completo (54 de 54 verificaciones correctas):**

1. Crear café, leche, agua, hielo, vasos, tapas y una botella de reventa.
2. Registrar una compra de 1 kg de café, que entra como 1.000 g a $60/g. Costo promedio ponderado de la leche: 1 L a $4.000 + 2 L a $10.000 = $4,67/ml.
3. Crear la receta del Cold Brew 12 oz: costo $2.050, margen $6.950 (77,2 %), «quedan 20; limita Agua».
4. Vender 3. Quedan 940 g de café y 47 vasos y tapas, y la venta guarda un costo de $6.150. La botella se descuenta 1 a 1. El Latte, sin receta, se vende igual y no descuenta nada.
5. Registrar una merma de 200 g de café dañado.
6. Conteo físico: 700 g contra 740 teóricos; queda una diferencia de −40 g registrada.
7. Anular la venta: se devuelven 60 g de café, 3 vasos y 3 tapas.
8. Receta versión 2 (18 g): las ventas nuevas la usan y la venta anterior conserva la versión 1.
9. Producir un lote de concentrado: entran 800 ml a $7,5/ml y se descuentan los ingredientes.
10. Corregir la merma con un movimiento contrario.
11. Venta con stock insuficiente: se registra igual, el stock queda en negativo y aparece el aviso.
12. Los 10 reportes y la exportación a Excel funcionan; la simulación no modifica nada.
13. Calculadora: 2 L → 2.000 ml pasados al campo.
14. Todo queda sincronizado con Firebase: generación, autor, costo promedio en el elemento y versiones de receta.
15. Imprimir el cierre en A4 con el detalle de los movimientos de caja, y en ticket de 58 mm.
16. Al recargar la app, el inventario queda igual.

**Regresión:** las pruebas de las versiones anteriores siguen pasando. Las únicas diferencias son esperadas: el número de versión, la cantidad de hojas del Excel (ahora hay 3 más) y una expectativa antigua de la política de plazos.
