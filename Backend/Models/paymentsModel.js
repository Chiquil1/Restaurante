const pool = require("../config/Db");

class Payments {
  // Registrar un nuevo pago y actualizar la venta (Atomicidad con Transacción)
  static async createPayment(data) {
    const { venta_id, monto, metodo_pago, notas, usuario_id } = data;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insertar el pago
      const paymentQuery = `
        INSERT INTO pagos (venta_id, monto, metodo_pago, notas, usuario_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const { rows: paymentResult } = await client.query(paymentQuery, [venta_id, monto, metodo_pago, notas, usuario_id]);
      const payment = paymentResult[0];

      // 2. Calcular el total pagado hasta ahora para esta venta
      const totalPagadoQuery = `SELECT SUM(monto) as total FROM pagos WHERE venta_id = $1`;
      const { rows: sumResult } = await client.query(totalPagadoQuery, [venta_id]);
      const totalPagado = parseFloat(sumResult[0].total || 0);

      // 3. Obtener el total de la venta original
      const ventaQuery = `SELECT total FROM ventas WHERE id = $1`;
      const { rows: ventaResult } = await client.query(ventaQuery, [venta_id]);
      const totalVenta = parseFloat(ventaResult[0].total);

      // 4. Calcular saldo y determinar estado
      const nuevoSaldo = totalVenta - totalPagado;
      const nuevoEstado = nuevoSaldo <= 0 ? 'completada' : (nuevoSaldo < totalVenta ? 'parcial' : 'pendiente');

      // 5. Actualizar la tabla ventas
      await client.query(
        `UPDATE ventas SET saldo_pendiente = $1, estado = $2, metodo_pago = $3 WHERE id = $4`,
        [nuevoSaldo, nuevoEstado, metodo_pago, venta_id]
      );

      await client.query('COMMIT');
      return payment;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getPaymentsBySale(venta_id) {
    const query = `SELECT * FROM pagos WHERE venta_id = $1 ORDER BY fecha DESC`;
    const { rows } = await pool.query(query, [venta_id]);
    return rows;
  }

  static async getSaleBalance(venta_id) {
    const query = `SELECT total, saldo_pendiente, estado FROM ventas WHERE id = $1`;
    const { rows } = await pool.query(query, [venta_id]);
    return rows[0];
  }
}

module.exports = Payments;
