# 🛠️ GUÍA DE SETUP Y EJECUCIÓN - Backend Restaurante

## ✅ Requisitos Previos

- Node.js ≥ 14.0.0
- npm ≥ 6.0.0
- PostgreSQL 12+
- Git

---

## 📦 Paso 1: Instalación de Dependencias

```bash
cd Backend
npm install
```

Esto instalará:
- `express` - Framework web
- `pg` - Driver PostgreSQL
- `socket.io` - Tiempo real
- `cors` - Control de CORS
- `dotenv` - Gestión de variables
- `bcrypt` - Encriptación
- `nodemon` - Desarrollo (dev)

---

## 🗄️ Paso 2: Configurar Base de Datos

### 2.1 Crear base de datos PostgreSQL

```sql
CREATE DATABASE "Restaurante";
```

### 2.2 Ejecutar schema

```bash
psql -U postgres -d Restaurante -f postgres_schema.sql
```

O desde terminal:
```bash
psql -h localhost -U postgres -d Restaurante < postgres_schema.sql
```

### 2.3 Verificar conexión

```bash
psql -h localhost -U postgres -d Restaurante
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 Copiar archivo de ejemplo

```bash
cp .env.example .env
```

### 3.2 Editar `.env` con tus valores

```env
# Base de Datos
DB_USER=postgres
DB_PASSWORD=tu_contraseña  # CAMBIAR
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Restaurante

# Servidor
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

---

## 🚀 Paso 4: Ejecutar el Servidor

### Modo Desarrollo (Con auto-reload)
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor debería mostrar:
```
✅ Servidor iniciado correctamente
   port: 3000
   environment: development
```

---

## ✔️ Paso 5: Verificar que Todo Funciona

### 5.1 Health Check
```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "database": "connected",
  "socketClients": 0,
  "uptime": 5.234
}
```

### 5.2 Status API
```bash
curl http://localhost:3000/api/status
```

Respuesta esperada:
```json
{
  "message": "API Restaurante ✅",
  "version": "1.0.0",
  "status": "online",
  "environment": "development"
}
```

---

## 🔍 Solución de Problemas

### Error: "Error conectando a base de datos"

**Solución:**
1. Verifica que PostgreSQL está ejecutándose
2. Verifica credenciales en `.env`
3. Verifica que la base de datos existe

```bash
psql -h localhost -U postgres -d Restaurante -c "SELECT 1"
```

### Error: "Puerto 3000 ya en uso"

**Solución:**
```bash
# Encuentra el proceso
lsof -i :3000

# Mata el proceso (macOS/Linux)
kill -9 <PID>

# O cambia el puerto en .env
PORT=3001
```

### Error: "Cannot find module"

**Solución:**
```bash
# Reinstala dependencias
rm -rf node_modules
npm install
```

### Error: "Connect ECONNREFUSED 127.0.0.1:5432"

**Solución:**
```bash
# Verifica que PostgreSQL está corriendo
# macOS:
brew services list

# Inicia PostgreSQL si está detenido:
brew services start postgresql
```

---

## 📁 Estructura de Archivos

```
Backend/
├── .env                          # Variables de entorno
├── .env.example                  # Template de .env
├── server.js                     # Entrada principal
├── package.json                  # Dependencias
├── API_DOCUMENTATION.md          # Docs de API
├── CONTROLLER_BEST_PRACTICES.md  # Guía de controladores
│
├── config/
│   └── Db.js                     # Configuración de BD
│
├── middleware/
│   ├── logger.js                 # Logging profesional
│   ├── errorHandler.js           # Manejo de errores
│   ├── validators.js             # Validadores
│   └── socketErrorHandler.js     # Errores de Socket.io
│
├── services/
│   └── socketService.js          # Servicio Socket.io
│
├── Controller/                   # Controladores
│   ├── ordersController.js
│   ├── tablesController.js
│   ├── menuController.js
│   └── ... (otros)
│
├── Models/                       # Modelos de datos
│   ├── ordersModel.js
│   ├── tablesModel.js
│   └── ... (otros)
│
├── Routes/                       # Rutas de API
│   ├── ordersRoutes.js
│   ├── tablesRoutes.js
│   └── ... (otros)
│
├── logs/                         # Registros (generado)
│   ├── error.log
│   ├── info.log
│   └── all.log
│
└── postgres_schema.sql           # Schema de BD
```

---

## 📊 Verificar Logs

```bash
# Ver últimos errores
tail -f logs/error.log

# Ver todo
tail -f logs/all.log

# Buscar un evento específico
grep "Orden creada" logs/all.log
```

---

## 🧪 Testing Rápido

### Crear orden
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "mesa_id": 1,
    "mesero_id": 1,
    "total": 150.00,
    "estado": "abierto"
  }'
```

### Obtener órdenes
```bash
curl http://localhost:3000/api/orders
```

### Actualizar estado
```bash
curl -X PUT http://localhost:3000/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"estado": "pagado"}'
```

---

## 🔄 Reiniciar el Servidor

Si estás en desarrollo y tienes problemas:

1. **Presiona `Ctrl+C`** para detener el servidor
2. **Espera 2-3 segundos**
3. **Ejecuta nuevamente:**
   ```bash
   npm run dev
   ```

---

## 📝 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start

# Ver versión de Node
node -v

# Ver versión de npm
npm -v

# Listar puertos en uso (macOS/Linux)
lsof -i -P -n | grep LISTEN

# Listar puertos en uso (Windows)
netstat -ano | findstr :3000
```

---

## 🎯 Próximos Pasos

1. ✅ Backend configurado y ejecutándose
2. 📱 Conectar frontend con los endpoints
3. 🔐 Implementar autenticación JWT
4. 📈 Agregar más validaciones
5. 🧪 Crear tests automatizados

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en `/logs/error.log`
2. Verifica que la BD está funcionando
3. Verifica que el puerto está disponible
4. Revisa la documentación en `API_DOCUMENTATION.md`
