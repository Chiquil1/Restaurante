const pool = require("../config/Db");

class Reports {
  // Get sales report
  static async getSalesReport(dateFrom, dateTo) {
    try {
      const query = `
        SELECT 
          DATE(fecha) as fecha,
          COUNT(*) as transacciones,
          SUM(total) as monto_total,
          AVG(total) as ticket_promedio,
          MAX(total) as venta_maxima,
          MIN(total) as venta_minima
        FROM ventas
        WHERE estado = 'completada'
          AND DATE(fecha) BETWEEN $1 AND $2
        GROUP BY DATE(fecha)
        ORDER BY fecha DESC;
      `;

      const result = await pool.query(query, [dateFrom, dateTo]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener reporte de ventas: ${error.message}`);
    }
  }

  // Get reservations report
  static async getReservationsReport(dateFrom, dateTo) {
    try {
      const query = `
        SELECT 
          estado,
          DATE(fecha) as fecha,
          COUNT(*) as cantidad,
          AVG(numero_personas) as promedio_personas
        FROM reservas
        WHERE DATE(fecha) BETWEEN $1 AND $2
        GROUP BY DATE(fecha), estado
        ORDER BY fecha DESC;
      `;

      const result = await pool.query(query, [dateFrom, dateTo]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener reporte de reservas: ${error.message}`);
    }
  }

  // Get occupancy report
  static async getOccupancyReport(date) {
    try {
      const query = `
        SELECT 
          estado,
          COUNT(*) as cantidad,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM mesas), 2) as porcentaje
        FROM mesas
        GROUP BY estado;
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener reporte de ocupación: ${error.message}`);
    }
  }

  // Get menu popularity report
  static async getMenuPopularityReport(dateFrom, dateTo) {
    try {
      const query = `
        SELECT 
          v.detalles ->> 'nombre' as plato,
          COUNT(*) as cantidad_vendida,
          SUM((v.detalles ->> 'precio')::numeric) as monto_total
        FROM ventas v
        WHERE DATE(v.fecha) BETWEEN $1 AND $2
          AND v.estado = 'completada'
        GROUP BY v.detalles ->> 'nombre'
        ORDER BY cantidad_vendida DESC
        LIMIT 20;
      `;

      const result = await pool.query(query, [dateFrom, dateTo]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener reporte de popularidad: ${error.message}`);
    }
  }

  // Get staff performance report
  static async getStaffPerformanceReport(dateFrom, dateTo) {
    try {
      const query = `
        SELECT 
          p.nombre,
          p.puesto,
          COUNT(v.id) as ventas_realizadas,
          SUM(v.total) as monto_total,
          AVG(v.total) as ticket_promedio
        FROM personal p
        LEFT JOIN ventas v ON p.id = v.personal_id 
          AND DATE(v.fecha) BETWEEN $1 AND $2
        WHERE p.estado = 'activo'
        GROUP BY p.id, p.nombre, p.puesto
        ORDER BY ventas_realizadas DESC;
      `;

      const result = await pool.query(query, [dateFrom, dateTo]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener reporte de desempeño: ${error.message}`);
    }
  }
}

module.exports = Reports;
