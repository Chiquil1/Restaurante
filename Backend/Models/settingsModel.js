const pool = require('../config/Db');

// ─────────────────────────────────────────────
// CONFIGURACIÓN GENERAL
// ─────────────────────────────────────────────
const getGeneral = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM configuracion_general LIMIT 1'
  );
  return rows[0] || null;
};

const findGeneral = async () => {
  const { rows } = await pool.query(
    'SELECT id FROM configuracion_general LIMIT 1'
  );
  return rows[0] || null;
};

const insertGeneral = async (data) => {
  const { nombreNegocio, moneda, horarioApertura, horarioCierre, telefono, email } = data;
  const { rows } = await pool.query(
    `INSERT INTO configuracion_general 
     (nombreNegocio, moneda, horario_apertura, horario_cierre, telefono, email) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [nombreNegocio, moneda, horarioApertura, horarioCierre, telefono, email]
  );
  return rows[0];
};

const updateGeneral = async (data) => {
  const { nombreNegocio, moneda, horarioApertura, horarioCierre, telefono, email } = data;
  const { rows } = await pool.query(
    `UPDATE configuracion_general 
     SET nombreNegocio = $1, 
         moneda = $2, 
         horario_apertura = $3, 
         horario_cierre = $4, 
         telefono = $5, 
         email = $6, 
         fecha_actualizacion = NOW() 
     RETURNING *`,
    [nombreNegocio, moneda, horarioApertura, horarioCierre, telefono, email]
  );
  return rows[0];
};

// ─────────────────────────────────────────────
// NOTIFICACIONES
// ─────────────────────────────────────────────
const getNotifications = async () => {
  const { rows } = await pool.query('SELECT * FROM configuracion_notificaciones LIMIT 1');
  return rows[0] || null;
};

const findNotifications = async () => {
  const { rows } = await pool.query('SELECT id FROM configuracion_notificaciones LIMIT 1');
  return rows[0] || null;
};

const insertNotifications = async (data) => {
  const { alertasPreparacion, alertasStock, alertasReservas, correoAdmin, avisoSonoro } = data;
  const { rows } = await pool.query(
    `INSERT INTO configuracion_notificaciones 
     (alertasPreparacion, alertasStock, alertasReservas, correoAdmin, avisoSonoro) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [alertasPreparacion, alertasStock, alertasReservas, correoAdmin, avisoSonoro]
  );
  return rows[0];
};

const updateNotifications = async (data) => {
  const { alertasPreparacion, alertasStock, alertasReservas, correoAdmin, avisoSonoro } = data;
  const { rows } = await pool.query(
    `UPDATE configuracion_notificaciones 
     SET alertasPreparacion = $1, 
         alertasStock = $2, 
         alertasReservas = $3, 
         correoAdmin = $4, 
         avisoSonoro = $5, 
         fecha_actualizacion = NOW() 
     RETURNING *`,
    [alertasPreparacion, alertasStock, alertasReservas, correoAdmin, avisoSonoro]
  );
  return rows[0];
};

// ─────────────────────────────────────────────
// SUCURSALES
// ─────────────────────────────────────────────
const getBranch = async () => {
  const { rows } = await pool.query('SELECT * FROM sucursales LIMIT 1');
  return rows[0] || null;
};

const findBranch = async () => {
  const { rows } = await pool.query('SELECT id FROM sucursales LIMIT 1');
  return rows[0] || null;
};

const insertBranch = async (data) => {
  const { nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono } = data;
  const { rows } = await pool.query(
    `INSERT INTO sucursales 
     (nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono]
  );
  return rows[0];
};

const updateBranch = async (data) => {
  const { nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono } = data;
  const { rows } = await pool.query(
    `UPDATE sucursales 
     SET nombreSucursal = $1, 
         direccion = $2, 
         ciudad = $3, 
         estado = $4, 
         codigoPostal = $5, 
         telefono = $6 
     RETURNING *`,
    [nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono]
  );
  return rows[0];
};

// ─────────────────────────────────────────────
// SEGURIDAD Y BACKUP
// ─────────────────────────────────────────────
const updatePassword = async (userId, hashedPassword) => {
  const { rows } = await pool.query(
    `UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id`,
    [hashedPassword, userId]
  );
  return rows[0];
};

const createBackup = async (sucursalId) => {
  const { rows } = await pool.query(
    `INSERT INTO backups (sucursal_id, fecha_backup, tipo_backup, estado) 
     VALUES ($1, NOW(), 'manual', 'completado') 
     RETURNING *`,
    [sucursalId]
  );
  return rows[0];
};

const updateLastBackup = async (sucursalId) => {
  // Nota: Usamos fecha_creacion ya que no hay columna 'ultimo_backup' en tu SQL de sucursales
  await pool.query(
    `UPDATE sucursales SET fecha_creacion = NOW() WHERE id = $1`,
    [sucursalId]
  );
};

module.exports = {
  getGeneral, getNotifications, getBranch, findGeneral, findNotifications, findBranch,
  updateGeneral, insertGeneral, updateNotifications, insertNotifications,
  updatePassword, updateBranch, insertBranch, createBackup, updateLastBackup,
};
