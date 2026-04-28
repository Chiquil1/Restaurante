const pool = require('../config/Db');

// ── Configuración General ──
exports.getConfig = async () => {
    const result = await pool.query('SELECT * FROM configuracion_general ORDER BY id DESC LIMIT 1');
    return result.rows[0];
};

exports.updateConfig = async (config) => {
    const { nombreNegocio, moneda, horario_apertura, horario_cierre, telefono, email } = config;
    const result = await pool.query(
        `UPDATE configuracion_general SET
            nombreNegocio=$1, moneda=$2, horario_apertura=$3, horario_cierre=$4, telefono=$5, email=$6
        WHERE id=1 RETURNING *`,
        [nombreNegocio, moneda, horario_apertura, horario_cierre, telefono, email]
    );
    return result.rows[0];
};

exports.createConfig = async (config) => {
    const { nombreNegocio, moneda, horario_apertura, horario_cierre, telefono, email } = config;
    const result = await pool.query(
        `INSERT INTO configuracion_general (nombreNegocio, moneda, horario_apertura, horario_cierre, telefono, email)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [nombreNegocio, moneda, horario_apertura, horario_cierre, telefono, email]
    );
    return result.rows[0];
};

// ── Sucursales ──
exports.getSucursales = async () => {
    const result = await pool.query('SELECT * FROM sucursales ORDER BY id');
    return result.rows;
};

exports.getSucursalById = async (id) => {
    const result = await pool.query('SELECT * FROM sucursales WHERE id = $1', [id]);
    return result.rows[0];
};

exports.createSucursal = async (sucursal) => {
    const { nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono } = sucursal;
    const result = await pool.query(
        `INSERT INTO sucursales (nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono]
    );
    return result.rows[0];
};

exports.updateSucursal = async (id, sucursal) => {
    const { nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono } = sucursal;
    const result = await pool.query(
        `UPDATE sucursales SET
            nombreSucursal=$1, direccion=$2, ciudad=$3, estado=$4, codigoPostal=$5, telefono=$6
        WHERE id=$7 RETURNING *`,
        [nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono, id]
    );
    return result.rows[0];
};

exports.deleteSucursal = async (id) => {
    await pool.query('DELETE FROM sucursales WHERE id = $1', [id]);
    return { message: 'Sucursal eliminada' };
};
