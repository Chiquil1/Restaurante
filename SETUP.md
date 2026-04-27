# 🍽️ Sistema de Gestión de Restaurante

Un sistema completo para gestionar todas las operaciones de un restaurante: reservas, menú, mesas, personal, ventas y reportes.

## ✨ Características Principales

- ✅ **Gestión de Reservas**: Creat, editar y eliminar reservas de clientes
- ✅ **Gestor de Menú**: Administrar platillos, categorías y disponibilidad
- ✅ **Mapa de Mesas**: Visualizar y controlar el estado de las mesas
- ✅ **Gestión de Personal**: Controlar empleados y sus turnos
- ✅ **Punto de Venta**: Registrar ventas y métodos de pago
- ✅ **Reportes Analíticos**: Generar reportes de ventas, reservas y desempeño
- ✅ **Vista de Cocina**: Mostrar órdenes pendientes en tiempo real
- ✅ **Plano del Restaurante**: Visualizar pisos y distribución de mesas

## 🛠️ Tecnologías

**Frontend:**
- React 18+
- Tailwind CSS
- Heroicons para iconos
- Vite como bundler

**Backend:**
- Node.js + Express
- PostgreSQL
- CORS habilitado
- Dotenv para configuración

## 📋 Requisitos Previos

- Node.js 16+
- PostgreSQL 12+
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-repositorio>
cd Restaurante
```

### 2. Configuración de Frontend

```bash
npm install
```

### 3. Configuración de Backend

```bash
cd Backend
npm install
```

Instala las dependencias necesarias:
```bash
npm install dotenv pg cors express
```

### 4. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

Contenido de `.env`:
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=Restaurante
SERVER_PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 5. Crear la Base de Datos

```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear la base de datos
CREATE DATABASE Restaurante;

-- Usar la base de datos
\c Restaurante

-- Ejecutar el script de inicialización (ver abajo)
```

## 🗄️ Estructura de Base de Datos

Las tablas necesarias son:

```sql
-- Tabla de Reservas
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  nombre_cliente VARCHAR(255) NOT NULL,
  telefono_cliente VARCHAR(20),
  email VARCHAR(255),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  numero_personas INT NOT NULL,
  mesas_asignadas VARCHAR(255),
  notas TEXT,
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Menú
CREATE TABLE menu (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  precio DECIMAL(10, 2) NOT NULL,
  ingredientes TEXT,
  tiempo_preparacion INT,
  disponible BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Mesas
CREATE TABLE mesas (
  id SERIAL PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  capacidad INT NOT NULL,
  piso INT,
  ubicacion VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'disponible',
  reserva_id INT,
  posicion_x INT,
  posicion_y INT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Personal
CREATE TABLE personal (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  puesto VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(20),
  salario DECIMAL(10, 2),
  turno VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'activo',
  fecha_contratacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Ventas
CREATE TABLE ventas (
  id SERIAL PRIMARY KEY,
  mesa_id INT,
  personal_id INT,
  detalles JSONB,
  total DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(50),
  nota TEXT,
  estado VARCHAR(50) DEFAULT 'completada',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mesa_id) REFERENCES mesas(id),
  FOREIGN KEY (personal_id) REFERENCES personal(id)
);

-- Tabla de Pisos
CREATE TABLE pisos (
  id SERIAL PRIMARY KEY,
  numero INT NOT NULL,
  nombre VARCHAR(255),
  capacidad_total INT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Configuración
CREATE TABLE configuracion_general (
  id SERIAL PRIMARY KEY,
  nombreNegocio VARCHAR(255),
  moneda VARCHAR(10),
  horario_apertura TIME,
  horario_cierre TIME,
  telefono VARCHAR(20),
  email VARCHAR(255),
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE configuracion_notificaciones (
  id SERIAL PRIMARY KEY,
  alertasPreparacion BOOLEAN DEFAULT TRUE,
  alertasStock BOOLEAN DEFAULT TRUE,
  alertasReservas BOOLEAN DEFAULT TRUE,
  correoAdmin VARCHAR(255),
  avisoSonoro BOOLEAN DEFAULT TRUE,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tablas de Sucursales (para Settings)
CREATE TABLE sucursales (
  id SERIAL PRIMARY KEY,
  nombreSucursal VARCHAR(255),
  direccion VARCHAR(255),
  ciudad VARCHAR(100),
  estado VARCHAR(100),
  codigoPostal VARCHAR(10),
  telefono VARCHAR(20),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📁 Estructura de Carpetas

```
Restaurante/
├── Backend/
│   ├── Controller/       # Controladores de la API
│   ├── Models/          # Modelos y lógica de datos
│   ├── Routes/          # Definición de rutas
│   ├── config/          # Configuración (BD, etc)
│   └── sever.js         # Archivo principal del servidor
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── modules/pages/   # Páginas principales
│   ├── index.css        # Estilos globales
│   └── main.jsx         # Punto de entrada
└── package.json         # Dependencias del proyecto
```

## 🏃 Cómo Ejecutar

### Terminal 1 - Backend

```bash
cd Backend
npm start
```

El servidor estará disponible en `http://localhost:5000`

### Terminal 2 - Frontend

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📡 Endpoints de API

### Reservations
- `GET /api/reservations` - Obtener todas las reservas
- `POST /api/reservations` - Crear reserva
- `PUT /api/reservations/:id` - Actualizar reserva
- `DELETE /api/reservations/:id` - Eliminar reserva
- `GET /api/reservations/stats` - Estadísticas de reservas

### Menu
- `GET /api/menu` - Obtener menú
- `GET /api/menu/categories` - Obtener categorías
- `POST /api/menu` - Crear plato
- `PUT /api/menu/:id` - Actualizar plato
- `DELETE /api/menu/:id` - Eliminar plato

### Tables
- `GET /api/tables` - Obtener mesas
- `POST /api/tables` - Crear mesa
- `PUT /api/tables/:id/status` - Cambiar estado
- `PUT /api/tables/:id/release` - Liberar mesa
- `GET /api/tables/stats` - Estadísticas

### Staff
- `GET /api/staff` - Obtener personal
- `POST /api/staff` - Agregar empleado
- `PUT /api/staff/:id` - Actualizar empleado
- `GET /api/staff/position/:puesto` - Por puesto
- `GET /api/staff/stats` - Estadísticas

### Sales
- `GET /api/sales` - Obtener ventas
- `POST /api/sales` - Registrar venta
- `GET /api/sales/summary` - Resumen de ventas
- `GET /api/sales/payment-summary` - Por método de pago

### Reports
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/reservations` - Reporte de reservas
- `GET /api/reports/occupancy` - Ocupación de mesas
- `GET /api/reports/menu-popularity` - Platos populares
- `GET /api/reports/staff-performance` - Desempeño del personal

### Floors
- `GET /api/floors` - Obtener pisos
- `POST /api/floors` - Crear piso
- `PUT /api/floors/:id` - Actualizar piso
- `GET /api/floors/:id` - Piso con mesas

## 🔒 Seguridad (Futuro)

- [ ] Implementar autenticación JWT
- [ ] Hash de contraseñas con bcrypt
- [ ] Validación de entrada en todos los endpoints
- [ ] Middleware de autorización
- [ ] Rate limiting
- [ ] HTTPS en producción

## 🚨 Troubleshooting

### Problema: "Conexión rechazada en localhost:5000"
**Solución:** Asegúrate de que el backend está corriendo y el puerto no está en uso

### Problema: "Error: ECONNREFUSED 127.0.0.1:5432"
**Solución:** Verifica que PostgreSQL está corriendo:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Abre PostgreSQL desde Services
```

### Problema: "Database does not exist"
**Solución:** Crea la base de datos siguiendo los pasos en la sección de BD

## 📝 Notas de Desarrollo

- El servidor usa CORS habilitado para la URL del frontend
- Las credenciales deben estar en `.env` (nunca en el código)
- Los modelos usan async/await para operaciones asincrónas
- Las validaciones necesitan mejorarse en producción

## 🤝 Contribuir

1. Haz un Fork del proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT

## 👨‍💻 Autor

Creado como un sistema de gestión de restaurante profesional

---

**¿Necesitas ayuda?** Consulta la documentación o abre un issue.
