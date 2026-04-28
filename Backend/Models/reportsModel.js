const pool = require('../config/Db');

// ── Reporte de Ventas por Fecha ──
exports.getSalesReport = async (fecha_inicio, fecha_fin) => {
    const result = await pool.query(
        `SELECT DATE(fecha) as fecha, SUM(total) as total, COUNT(*) as cantidad 
         FROM ventas 
         WHERE fecha BETWEEN $1 AND $2 
         GROUP BY DATE(fecha) 
         ORDER BY fecha`,
        [fecha_inicio, fecha_fin]
    );
    return result.rows;
};

// ── Reporte de Productos Más Vendidos ──
exports.getTopProducts = async (fecha_inicio, fecha_fin, limit = 10) => {
    const result = await pool.query(
        `SELECT m.nombre, SUM(oi.cantidad) as total_vendido, SUM(oi.subtotal) as total_ingresos 
         FROM order_items oi 
         JOIN menu m ON oi.menu_item_id = m.id 
         JOIN orders o ON oi.order_id = o.id 
         WHERE o.fecha BETWEEN $1 AND $2 
         GROUP BY m.id, m.nombre 
         ORDER BY total_vendido DESC 
         LIMIT $3`,
        [fecha_inicio, fecha_fin, limit]
    );
    return result.rows;
};

// ── Reporte de Meseros ──
exports.getWaiterReport = async (fecha_inicio, fecha_fin) => {
    const result = await pool.query(
        `SELECT p.nombre, p.apellido, COUNT(o.id) as pedidos_atendidos, SUM(o.total) as total_ventas 
         FROM personal p 
         LEFT JOIN orders o ON p.id = o.mesero_id 
         WHERE o.fecha BETWEEN $1 AND $2 
         GROUP BY p.id, p.nombre, p.apellido 
         ORDER BY total_ventas DESC`,
        [fecha_inicio, fecha_fin]
    );
    return result.rows;
};

// ── Reporte de Mesas ──
exports.getTableReport = async () => {
    const result = await pool.query(
        `SELECT estado, COUNT(*) as cantidad, SUM(total) as total_ventas 
         FROM mesas 
         GROUP BY estado`
    );
    return result.rows;
};

// ── Reporte de Reservas ──
exports.getReservationsReport = async (fecha_inicio, fecha_fin) => {
    const result = await pool.query(
        `SELECT estado, COUNT(*) as cantidad 
         FROM reservations 
         WHERE fecha BETWEEN $1 AND $2 
         GROUP BY estado`,
        [fecha_inicio, fecha_fin]
    );
    return result.rows;
};
