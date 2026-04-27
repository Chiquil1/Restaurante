export const dashboardService = {
  async getStats(pool) {
    try {
      // 1. Ventas de Hoy (Cambiamos created_at -> fecha)
      const ventas = await pool.query(`
        SELECT COALESCE(SUM(total), 0) as ventasHoy
        FROM ventas
        WHERE DATE(fecha) = CURRENT_DATE
        AND estado = 'completada'
      `);

      // 2. Clientes de Hoy (Cambiamos orders -> reservations y created_at -> fecha)
      const clientes = await pool.query(`
        SELECT COUNT(*) as clientesHoy
        FROM reservations
        WHERE DATE(fecha) = CURRENT_DATE
      `);

      // 3. Pedidos Activos (Sincronizamos los estados: pendiente, preparando, entregado)
      const pedidos = await pool.query(`
        SELECT COUNT(*) as pedidosActivos
        FROM orders
        WHERE estado NOT IN ('pagado', 'completado', 'cancelado')
      `);

      // 4. Mesas (Cambiamos ocupada = true -> estado != 'libre')
      const mesas = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE estado != 'libre') as mesasOcupadas,
          COUNT(*) as totalMesas
        FROM mesas
      `);

      return {
        ventasHoy: ventas.rows[0].ventasHoy,
        clientesHoy: clientes.rows[0].clientesHoy,
        pedidosActivos: pedidos.rows[0].pedidosActivos,
        mesasOcupadas: mesas.rows[0].mesasOcupadas || 0,
        totalMesas: mesas.rows[0].totalMesas
      };
    } catch (error) {
      console.error("❌ ERROR CRÍTICO EN DASHBOARD SERVICE:", error);
      // Retornamos valores en 0 para que la web no se caiga aunque haya un error
      return {
        ventasHoy: 0,
        clientesHoy: 0,
        pedidosActivos: 0,
        mesasOcupadas: 0,
        totalMesas: 0
      };
    }
  }
};
