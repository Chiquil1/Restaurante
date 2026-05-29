/**
 * CONTROLLER: Order Items
 * Gestión avanzada de items de órdenes
 */

const prisma = require('../config/prisma');
const logger = require('../middleware/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { validators } = require('../middleware/validators');

/**
 * GET /api/order-items/order/:orderId
 * Obtener items de una orden
 */
exports.getOrderItems = asyncHandler(async (req, res) => {
    const orderId = validators.validateId(req.params.orderId, 'ID de orden');

    const items = await prisma.order_items.findMany({
        where: {
            order_id: orderId
        },
        orderBy: {
            id: 'asc'
        }
    });

    logger.info('Items obtenidos', {
        orderId,
        count: items.length
    });

    res.json({
        success: true,
        data: items,
        count: items.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/order-items/:itemId
 * Obtener item por ID
 */
exports.getOrderItemById = asyncHandler(async (req, res) => {
    const itemId = validators.validateId(req.params.itemId, 'ID del item');

    const item = await prisma.order_items.findUnique({
        where: {
            id: itemId
        }
    });

    if (!item) {
        throw new ApiError('Item no encontrado', 404);
    }

    logger.info('Item obtenido', { itemId });

    res.json({
        success: true,
        data: item,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/order-items
 * Crear item en orden
 */
exports.createOrderItem = asyncHandler(async (req, res) => {
    const io = req.app.get('io');

    const {
        order_id,
        menu_item_id,
        nombre,
        precio_unitario,
        cantidad,
        notas,
        estado
    } = req.body;

    validators.validateRequired(
        req.body,
        ['order_id', 'nombre', 'precio_unitario', 'cantidad'],
        'Order Item'
    );

    const validatedOrderId = validators.validateId(order_id, 'ID de orden');

    const subtotal =
        Number(precio_unitario) * Number(cantidad);

    const result = await prisma.$transaction(async (tx) => {

        // Verificar orden
        const order = await tx.orders.findUnique({
            where: {
                id: validatedOrderId
            }
        });

        if (!order) {
            throw new ApiError('Orden no encontrada', 404);
        }

        // Crear item
        const item = await tx.order_items.create({
            data: {
                nombre,
                precio_unitario: Number(precio_unitario),
                cantidad: Number(cantidad),
                subtotal,
                notas: notas || null,
                estado: estado || 'pendiente',
                orders: {
                    connect: {
                        id: validatedOrderId
                    }
                },
                ...(menu_item_id && {
                    menu: {
                        connect: {
                            id: Number(menu_item_id)
                        }
                    }
                })
            }
        });

        // Recalcular total
        const totals = await tx.order_items.aggregate({
            where: {
                order_id: validatedOrderId
            },
            _sum: {
                subtotal: true
            }
        });

        const totalOrden = totals._sum.subtotal || 0;

        // Actualizar orden
        const updatedOrder = await tx.orders.update({
            where: {
                id: validatedOrderId
            },
            data: {
                total: totalOrden
            }
        });

        return {
            item,
            order: updatedOrder
        };
    });

    logger.success('Item agregado', {
        itemId: result.item.id,
        orderId: validatedOrderId
    });

    io.of('/orders').emit('item_created', {
        item: result.item,
        orden_actualizada: result.order,
        timestamp: new Date().toISOString()
    });

    res.status(201).json({
        success: true,
        message: 'Item agregado correctamente',
        data: result,
        timestamp: new Date().toISOString()
    });
});

/**
 * PATCH /api/order-items/:id/status
 * Actualizar estado del item
 */
exports.updateItemStatus = asyncHandler(async (req, res) => {
    const itemId = validators.validateId(req.params.id, 'ID del item');

    const estado = req.body.estado || req.body.status;

    if (!estado) {
        throw new ApiError('Estado requerido', 400);
    }

    const io = req.app.get('io');

    const item = await prisma.order_items.update({
        where: {
            id: itemId
        },
        data: {
            estado
        }
    });

    logger.info('Estado de item actualizado', {
        itemId,
        estado
    });

    io.of('/orders').emit('item_updated', {
        item,
        timestamp: new Date().toISOString()
    });

    res.json({
        success: true,
        message: 'Estado actualizado',
        data: item,
        timestamp: new Date().toISOString()
    });
});

/**
 * PATCH /api/order-items/:id/quantity
 * Actualizar cantidad del item
 */
exports.updateItemQuantity = asyncHandler(async (req, res) => {
    const itemId = validators.validateId(req.params.id, 'ID del item');

    const { cantidad } = req.body;

    validators.validatePositiveNumber(cantidad, 'cantidad');

    const io = req.app.get('io');

    const result = await prisma.$transaction(async (tx) => {

        const existingItem = await tx.order_items.findUnique({
            where: {
                id: itemId
            }
        });

        if (!existingItem) {
            throw new ApiError('Item no encontrado', 404);
        }

        const subtotal =
            existingItem.precio_unitario * Number(cantidad);

        // Actualizar item
        const updatedItem = await tx.order_items.update({
            where: {
                id: itemId
            },
            data: {
                cantidad: Number(cantidad),
                subtotal
            }
        });

        // Recalcular total orden
        const totals = await tx.order_items.aggregate({
            where: {
                order_id: existingItem.order_id
            },
            _sum: {
                subtotal: true
            }
        });

        const totalOrden = totals._sum.subtotal || 0;

        const updatedOrder = await tx.orders.update({
            where: {
                id: existingItem.order_id
            },
            data: {
                total: totalOrden
            }
        });

        return {
            item: updatedItem,
            order: updatedOrder
        };
    });

    logger.info('Cantidad actualizada', {
        itemId,
        cantidad
    });

    io.of('/orders').emit('item_quantity_updated', {
        item: result.item,
        orden_actualizada: result.order,
        timestamp: new Date().toISOString()
    });

    res.json({
        success: true,
        message: 'Cantidad actualizada',
        data: result,
        timestamp: new Date().toISOString()
    });
});

exports.markItemReady = asyncHandler(async (req, res, next) => {
    req.body.estado = 'listo';
    return exports.updateItemStatus(req, res, next);
});

exports.markItemDelivered = asyncHandler(async (req, res, next) => {
    req.body.estado = 'entregado';
    return exports.updateItemStatus(req, res, next);
});

/**
 * DELETE /api/order-items/:id
 * Eliminar item
 */
exports.deleteOrderItem = asyncHandler(async (req, res) => {
    const itemId = validators.validateId(req.params.id, 'ID del item');

    const io = req.app.get('io');

    const result = await prisma.$transaction(async (tx) => {

        const existingItem = await tx.order_items.findUnique({
            where: {
                id: itemId
            }
        });

        if (!existingItem) {
            throw new ApiError('Item no encontrado', 404);
        }

        const orderId = existingItem.order_id;

        // Eliminar item
        await tx.order_items.delete({
            where: {
                id: itemId
            }
        });

        // Recalcular total
        const totals = await tx.order_items.aggregate({
            where: {
                order_id: orderId
            },
            _sum: {
                subtotal: true
            }
        });

        const totalOrden = totals._sum.subtotal || 0;

        const updatedOrder = await tx.orders.update({
            where: {
                id: orderId
            },
            data: {
                total: totalOrden
            }
        });

        return {
            orderId,
            updatedOrder
        };
    });

    logger.success('Item eliminado', {
        itemId
    });

    io.of('/orders').emit('item_deleted', {
        itemId,
        orden_actualizada: result.updatedOrder,
        timestamp: new Date().toISOString()
    });

    res.json({
        success: true,
        message: 'Item eliminado correctamente',
        orderId: result.orderId,
        timestamp: new Date().toISOString()
    });
});

module.exports = exports;
