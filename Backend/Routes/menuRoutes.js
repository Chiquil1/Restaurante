const express = require('express');

const router = express.Router();

const menuController = require('../Controller/menuController');

// Middlewares
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

// ─────────────────────────────────────
// RUTAS PÚBLICAS (POS / CLIENTE)
// ─────────────────────────────────────

/**
 * Obtener todo el menú
 */
router.get(
    '/',
    menuController.getAllMenuItems
);

/**
 * Obtener menú disponible (solo items activos)
 */
router.get(
    '/available',
    menuController.getAvailableMenu
);

/**
 * Obtener categorías del menú
 */
router.get(
    '/categories',
    menuController.getCategories
);

/**
 * Obtener items por categoría
 */
router.get(
    '/category/:category',
    menuController.getMenuByCategory
);

// ─────────────────────────────────────
// RUTA DETALLE
// ─────────────────────────────────────

/**
 * Obtener item por ID
 */
router.get(
    '/:id',
    menuController.getMenuItemById
);

// ─────────────────────────────────────
// CRUD ADMIN
// ─────────────────────────────────────

/**
 * Crear item del menú
 */
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'manager']),
    rateLimiter,
    menuController.createMenuItem
);

/**
 * Actualizar item del menú
 */
router.patch(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'manager']),
    menuController.updateMenuItem
);

/**
 * Eliminar item del menú
 */
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    menuController.deleteMenuItem
);

// ─────────────────────────────────────
// CONTROL DE DISPONIBILIDAD
// ─────────────────────────────────────

/**
 * Activar/desactivar item
 */
router.patch(
    '/:id/toggle',
    authMiddleware,
    roleMiddleware(['admin', 'manager']),
    menuController.toggleAvailability
);

module.exports = router;

