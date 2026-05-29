/**
 * CONTROLLER: Payments
 * Gestión de pagos y balances
 */

const prisma = require('../config/prisma');
const logger = require('../middleware/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { validators } = require('../middleware/validators');

/**
 * GET /api/payments/sale/:venta_id
 * Obtener pagos de una venta
 */
exports.getPaymentsBySale = asyncHandler(async (req, res) => {
    const ventaId = validators.validateId(
        req.params.venta_id,
        'ID de venta'
    );

    const payments = await prisma.pagos.findMany({
        where: {
            venta_id: ventaId
        },
        orderBy: {
            fecha: 'asc'
        }
    });

    logger.info('Pagos obtenidos', {
        ventaId,
        count: payments.length
    });

    res.json({
        success: true,
        data: payments,
        count: payments.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/payments/:id
 * Obtener pago por ID
 */
exports.getPaymentById = asyncHandler(async (req, res) => {
    const paymentId = validators.validateId(
        req.params.id,
        'ID del pago'
    );

    const payment = await prisma.pagos.findUnique({
        where: {
            id: paymentId
        }
    });

    if (!payment) {
        throw new ApiError('Pago no encontrado', 404);
    }

    logger.info('Pago obtenido', {
        paymentId
    });

    res.json({
        success: true,
        data: payment,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/payments
 * Crear nuevo pago
 */
exports.createPayment = asyncHandler(async (req, res) => {
    const io = req.app.get('io');

    const {
        venta_id,
        monto,
        metodo_pago,
        notas,
        usuario_id
    } = req.body;

    validators.validateRequired(
        req.body,
        ['venta_id', 'monto', 'metodo_pago'],
        'Pago'
    );

    validators.validatePositiveNumber(
        monto,
        'Monto'
    );

    const validatedVentaId = validators.validateId(
        venta_id,
        'ID de venta'
    );

    const result = await prisma.$transaction(async (tx) => {

        // Verificar venta
        const venta = await tx.ventas.findUnique({
            where: {
                id: validatedVentaId
            }
        });

        if (!venta) {
            throw new ApiError('Venta no encontrada', 404);
        }

        // Crear pago
        const payment = await tx.pagos.create({
            data: {
                venta_id: validatedVentaId,
                monto: Number(monto),
                metodo_pago,
                notas: notas || null,
                usuario_id: usuario_id || null
            }
        });

        // Calcular total pagado
        const pagos = await tx.pagos.aggregate({
            where: {
                venta_id: validatedVentaId
            },
            _sum: {
                monto: true
            }
        });

        const totalPagado = pagos._sum.monto || 0;

        const saldoPendiente =
            Number(venta.total) - Number(totalPagado);

        // Actualizar venta
        const ventaActualizada = await tx.ventas.update({
            where: {
                id: validatedVentaId
            },
            data: {
                estado: saldoPendiente <= 0
                    ? 'pagado'
                    : 'pendiente'
            }
        });

        return {
            payment,
            venta: ventaActualizada,
            totalPagado,
            saldoPendiente
        };
    });

    logger.success('Pago registrado', {
        paymentId: result.payment.id,
        ventaId: validatedVentaId,
        monto
    });

    io.of('/payments').emit('payment_created', {
        pago: result.payment,
        venta_actualizada: result.venta,
        timestamp: new Date().toISOString()
    });

    res.status(201).json({
        success: true,
        message: 'Pago registrado correctamente',
        data: result,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/payments/balance/:venta_id
 * Obtener balance de venta
 */
exports.getSaleBalance = asyncHandler(async (req, res) => {
    const ventaId = validators.validateId(
        req.params.venta_id,
        'ID de venta'
    );

    const venta = await prisma.ventas.findUnique({
        where: {
            id: ventaId
        }
    });

    if (!venta) {
        throw new ApiError('Venta no encontrada', 404);
    }

    const pagos = await prisma.pagos.findMany({
        where: {
            venta_id: ventaId
        },
        orderBy: {
            fecha: 'asc'
        }
    });

    const totalPagado = pagos.reduce(
        (acc, pago) => acc + Number(pago.monto),
        0
    );

    const saldoPendiente =
        Number(venta.total) - totalPagado;

    const balance = {
        venta_id: venta.id,
        total_venta: Number(venta.total),
        total_pagado: totalPagado,
        saldo_pendiente: saldoPendiente <= 0
            ? 0
            : saldoPendiente,
        estado: saldoPendiente <= 0
            ? 'pagado'
            : 'pendiente',
        pagos
    };

    logger.info('Balance obtenido', {
        ventaId,
        saldoPendiente
    });

    res.json({
        success: true,
        data: balance,
        timestamp: new Date().toISOString()
    });
});

module.exports = exports;
