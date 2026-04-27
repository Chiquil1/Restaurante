const express = require('express');
const router  = express.Router();
const {
  getSettingsHandler,
  updateGeneralHandler,
  updateNotificationsHandler,
  updatePasswordHandler,
  updateBranchHandler,
  createBackupHandler,
} = require('../Controller/settingsController');

// ─── GET /api/settings ────────────────────────────────────────────────────────
// Devuelve toda la configuración actual
router.get('/', getSettingsHandler);

// ─── PUT /api/settings/general ────────────────────────────────────────────────
// Body: { nombreNegocio, moneda, horarioApertura, horarioCierre, telefonoContacto, email }
router.put('/general', updateGeneralHandler);

// ─── PUT /api/settings/notifications ─────────────────────────────────────────
// Body: { alertasPreparacion, alertasStock, alertasReservas, correoAdminOrden, avisoSonoro }
router.put('/notifications', updateNotificationsHandler);

// ─── PUT /api/settings/password ───────────────────────────────────────────────
// Body: { passwordActual, passwordNueva }
router.put('/password', updatePasswordHandler);

// ─── PUT /api/settings/branch ─────────────────────────────────────────────────
// Body: { nombreSucursal, direccion, ciudad, estado, codigoPostal, telefono }
router.put('/branch', updateBranchHandler);

// ─── POST /api/settings/backup ────────────────────────────────────────────────
// Sin body — registra timestamp y ejecuta lógica de backup
router.post('/backup', createBackupHandler);

module.exports = router;