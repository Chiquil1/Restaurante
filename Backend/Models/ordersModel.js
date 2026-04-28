const pool = require('../config/Db');

exports.getAllOrders = async () => {
    const result = await pool.query(`
        SELECT o.*, m.numero as mesa_numero, p.nombre as mesero_nombre 
        FROM orders o 
        LEFT JOIN mesas m ON o.mesa_id = m.id 
        LEFT JOIN personal p ON o.mesero_id = p.id 
        ORDER BY o.fecha DESC
    `);
    return result.rows;
};

exports.getOrderById = async (id) => {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
};

exports.createOrder = async (order) => {
    const { mesa_id, mesero_id, total, estado } = order;
    const result = await pool.query(
        `INSERT INTO orders (mesa_id, mesero_id, total, estado)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [mesa_id, mesero_id, total || 0, estado || 'abierto']
    );
    return result.rows[0];
};

exports.updateOrder = async (id, order) => {
    const { mesa_id, mesero_id, total, estado } = order;
    const result = await pool.query(
        `UPDATE orders SET
            mesa_id=$1, mesero_id=$2, total=$3, estado=$4
        WHERE id=$5 RETURNING *`,
        [mesa_id, mesero_id, total, estado, id]
    );
    return result.rows[0];
};

exports.deleteOrder = async (id) => {
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    return { message: 'Pedido eliminado' };
};

exports.getOrdersByTable = async (mesa_id) => {
    const result = await pool.query('SELECT * FROM orders WHERE mesa_id = $1 ORDER BY fecha DESC', [mesa_id]);
    return result.rows;
};

exports.getOrdersByStatus = async (estado) => {
    const result = await pool.query('SELECT * FROM orders WHERE estado = $1 ORDER BY fecha DESC', [estado]);
    return result.rows;
};

exports.getOpenOrders = async () => {
    const result = await pool.query("SELECT * FROM orders WHERE estado = 'abierto' ORDER BY fecha DESC");
    return result.rows;
};
