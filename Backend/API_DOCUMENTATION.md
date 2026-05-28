# 📚 Documentación de API - Restaurante Backend

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
```

### Variables de Entorno
Copiar `.env.example` a `.env` y configurar valores:
```bash
cp .env.example .env
```

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

---

## 📋 Endpoints Disponibles

### Health Check
```
GET /health
GET /api/status
```

---

## 🗂️ Módulos de API

### 1. 📦 ÓRDENES (Orders)
**Ruta Base:** `/api/orders`

#### Obtener todas las órdenes
```
GET /api/orders
Response: {
  success: true,
  data: [...],
  count: 10,
  timestamp: "2024-05-27T10:30:00.000Z"
}
```

#### Obtener orden por ID
```
GET /api/orders/:id
```

#### Crear orden
```
POST /api/orders
Body: {
  mesa_id: 1,
  mesero_id: 1,
  total: 150.00,
  estado: "abierto",
  cliente: "Juan"
}
```

#### Crear orden con items
```
POST /api/orders/create-with-items
Body: {
  order: {
    mesa_id: 1,
    mesero_id: 1,
    total: 250.00,
    estado: "abierto"
  },
  items: [
    {
      nombre: "Pizza Margherita",
      precio_unitario: 150.00,
      cantidad: 1,
      estado: "pendiente"
    }
  ]
}
```

#### Actualizar estado de orden
```
PUT /api/orders/:id
Body: {
  estado: "pagado"  # abierto, pendiente, preparando, listo, pagado, cancelado
}
```

#### Eliminar/Cancelar orden
```
DELETE /api/orders/:id
```

---

### 2. 🪑 MESAS (Tables)
**Ruta Base:** `/api/tables`

#### Obtener todas las mesas
```
GET /api/tables
GET /api/tables?estado=libre  # Filtrar por estado
```

#### Obtener estado de mesas
```
GET /api/tables/states
```

#### Obtener mesa por ID
```
GET /api/tables/:id
```

#### Crear mesa
```
POST /api/tables
Body: {
  numero: 1,
  ubicacion: "Patio",
  capacidad: 4,
  tipo: "standard"
}
```

#### Actualizar mesa
```
PUT /api/tables/:id
Body: {
  numero: 2,
  ubicacion: "Salón principal",
  capacidad: 6
}
```

#### Cambiar estado de mesa
```
PATCH /api/tables/:id/status
Body: {
  estado: "ocupada",  # libre, ocupada, reservada, mantenimiento
  mesero_id: 1,
  cliente: "María"
}
```

#### Liberar mesa
```
POST /api/tables/:id/liberar
```

#### Eliminar mesa
```
DELETE /api/tables/:id
```

---

### 3. 📝 RESERVACIONES (Reservations)
**Ruta Base:** `/api/reservations`

- `GET /` - Listar todas
- `GET /:id` - Obtener por ID
- `POST /` - Crear nueva
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar

---

### 4. 🍽️ MENÚ (Menu)
**Ruta Base:** `/api/menu`

- `GET /` - Listar todos los ítems
- `GET /:id` - Obtener ítem
- `POST /` - Crear ítem
- `PUT /:id` - Actualizar ítem
- `DELETE /:id` - Eliminar ítem

---

### 5. 💳 PAGOS (Payments)
**Ruta Base:** `/api/payments`

- `GET /` - Listar todos
- `GET /:id` - Obtener pago
- `POST /` - Crear pago
- `PUT /:id` - Actualizar pago
- `DELETE /:id` - Eliminar pago

---

### 6. 👥 PERSONAL (Staff)
**Ruta Base:** `/api/staff`

- `GET /` - Listar personal
- `GET /:id` - Obtener empleado
- `POST /` - Crear empleado
- `PUT /:id` - Actualizar empleado
- `DELETE /:id` - Eliminar empleado

---

### 7. 📊 REPORTES (Reports)
**Ruta Base:** `/api/reports`

- `GET /dashboard` - Dashboard
- `GET /ventas` - Reporte de ventas
- `GET /ocupacion` - Ocupación de mesas
- `GET /productos` - Productos más vendidos

---

### 8. ⚙️ CONFIGURACIÓN (Settings)
**Ruta Base:** `/api/settings`

- `GET /` - Obtener configuración
- `PUT /` - Actualizar configuración

---

## 🔌 Socket.io - Eventos en Tiempo Real

### Conexión
```javascript
const socket = io('http://localhost:3000');

socket.on('connection_established', (data) => {
  console.log('Conectado:', data.socketId);
});

socket.on('pong', () => {
  console.log('Servidor responde');
});
```

### Namespace: `/orders` (Órdenes)
```javascript
const ordersSocket = io('http://localhost:3000/orders');

// Escuchar eventos
ordersSocket.on('order_created', (data) => {
  // Nueva orden creada
});

ordersSocket.on('order_updated', (data) => {
  // Orden actualizada
});

ordersSocket.on('order_completed', (data) => {
  // Orden completada
});

ordersSocket.on('order_cancelled', (data) => {
  // Orden cancelada
});
```

### Namespace: `/tables` (Mesas)
```javascript
const tablesSocket = io('http://localhost:3000/tables');

tablesSocket.on('table_created', (data) => {});
tablesSocket.on('table_updated', (data) => {});
tablesSocket.on('table_status_changed', (data) => {});
tablesSocket.on('table_occupied', (data) => {});
tablesSocket.on('table_freed', (data) => {});
```

### Namespace: `/reservations` (Reservaciones)
```javascript
const reservationsSocket = io('http://localhost:3000/reservations');

reservationsSocket.on('reservation_created', (data) => {});
reservationsSocket.on('reservation_updated', (data) => {});
reservationsSocket.on('reservation_cancelled', (data) => {});
```

### Namespace: `/payments` (Pagos)
```javascript
const paymentsSocket = io('http://localhost:3000/payments');

paymentsSocket.on('payment_processed', (data) => {});
paymentsSocket.on('payment_failed', (data) => {});
```

---

## 📝 Formato de Response

Todos los endpoints retornan en este formato:

### Success
```json
{
  "success": true,
  "message": "Operación completada",
  "data": {},
  "count": 1,
  "timestamp": "2024-05-27T10:30:00.000Z"
}
```

### Error
```json
{
  "success": false,
  "error": {
    "message": "Descripción del error",
    "statusCode": 400
  },
  "timestamp": "2024-05-27T10:30:00.000Z"
}
```

---

## ✅ Estados Válidos

### Estados de Orden
- `abierto` - Orden recién creada
- `pendiente` - Esperando preparación
- `preparando` - En cocina
- `listo` - Listo para servir
- `pagado` - Pagado y completado
- `cancelado` - Cancelada

### Estados de Mesa
- `libre` - Disponible
- `ocupada` - Con clientes
- `reservada` - Reservada
- `mantenimiento` - En mantenimiento

---

## 🔐 Seguridad

- ✅ CORS configurado
- ✅ Body limit de 10MB
- ✅ Validación de entrada
- ✅ Manejo centralizado de errores
- ✅ Logging de todas las operaciones
- ⚠️ JWT no implementado aún (adicionar en futuro)

---

## 📊 Logging

Todos los eventos se registran en `/logs/`:
- `error.log` - Errores
- `info.log` - Información general
- `all.log` - Todos los eventos

---

## 🚦 Códigos de Error

| Código | Significado |
|--------|------------|
| 400 | Solicitud inválida |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: mesa ocupada) |
| 500 | Error interno del servidor |

---

## 📌 Notas Importantes

1. **Transacciones**: Las operaciones críticas (crear orden con items) usan transacciones
2. **Eventos Socket.io**: Se emiten automáticamente en cambios importantes
3. **Validación**: Toda entrada se valida antes de procesarse
4. **Logs**: Todas las operaciones se registran para auditoría

---

## 🔄 Ciclo de Vida de una Orden

```
1. POST /api/orders/create-with-items
   ↓
2. Validar datos
   ↓
3. Iniciar transacción
   ↓
4. Crear orden
   ↓
5. Crear items
   ↓
6. Marcar mesa como ocupada
   ↓
7. Confirmar transacción
   ↓
8. Emitir evento Socket.io
   ↓
9. Response al cliente
```

---

## 🔄 Ciclo de Vida de una Mesa

```
LIBRE
  ↓
Cliente llega → OCUPADA
  ↓
Reserva → RESERVADA
  ↓
Mantenimiento → MANTENIMIENTO
  ↓
Cliente se va / Paga → LIBRE
```
