const express = require('express');
const router = express.Router();
const ordersController = require('../Controller/ordersController');

router.get('/', ordersController.getAllOrders);
router.get('/:id', ordersController.getOrderById);
router.post('/', ordersController.createOrder);
router.put('/:id/estado', ordersController.updateOrderStatus);
router.delete('/:id', ordersController.deleteOrder);

module.exports = router;
