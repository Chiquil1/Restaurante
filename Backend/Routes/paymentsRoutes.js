const express = require('express');
const router = express.Router();
const paymentsController = require('../Controller/paymentsController');

router.get('/venta/:venta_id', paymentsController.getPaymentsBySale);
router.get('/:id', paymentsController.getPaymentById);
router.post('/', paymentsController.createPayment);
router.get('/venta/:venta_id/saldo', paymentsController.getSaleBalance);

module.exports = router;
