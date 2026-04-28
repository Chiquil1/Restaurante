const express = require('express');
const router = express.Router();
const ordersController = require('../Controller/ordersController');

// Rutas principales
router.get('/', ordersController.getAllOrders);
router.get('/:id', ordersController.getOrderById);

// Métodos de escritura
router.post('/', ordersController.createOrder);
router.put('/:id/estado', ordersController.updateOrderStatus); // Ruta específica para cambiar estado
router.delete('/:id', ordersController.deleteOrder);

module.exports = router;