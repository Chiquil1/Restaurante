const pool = require("../config/Db");

class Sales {
  // 1. Historial completo (Usado en la página de Ventas)
  static async getAllSales(startDate, endDate) {
    try {
      let query = `
        SELECT v.*, 
               m.numero as mesa_numero, 
               p.nombre as personal_nombre
        FROM ventas v
        LEFT JOIN mesas m ON v.mesa_id = m.id
        LEFT JOIN personal p ON v.personal_id = p.id
      `;
      const values = [];
      if (startDate && endDate) {
        query += ` WHERE v.fecha BETWEEN $1 AND $2`;
        values.push(startDate, endDate);
      }
      query += ` ORDER BY v.fecha DESC`;
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener historial de ventas: ${error.message}`, { cause: error });
    }
  }

  // 2. Resumen general (Total, Cantidad, Promedio)
  static async getSummary(startDate, endDate) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_pedidos, 
          SUM(total) as ingresos_totales, 
          AVG(total) as ticket_promedio 
        FROM ventas
      `;
      const values = [];
      if (startDate && endDate) {
        query += ` WHERE fecha BETWEEN $1 AND $2`;
        values.push(startDate, endDate);
      }
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al calcular resumen de ventas: ${error.message}`, { cause: error });
    }
  }

  // 3. Resumen por método de pago
  static async getPaymentSummary(startDate, endDate) {
    try {
      let query = `
        SELECT metodo_pago, SUM(total) as total, COUNT(*) as cantidad
        FROM ventas
        GROUP BY metodo_pago
      `;
      const values = [];
      if (startDate && endDate) {
        query += ` WHERE fecha BETWEEN $1 AND $2`;
        values.push(startDate, endDate);
      }
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener resumen de pagos: ${error.message}`, { cause: error });
    }
  }

  // 4. Búsqueda por pedido (VITAL PARA EL BOTÓN COBRAR)
  static async findByOrderId(orderId) {
    try {
      const query = `
        SELECT * 
        FROM ventas 
        WHERE detalles->>'order_id' = $1 
        LIMIT 1
      `;
      const { rows } = await pool.query(query, [orderId.toString()]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al buscar la venta del pedido ${orderId}: ${error.message}`, { cause: error });
    }
  }

  // 5. Suma total de todas las ventas (VITAL PARA EL MAPA DE MESAS)
  static async getTotalSales() {
    try {
      const query = `SELECT SUM(total) as total_general FROM ventas`;
      const { rows } = await pool.query(query);
      return rows[0].total_general || 0;
    } catch (error) {
      throw new Error(`Error al sumar ventas totales: ${error.message}`, { cause: error });
    }
  }

  // 6. Crear venta
  static async createSale(data) {
    try {
      const { mesa_id, personal_id, detalles, total, metodo_pago, nota, estado = 'pendiente' } = data;
      const saldoPendiente = estado === 'completada' ? 0 : total;
      const query = `
        INSERT INTO ventas (mesa_id, personal_id, detalles, total, metodo_pago, nota, estado, saldo_pendiente, fecha)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const { rows } = await pool.query(query, [mesa_id, personal_id, detalles, total, metodo_pago, nota, estado, saldoPendiente]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear registro de venta: ${error.message}`, { cause: error });
    }
  }

  // 7. Actualizar estado
  static async updateStatus(id, status) {
    try {
      const query = `UPDATE ventas SET estado = $1 WHERE id = $2 RETURNING *`;
      const { rows } = await pool.query(query, [status, id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar estado de venta: ${error.message}`, { cause: error });
    }
  }
}

module.exports = Sales;
