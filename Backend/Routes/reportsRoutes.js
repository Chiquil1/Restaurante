const express = require('express');
const router = express.Router();
const reportsController = require('../Controller/reportsController');

//
// 📊 REPORTES PRINCIPALES
//

// 🔹 Ventas (core del negocio)
router.get('/ventas', reportsController.getSalesReport);

// 🔹 Reservaciones
router.get('/reservas', reportsController.getReservationsReport);

// 🔹 Ocupación (mesas / uso del restaurante)
router.get('/ocupacion', reportsController.getOccupancyReport);

//
// 📈 REPORTES ANALÍTICOS
//

// 🔹 Productos / menú más vendidos
router.get('/menu/popularidad', reportsController.getMenuPopularity);

// 🔹 Desempeño del personal
router.get('/personal', reportsController.getStaffPerformance);

module.exports = router;