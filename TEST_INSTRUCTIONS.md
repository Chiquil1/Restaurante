# 🧪 Instrucciones de Prueba - Sistema Restaurante Sincronizado

## ✅ Cambios Implementados

### 1. **Sincronización de Órdenes con Items**
- ✅ Nuevo endpoint `POST /api/orders/create-with-items` que crea orden + items en transacción
- ✅ La mesa se marca automáticamente como 'ocupada' al crear orden
- ✅ Socket.io emite evento para sincronizar todos los clientes

### 2. **Selección de Elementos Corregida**
- ✅ Orders.jsx: Botón + ahora flotante en el corner del card
- ✅ Mejor UX: no hay conflictos de clicks
- ✅ Los items se agregan correctamente al carrito

### 3. **Sincronización de Estados**
- ✅ TablesMap escucha eventos de órdenes (cuando se crean/cancelan)
- ✅ Reservations sincroniza estados de mesas
- ✅ Mesas se liberan al pagar/finalizar orden

### 4. **Backend Refactorizado**
- ✅ ordersModel: función `updateOrder()` para actualizaciones flexibles
- ✅ orderItemsModel: funciones de cálculo y actualización
- ✅ ordersController: validación mejorada y transacciones

---

## 🚀 Pasos para Probar

### Paso 1: Iniciar Servidor Backend
```bash
cd Backend
npm start
# Debe estar en puerto 3000 y mostrar: "✅ Servidor escuchando en puerto 3000"
```

### Paso 2: Iniciar Frontend en otra terminal
```bash
npm run dev
# Acceder a http://localhost:5173
```

### Paso 3: Probar Creación de Órdenes
1. Ir a **Punto de Venta** → **Menú**
2. Hacer clic en **+ (botón naranja)** de un producto → agregará al carrito
3. Seleccionar una mesa (o dejar para llevar)
4. Hacer clic en **"Procesar Pedido"**
5. **Verificar:**
   - ✅ La orden se crea correctamente
   - ✅ Los items aparecen en la orden
   - ✅ El total se calcula bien

### Paso 4: Verificar Sincronización de Mesas
1. Mientras la orden está abierta, ir a **Mapa de Mesas**
2. **Verificar:** La mesa debe mostrar estado **"ocupada"** en rojo
3. Volver a **Punto de Venta** y finalizar la orden (cambiar estado a "pagada")
4. **Verificar:** La mesa debe cambiar a **"libre"** en verde automáticamente

### Paso 5: Probar Reservaciones
1. Ir a **Reservaciones** → **Nueva Reserva**
2. Seleccionar una mesa libre
3. Crear la reserva
4. **Verificar:**
   - ✅ La mesa cambia a estado "reservada" (amarillo)
   - ✅ En Mapa de Mesas aparece como reservada

### Paso 6: Verificar Socket.io en Tiempo Real
1. Abre **2 ventanas del navegador** lado a lado
2. En una ventana: Crea una orden
3. En la otra ventana: Ve a Mapa de Mesas
4. **Verificar:** La mesa se actualiza automáticamente sin recargar

---

## 🔍 Checklist de Validación

- [ ] Órdenes se crean con items correctamente
- [ ] Mesas cambian a "ocupada" al crear orden
- [ ] Mesas se liberan al finalizar orden
- [ ] Reservaciones reservan mesas correctamente
- [ ] Estados se sincronizan en tiempo real (Socket.io)
- [ ] El carrito funciona sin problemas
- [ ] Los totales se calculan correctamente
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en consola del servidor

---

## 🐛 Si Algo No Funciona

### Error: "Orden no encontrada"
- Verificar que el endpoint `/orders/create-with-items` existe
- Revisar logs del servidor

### Las mesas no actualizan
- Verificar que Socket.io está conectado (consola del navegador)
- Buscar evento `📡 Actualización recibida` en consola

### El carrito no guarda
- Verificar que OrderService está importado correctamente
- Revisar que API_URL es `/api/orders`

### Items no se guardan
- Verificar tabla `order_items` en BD existe
- Revisar logs de transacción en servidor

---

## 📊 Rutas Disponibles

```
GET    /api/orders              - Obtener todas las órdenes
GET    /api/orders/:id          - Obtener orden por ID
POST   /api/orders              - Crear orden (solo cabecera)
POST   /api/orders/create-with-items  - ✅ NUEVO: Crear orden + items
PUT    /api/orders/:id          - Actualizar estado de orden
DELETE /api/orders/:id          - Cancelar orden

GET    /api/orderitems/:id      - Obtener items de una orden
POST   /api/orderitems          - Crear item
PUT    /api/orderitems/:id/estado - Actualizar estado del item

GET    /api/tables              - Obtener todas las mesas
POST   /api/tables              - Crear mesa
PUT    /api/tables/:id          - Actualizar mesa
DELETE /api/tables/:id          - Eliminar mesa

GET    /api/reservations        - Obtener reservaciones
POST   /api/reservations        - Crear reservación
PUT    /api/reservations/:id    - Actualizar reservación
DELETE /api/reservations/:id    - Cancelar reservación
```

---

## ✨ Mejoras Implementadas

| Aspecto | Antes | Ahora |
|--------|-------|-------|
| Creación de órdenes | Múltiples requests | 1 transacción atómica |
| Selección de items | Conflicto con clicks | Botón flotante claro |
| Sincronización mesas | Manual/lenta | Tiempo real con Socket.io |
| Estado de órdenes | No se actualizaba | Sincronizado automáticamente |
| URLs API | Inconsistentes | Uniformes y relativas |

---

¡Todo debe estar funcionando perfectamente! 🎉
