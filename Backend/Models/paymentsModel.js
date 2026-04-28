const pool = require('../config/Db');

exports.getAllPayments = async () => {
    const result = await pool.query(`
        SELECT p.*, v.total as venta_total, u.nombre as usuario_nombre 
        FROM pagos p 
        LEFT JOIN ventas v ON p.venta_id = v.id 
        LEFT JOIN personal u ON p.usuario_id = u.id 
        ORDER BY p.fecha DESC
    `);
    return result.rows;
};

exports.getPaymentById = async (id) => {
    const result = await pool.query('SELECT * FROM pagos WHERE id = $1', [id]);
    return result.rows[0];
};

exports.createPayment = async (payment) => {
    const { venta_id, monto, metodo_pago, notas, usuario_id } = payment;
    const result = await pool.query(
        `INSERT INTO pagos (venta_id, monto, metodo_pago, notas, usuario_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [venta_id, monto, metodo_pago, notas, usuario_id]
    );
    return result.rows[0];
};

exports.updatePayment = async (id, payment) => {
    const { venta_id, monto, metodo_pago, notas, usuario_id } = payment;
    const result = await pool.query(
        `UPDATE pagos SET
            venta_id=$1, monto=$2, metodo_pago=$3, notas=$4, usuario_id=$5
        WHERE id=$6 RETURNING *`,
        [venta_id, monto, metodo_pago, notas, usuario_id, id]
    );
    return result.rows[0];
};

exports.deletePayment = async (id) => {
    await pool.query('DELETE FROM pagos WHERE id = $1', [id]);
    return { message: 'Pago eliminado' };
};

exports.getPaymentsBySale = async (venta_id) => {
    const result = await pool.query('SELECT * FROM pagos WHERE venta_id = $1 ORDER BY fecha', [venta_id]);
    return result.rows;
};

exports.getTotalPayments = async () => {
    const result = await pool.query('SELECT SUM(monto) as total FROM pagos');
    return result.rows[0];
};
