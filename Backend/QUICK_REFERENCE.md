# ⚡ QUICK REFERENCE - Backend Restaurante

## 🚀 Start Server
```bash
npm run dev      # Development (auto-reload)
npm start        # Production
```

## 🔧 Check Health
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/status
```

## 📝 Logs
```bash
tail -f logs/all.log        # All events
tail -f logs/error.log      # Errors only
tail -f logs/info.log       # Info only
```

---

## 🎯 Common Tasks

### Create Order with Items
```bash
curl -X POST http://localhost:3000/api/orders/create-with-items \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "mesa_id": 1,
      "mesero_id": 1,
      "total": 250,
      "estado": "abierto"
    },
    "items": [
      {
        "nombre": "Pizza",
        "precio_unitario": 150,
        "cantidad": 1
      }
    ]
  }'
```

### Get All Orders
```bash
curl http://localhost:3000/api/orders
```

### Update Order Status
```bash
curl -X PUT http://localhost:3000/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"estado": "pagado"}'
```

### Get All Tables
```bash
curl http://localhost:3000/api/tables
```

### Change Table Status
```bash
curl -X PATCH http://localhost:3000/api/tables/1/status \
  -H "Content-Type: application/json" \
  -d '{"estado": "ocupada"}'
```

---

## 🏗️ Architecture

```
Request
  ↓
Express Route
  ↓
Controller (asyncHandler)
  ↓
Validation (validators)
  ↓
Model (Database)
  ↓
Logger (log every operation)
  ↓
Socket.io (emit event)
  ↓
Response (standardized)
```

---

## 🔑 Key Middleware

### Logger
```javascript
const logger = require('./middleware/logger');

logger.info('Info message', { meta: 'data' });
logger.error('Error message', error, { meta: 'data' });
logger.success('Success message');
logger.debug('Debug message');
logger.warn('Warning message');
```

### Error Handler
```javascript
const { ApiError, asyncHandler } = require('./middleware/errorHandler');

exports.getById = asyncHandler(async (req, res) => {
    throw new ApiError('Not found', 404);
});
```

### Validators
```javascript
const { validators } = require('./middleware/validators');

validators.validateId(req.params.id, 'ID');
validators.validateRequired(obj, ['field1', 'field2'], 'objectName');
validators.validatePositiveNumber(num, 'fieldName');
validators.validateOrderStatus(status);
```

---

## 📊 Valid States

### Order Status
- `abierto` - Just created
- `pendiente` - Waiting
- `preparando` - Being prepared
- `listo` - Ready
- `pagado` - Paid
- `cancelado` - Cancelled

### Table Status
- `libre` - Available
- `ocupada` - Occupied
- `reservada` - Reserved
- `mantenimiento` - Maintenance

---

## 🔌 Socket.io Namespaces

```javascript
// Orders
io.of('/orders').emit('order_created', data);
io.of('/orders').emit('order_updated', data);

// Tables
io.of('/tables').emit('table_status_changed', data);
io.of('/tables').emit('table_freed', data);

// Reservations
io.of('/reservations').emit('reservation_created', data);

// Payments
io.of('/payments').emit('payment_processed', data);
```

---

## 📌 Controller Pattern

```javascript
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { validators } = require('../middleware/validators');
const logger = require('../middleware/logger');

exports.getById = asyncHandler(async (req, res) => {
    // 1. Validate
    const id = validators.validateId(req.params.id, 'ID');
    
    // 2. Get data
    const data = await Model.getById(id);
    
    // 3. Check result
    if (!data) throw new ApiError('Not found', 404);
    
    // 4. Log
    logger.info('Resource fetched', { id });
    
    // 5. Emit event if needed
    const io = req.app.get('io');
    io.of('/namespace').emit('event', data);
    
    // 6. Response
    res.json({
        success: true,
        data: data,
        timestamp: new Date().toISOString()
    });
});
```

---

## ⚙️ Environment Variables

```env
# Database
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Restaurante
DB_POOL_MIN=2
DB_POOL_MAX=20

# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Socket.io
SOCKET_RECONNECT_DELAY=5000
SOCKET_PING_INTERVAL=25000

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
CORS_CREDENTIALS=true
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `lsof -i :3000` → `kill -9 PID` |
| DB connection error | Check `.env` credentials |
| Cannot find module | `npm install` |
| PostgreSQL not running | `brew services start postgresql` |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Overview & features |
| SETUP_GUIDE.md | Installation & config |
| API_DOCUMENTATION.md | All endpoints |
| CONTROLLER_BEST_PRACTICES.md | Development guide |
| IMPROVEMENTS_SUMMARY.md | Changes made |
| QUICK_REFERENCE.md | This file |

---

## 🔍 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad request |
| 404 | Not found |
| 409 | Conflict |
| 500 | Server error |

---

## 📋 Response Format

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {},
  "count": 1,
  "timestamp": "2024-05-27T10:30:00.000Z"
}
```

Error:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  },
  "timestamp": "2024-05-27T10:30:00.000Z"
}
```

---

## 🚨 Common Errors

### Database Connection
```
ECONNREFUSED 127.0.0.1:5432
→ Start PostgreSQL: brew services start postgresql
```

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
→ Kill process: lsof -i :3000 | kill -9
```

### Dependencies Missing
```
Cannot find module 'express'
→ Install: npm install
```

### Validation Error
```
ID inválido
→ Pass valid numeric ID
```

---

## 💡 Tips

- Always validate input in controllers
- Use asyncHandler for async routes
- Log important operations
- Emit Socket.io events for UI updates
- Use ApiError for controlled errors
- Check .env file exists and is configured
- Read logs in case of issues
- Use PATCH for partial updates

---

## 🔄 Common Workflows

### Create Order
```
1. POST /api/orders/create-with-items
2. Validate data
3. Start transaction
4. Create order + items
5. Update table status
6. Emit Socket.io event
7. Response to client
```

### Change Table Status
```
1. PATCH /api/tables/:id/status
2. Validate ID & status
3. Check table exists
4. Update status
5. Emit Socket.io event
6. Response to client
```

### Delete Order
```
1. DELETE /api/orders/:id
2. Validate ID
3. Check order exists
4. Free table if occupied
5. Delete order
6. Emit Socket.io event
7. Response to client
```

---

**Last Updated:** May 27, 2024  
**Version:** 1.0.0
