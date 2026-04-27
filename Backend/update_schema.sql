-- Script de actualización para sincronización de pedidos y mesas
-- Ejecutar después de actualizar el código

-- Crear tabla order_items si no existe
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

-- Crear tabla mesa_pedidos para sincronización
CREATE TABLE IF NOT EXISTS mesa_pedidos (
  id BIGSERIAL PRIMARY KEY,
  mesa_id BIGINT REFERENCES mesas(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mesa_id, order_id)
);

-- Actualizar tabla orders para nueva estructura
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mesa_id BIGINT REFERENCES mesas(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mesero_id BIGINT REFERENCES meseros(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prioridad TEXT DEFAULT 'normal';

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_mesa_pedidos_mesa_id ON mesa_pedidos(mesa_id);
CREATE INDEX IF NOT EXISTS idx_mesa_pedidos_order_id ON mesa_pedidos(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_mesa_id ON orders(mesa_id);
CREATE INDEX IF NOT EXISTS idx_orders_mesero_id ON orders(mesero_id);

-- Función para actualizar total de mesa cuando se crea/modifica pedido
CREATE OR REPLACE FUNCTION actualizar_total_mesa()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se asigna mesa a un pedido, actualizar total de la mesa
  IF TG_OP = 'INSERT' AND NEW.mesa_id IS NOT NULL THEN
    UPDATE mesas SET total = COALESCE(total, 0) + NEW.total WHERE id = NEW.mesa_id;
    INSERT INTO mesa_pedidos (mesa_id, order_id) VALUES (NEW.mesa_id, NEW.id)
    ON CONFLICT (mesa_id, order_id) DO NOTHING;
  END IF;

  -- Si se actualiza el total de un pedido con mesa asignada
  IF TG_OP = 'UPDATE' AND NEW.mesa_id IS NOT NULL AND OLD.total != NEW.total THEN
    UPDATE mesas SET total = COALESCE(total, 0) - OLD.total + NEW.total WHERE id = NEW.mesa_id;
  END IF;

  -- Si se elimina un pedido con mesa asignada
  IF TG_OP = 'DELETE' AND OLD.mesa_id IS NOT NULL THEN
    UPDATE mesas SET total = GREATEST(COALESCE(total, 0) - OLD.total, 0) WHERE id = OLD.mesa_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para sincronización automática
DROP TRIGGER IF EXISTS trigger_actualizar_total_mesa ON orders;
CREATE TRIGGER trigger_actualizar_total_mesa
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION actualizar_total_mesa();

-- Función para actualizar total de mesa cuando cambian items de pedido
CREATE OR REPLACE FUNCTION actualizar_total_mesa_items()
RETURNS TRIGGER AS $$
DECLARE
  order_mesa_id BIGINT;
  nuevo_total NUMERIC(12,2);
BEGIN
  -- Obtener la mesa del pedido
  SELECT mesa_id INTO order_mesa_id FROM orders WHERE id = COALESCE(NEW.order_id, OLD.order_id);

  IF order_mesa_id IS NOT NULL THEN
    -- Calcular nuevo total del pedido
    SELECT COALESCE(SUM(subtotal), 0) INTO nuevo_total FROM order_items WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);

    -- Actualizar total del pedido
    UPDATE orders SET total = nuevo_total WHERE id = COALESCE(NEW.order_id, OLD.order_id);

    -- El trigger de orders se encargará de actualizar la mesa
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para items de pedido
DROP TRIGGER IF EXISTS trigger_actualizar_total_mesa_items ON order_items;
CREATE TRIGGER trigger_actualizar_total_mesa_items
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION actualizar_total_mesa_items();