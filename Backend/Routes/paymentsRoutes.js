const express = require('express');
const router = express.Router();
const paymentsController = require('../Controller/paymentsController');

// 🔹 Pagos por venta
router.get('/sale/:venta_id/balance', paymentsController.getSaleBalance);
router.get('/sale/:venta_id', paymentsController.getPaymentsBySale);
router.get('/venta/:venta_id/saldo', paymentsController.getSaleBalance);
router.get('/venta/:venta_id', paymentsController.getPaymentsBySale);

// 🔹 CRUD pagos
router.get('/:id', paymentsController.getPaymentById);
router.post('/', paymentsController.createPayment);

module.exports = router;
