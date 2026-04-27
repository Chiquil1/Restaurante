const pool = require('../config/Db');

const dashboardModel = {
  getVentasHoy: () => {
    return pool.query(`
      SELECT COALESCE(SUM(total), 0) as ventasHoy
      FROM ventas
      WHERE DATE(fecha) = CURRENT_DATE
      AND estado = 'completada'
    `);
  },
  getClientesHoy: () => {
    return pool.query(`
      SELECT COUNT(*) as clientesHoy
      FROM reservations
      WHERE DATE(fecha) = CURRENT_DATE
    `);
  },
  getPedidosActivos: () => {
    return pool.query(`
      SELECT COUNT(*) as pedidosActivos
      FROM orders
      WHERE estado NOT IN ('pagado','completado','cancelado')
    `);
  },
  getMesasOcupadas: () => {
    return pool.query(`
      SELECT COUNT(*) as mesasOcupadas
      FROM mesas
      WHERE estado != 'libre'
    `);
  },
  getTotalMesas: () => {
    return pool.query(`
      SELECT COUNT(*) as totalMesas
      FROM mesas
    `);
  }
};

module.exports = dashboardModel;
