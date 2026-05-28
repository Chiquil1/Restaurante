const express = require('express');

const router = express.Router();

const dashboardController = require('../Controller/dashboardController');

// Middlewares (recomendado en dashboard)
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// ─────────────────────────────────────
// DASHBOARD PRINCIPAL
// ─────────────────────────────────────

/**
 * Resumen completo del dashboard
 * (KPIs principales)
 */
router.get(
    '/',
    authMiddleware,
    dashboardController.getDashboardSummary
);

// ─────────────────────────────────────
// MÉTRICAS INDIVIDUALES
// ─────────────────────────────────────

/**
 * Ventas del día
 */
router.get(
    '/ventas-hoy',
    authMiddleware,
    dashboardController.getVentasHoy
);

/**
 * Clientes del día
 */
router.get(
    '/clientes-hoy',
    authMiddleware,
    dashboardController.getClientesHoy
);

/**
 * Pedidos activos
 */
router.get(
    '/pedidos-activos',
    authMiddleware,
    dashboardController.getPedidosActivos
);

/**
 * Mesas ocupadas
 */
router.get(
    '/mesas-ocupadas',
    authMiddleware,
    dashboardController.getMesasOcupadas
);

/**
 * Total de mesas
 */
router.get(
    '/total-mesas',
    authMiddleware,
    dashboardController.getTotalMesas
);

// ─────────────────────────────────────
// (OPCIONAL) ENDPOINT AGREGADO PARA FRONTEND MODERNO
// ─────────────────────────────────────

/**
 * Dashboard compacto (ideal para frontend React/Vue)
 */
router.get(
    '/summary',
    authMiddleware,
    dashboardController.getDashboardSummary
);

module.exports = router;
