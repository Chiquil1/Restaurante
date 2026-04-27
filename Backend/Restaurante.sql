-- =============================================================================
-- 1. LIMPIEZA TOTAL (Borrando en orden inverso a la jerarquía)
-- =============================================================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS mesas CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS personal CASCADE;
DROP TABLE IF EXISTS menu CASCADE;
DROP TABLE IF EXISTS pisos CASCADE;
DROP TABLE IF EXISTS sucursales CASCADE;
DROP TABLE IF EXISTS configuracion_notificaciones CASCADE;
DROP TABLE IF EXISTS configuracion_general CASCADE;

-- =============================================================================
-- 2. CREACIÓN DE TABLAS MEJORADAS
-- =============================================================================

-- Pisos: Organización del local
CREATE TABLE pisos (
  id SERIAL PRIMARY KEY,
  numero INT NOT NULL,
  nombre VARCHAR(255),
  capacidad_total INT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personal: Meseros y Cocineros
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

-- Menú: Productos disponibles
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

-- Reservas: Gestión de clientes
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

-- Mesas: Vinculadas a Pisos, Reservas y Personal
CREATE TABLE mesas (
  id SERIAL PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  capacidad INT NOT NULL,
  piso INT REFERENCES pisos(id), 
  ubicacion VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'disponible',
  reserva_id INT REFERENCES reservas(id) ON DELETE SET NULL,
  posicion_x INT,
  posicion_y INT,
  cliente VARCHAR(255),
  total DECIMAL(10, 2) DEFAULT 0, -- Monto acumulado de la mesa
  mesero_id INT REFERENCES personal(id),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Órdenes: El "Cabezal" del pedido
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  mesa_id INT REFERENCES mesas(id) ON DELETE SET NULL,
  mesero_id INT REFERENCES personal(id) ON DELETE SET NULL,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, preparando, listo, entregado, cancelado
  prioridad VARCHAR(50) DEFAULT 'normal', -- baja, normal, alta, urgente
  total DECIMAL(10, 2) DEFAULT 0,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items de Orden: Los platos específicos de cada pedido
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INT REFERENCES menu(id) ON DELETE SET NULL,
  nombre VARCHAR(255),
  precio_unitario DECIMAL(10, 2),
  cantidad INT NOT NULL,
  subtotal DECIMAL(10, 2),
  notas TEXT,
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ventas: Historial final cuando la orden se paga
CREATE TABLE ventas (
  id SERIAL PRIMARY KEY,
  mesa_id INT REFERENCES mesas(id),
  personal_id INT REFERENCES personal(id),
  detalles JSONB, -- Guardamos los items como JSON para historial
  total DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(50),
  nota TEXT,
  estado VARCHAR(50) DEFAULT 'completada',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tablas de Configuración
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

CREATE TABLE configuracion_notificaciones (
  id SERIAL PRIMARY KEY,
  alertasPreparacion BOOLEAN DEFAULT TRUE,
  alertasStock BOOLEAN DEFAULT TRUE,
  alertasReservas BOOLEAN DEFAULT TRUE,
  correoAdmin VARCHAR(255),
  avisoSonoro BOOLEAN DEFAULT TRUE,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Seguridad
ALTER USER postgres WITH PASSWORD 'postgres';




-- 1. CORRECCIÓN DE NOMBRES (Para que el Dashboard funcione)
-- Si la tabla existe como 'reservas', la renombramos a 'reservations'
ALTER TABLE IF EXISTS reservas RENAME TO reservations;

-- 2. ASEGURAR DATOS BASE (Para que las Mesas y Pedidos puedan guardarse)

-- Insertar Pisos (Sin esto, NO puedes crear Mesas)
INSERT INTO pisos (numero, nombre, capacidad_total) 
VALUES 
(1, 'Planta Baja', 50), 
(2, 'Primer Piso', 30), 
(3, 'Terraza', 20)
ON CONFLICT DO NOTHING;

-- Insertar Personal (Sin esto, NO puedes asignar Meseros a Mesas)
INSERT INTO personal (nombre, puesto, email, estado) 
VALUES 
('Administrador', 'Manager', 'admin@restaurante.com', 'activo'),
('Juan Mesero', 'Mesero', 'juan@restaurante.com', 'activo')
ON CONFLICT DO NOTHING;

-- Insertar Menú Base (Sin esto, NO puedes hacer Pedidos)
INSERT INTO menu (nombre, descripcion, categoria, precio, disponible) 
VALUES 
('Hamburguesa Clásica', 'Carne, queso, lechuga y tomate', 'Comidas', 12.50, true),
('Pizza Pepperoni', 'Masa artesanal con pepperoni', 'Comidas', 15.00, true),
('Refresco Cola', 'Sabor original 500ml', 'Bebidas', 2.50, true),
('Café Americano', 'Café recién colado', 'Bebidas', 3.00, true)
ON CONFLICT DO NOTHING;



-- 1. Agregar las columnas que le faltan a la tabla 'personal'
ALTER TABLE personal ADD COLUMN IF NOT EXISTS apellido VARCHAR(255);
ALTER TABLE personal ADD COLUMN IF NOT EXISTS dni_curp VARCHAR(50);
ALTER TABLE personal ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE personal ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE personal ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE personal ADD COLUMN IF NOT EXISTS rol_permisos VARCHAR(100);

-- 2. Crear la tabla de Ausencias (que el modelo usa)
CREATE TABLE IF NOT EXISTS personal_ausencias (
  id SERIAL PRIMARY KEY,
  personal_id INT REFERENCES personal(id) ON DELETE CASCADE,
  tipo VARCHAR(50), -- Ej: Enfermedad, Vacaciones, Permiso
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  motivo TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear la tabla de Horarios/Calendario (que el modelo usa)
CREATE TABLE IF NOT EXISTS personal_horarios (
  id SERIAL PRIMARY KEY,
  personal_id INT REFERENCES personal(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo_turno VARCHAR(50), -- Ej: Mañana, Tarde, Noche
  estado VARCHAR(50) DEFAULT 'asignado',
  CONSTRAINT unique_personal_fecha UNIQUE (personal_id, fecha)
);

