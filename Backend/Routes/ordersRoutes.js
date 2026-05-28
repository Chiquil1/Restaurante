const express = require('express');

const router = express.Router();

const ordersController = require('../Controller/ordersController');

// Middlewares
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

// ─────────────────────────────────────
// RUTAS ESPECIALES
// ─────────────────────────────────────

/**
 * Crear orden completa con items
 */
router.post(
    '/create-with-items',
    authMiddleware,
    rateLimiter,
    ordersController.createOrderWithItems
);

/**
 * Obtener órdenes activas
 */
router.get(
    '/active',
    authMiddleware,
    ordersController.getActiveOrders
);

/**
 * Obtener órdenes por mesa
 */
router.get(
    '/table/:tableId',
    authMiddleware,
    ordersController.getOrdersByTable
);

/**
 * Obtener órdenes por estado
 */
router.get(
    '/status/:status',
    authMiddleware,
    ordersController.getOrdersByStatus
);

/**
 * Cambiar estado rápidamente
 */
router.patch(
    '/:id/status',
    authMiddleware,
    ordersController.updateOrderStatus
);

/**
 * Marcar orden como pagada
 */
router.patch(
    '/:id/pay',
    authMiddleware,
    ordersController.markAsPaid
);

/**
 * Cancelar orden
 */
router.patch(
    '/:id/cancel',
    authMiddleware,
    ordersController.cancelOrder
);

// ─────────────────────────────────────
// CRUD PRINCIPAL
// ─────────────────────────────────────

/**
 * Obtener todas las órdenes
 */
router.get(
    '/',
    authMiddleware,
    ordersController.getAllOrders
);

/**
 * Obtener orden por ID
 */
router.get(
    '/:id',
    authMiddleware,
    ordersController.getOrderById
);

/**
 * Crear orden básica
 */
router.post(
    '/',
    authMiddleware,
    rateLimiter,
    ordersController.createOrder
);

/**
 * Actualizar orden completa
 */
router.put(
    '/:id',
    authMiddleware,
    ordersController.updateOrder
);

/**
 * Eliminar orden
 */
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'manager']),
    ordersController.deleteOrder
);

module.exports = router;

