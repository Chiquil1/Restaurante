const express = require('express');
const router = express.Router();
const reportsController = require('../Controller/reportsController');

router.get('/ventas', reportsController.getSalesReport);
router.get('/reservas', reportsController.getReservationsReport);
router.get('/ocupacion', reportsController.getOccupancyReport);
router.get('/popularidad', reportsController.getMenuPopularity);
router.get('/personal', reportsController.getStaffPerformance);

module.exports = router;
