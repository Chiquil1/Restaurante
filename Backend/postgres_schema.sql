-- Esquema de PostgreSQL para los módulos backend
-- Generado a partir de las consultas usadas en Backend/Models

-- Usuarios / auth
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  rol TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuración general del negocio
CREATE TABLE IF NOT EXISTS configuracion_general (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id),
  nombre_negocio TEXT,
  moneda TEXT,
  horario_apertura TIME,
  horario_cierre TIME,
  telefono_contacto TEXT,
  email_negocio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuracion_notificaciones (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id),
  alertas_preparacion BOOLEAN DEFAULT FALSE,
  alertas_stock BOOLEAN DEFAULT FALSE,
  alertas_reservas BOOLEAN DEFAULT FALSE,
  correo_admin_orden BOOLEAN DEFAULT FALSE,
  aviso_sonoro BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sucursales (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id),
  nombre_sucursal TEXT,
  direccion TEXT,
  ciudad TEXT,
  estado TEXT,
  codigo_postal TEXT,
  telefono TEXT,
  ultimo_backup TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS backups (
  id BIGSERIAL PRIMARY KEY,
  sucursal_id BIGINT REFERENCES sucursales(id),
  fecha_backup TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tipo_backup TEXT,
  estado TEXT
);

-- Menú
CREATE TABLE IF NOT EXISTS menu (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  precio NUMERIC(12,2) DEFAULT 0,
  ingredientes TEXT,
  tiempo_preparacion INTEGER DEFAULT 0,
  disponible BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mesas y meseros
CREATE TABLE IF NOT EXISTS meseros (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mesas (
  id BIGSERIAL PRIMARY KEY,
  numero INTEGER NOT NULL,
  capacidad INTEGER NOT NULL,
  piso INTEGER DEFAULT 1,
  piso_id BIGINT REFERENCES pisos(id),
  ubicacion TEXT DEFAULT '',
  estado TEXT DEFAULT 'libre',
  cliente TEXT DEFAULT '',
  total NUMERIC(12,2) DEFAULT 0,
  mesero_id BIGINT REFERENCES meseros(id),
  posicion_x INTEGER,
  posicion_y INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pisos (
  id BIGSERIAL PRIMARY KEY,
  numero INTEGER NOT NULL,
  nombre TEXT,
  capacidad_total INTEGER,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservaciones y clientes
CREATE TABLE IF NOT EXISTS guests (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT,
  apellido TEXT,
  telefono TEXT,
  email TEXT,
  cumpleanos DATE,
  preferencias TEXT DEFAULT '',
  alergias TEXT DEFAULT '',
  notas_vip TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id BIGSERIAL PRIMARY KEY,
  guest_id BIGINT REFERENCES guests(id),
  codigo_reserva TEXT UNIQUE,
  fecha DATE,
  hora TIME,
  duracion_estimada INTEGER DEFAULT 90,
  numero_personas INTEGER,
  estado TEXT DEFAULT 'solicitada',
  origen TEXT DEFAULT 'telefono',
  prioridad TEXT DEFAULT 'normal',
  zona TEXT,
  ocasion_especial TEXT,
  mesero_asignado BIGINT REFERENCES meseros(id),
  deposito NUMERIC(12,2) DEFAULT 0,
  consumo_minimo NUMERIC(12,2) DEFAULT 0,
  requiere_preparacion BOOLEAN DEFAULT FALSE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relación entre pedidos y mesas para sincronización automática
CREATE TABLE IF NOT EXISTS mesa_pedidos (
  id BIGSERIAL PRIMARY KEY,
  mesa_id BIGINT REFERENCES mesas(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mesa_id, order_id)
);

-- Órdenes/Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  mesa_id BIGINT REFERENCES mesas(id),
  mesero_id BIGINT REFERENCES meseros(id),
  estado TEXT DEFAULT 'pendiente',
  prioridad TEXT DEFAULT 'normal',
  total NUMERIC(12,2) DEFAULT 0,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items individuales de cada orden
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id BIGINT REFERENCES menu(id),
  nombre TEXT NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC(12,2) NOT NULL,
  notas TEXT,
  estado TEXT DEFAULT 'pendiente',
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ventas
CREATE TABLE IF NOT EXISTS personal (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  puesto TEXT,
  email TEXT,
  telefono TEXT,
  salario NUMERIC(12,2),
  turno TEXT,
  estado TEXT DEFAULT 'activo',
  fecha_contratacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventas (
  id BIGSERIAL PRIMARY KEY,
  mesa_id BIGINT REFERENCES mesas(id),
  personal_id BIGINT REFERENCES personal(id),
  detalles JSONB,
  total NUMERIC(12,2) DEFAULT 0,
  metodo_pago TEXT,
  nota TEXT,
  estado TEXT DEFAULT 'completada',
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers para sincronización automática

-- Función para actualizar el total de la mesa cuando cambian los items de orden
CREATE OR REPLACE FUNCTION actualizar_total_mesa()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el total de la mesa basado en los items de orden activos
  UPDATE mesas
  SET total = (
    SELECT COALESCE(SUM(oi.subtotal), 0)
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.mesa_id = mesas.id
    AND o.estado IN ('pendiente', 'preparando', 'listo')
  )
  WHERE id IN (
    SELECT DISTINCT mesa_id
    FROM orders
    WHERE id IN (
      SELECT order_id FROM order_items WHERE id = COALESCE(NEW.id, OLD.id)
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar total de mesa cuando cambian items de orden
CREATE TRIGGER trigger_actualizar_total_mesa
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION actualizar_total_mesa();

-- Función para registrar venta automática cuando se completa un pedido
CREATE OR REPLACE FUNCTION registrar_venta_automatica()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el estado cambió a 'completado' o 'pagado', registrar la venta
  IF (TG_OP = 'UPDATE' AND OLD.estado != 'completado' AND NEW.estado = 'completado') OR
     (TG_OP = 'UPDATE' AND OLD.estado != 'pagado' AND NEW.estado = 'pagado') THEN

    -- Insertar venta automática
    INSERT INTO ventas (mesa_id, personal_id, detalles, total, metodo_pago, estado, fecha)
    SELECT
      NEW.mesa_id,
      NEW.mesero_id,
      jsonb_build_object(
        'order_id', NEW.id,
        'items', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', oi.id,
              'nombre', oi.nombre,
              'cantidad', oi.cantidad,
              'precio_unitario', oi.precio_unitario,
              'subtotal', oi.subtotal
            )
          )
          FROM order_items oi
          WHERE oi.order_id = NEW.id
        )
      ),
      NEW.total,
      'efectivo', -- método de pago por defecto
      'completada',
      NOW()
    WHERE NEW.total > 0;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar venta automática al completar pedido
CREATE TRIGGER trigger_registrar_venta_automatica
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION registrar_venta_automatica();

-- Función para actualizar el total de la orden cuando cambian los items
CREATE OR REPLACE FUNCTION actualizar_total_orden()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el total de la orden basado en la suma de sus items
  UPDATE orders
  SET total = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM order_items
    WHERE order_id = orders.id
  )
  WHERE id = (
    SELECT order_id FROM order_items WHERE id = COALESCE(NEW.id, OLD.id)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar total de orden cuando cambian items
CREATE TRIGGER trigger_actualizar_total_orden
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION actualizar_total_orden();
