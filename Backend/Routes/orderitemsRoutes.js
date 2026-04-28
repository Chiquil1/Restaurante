const express = require('express');
const router = express.Router();
const orderitemsController = require('../Controller/ordersitemController');

router.get('/', orderitemsController.getOrderItems);
router.get('/:id', orderitemsController.getOrderItemById);
router.post('/', orderitemsController.createOrderItem);
router.put('/:id/estado', orderitemsController.updateItemStatus);
router.put('/:id/cantidad', orderitemsController.updateItemQuantity);
router.delete('/:id', orderitemsController.deleteOrderItem);

module.exports = router;
