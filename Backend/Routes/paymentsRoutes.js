const express = require('express');
const router = express.Router();
const controller = require('../Controller/paymentsController');

router.post('/', controller.createPayment);
router.get('/:ventaId', controller.getPaymentDetails);

module.exports = router;
