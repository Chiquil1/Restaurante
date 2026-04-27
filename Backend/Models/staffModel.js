const pool = require("../config/Db");

/**
 * StaffModel - Gestión de Personal
 * Mejoras: Seguridad contra SQL Injection, Mapeo robusto de datos y Optimización de Consultas.
 */
const StaffModel = {
  
  // 1. Obtener todo el personal
  getAll: async () => {
    const { rows } = await pool.query(`SELECT * FROM personal ORDER BY nombre ASC`);
    return rows;
  },

  // 2. Crear personal con mapeo seguro
  create: async (data) => {
    // Definimos el orden exacto de las columnas para evitar errores de desplazamiento de datos
    const columns = [
      'nombre', 'apellido', 'dni_curp', 'email', 'telefono', 
      'direccion', 'puesto', 'salario', 'turno', 'username', 
      'password_hash', 'rol_permisos'
    ];

    // Extraemos los valores basándonos en el orden de las columnas
    // Si un dato no viene en 'data', se inserta como NULL automáticamente
    const values = columns.map(col => data[col] || null);

    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const query = `
      INSERT INTO personal (${columns.join(", ")}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // 3. Gestión de Ausencias
  getAusencias: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM personal_ausencias WHERE personal_id = $1 ORDER BY fecha_inicio DESC`, 
      [id]
    );
    return rows;
  },

  createAusencia: async (data) => {
    const query = `
      INSERT INTO personal_ausencias (personal_id, tipo, fecha_inicio, fecha_fin, motivo) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const { rows } = await pool.query(query, [
      data.personal_id, data.tipo, data.fecha_inicio, data.fecha_fin, data.motivo
    ]);
    return rows[0];
  },

  // 4. Gestión de Horarios y Calendario
  getMonthlySchedule: async (month, year) => {
    const query = `
      SELECT ph.*, p.nombre, p.apellido 
      FROM personal_horarios ph 
      JOIN personal p ON ph.personal_id = p.id 
      WHERE EXTRACT(MONTH FROM fecha) = $1 AND EXTRACT(YEAR FROM fecha) = $2
    `;
    const { rows } = await pool.query(query, [month, year]);
    return rows;
  },

  updateShift: async (personal_id, fecha, tipo_turno) => {
    const query = `
      INSERT INTO personal_horarios (personal_id, fecha, tipo_turno) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (personal_id, fecha) 
      DO UPDATE SET tipo_turno = EXCLUDED.tipo_turno RETURNING *
    `;
    const { rows } = await pool.query(query, [personal_id, fecha, tipo_turno]);
    return rows[0];
  },

  // 5. Actualización Dinámica y Segura
  update: async (id, data) => {
    // LISTA BLANCA: Solo permitimos actualizar estas columnas para evitar SQL Injection
    const allowedColumns = [
      'nombre', 'apellido', 'dni_curp', 'email', 'telefono', 
      'direccion', 'puesto', 'salario', 'turno', 'username', 
      'password_hash', 'rol_permisos', 'estado'
    ];

    // Filtramos el objeto data para quedarnos solo con las columnas permitidas
    const filteredData = Object.keys(data)
      .filter(key => allowedColumns.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    if (Object.keys(filteredData).length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar");
    }

    const keys = Object.keys(filteredData);
    const values = Object.values(filteredData);

    // Construimos la cláusula SET: "nombre = $1, apellido = $2..."
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    
    // El ID será el último parámetro
    const query = `UPDATE personal SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const { rows } = await pool.query(query, [...values, id]);
    
    return rows[0];
  },

  // 6. Eliminar personal
  delete: async (id) => {
    await pool.query(`DELETE FROM personal WHERE id = $1`, [id]);
  }
};

module.exports = StaffModel;
