const express = require('express');
const router = express.Router();
const settingsController = require('../Controller/settingsController');

router.get('/general', settingsController.getGeneral);
router.put('/general', settingsController.updateGeneral);
router.get('/sucursal', settingsController.getBranch);
router.put('/sucursal', settingsController.updateBranch);
router.post('/backup', settingsController.createBackup);

module.exports = router;
