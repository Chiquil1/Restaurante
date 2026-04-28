const pool = require('../config/Db');

exports.getAllOrderItems = async () => {
    const result = await pool.query(`
        SELECT oi.*, o.mesa_id, m.nombre as menu_nombre 
        FROM order_items oi 
        LEFT JOIN orders o ON oi.order_id = o.id 
        LEFT JOIN menu m ON oi.menu_item_id = m.id 
        ORDER BY oi.fecha DESC
    `);
    return result.rows;
};

exports.getOrderItemsById = async (id) => {
    const result = await pool.query('SELECT * FROM order_items WHERE id = $1', [id]);
    return result.rows[0];
};

exports.getOrderItemsByOrder = async (order_id) => {
    const result = await pool.query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id', [order_id]);
    return result.rows;
};

exports.createOrderItem = async (item) => {
    const { order_id, menu_item_id, nombre, precio_unitario, cantidad, subtotal, notas, estado } = item;
    const result = await pool.query(
        `INSERT INTO order_items (order_id, menu_item_id, nombre, precio_unitario, cantidad, subtotal, notas, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [order_id, menu_item_id, nombre, precio_unitario, cantidad, subtotal, notas, estado || 'pendiente']
    );
    return result.rows[0];
};

exports.updateOrderItem = async (id, item) => {
    const { menu_item_id, nombre, precio_unitario, cantidad, subtotal, notas, estado } = item;
    const result = await pool.query(
        `UPDATE order_items SET
            menu_item_id=$1, nombre=$2, precio_unitario=$3, cantidad=$4, subtotal=$5, notas=$6, estado=$7
        WHERE id=$8 RETURNING *`,
        [menu_item_id, nombre, precio_unitario, cantidad, subtotal, notas, estado, id]
    );
    return result.rows[0];
};

exports.deleteOrderItem = async (id) => {
    await pool.query('DELETE FROM order_items WHERE id = $1', [id]);
    return { message: 'Item eliminado' };
};

exports.updateOrderItemStatus = async (id, estado) => {
    const result = await pool.query('UPDATE order_items SET estado = $1 WHERE id = $2 RETURNING *', [estado, id]);
    return result.rows[0];
};
