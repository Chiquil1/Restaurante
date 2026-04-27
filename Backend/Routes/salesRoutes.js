const express = require('express');
const router = express.Router();
const salesController = require('../Controller/salesController');

// Historial y Reportes
router.get('/', salesController.getAllSales);
router.get('/summary', salesController.getSummary);
router.get('/payment-summary', salesController.getPaymentSummary);
router.get('/total', salesController.getTotalSales);

// Flujo de Cobro y Gestión
router.get('/by-order/:orderId', salesController.getSaleByOrderId);
router.post('/', salesController.createSale);
router.put('/:id/status', salesController.updateStatus);

module.exports = router;
