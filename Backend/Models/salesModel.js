const pool = require('../config/Db');

exports.getAllSales = async () => {
    const result = await pool.query(`
        SELECT v.*, m.numero as mesa_numero, p.nombre as vendedor_nombre 
        FROM ventas v 
        LEFT JOIN mesas m ON v.mesa_id = m.id 
        LEFT JOIN personal p ON v.personal_id = p.id 
        ORDER BY v.fecha DESC
    `);
    return result.rows;
};

exports.getSaleById = async (id) => {
    const result = await pool.query('SELECT * FROM ventas WHERE id = $1', [id]);
    return result.rows[0];
};

exports.createSale = async (sale) => {
    const { mesa_id, personal_id, detalles, total, metodo_pago, saldo_pendiente, estado, nota } = sale;
    const result = await pool.query(
        `INSERT INTO ventas (mesa_id, personal_id, detalles, total, metodo_pago, saldo_pendiente, estado, nota)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [mesa_id, personal_id, JSON.stringify(detalles), total, metodo_pago, saldo_pendiente || 0, estado || 'pendiente', nota]
    );
    return result.rows[0];
};

exports.updateSale = async (id, sale) => {
    const { mesa_id, personal_id, detalles, total, metodo_pago, saldo_pendiente, estado, nota } = sale;
    const result = await pool.query(
        `UPDATE ventas SET
            mesa_id=$1, personal_id=$2, detalles=$3, total=$4, metodo_pago=$5, saldo_pendiente=$6, estado=$7, nota=$8
        WHERE id=$9 RETURNING *`,
        [mesa_id, personal_id, JSON.stringify(detalles), total, metodo_pago, saldo_pendiente, estado, nota, id]
    );
    return result.rows[0];
};

exports.deleteSale = async (id) => {
    await pool.query('DELETE FROM ventas WHERE id = $1', [id]);
    return { message: 'Venta eliminada' };
};

exports.getSalesByDate = async (fecha) => {
    const result = await pool.query("SELECT * FROM ventas WHERE DATE(fecha) = $1 ORDER BY fecha DESC", [fecha]);
    return result.rows;
};

exports.getSalesByStatus = async (estado) => {
    const result = await pool.query('SELECT * FROM ventas WHERE estado = $1 ORDER BY fecha DESC', [estado]);
    return result.rows;
};

// FUNCIÓN ÚNICA Y CORREGIDA
exports.getTotalSales = async (startDate, endDate) => {
    let query = 'SELECT SUM(total) as total_general FROM ventas';
    const values = [];

    if (startDate && endDate) {
        query += ' WHERE fecha BETWEEN $1 AND $2';
        values.push(startDate, endDate);
    }

    const result = await pool.query(query, values);
    return { 
        total: result.rows[0].total_general ? parseFloat(result.rows[0].total_general) : 0 
    };
};
