const pool = require('../config/Db');

// Obtener todas las órdenes (con joins para traer datos de mesa y mesero)
exports.getAllOrders = async () => {
    const query = `
        SELECT 
            o.id, 
            o.mesa_id, 
            m.numero as mesa_numero, 
            o.mesero_id, 
            p.nombre as mesero_nombre, 
            o.total, 
            o.estado, 
            o.fecha 
        FROM orders o
        LEFT JOIN mesas m ON o.mesa_id = m.id
        LEFT JOIN personal p ON o.mesero_id = p.id
        ORDER BY o.fecha DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

// Obtener orden por ID
exports.getOrderById = async (id) => {
    const query = `
        SELECT 
            o.*, 
            m.numero as mesa_numero, 
            p.nombre as mesero_nombre 
        FROM orders o
        LEFT JOIN mesas m ON o.mesa_id = m.id
        LEFT JOIN personal p ON o.mesero_id = p.id
        WHERE o.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// Crear nueva orden
exports.createOrder = async (orderData) => {
    const { mesa_id, mesero_id, total, estado } = orderData;
    
    // Si no hay mesa_id, permitir null (pedido para llevar o sin asignar aún)
    const query = `
        INSERT INTO orders (mesa_id, mesero_id, total, estado)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [mesa_id || null, mesero_id || null, total || 0, estado || 'abierto'];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Actualizar estado de la orden
exports.updateOrderStatus = async (id, estado) => {
    const query = `
        UPDATE orders 
        SET estado = $1, fecha = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *
    `;
    const result = await pool.query(query, [estado, id]);
    return result.rows[0];
};

// Eliminar orden (Cancelarla)
exports.deleteOrder = async (id) => {
    // Primero eliminar los items asociados (si no hay CASCADE configurado)
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    
    // Luego eliminar la orden
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    
    return { message: 'Orden eliminada correctamente' };
};
