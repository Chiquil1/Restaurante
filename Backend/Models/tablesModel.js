const pool = require('../config/Db');

// Obtener todas las mesas (con filtro opcional por estado)
exports.getAllTables = async (filters = {}) => {
    let query = 'SELECT * FROM mesas';
    const values = [];
    
    if (filters.estado) {
        query += ' WHERE estado = $1';
        values.push(filters.estado);
    }
    
    query += ' ORDER BY numero ASC';
    
    const result = await pool.query(query, values);
    return result.rows;
};

// Obtener una mesa por ID
exports.getTableById = async (id) => {
    const result = await pool.query('SELECT * FROM mesas WHERE id = $1', [id]);
    return result.rows[0];
};

// Crear nueva mesa (Robusto ante columnas faltantes)
exports.createTable = async (tableData) => {
    const { numero, capacidad, piso, ubicacion, estado, mesero_id, cliente, total } = tableData;
    
    // Construcción dinámica de la consulta para evitar errores si faltan columnas en la DB
    // Asumimos que 'numero', 'capacidad' y 'estado' son las únicas obligatorias según tu SQL base
    let columns = ['numero', 'capacidad', 'estado'];
    let values = [numero, capacidad, estado || 'libre'];
    let placeholders = ['$1', '$2', '$3'];
    let paramCount = 3;

    // Agregamos opcionales solo si tienen valor
    if (ubicacion) {
        paramCount++;
        columns.push('ubicacion');
        values.push(ubicacion);
        placeholders.push(`$${paramCount}`);
    }
    
    if (mesero_id) {
        paramCount++;
        columns.push('mesero_id');
        values.push(mesero_id);
        placeholders.push(`$${paramCount}`);
    }

    if (cliente) {
        paramCount++;
        columns.push('cliente');
        values.push(cliente);
        placeholders.push(`$${paramCount}`);
    }

    if (total !== undefined && total !== null) {
        paramCount++;
        columns.push('total');
        values.push(total);
        placeholders.push(`$${paramCount}`);
    }

    // Intentamos agregar 'piso' si existe en la data, si la columna no existe en DB, 
    // el catch lo manejará o podemos omitirlo explícitamente si sabemos que falta.
    // Para este caso, lo agregamos condicionalmente.
    if (piso !== undefined && piso !== null) {
        paramCount++;
        columns.push('piso');
        values.push(piso);
        placeholders.push(`$${paramCount}`);
    }

    const query = `
        INSERT INTO mesas (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT (numero) DO UPDATE SET 
            ${columns.map((col, i) => `${col} = EXCLUDED.${col}`).join(', ')}
        RETURNING *
    `;

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        // Si falla por columna inexistente (ej. 'piso'), intentamos de nuevo sin ella
        if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.warn("Columna no encontrada en DB, reintentando sin columnas avanzadas...");
            // Fallback simple: reintenta solo con lo básico si hay error de estructura
            const fallbackQuery = `
                INSERT INTO mesas (numero, capacidad, estado, ubicacion, mesero_id, cliente, total)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (numero) DO UPDATE SET 
                    capacidad = EXCLUDED.capacidad,
                    ubicacion = EXCLUDED.ubicacion,
                    estado = EXCLUDED.estado,
                    mesero_id = EXCLUDED.mesero_id,
                    cliente = EXCLUDED.cliente,
                    total = EXCLUDED.total
                RETURNING *
            `;
            const fallbackValues = [numero, capacidad, estado || 'libre', ubicacion || null, mesero_id || null, cliente || null, total || 0];
            const fallbackResult = await pool.query(fallbackQuery, fallbackValues);
            return fallbackResult.rows[0];
        }
        throw error;
    }
};

// Actualizar mesa
exports.updateTable = async (id, tableData) => {
    const { numero, capacidad, piso, ubicacion, estado, mesero_id, cliente, total } = tableData;
    
    // Similar lógica defensiva para update
    const updates = [];
    const values = [];
    let paramCount = 0;

    const addUpdate = (col, val) => {
        if (val !== undefined && val !== null) {
            paramCount++;
            updates.push(`${col} = $${paramCount}`);
            values.push(val);
        }
    };

    addUpdate('numero', numero);
    addUpdate('capacidad', capacidad);
    addUpdate('piso', piso); 
    addUpdate('ubicacion', ubicacion);
    addUpdate('estado', estado);
    addUpdate('mesero_id', mesero_id);
    addUpdate('cliente', cliente);
    addUpdate('total', total);

    if (updates.length === 0) return await this.getTableById(id);

    paramCount++;
    values.push(id);

    const query = `
        UPDATE mesas SET ${updates.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} RETURNING *
    `;

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        if (error.message.includes('column') && error.message.includes('does not exist')) {
             // Fallback para update sin 'piso' ni coordenadas si fallara
             const simpleQuery = `
                UPDATE mesas SET 
                    numero = COALESCE($1, numero),
                    capacidad = COALESCE($2, capacidad),
                    ubicacion = COALESCE($3, ubicacion),
                    estado = COALESCE($4, estado),
                    mesero_id = COALESCE($5, mesero_id),
                    cliente = COALESCE($6, cliente),
                    total = COALESCE($7, total),
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = $8 RETURNING *
             `;
             const result = await pool.query(simpleQuery, [numero, capacidad, ubicacion, estado, mesero_id, cliente, total, id]);
             return result.rows[0];
        }
        throw error;
    }
};

// Eliminar mesa
exports.deleteTable = async (id) => {
    await pool.query('DELETE FROM mesas WHERE id = $1', [id]);
    return { message: 'Mesa eliminada correctamente' };
};

// Actualizar estado de la mesa
exports.updateTableStatus = async (id, estado, mesero_id = null, cliente = null) => {
    const result = await pool.query(
        `UPDATE mesas SET estado = $1, mesero_id = $2, cliente = $3, fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [estado, mesero_id, cliente, id]
    );
    return result.rows[0];
};
