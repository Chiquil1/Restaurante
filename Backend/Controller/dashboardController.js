const pool = require('../config/Db');

const getDashboardStats = async (req, res) => {
  try {
    // Ejecutamos todas las consultas en paralelo para máxima velocidad
    const results = await Promise.all([
      // 1. Ventas hoy
      pool.query(`SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE DATE(fecha) = CURRENT_DATE AND estado = 'completada'`),
      
      // 2. Clientes hoy (Reservas)
      pool.query(`SELECT COUNT(*) as total FROM reservations WHERE DATE(fecha) = CURRENT_DATE`),
      
      // 3. Pedidos Activos -> CORREGIDO: 'status' cambiado a 'estado'
      pool.query(`SELECT COUNT(*) as total FROM orders WHERE estado NOT IN ('pagado','completado','cancelado')`),
      
      // 4. Mesas Ocupadas
      pool.query(`SELECT COUNT(*) as total FROM mesas WHERE estado != 'libre'`),
      
      // 5. Total de Mesas
      pool.query(`SELECT COUNT(*) as total FROM mesas`)
    ]);

    return res.json({
      // Usamos parseFloat para las ventas porque es dinero, y Number para los conteos
      ventasHoy: parseFloat(results[0].rows[0].total || 0),
      clientesHoy: Number(results[1].rows[0].total),
      pedidosActivos: Number(results[2].rows[0].total),
      mesasOcupadas: Number(results[3].rows[0].total),
      totalMesas: Number(results[4].rows[0].total),
    });
  } catch (error) {
    console.error("DASHBOARD_ERROR:", error);
    res.status(500).json({ error: "Error al procesar estadísticas" });
  }
};

module.exports = { getDashboardStats };
