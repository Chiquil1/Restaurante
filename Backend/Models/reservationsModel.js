const pool = require('../config/Db');

// Obtener todas las reservaciones (con filtros opcionales)
exports.getAllReservations = async (filters = {}) => {
    let query = 'SELECT * FROM reservations';
    const values = [];
    let conditionCounter = 1;

    if (filters.estado) {
        query += ` WHERE estado = $${conditionCounter}`;
        values.push(filters.estado);
        conditionCounter++;
    }

    if (filters.fecha) {
        query += filters.estado ? ' AND ' : ' WHERE ';
        query += `fecha = $${conditionCounter}`;
        values.push(filters.fecha);
    }

    query += ' ORDER BY fecha DESC, hora DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
};

// Obtener una reservación por ID
exports.getReservationById = async (id) => {
    const result = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
    return result.rows[0];
};

// Crear nueva reservación
exports.createReservation = async (reservation) => {
    const { 
        nombre_cliente, telefono_cliente, email, fecha, hora, 
        numero_personas, mesas_asignadas, notas, estado 
    } = reservation;

    // Asegurar que mesas_asignadas sea un string JSON válido si es un array
    let mesasString = mesas_asignadas;
    if (Array.isArray(mesas_asignadas)) {
        mesasString = JSON.stringify(mesas_asignadas);
    }

    const result = await pool.query(
        `INSERT INTO reservations (nombre_cliente, telefono_cliente, email, fecha, hora, numero_personas, mesas_asignadas, notas, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [nombre_cliente, telefono_cliente, email, fecha, hora, numero_personas, mesasString, notas, estado || 'pendiente']
    );
    return result.rows[0];
};

// Actualizar reservación
exports.updateReservation = async (id, reservation) => {
    const { 
        nombre_cliente, telefono_cliente, email, fecha, hora, 
        numero_personas, mesas_asignadas, notas, estado 
    } = reservation;

    let mesasString = mesas_asignadas;
    if (Array.isArray(mesas_asignadas)) {
        mesasString = JSON.stringify(mesas_asignadas);
    } else if (!mesas_asignadas) {
        mesasString = '[]'; // Valor por defecto si está vacío
    }

    const result = await pool.query(
        `UPDATE reservations SET
            nombre_cliente=$1, telefono_cliente=$2, email=$3, fecha=$4, hora=$5, 
            numero_personas=$6, mesas_asignadas=$7, notas=$8, estado=$9
        WHERE id=$10 RETURNING *`,
        [nombre_cliente, telefono_cliente, email, fecha, hora, numero_personas, mesasString, notas, estado, id]
    );
    return result.rows[0];
};

// Eliminar reservación
exports.deleteReservation = async (id) => {
    await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
    return { message: 'Reserva eliminada correctamente' };
};

// Helpers adicionales para el controlador
exports.getReservationsByDate = async (fecha) => {
    const result = await pool.query('SELECT * FROM reservations WHERE fecha = $1 ORDER BY hora', [fecha]);
    return result.rows;
};