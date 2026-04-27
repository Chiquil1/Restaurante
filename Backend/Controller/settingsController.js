const bcrypt = require('bcrypt');
const {
  getSettings,
  updateGeneral,
  updateNotifications,
  updatePassword,
  updateBranch,
  registerBackup,
} = require('../Services/settings.service');

const getSettingsHandler = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    console.error('getSettings error:', err);
    res.status(500).json({ message: 'Error al obtener configuración', error: err.message });
  }
};

const updateGeneralHandler = async (req, res) => {
  try {
    const { nombreNegocio, moneda, horarioApertura, horarioCierre, telefonoContacto, email } = req.body;

    if (!nombreNegocio || !moneda || !horarioApertura || !horarioCierre) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const updated = await updateGeneral({
      nombreNegocio,
      moneda,
      horarioApertura,
      horarioCierre,
      telefono: telefonoContacto, // Mapeo a columna 'telefono'
      email,
    });

    res.json({ message: 'Configuración general actualizada', data: updated });
  } catch (err) {
    console.error('updateGeneral error:', err);
    res.status(500).json({ message: 'Error al actualizar configuración general', error: err.message });
  }
};

const updateNotificationsHandler = async (req, res) => {
  try {
    const { alertasPreparacion, alertasStock, alertasReservas, correoAdminOrden, avisoSonoro } = req.body;

    const updated = await updateNotifications({
      alertasPreparacion: !!alertasPreparacion,
      alertasStock:       !!alertasStock,
      alertasReservas:    !!alertasReservas,
      correoAdmin:        correoAdminOrden, // Mapeo a columna 'correoAdmin'
      avisoSonoro:        !!avisoSonoro,
    });

    res.json({ message: 'Notificaciones actualizadas', data: updated });
  } catch (err) {
    console.error('updateNotifications error:', err);
    res.status(500).json({ message: 'Error al actualizar notificaciones', error: err.message });
  }
};

const updatePasswordHandler = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const userId = req.user?.id || 1; 

    // Aquí deberías importar pool para verificar la password actual
    const pool = require('../config/Db');
    const { rows } = await pool.query('SELECT password FROM usuarios WHERE id = $1', [userId]);

    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });

    const esValida = await bcrypt.compare(passwordActual, rows[0].password);
    if (!esValida) return res.status(401).json({ message: 'Contraseña actual incorrecta' });

    const nuevoHash = await bcrypt.hash(passwordNueva, 10);
    await updatePassword(userId, nuevoHash);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar contraseña', error: err.message });
  }
};

const updateBranchHandler = async (req, res) => {
  try {
    const { nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono } = req.body;
    const updated = await updateBranch({
      nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono,
    });
    res.json({ message: 'Información de sucursal actualizada', data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar sucursal', error: err.message });
  }
};

const createBackupHandler = async (req, res) => {
  try {
    const result = await registerBackup();
    res.json({
      message: 'Backup creado exitosamente',
      ultimoBackup: result ? result.fecha_backup : new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear backup', error: err.message });
  }
};

module.exports = {
  getSettingsHandler,
  updateGeneralHandler,
  updateNotificationsHandler,
  updatePasswordHandler,
  updateBranchHandler,
  createBackupHandler,
};
