const pool = require('../config/Db');

// ── Ventas de Hoy ──
exports.getVentasHoy = async () => {
    const result = await pool.query(
        `SELECT COALESCE(SUM(total), 0) as total 
         FROM ventas 
         WHERE DATE(fecha) = CURRENT_DATE`
    );
    return result.rows[0];
};

// ── Clientes de Hoy ──
exports.getClientesHoy = async () => {
    const result = await pool.query(
        `SELECT COUNT(DISTINCT mesa_id) as total 
         FROM ventas 
         WHERE DATE(fecha) = CURRENT_DATE`
    );
    return result.rows[0];
};

// ── Pedidos Activos ──
exports.getPedidosActivos = async () => {
    const result = await pool.query(
        `SELECT COUNT(*) as total 
         FROM orders 
         WHERE estado = 'abierto'`
    );
    return result.rows[0];
};

// ── Mesas Ocupadas ──
exports.getMesasOcupadas = async () => {
    const result = await pool.query(
        `SELECT COUNT(*) as total 
         FROM mesas 
         WHERE estado = 'ocupada'`
    );
    return result.rows[0];
};

// ── Total de Mesas ──
exports.getTotalMesas = async () => {
    const result = await pool.query('SELECT COUNT(*) as total FROM mesas');
    return result.rows[0];
};

// ── Resumen Dashboard ──
exports.getDashboardSummary = async () => {
    const ventasHoy = await this.getVentasHoy();
    const clientesHoy = await this.getClientesHoy();
    const pedidosActivos = await this.getPedidosActivos();
    const mesasOcupadas = await this.getMesasOcupadas();
    const totalMesas = await this.getTotalMesas();

    return {
        ventasHoy: ventasHoy.total,
        clientesHoy: clientesHoy.total,
        pedidosActivos: pedidosActivos.total,
        mesasOcupadas: mesasOcupadas.total,
        totalMesas: totalMesas.total
    };
};
