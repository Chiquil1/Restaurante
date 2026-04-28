const pool = require('../config/Db');

exports.getAllTables = async () => {
    const result = await pool.query('SELECT * FROM mesas ORDER BY numero');
    return result.rows;
};

exports.getTableById = async (id) => {
    const result = await pool.query('SELECT * FROM mesas WHERE id = $1', [id]);
    return result.rows[0];
};

// --- FUNCIÓN AÑADIDA: Esto soluciona el Error 500 ---
exports.getWaiters = async () => {
    // Buscamos en la tabla personal a quienes sean Meseros
    const result = await pool.query(
        "SELECT id, nombre, apellido FROM personal WHERE puesto = 'Mesero' OR rol_permisos = 'Mesero' ORDER BY nombre"
    );
    return result.rows;
};

exports.createTable = async (table) => {
    const { numero, capacidad, piso, ubicacion, estado, posicion_x, posicion_y } = table;
    
    // Forzamos que los valores numéricos sean realmente números para evitar errores de tipo
    const valNumero = parseInt(numero);
    const valCapacidad = parseInt(capacidad) || 2;
    const valPiso = parseInt(piso) || 1;
    const valPosX = parseInt(posicion_x) || 0;
    const valPosY = parseInt(posicion_y) || 0;

    if (isNaN(valNumero)) {
        throw new Error("El número de mesa debe ser un valor numérico válido");
    }

    const result = await pool.query(
        `INSERT INTO mesas (numero, capacidad, piso, ubicacion, estado, posicion_x, posicion_y)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [valNumero, valCapacidad, valPiso, ubicacion, estado || 'libre', valPosX, valPosY]
    );
    return result.rows[0];
};

exports.updateTable = async (id, table) => {
    const { numero, capacidad, piso, ubicacion, estado, mesero_id, reserva_id, posicion_x, posicion_y, cliente, total } = table;
    const result = await pool.query(
        `UPDATE mesas SET
            numero=$1, capacidad=$2, piso=$3, ubicacion=$4, estado=$5, mesero_id=$6, reserva_id=$7, posicion_x=$8, posicion_y=$9, cliente=$10, total=$11
        WHERE id=$12 RETURNING *`,
        [numero, capacidad, piso, ubicacion, estado, mesero_id, reserva_id, posicion_x, posicion_y, cliente, total, id]
    );
    return result.rows[0];
};

exports.deleteTable = async (id) => {
    await pool.query('DELETE FROM mesas WHERE id = $1', [id]);
    return { message: 'Mesa eliminada' };
};

exports.getTableByStatus = async (estado) => {
    const result = await pool.query('SELECT * FROM mesas WHERE estado = $1 ORDER BY numero', [estado]);
    return result.rows;
};

exports.updateTableStatus = async (id, estado) => {
    const result = await pool.query('UPDATE mesas SET estado = $1 WHERE id = $2 RETURNING *', [estado, id]);
    return result.rows[0];
};

exports.assignWaiter = async (id, mesero_id) => {
    const result = await pool.query('UPDATE mesas SET mesero_id = $1 WHERE id = $2 RETURNING *', [mesero_id, id]);
    return result.rows[0];
};
