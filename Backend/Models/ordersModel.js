const pool = require("../config/Db");
const OrderItems = require("./orderItemsModel");

/**
 * OrdersModel - Gestión de Pedidos
 * Mejoras: Optimización de consultas (Evita N+1), inserciones concurrentes,
 * manejo de errores moderno y sincronización automática de saldos en mesas.
 */
class Orders {
  
  // 1. Obtener todos los pedidos (Súper Optimizado)
  static async getAllOrders() {
    try {
      // Consulta 1: Traer todas las órdenes
      const orderQuery = `
        SELECT o.*, 
               m.numero as mesa_numero, 
               p.nombre as mesero_nombre
        FROM orders o
        LEFT JOIN mesas m ON o.mesa_id = m.id
        LEFT JOIN personal p ON o.mesero_id = p.id
        ORDER BY o.fecha DESC
      `;
      const { rows: orders } = await pool.query(orderQuery);

      if (orders.length === 0) return [];

      // OPTIMIZACIÓN PRO: En lugar de hacer una consulta por cada pedido, 
      // traemos TODOS los items de TODOS los pedidos en una sola consulta.
      const orderIds = orders.map(o => o.id);
      const itemsQuery = `SELECT * FROM order_items WHERE order_id = ANY($1)`;
      const { rows: allItems } = await pool.query(itemsQuery, [orderIds]);

      // Agrupamos los items por su order_id en un mapa para acceso instantáneo
      const itemsMap = allItems.reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      }, {});

      // Unimos los pedidos con sus respectivos items y calculamos el total
      return orders.map(order => {
        const items = itemsMap[order.id] || [];
        const totalCalculado = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
        return { 
          ...order, 
          items, 
          total_calculado: totalCalculado,
          items_count: items.length 
        };
      });

    } catch (error) {
      throw new Error(`Error crítico al obtener pedidos: ${error.message}`, { cause: error });
    }
  }

  // 2. Crear pedido y platos (Sincronizado y Rápido)
  static async createOrder(data) {
    try {
      const { mesaId, meseroId, items, estado = 'pendiente', prioridad = 'normal' } = data;
      
      // Calcular total general
      const totalPedido = items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

      // Insertar la orden
      const orderQuery = `
        INSERT INTO orders (mesa_id, mesero_id, estado, prioridad, total, fecha)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const { rows: orderResult } = await pool.query(orderQuery, [mesaId || null, meseroId || null, estado, prioridad, totalPedido]);
      const orderId = orderResult[0].id;

      // OPTIMIZACIÓN: Insertar todos los items concurrentemente con Promise.all
      // Esto es mucho más rápido que un bucle 'for'
      const itemPromises = items.map(item => 
        OrderItems.createOrderItem({
          orderId: orderId,
          menuItemId: item.menu_item_id,
          nombre: item.nombre,
          precioUnitario: item.precio_unitario,
          cantidad: item.cantidad,
          notas: item.notas
        })
      );
      await Promise.all(itemPromises);

      // Sincronizar total con la mesa
      if (mesaId) {
        await pool.query(`UPDATE mesas SET total = COALESCE(total, 0) + $1 WHERE id = $2`, [totalPedido, mesaId]);
      }

      return await this.getOrderById(orderId);
    } catch (error) {
      throw new Error(`Error al crear pedido: ${error.message}`, { cause: error });
    }
  }

  // 3. Obtener un pedido específico
  static async getOrderById(id) {
    try {
      const query = `
        SELECT o.*, m.numero as mesa_numero, p.nombre as mesero_nombre
        FROM orders o
        LEFT JOIN mesas m ON o.mesa_id = m.id
        LEFT JOIN personal p ON o.mesero_id = p.id
        WHERE o.id = $1
      `;
      const { rows } = await pool.query(query, [id]);
      const order = rows[0];
      
      if (!order) return null;

      const items = await OrderItems.getOrderItems(id);
      return {
        ...order,
        items: items,
        total_calculado: items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0)
      };
    } catch (error) {
      throw new Error(`Error al obtener pedido ${id}: ${error.message}`, { cause: error });
    }
  }

  // 4. Actualizar estado y disparar venta
  static async updateOrderStatus(id, status) {
    try {
      await pool.query(`UPDATE orders SET estado = $1 WHERE id = $2`, [status, id]);
      
      // Si el pedido se marca como entregado o pagado, se registra en ventas
      if (['entregado', 'completado', 'pagado'].includes(status)) {
        await this.registrarVentaAutomatica(id);
      }
      
      return await this.getOrderById(id);
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`, { cause: error });
    }
  }

  // 5. Registro de venta (Histórico)
    // 5. Registro de venta (Ahora inicia como 'pendiente' para ser pagada en el módulo de pagos)
  static async registrarVentaAutomatica(orderId) {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) return;

      const detalles = JSON.stringify({ 
        order_id: orderId, 
        items: order.items,
        fecha_pedido: order.fecha 
      });

      // CAMBIO CRÍTICO: estado 'pendiente' y saldo_pendiente = total
      await pool.query(`
        INSERT INTO ventas (mesa_id, personal_id, detalles, total, metodo_pago, estado, saldo_pendiente, fecha)
        VALUES ($1, $2, $3, $4, 'pendiente', 'pendiente', $4, CURRENT_TIMESTAMP)
      `, [order.mesa_id, order.mesero_id, detalles, order.total]);
    } catch (error) {
      console.error('❌ Error crítico en registro de venta:', error);
    }
  }


  // 6. Eliminar pedido y corregir saldo de mesa
  static async deleteOrder(id) {
    try {
      const order = await this.getOrderById(id);
      if (!order) throw new Error('Pedido no encontrado');

      // El borrado de order_items es automático por ON DELETE CASCADE en el SQL
      await pool.query('DELETE FROM orders WHERE id = $1', [id]);

      // Restar el monto del pedido al total de la mesa
      if (order.mesa_id) {
        await pool.query(`UPDATE mesas SET total = COALESCE(total, 0) - $1 WHERE id = $2`, [order.total, order.mesa_id]);
      }

      return true;
    } catch (error) {
      throw new Error(`Error al eliminar pedido: ${error.message}`, { cause: error });
    }
  }
}

module.exports = Orders;
