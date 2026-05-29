const express = require('express');
const router = express.Router();
const reportsController = require('../Controller/reportsController');

//
// 📊 REPORTES PRINCIPALES
//

// 🔹 Ventas (core del negocio)
router.get('/sales', reportsController.getSalesReport);
router.get('/ventas', reportsController.getSalesReport);

// 🔹 Reservaciones
router.get('/reservations', reportsController.getReservationsReport);
router.get('/reservas', reportsController.getReservationsReport);

// 🔹 Ocupación (mesas / uso del restaurante)
router.get('/occupancy', reportsController.getOccupancyReport);
router.get('/ocupacion', reportsController.getOccupancyReport);

//
// 📈 REPORTES ANALÍTICOS
//

// 🔹 Productos / menú más vendidos
router.get('/menu-popularity', reportsController.getMenuPopularity);
router.get('/menu/popularidad', reportsController.getMenuPopularity);

// 🔹 Desempeño del personal
router.get('/staff-performance', reportsController.getStaffPerformance);
router.get('/personal', reportsController.getStaffPerformance);

module.exports = router;
