# Usabilidad en SmartBusiness IA

Este documento explica cómo el frontend aplica dos marcos de usabilidad:

1. **Las 10 heurísticas de Jakob Nielsen.** Sirven para evaluar la interfaz cualitativamente.
2. **GOMS / KLM** (Card, Moran y Newell). Sirve para medir cuantitativamente cuánto tarda un usuario experto en completar una tarea.

---

## 1. Heurísticas de Nielsen

| # | Heurística | Cómo se cumple en SmartBusiness IA | Dónde |
|---|---|---|---|
| 1 | **Visibilidad del estado del sistema** | Spinners con texto en cada carga. Botones que cambian a "Registrando…" o "Desactivando…". Notificaciones (toasts) al terminar cada acción. Ítem activo resaltado en el menú. En Nueva venta, el producto que se agregará con Enter aparece resaltado y el total se anuncia con `aria-live`. En Inventario, una vista previa muestra el stock que quedará (**actual → resultante**) antes de confirmar. | `shared/components/spinner`, `toast`, `venta-form`, `inventario` |
| 2 | **Relación entre el sistema y el mundo real** | Lenguaje del negocio peruano: soles (S/), "bodega", "botica", "entrada / salida / ajuste", "stock mínimo". Los íconos representan objetos reconocibles (carrito, recibo, paquete). | Todo el frontend |
| 3 | **Control y libertad del usuario** | "Deshacer" al quitar un producto del carrito o al vaciarlo. Diálogos con "Cancelar" enfocado por defecto, que se cierran con Esc o con clic fuera. Esc también cierra el menú de usuario y el menú lateral. "Cambiar de negocio" siempre visible. | `toast.service.ts`, `confirm-dialog`, `shell` |
| 4 | **Consistencia y estándares** | Un único diálogo de confirmación con el estilo de la app, en lugar del `confirm()` nativo del navegador. Etiquetas que coinciden con la acción real ("Desactivar" en vez de "Quitar"). Mismo patrón de cabecera, botones y badges en todas las pantallas. | `confirm.service.ts`, `producto-list`, `empleado-list` |
| 5 | **Prevención de errores** | Aviso al salir de una venta con productos en el carrito o de un formulario con cambios sin guardar (también al cerrar la pestaña). No se puede vender más que el stock: los botones +/− se deshabilitan en los límites. Una salida de inventario mayor al stock se bloquea en el frontend y también en el backend. Las acciones destructivas siempre piden confirmación. | `pending-changes.guard.ts`, `venta-form`, `inventario`, `InventarioService.java` |
| 6 | **Reconocer antes que recordar** | La ayuda bajo el buscador indica qué hará Enter. Los atajos aparecen en los tooltips del menú ("Productos (Alt+2)") y en los botones (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>). Inventario se abre con el producto ya elegido desde el catálogo. El carrito avisa "máximo en stock". | `shell`, `venta-form`, `producto-list` |
| 7 | **Flexibilidad y eficiencia de uso** | Atajos para usuarios expertos: <kbd>N</kbd> nueva venta, <kbd>/</kbd> buscar, <kbd>Alt</kbd>+<kbd>1…6</kbd> secciones, <kbd>Enter</kbd> agrega el primer resultado, <kbd>Ctrl</kbd>+<kbd>Enter</kbd> cobra. Botón "Nueva venta" siempre visible en la barra superior. Después de cobrar, la pantalla queda lista para el siguiente cliente. Los usuarios nuevos pueden seguir usando solo el mouse. | `shell`, `venta-form` |
| 8 | **Diseño estético y minimalista** | Paleta reducida con colores semánticos: rojo = peligro, verde = éxito, morado = IA. Tarjetas limpias. Solo se muestra la información necesaria; el detalle de cada venta se despliega a pedido. | `styles.css`, `venta-list` |
| 9 | **Ayudar a reconocer, diagnosticar y corregir errores** | Mensajes en lenguaje claro junto al campo con error. El backend devuelve códigos correctos: 401 credenciales, 403 cuenta deshabilitada, 409 email duplicado o stock insuficiente. Los mensajes dicen qué pasó y cuánto hay ("Solo hay 4 en stock…"). Los errores inesperados ya no muestran detalles técnicos internos. | `error.interceptor.ts`, `GlobalExceptionHandler.java`, `ReglaNegocioException.java` |
| 10 | **Ayuda y documentación** | Panel "Atajos de teclado" que se abre con <kbd>?</kbd> o con el botón de ayuda de la barra superior. Cada pantalla tiene un subtítulo que explica para qué sirve. Los estados vacíos indican el siguiente paso ("Agrega productos para empezar…"). | `shortcuts-help`, `empty-state` |

### 1.1 Cambio de contraseña ("Mi cuenta")

Se llega desde el menú de usuario → **Mi cuenta y contraseña** (`/app/cuenta`). El backend expone el endpoint protegido con JWT `PUT /api/usuarios/me/password`.

| Heurística | Aplicación |
|---|---|
| 1 · Estado del sistema | La lista de requisitos se marca en verde mientras se escribe (8 caracteres, distinta de la actual, ambas coinciden). El botón cambia a "Guardando…" y al terminar aparece una notificación de éxito. |
| 3 · Control y libertad | Casilla "Mostrar contraseñas" para revisar lo escrito. Si sales con el formulario a medio llenar, se pide confirmación. |
| 5 · Prevención de errores | Se exige la contraseña actual, así que una sesión olvidada abierta no basta para cambiarla. La nueva se escribe dos veces. Las validaciones se hacen en el frontend y se repiten en el backend. |
| 9 · Mensajes de error claros | "La contraseña actual no es correcta" se muestra junto al campo correspondiente. Responde 400 y no 401, para no confundirse con una sesión expirada y no cerrar la sesión. |

### 1.2 Corrección de la tabla de Productos (heurística 8)

Las líneas de la tabla se desalineaban porque la celda de acciones (`<td>`) tenía `display: flex`. Con eso deja de comportarse como celda de tabla y su borde y su altura no coinciden con el resto de la fila. Ahora los botones van dentro de un contenedor interno y todas las celdas se alinean al centro verticalmente.

---

## 2. Análisis GOMS

### 2.1 Modelo GOMS de la tarea principal

**Objetivo (Goal):** registrar la venta de un cliente que lleva 3 productos.

```
GOAL: Registrar venta
  GOAL: Abrir el punto de venta
    [selección] SI la mano está en el teclado → MÉTODO atajo: pulsar N
                SI la mano está en el mouse   → MÉTODO botón: clic en "Nueva venta" (barra superior)
  GOAL: Agregar cada producto (repetir por producto)
    MÉTODO buscar-y-Enter:
      escribir parte del nombre → verificar el producto resaltado → pulsar Enter
    [selección] SI hay varios parecidos → MÉTODO clic en "Agregar" del producto correcto
  GOAL: Ajustar cantidades (opcional)
    MÉTODO +/− o escribir la cantidad
  GOAL: Cobrar
    [selección] teclado → Ctrl+Enter   |   mouse → clic en "Registrar venta"
```

### 2.2 Cálculo KLM (Keystroke-Level Model)

Tiempos estándar de los operadores (Card, Moran y Newell, 1980):

| Operador | Significado | Tiempo |
|---|---|---|
| **K** | Pulsar una tecla (mecanógrafo promedio) | 0,28 s |
| **P** | Apuntar con el mouse a un objetivo | 1,10 s |
| **B** | Presionar o soltar el botón del mouse (un clic = BB) | 0,10 s |
| **H** | Mover la mano entre el teclado y el mouse | 0,40 s |
| **M** | Preparación mental antes de una acción | 1,35 s |

**Supuestos:** se parte del Panel, se buscan 3 productos escribiendo 4 letras de cada uno y se cobra. No se cuenta el tiempo de respuesta del servidor.

#### Tarea A: registrar una venta de 3 productos

**Antes de las mejoras**

| Paso | Operadores | Tiempo |
|---|---|---|
| Ir a Ventas (menú) | M P BB | 2,65 s |
| Clic en "+ Nueva venta" | M P BB | 2,65 s |
| Producto 1: clic en el buscador, escribir, volver al mouse, clic en "Agregar" | M P BB H 4K H M P BB | 7,22 s |
| Productos 2 y 3: igual, pero antes hay que borrar el texto anterior (Ctrl+A) | 2 × (7,22 + 2K) | 15,56 s |
| Clic en "Registrar venta" | M P BB | 2,65 s |
| **Total** | | **30,73 s** |

Además, después de cobrar la app volvía a la lista de ventas, así que la **siguiente venta** sumaba de nuevo el clic en "+ Nueva venta" (2,65 s).

**Después de las mejoras (usuario experto con teclado)**

| Paso | Operadores | Tiempo |
|---|---|---|
| Pulsar <kbd>N</kbd> (el buscador ya queda enfocado) | M K | 1,63 s |
| Cada producto: escribir 4 letras y Enter (el buscador se limpia solo) | 3 × (M 5K) | 8,25 s |
| Cobrar con <kbd>Ctrl</kbd>+<kbd>Enter</kbd> | M 2K | 1,91 s |
| **Total** | | **11,79 s** |

**Resultado:** de 30,73 s a 11,79 s, es decir, **un 62 % menos de tiempo** por venta. Entre una venta y la siguiente se ahorran además 2,65 s, porque el punto de venta queda listo para el próximo cliente.

Un usuario que prefiere el mouse también mejora:
- Sale de la barra superior con un solo clic, en lugar de pasar por el menú de Ventas.
- El buscador ya queda enfocado.
- Ya no necesita borrar el texto de búsqueda antes de cada producto.

#### Tarea B: registrar una entrada de 10 unidades de un producto, desde el catálogo

| | Operadores | Tiempo |
|---|---|---|
| **Antes:** menú Inventario → abrir la lista desplegable → buscar el producto en la lista → clic en Cantidad → escribir "10" → Enter | 4 × (M P BB) + H + 2K + M K | 13,19 s |
| **Después:** botón "Stock" en la fila del producto (llega preseleccionado) → clic en Cantidad → escribir "10" → Enter | 2 × (M P BB) + H + 2K + M K | 7,89 s |

**Resultado:** **un 40 % menos de tiempo.** Además, el usuario ya no tiene que recordar ni buscar el producto en una lista desplegable (heurística 6).

---

## 3. Cómo verificarlo

1. Entra con la cuenta de prueba y pulsa <kbd>?</kbd> para ver todos los atajos.
2. Pulsa <kbd>N</kbd>, escribe `arro` y pulsa <kbd>Enter</kbd>; luego `acei` y <kbd>Enter</kbd>; luego <kbd>Ctrl</kbd>+<kbd>Enter</kbd>. La venta queda registrada sin tocar el mouse.
3. Quita un producto del carrito y usa **Deshacer** en la notificación.
4. Con productos en el carrito, intenta ir a otra sección. Aparece el aviso de cambios sin guardar.
5. En Productos, pulsa **Stock** en una fila y elige **Salida** con una cantidad mayor al stock. El sistema lo impide y explica por qué.
6. En el menú de usuario, entra a **Mi cuenta y contraseña**. Escribe una contraseña actual equivocada (aparece el error junto al campo) y después la correcta. Cierra sesión y entra con la nueva.
