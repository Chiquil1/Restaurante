/**
 * CONTROLLER: Ventas
 * Gestión completa de ventas y pagos
 */

const salesModel = require('../Models/salesModel');

const logger = require('../middleware/logger');

const {
    ApiError,
    asyncHandler
} = require('../middleware/errorHandler');

const {
    validators
} = require('../middleware/validators');

/**
 * Helper Socket
 */
const emitSalesEvent = (req, event, payload) => {
    const io = req.app.get('io');

    io.of('/sales').emit(event, {
        ...payload,
        timestamp: new Date().toISOString()
    });
};

/**
 * GET ALL SALES
 * GET /api/sales
 */
exports.getAllSales = asyncHandler(async (req, res) => {

    const {
        startDate,
        endDate,
        estado,
        metodo_pago
    } = req.query;

    // Validar fechas
    if (startDate) validators.validateDate(startDate);
    if (endDate) validators.validateDate(endDate);

    const sales = await salesModel.getAllSales({
        startDate,
        endDate,
        estado,
        metodo_pago
    });

    logger.info('Ventas obtenidas', {
        count: sales.length
    });

    res.json({
        success: true,
        data: sales,
        count: sales.length,
        filters: {
            startDate,
            endDate,
            estado,
            metodo_pago
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET SALE BY ID
 * GET /api/sales/:id
 */
exports.getSaleById = asyncHandler(async (req, res) => {

    const saleId = validators.validateId(
        req.params.id,
        'ID de venta'
    );

    const sale = await salesModel.getSaleById(saleId);

    if (!sale) {
        throw new ApiError(
            'Venta no encontrada',
            404
        );
    }

    logger.info('Venta obtenida', {
        saleId
    });

    res.json({
        success: true,
        data: sale,
        timestamp: new Date().toISOString()
    });
});

/**
 * CREATE SALE
 * POST /api/sales
 */
exports.createSale = asyncHandler(async (req, res) => {

    const io = req.app.get('io');

    const {
        mesa_id,
        personal_id,
        detalles,
        total,
        metodo_pago,
        saldo_pendiente,
        estado,
        nota
    } = req.body;

    // Validaciones
    validators.validateRequired(
        {
            total,
            metodo_pago
        },
        ['total', 'metodo_pago'],
        'Venta'
    );

    validators.validatePositiveNumber(
        total,
        'total'
    );

    if (mesa_id) {
        validators.validateId(
            mesa_id,
            'mesa_id'
        );
    }

    if (personal_id) {
        validators.validateId(
            personal_id,
            'personal_id'
        );
    }

    if (estado) {
        validators.validateSaleStatus(estado);
    }

    const sale = await salesModel.createSale({
        mesa_id,
        personal_id,
        detalles: detalles || [],
        total,
        metodo_pago,
        saldo_pendiente: saldo_pendiente || 0,
        estado: estado || 'pendiente',
        nota
    });

    logger.success('Venta creada', {
        saleId: sale.id,
        total
    });

    emitSalesEvent(req, 'sale_created', {
        sale
    });

    res.status(201).json({
        success: true,
        message: 'Venta creada correctamente',
        data: sale,
        timestamp: new Date().toISOString()
    });
});

/**
 * UPDATE SALE STATUS
 * PATCH /api/sales/:id/status
 */
exports.updateSaleStatus = asyncHandler(async (req, res) => {

    const saleId = validators.validateId(
        req.params.id,
        'ID de venta'
    );

    const {
        status
    } = req.body;

    if (!status) {
        throw new ApiError(
            'El estado es obligatorio',
            400
        );
    }

    validators.validateSaleStatus(status);

    const existingSale =
        await salesModel.getSaleById(saleId);

    if (!existingSale) {
        throw new ApiError(
            'Venta no encontrada',
            404
        );
    }

    const sale =
        await salesModel.updateSaleStatus(
            saleId,
            status
        );

    logger.info('Estado venta actualizado', {
        saleId,
        estadoAnterior: existingSale.estado,
        nuevoEstado: status
    });

    emitSalesEvent(req, 'sale_updated', {
        sale,
        estadoAnterior: existingSale.estado
    });

    res.json({
        success: true,
        message: `Venta actualizada a estado: ${status}`,
        data: sale,
        timestamp: new Date().toISOString()
    });
});

/**
 * DELETE SALE
 * DELETE /api/sales/:id
 */
exports.deleteSale = asyncHandler(async (req, res) => {

    const saleId = validators.validateId(
        req.params.id,
        'ID de venta'
    );

    const existingSale =
        await salesModel.getSaleById(saleId);

    if (!existingSale) {
        throw new ApiError(
            'Venta no encontrada',
            404
        );
    }

    await salesModel.deleteSale(saleId);

    logger.success('Venta eliminada', {
        saleId
    });

    emitSalesEvent(req, 'sale_deleted', {
        saleId
    });

    res.json({
        success: true,
        message: 'Venta eliminada correctamente',
        saleId,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET SUMMARY
 * GET /api/sales/summary
 */
exports.getSummary = asyncHandler(async (req, res) => {

    const {
        startDate,
        endDate
    } = req.query;

    if (startDate) validators.validateDate(startDate);
    if (endDate) validators.validateDate(endDate);

    const summary =
        await salesModel.getSummary(
            startDate,
            endDate
        );

    logger.info('Resumen de ventas generado');

    res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
    });
});

/**
 * PAYMENT SUMMARY
 * GET /api/sales/payment-summary
 */
exports.getPaymentSummary = asyncHandler(async (req, res) => {

    const {
        startDate,
        endDate
    } = req.query;

    if (startDate) validators.validateDate(startDate);
    if (endDate) validators.validateDate(endDate);

    const summary =
        await salesModel.getPaymentSummary(
            startDate,
            endDate
        );

    logger.info('Resumen de pagos generado');

    res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
    });
});

/**
 * TOTAL SALES
 * GET /api/sales/total
 */
exports.getTotal = asyncHandler(async (req, res) => {

    const {
        startDate,
        endDate
    } = req.query;

    if (startDate) validators.validateDate(startDate);
    if (endDate) validators.validateDate(endDate);

    const data =
        await salesModel.getTotalSales(
            startDate,
            endDate
        );

    logger.info('Total de ventas calculado', {
        total: data.total
    });

    res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
    });
});