const pool = require('../config/Db');

exports.getAllStaff = async () => {
    const result = await pool.query('SELECT * FROM personal ORDER BY id');
    return result.rows;
};

exports.getStaffById = async (id) => {
    const result = await pool.query('SELECT * FROM personal WHERE id = $1', [id]);
    return result.rows[0];
};

exports.createStaff = async (staff) => {
    const { nombre, apellido, dni_curp, email, telefono, direccion, puesto, salario, turno, username, password_hash, rol_permisos, estado } = staff;
    const result = await pool.query(
        `INSERT INTO personal (nombre, apellido, dni_curp, email, telefono, direccion, puesto, salario, turno, username, password_hash, rol_permisos, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [nombre, apellido, dni_curp, email, telefono, direccion, puesto, salario, turno, username, password_hash, rol_permisos, estado || 'activo']
    );
    return result.rows[0];
};

exports.updateStaff = async (id, staff) => {
    const { nombre, apellido, dni_curp, email, telefono, direccion, puesto, salario, turno, rol_permisos, estado } = staff;
    const result = await pool.query(
        `UPDATE personal SET
            nombre=$1, apellido=$2, dni_curp=$3, email=$4, telefono=$5, direccion=$6, puesto=$7, salario=$8, turno=$9, rol_permisos=$10, estado=$11
        WHERE id=$12 RETURNING *`,
        [nombre, apellido, dni_curp, email, telefono, direccion, puesto, salario, turno, rol_permisos, estado, id]
    );
    return result.rows[0];
};

exports.deleteStaff = async (id) => {
    await pool.query('DELETE FROM personal WHERE id = $1', [id]);
    return { message: 'Personal eliminado' };
};

exports.getStaffByUsername = async (username) => {
    const result = await pool.query('SELECT * FROM personal WHERE username = $1', [username]);
    return result.rows[0];
};

// ── Ausencias ──
exports.getAusencias = async () => {
    const result = await pool.query('SELECT a.*, p.nombre, p.apellido FROM ausencias a JOIN personal p ON a.personal_id = p.id ORDER BY a.id DESC');
    return result.rows;
};

exports.createAusencia = async (ausencia) => {
    const { personal_id, tipo, fecha_inicio, fecha_fin, motivo } = ausencia;
    const result = await pool.query(
        `INSERT INTO ausencias (personal_id, tipo, fecha_inicio, fecha_fin, motivo)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [personal_id, tipo, fecha_inicio, fecha_fin, motivo]
    );
    return result.rows[0];
};

exports.deleteAusencia = async (id) => {
    await pool.query('DELETE FROM ausencias WHERE id = $1', [id]);
    return { message: 'Ausencia eliminada' };
};
