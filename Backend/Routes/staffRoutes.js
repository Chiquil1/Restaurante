const express = require('express');
const router = express.Router();
const controller = require('../Controller/staffController');

// 1. RUTAS FIJAS (Deben ir primero para evitar conflictos con :id)
router.get('/schedule', controller.getSchedule);
router.put('/schedule', controller.updateShift);
router.post('/ausencias', controller.addAbsence);

// 2. RUTAS DE PERSONAL Y PARÁMETROS (Deben ir después)
router.get('/', controller.getStaff);
router.post('/', controller.createStaff);
router.get('/:id/ausencias', controller.getAbsences);

module.exports = router;
