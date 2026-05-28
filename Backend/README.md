# 🍽️ Backend - Sistema de Gestión de Restaurante

## 📋 Descripción

Backend profesional y escalable para un sistema integral de gestión de restaurante. Desarrollado con Express.js, PostgreSQL y Socket.io para operaciones en tiempo real.

---

## ✨ Características Principales

- ✅ **REST API completa** - Todos los módulos del restaurante
- ✅ **Socket.io en tiempo real** - Actualización instantánea de órdenes, mesas y más
- ✅ **Transacciones ACID** - Garantiza consistencia en operaciones críticas
- ✅ **Manejo robusto de errores** - Centralizado con ApiError
- ✅ **Logging profesional** - Con timestamps y contexto detallado
- ✅ **Validación de entrada** - Previene datos inválidos
- ✅ **CORS configurado** - Seguridad y compatibilidad
- ✅ **Graceful shutdown** - Cierre limpio del servidor
- ✅ **Namespaces Socket.io** - Organización de eventos por módulo
- ✅ **Pool de conexiones** - Gestión eficiente de BD

---

## 🚀 Inicio Rápido

### 1. Instalación

```bash
cd Backend
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Base de Datos

```bash
psql -U postgres -d Restaurante -f postgres_schema.sql
```

### 4. Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### 5. Verificar

```bash
curl http://localhost:3000/health
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-----------|
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Todos los endpoints y ejemplos |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Guía completa de instalación |
| [CONTROLLER_BEST_PRACTICES.md](./CONTROLLER_BEST_PRACTICES.md) | Estándares de desarrollo |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│         Cliente (Frontend)              │
└────────────┬────────────────────────────┘
             │ HTTP + WebSocket
    ┌────────▼────────┐
    │   EXPRESS APP   │
    └────────┬────────┘
             │
    ┌────────▼────────────────────┐
    │  Middleware & Validación    │
    │  ├─ Logger                  │
    │  ├─ ErrorHandler            │
    │  ├─ Validators              │
    │  └─ CORS                    │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │      Routes & Controllers   │
    │  ├─ /api/orders            │
    │  ├─ /api/tables            │
    │  ├─ /api/staff             │
    │  └─ ... (otros módulos)    │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │      Models & Services      │
    │  ├─ ordersModel            │
    │  ├─ tablesModel            │
    │  └─ socketService          │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │    PostgreSQL Database      │
    │  ├─ orders                 │
    │  ├─ mesas                  │
    │  ├─ personal               │
    │  └─ ... (otras tablas)     │
    └─────────────────────────────┘
```

---

## 🔌 Socket.io Namespaces

El servidor proporciona 4 namespaces principales:

### `/orders` - Órdenes en tiempo real
```javascript
socket.on('order_created', (data) => {})
socket.on('order_updated', (data) => {})
socket.on('order_cancelled', (data) => {})
```

### `/tables` - Estado de mesas
```javascript
socket.on('table_created', (data) => {})
socket.on('table_status_changed', (data) => {})
socket.on('table_freed', (data) => {})
```

### `/reservations` - Reservaciones
```javascript
socket.on('reservation_created', (data) => {})
socket.on('reservation_updated', (data) => {})
```

### `/payments` - Pagos
```javascript
socket.on('payment_processed', (data) => {})
socket.on('payment_failed', (data) => {})
```

---

## 📊 Endpoints Principales

### Dashboard
- `GET /api/dashboard` - Estadísticas principales

### Órdenes
- `GET /api/orders` - Listar todas
- `POST /api/orders` - Crear orden
- `POST /api/orders/create-with-items` - Crear con items (transacción)
- `PUT /api/orders/:id` - Actualizar estado
- `DELETE /api/orders/:id` - Cancelar orden

### Mesas
- `GET /api/tables` - Listar todas
- `POST /api/tables` - Crear mesa
- `PATCH /api/tables/:id/status` - Cambiar estado
- `POST /api/tables/:id/liberar` - Liberar mesa
- `DELETE /api/tables/:id` - Eliminar mesa

### Otros Módulos
- `/api/menu` - Gestión de menú
- `/api/reservations` - Reservaciones
- `/api/payments` - Pagos
- `/api/staff` - Personal
- `/api/reports` - Reportes
- `/api/settings` - Configuración

---

## 🔐 Seguridad

| Características | Descripción |
|----------------|-----------|
| CORS | ✅ Configurado y restringido |
| Validación | ✅ Entrada validada en todos los endpoints |
| Pool conexiones | ✅ Límite de conexiones DB |
| Error handling | ✅ No expone stack traces en producción |
| Transacciones | ✅ ACID para operaciones críticas |
| Logging | ✅ Auditoría de todas las operaciones |

---

## 📝 Logging

Todos los eventos se guardan automáticamente:

```
logs/
├── error.log      # Solo errores
├── info.log       # Info general
└── all.log        # Todos los eventos
```

Ver en tiempo real:
```bash
tail -f logs/all.log
```

---

## 🧪 Testing Rápido

### Health Check
```bash
curl http://localhost:3000/health
```

### Obtener órdenes
```bash
curl http://localhost:3000/api/orders
```

### Crear orden
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"mesa_id": 1, "total": 150, "estado": "abierto"}'
```

---

## 🛠️ Desarrollo

### Estructura de Controladores

Cada controlador debe seguir este patrón:

```javascript
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { validators } = require('../middleware/validators');
const logger = require('../middleware/logger');

exports.getAll = asyncHandler(async (req, res) => {
    // 1. Validar entrada
    // 2. Obtener datos
    // 3. Log
    // 4. Response estandarizado
});
```

Ver [CONTROLLER_BEST_PRACTICES.md](./CONTROLLER_BEST_PRACTICES.md) para más detalles.

---

## 🚨 Manejo de Errores

El sistema captura y responde consistentemente:

```javascript
// Error capturado automáticamente
throw new ApiError('Mensaje de error', 400);

// Response automática
{
  "success": false,
  "error": {
    "message": "Mensaje de error",
    "statusCode": 400
  },
  "timestamp": "2024-05-27T10:30:00.000Z"
}
```

---

## 📈 Performance

- Pool PostgreSQL: 2-20 conexiones
- Max HTTP buffer: 10MB
- Socket.io ping interval: 25s
- Connection timeout: 5s

---

## 🔄 Ciclo de Vida de Órdenes

```
1. Cliente crea orden
   ↓
2. POST /api/orders/create-with-items
   ↓
3. Transacción inicia
   ↓
4. Orden + Items creados
   ↓
5. Mesa marcada ocupada
   ↓
6. Evento Socket.io emitido
   ↓
7. Frontend actualizado en tiempo real
```

---

## 📋 Requisitos del Sistema

- Node.js ≥ 14.0.0
- npm ≥ 6.0.0
- PostgreSQL 12+
- 512MB RAM mínimo
- 100MB almacenamiento

---

## 🤝 Contribuyendo

1. Seguir el patrón de controladores
2. Usar validadores disponibles
3. Loguear operaciones importantes
4. Emitir eventos Socket.io
5. Documentar cambios

---

## 📄 Variables de Entorno

```env
# Base de Datos
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Restaurante
DB_POOL_MIN=2
DB_POOL_MAX=20

# Servidor
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Socket.io
SOCKET_PORT=3000
SOCKET_RECONNECT_DELAY=5000
SOCKET_PING_INTERVAL=25000

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
CORS_CREDENTIALS=true

# Seguridad
JWT_SECRET=your_secret_key
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=10
```

---

## 🆘 Troubleshooting

| Error | Solución |
|-------|----------|
| ECONNREFUSED 5432 | Inicia PostgreSQL: `brew services start postgresql` |
| EADDRINUSE 3000 | Cambia puerto en .env o mata proceso: `lsof -i :3000` |
| Cannot find module | Reinstala: `npm install` |
| DB connection error | Verifica credenciales en .env |

---

## 📊 Métricas

- **Endpoints:** 40+
- **Namespaces Socket.io:** 4
- **Validadores:** 10+
- **Middleware:** 4
- **Modelos:** 10+

---

## 🎯 Próximas Mejoras

- [ ] Autenticación JWT
- [ ] Tests automatizados
- [ ] Rate limiting
- [ ] Caché Redis
- [ ] Documentación Swagger
- [ ] Docker containerization

---

## 📞 Contacto

Para preguntas o problemas, consulta:
- 📚 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- 🛠️ [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 💻 [CONTROLLER_BEST_PRACTICES.md](./CONTROLLER_BEST_PRACTICES.md)

---

**Última actualización:** Mayo 2024  
**Versión:** 1.0.0  
**Estado:** ✅ Producción-ready
