const express = require('express');
const router = express.Router();
const dashboardController = require('../Controller/dashboardController');

router.get('/ventas-hoy', dashboardController.getVentasHoy);
router.get('/clientes-hoy', dashboardController.getClientesHoy);
router.get('/pedidos-activos', dashboardController.getPedidosActivos);
router.get('/mesas-ocupadas', dashboardController.getMesasOcupadas);
router.get('/total-mesas', dashboardController.getTotalMesas);
router.get('/resumen', dashboardController.getDashboardSummary);

module.exports = router;
