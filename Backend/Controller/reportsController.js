/**
 * CONTROLLER: Reports
 * Gestiona todos los reportes y estadísticas del sistema
 */

const reportsModel = require('../Models/reportsModel');
const logger = require('../middleware/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { validators } = require('../middleware/validators');

/**
 * GET /api/reports/sales
 * Reporte de ventas
 * Query:
 *  - dateFrom
 *  - dateTo
 */
exports.getSalesReport = asyncHandler(async (req, res) => {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
        throw new ApiError('dateFrom y dateTo son obligatorios', 400);
    }

    const report = await reportsModel.getSalesReport(dateFrom, dateTo);

    logger.info('Reporte de ventas generado', {
        dateFrom,
        dateTo,
        totalRegistros: report.length
    });

    res.json({
        success: true,
        data: report,
        filters: {
            dateFrom,
            dateTo
        },
        count: report.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/reports/reservations
 * Reporte de reservaciones
 */
exports.getReservationsReport = asyncHandler(async (req, res) => {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
        throw new ApiError('dateFrom y dateTo son obligatorios', 400);
    }

    const report = await reportsModel.getReservationsReport(dateFrom, dateTo);

    logger.info('Reporte de reservaciones generado', {
        dateFrom,
        dateTo,
        totalRegistros: report.length
    });

    res.json({
        success: true,
        data: report,
        filters: {
            dateFrom,
            dateTo
        },
        count: report.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/reports/occupancy
 * Reporte de ocupación de mesas
 */
exports.getOccupancyReport = asyncHandler(async (req, res) => {
    const report = await reportsModel.getOccupancyReport();

    logger.info('Reporte de ocupación generado');

    res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/reports/menu-popularity
 * Reporte de popularidad del menú
 */
exports.getMenuPopularity = asyncHandler(async (req, res) => {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
        throw new ApiError('dateFrom y dateTo son obligatorios', 400);
    }

    const report = await reportsModel.getMenuPopularityReport(
        dateFrom,
        dateTo
    );

    logger.info('Reporte de popularidad del menú generado', {
        dateFrom,
        dateTo,
        totalRegistros: report.length
    });

    res.json({
        success: true,
        data: report,
        filters: {
            dateFrom,
            dateTo
        },
        count: report.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/reports/staff-performance
 * Reporte de rendimiento del personal
 */
exports.getStaffPerformance = asyncHandler(async (req, res) => {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
        throw new ApiError('dateFrom y dateTo son obligatorios', 400);
    }

    const report = await reportsModel.getStaffPerformanceReport(
        dateFrom,
        dateTo
    );

    logger.info('Reporte de rendimiento del personal generado', {
        dateFrom,
        dateTo,
        totalRegistros: report.length
    });

    res.json({
        success: true,
        data: report,
        filters: {
            dateFrom,
            dateTo
        },
        count: report.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/reports/dashboard-summary
 * Resumen general ejecutivo
 */
exports.getDashboardSummary = asyncHandler(async (req, res) => {
    const summary = await reportsModel.getDashboardSummary();

    logger.info('Resumen ejecutivo generado');

    res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
    });
});