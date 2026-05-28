const express = require('express');

const router = express.Router();

const orderItemsController = require('../Controller/ordersitemController');

// Middlewares
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

// ─────────────────────────────────────
// OBTENER ITEMS
// ─────────────────────────────────────

/**
 * Obtener todos los items de una orden
 */
router.get(
    '/order/:orderId',
    authMiddleware,
    orderItemsController.getOrderItems
);

/**
 * Obtener item específico
 */
router.get(
    '/:id',
    authMiddleware,
    orderItemsController.getOrderItemById
);

// ─────────────────────────────────────
// CREAR ITEM
// ─────────────────────────────────────

/**
 * Agregar item a una orden
 */
router.post(
    '/',
    authMiddleware,
    rateLimiter,
    orderItemsController.createOrderItem
);

// ─────────────────────────────────────
// ACTUALIZACIONES
// ─────────────────────────────────────

/**
 * Actualizar cantidad
 */
router.patch(
    '/:id/quantity',
    authMiddleware,
    orderItemsController.updateItemQuantity
);

/**
 * Actualizar estado
 */
router.patch(
    '/:id/status',
    authMiddleware,
    orderItemsController.updateItemStatus
);

/**
 * Marcar item como preparado
 */
router.patch(
    '/:id/ready',
    authMiddleware,
    orderItemsController.markItemReady
);

/**
 * Marcar item como entregado
 */
router.patch(
    '/:id/delivered',
    authMiddleware,
    orderItemsController.markItemDelivered
);

// ─────────────────────────────────────
// ELIMINAR ITEM
// ─────────────────────────────────────

router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'manager']),
    orderItemsController.deleteOrderItem
);

module.exports = router;

