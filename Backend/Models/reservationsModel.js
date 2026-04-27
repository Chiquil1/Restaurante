const pool = require('../config/Db');

/**
 * MODELO DE RESERVAS
 * Sincronizado con la tabla 'reservations' (PostgreSQL)
 */

const getReservations = async () => {
  // CAMBIO: de 'reservas' a 'reservations'
  const { rows } = await pool.query(`
    SELECT id, nombre_cliente, telefono_cliente, email, fecha, hora, numero_personas, mesas_asignadas, notas, estado, fecha_creacion 
    FROM reservations 
    ORDER BY fecha DESC, hora DESC
  `);
  return rows;
};

const getReservationById = async (id) => {
  // CAMBIO: de 'reservas' a 'reservations'
  const { rows } = await pool.query(
    `SELECT * FROM reservations WHERE id = $1`,
    [id]
  );
  return rows[0];
};

const createReservation = async (data) => {
  try {
    // CAMBIO: de 'reservas' a 'reservations'
    const { rows } = await pool.query(`
      INSERT INTO reservations (
        nombre_cliente, telefono_cliente, email, fecha, hora, numero_personas, mesas_asignadas, notas, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      data.nombre_cliente,
      data.telefono_cliente,
      data.email,
      data.fecha,
      data.hora,
      data.numero_personas,
      data.mesas_asignadas || null,
      data.notas || '',
      data.estado || 'pendiente'
    ]);
    return rows[0];
  } catch (err) {
    throw new Error(`Error al crear reserva en BD: ${err.message}`, { cause: err });
  }
};

const updateReservation = async (id, data) => {
  try {
    // CAMBIO: de 'reservas' a 'reservations'
    const { rows } = await pool.query(`
      UPDATE reservations
      SET
        nombre_cliente = $1, telefono_cliente = $2, email = $3, fecha = $4, hora = $5, 
        numero_personas = $6, mesas_asignadas = $7, notas = $8, estado = $9
      WHERE id = $10
      RETURNING *
    `, [
      data.nombre_cliente, data.telefono_cliente, data.email, data.fecha, data.hora,
      data.numero_personas, data.mesas_asignadas, data.notas, data.estado, id
    ]);
    return rows[0];
  } catch (err) {
    throw new Error(`Error al actualizar reserva en BD: ${err.message}`, { cause: err });
  }
};

const deleteReservation = async (id) => {
  try {
    // CAMBIO: de 'reservas' a 'reservations'
    await pool.query(`DELETE FROM reservations WHERE id = $1`, [id]);
    return { success: true };
  } catch (err) {
    throw new Error(`Error al eliminar reserva: ${err.message}`, { cause: err });
  }
};

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
};
