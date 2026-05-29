const express = require('express');
const router = express.Router();
const staffController = require('../Controller/staffController');

router.get('/', staffController.getAllStaff);
router.get('/ausencias', staffController.getAusencias);
router.get('/:id', staffController.getStaffById);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);
router.post('/ausencias', staffController.createAusencia);

module.exports = router;
