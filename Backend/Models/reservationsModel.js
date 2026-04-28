const pool = require('../config/Db');

exports.getAllReservations = async () => {
    const result = await pool.query('SELECT * FROM reservations ORDER BY fecha DESC, hora DESC');
    return result.rows;
};

exports.getReservationById = async (id) => {
    const result = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
    return result.rows[0];
};

exports.createReservation = async (reservation) => {
    const { nombre_cliente, telefono_cliente, email, fecha, hora, numero_personas, mesas_asignadas, notas, estado } = reservation;
    const result = await pool.query(
        `INSERT INTO reservations (nombre_cliente, telefono_cliente, email, fecha, hora, numero_personas, mesas_asignadas, notas, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [nombre_cliente, telefono_cliente, email, fecha, hora, numero_personas, mesas_asignadas, notas, estado || 'pendiente']
    );
    return result.rows[0];
};

exports.updateReservation = async (id, reservation) => {
    const { nombre_cliente, telefono_cliente, email, fecha, hora, numero_personas, mesas_asignadas, notas, estado } = reservation;
    const result = await pool.query(
        `UPDATE reservations SET
            nombre_cliente=$1, telefono_cliente=$2, email=$3, fecha=$4, hora=$5, numero_personas=$6, mesas_asignadas=$7, notas=$8, estado=$9
        WHERE id=$10 RETURNING *`,
        [nombre_cliente, telefono_cliente, email, fecha, hora, numero_personas, mesas_asignadas, notas, estado, id]
    );
    return result.rows[0];
};

exports.deleteReservation = async (id) => {
    await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
    return { message: 'Reserva eliminada' };
};

exports.getReservationsByDate = async (fecha) => {
    const result = await pool.query('SELECT * FROM reservations WHERE fecha = $1 ORDER BY hora', [fecha]);
    return result.rows;
};

exports.getReservationsByStatus = async (estado) => {
    const result = await pool.query('SELECT * FROM reservations WHERE estado = $1 ORDER BY fecha DESC, hora DESC', [estado]);
    return result.rows;
};
