const pool = require("../config/Db");

/**
 * OrderItemsModel - Gestión de Platos de un Pedido
 * Mejoras: Reducción de consultas mediante RETURNING, manejo de errores ES2022 
 * y sincronización de totales con la orden y la mesa.
 */
class OrderItems {
  
  // 1. Crear un plato en una orden
  static async createOrderItem(data) {
    try {
      const { orderId, menuItemId, nombre, precioUnitario, cantidad, notas } = data;
      const subtotal = precioUnitario * cantidad;

      const query = `
        INSERT INTO order_items (order_id, menu_item_id, nombre, precio_unitario, cantidad, subtotal, notas, fecha)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const { rows } = await pool.query(query, [
        orderId, menuItemId, nombre, precioUnitario, cantidad, subtotal, notas || ''
      ]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear item de orden: ${error.message}`, { cause: error });
    }
  }

  // 2. Obtener todos los platos de una orden específica
  static async getOrderItems(orderId) {
    try {
      const query = `
        SELECT oi.*, m.categoria
        FROM order_items oi
        LEFT JOIN menu m ON oi.menu_item_id = m.id
        WHERE oi.order_id = $1
        ORDER BY oi.fecha ASC
      `;
      const { rows } = await pool.query(query, [orderId]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener items de la orden ${orderId}: ${error.message}`, { cause: error });
    }
  }

  // 3. Actualizar estado (Súper Optimizado con RETURNING)
  static async updateItemStatus(id, status) {
    try {
      // En lugar de hacer UPDATE y luego SELECT, hacemos todo en uno
      const query = `UPDATE order_items SET estado = $1 WHERE id = $2 RETURNING *`;
      const { rows } = await pool.query(query, [status, id]);
      
      if (rows.length === 0) throw new Error("Item no encontrado");
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar estado del item: ${error.message}`, { cause: error });
    }
  }

  // 4. Actualizar cantidad y recalcular subtotal automáticamente en SQL
  static async updateItemQuantity(id, cantidad) {
    try {
      // Calculamos el subtotal directamente en la consulta SQL para evitar un SELECT previo
      const query = `
        UPDATE order_items 
        SET cantidad = $1, 
            subtotal = precio_unitario * $1 
        WHERE id = $2 
        RETURNING *
      `;
      const { rows } = await pool.query(query, [cantidad, id]);
      
      if (rows.length === 0) throw new Error("Item no encontrado");
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar cantidad: ${error.message}`, { cause: error });
    }
  }

  // 5. Eliminar item (Súper Optimizado con RETURNING)
  static async deleteOrderItem(id) {
    try {
      // DELETE RETURNING nos devuelve el item borrado sin necesidad de buscarlo antes
      const query = `DELETE FROM order_items WHERE id = $1 RETURNING *`;
      const { rows } = await pool.query(query, [id]);
      
      if (rows.length === 0) throw new Error("Item no encontrado");
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar item: ${error.message}`, { cause: error });
    }
  }
}

module.exports = OrderItems;
