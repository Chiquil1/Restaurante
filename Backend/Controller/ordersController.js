const prisma = require('../config/prisma');

const logger = require('../middleware/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { validators } = require('../middleware/validators');

/**
 * GET /api/orders
 * Obtener todas las órdenes
 */
exports.getAllOrders = asyncHandler(async (req, res) => {

    const orders = await prisma.orders.findMany({
        include: {
            mesas: {
                select: {
                    id: true,
                    numero: true,
                    estado: true
                }
            },
            personal: {
                select: {
                    id: true,
                    nombre: true,
                    apellido: true
                }
            },
            order_items: true
        },
        orderBy: {
            fecha: 'desc'
        }
    });

    logger.info('Órdenes obtenidas', {
        count: orders.length
    });

    res.json({
        success: true,
        data: orders,
        count: orders.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/orders/:id
 * Obtener orden por ID
 */
exports.getOrderById = asyncHandler(async (req, res) => {

    const orderId = validators.validateId(
        req.params.id,
        'ID de orden'
    );

    const order = await prisma.orders.findUnique({
        where: {
            id: orderId
        },
        include: {
            mesas: true,
            personal: true,
            order_items: true
        }
    });

    if (!order) {
        throw new ApiError('Orden no encontrada', 404);
    }

    logger.info('Orden obtenida', {
        orderId
    });

    res.json({
        success: true,
        data: order,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/orders
 * Crear nueva orden
 */
exports.createOrder = asyncHandler(async (req, res) => {

    const {
        mesa_id,
        mesero_id,
        total,
        estado,
        cliente
    } = req.body;

    const io = req.app.get('io');

    // ─────────────────────────────
    // VALIDACIONES
    // ─────────────────────────────

    if (total !== undefined) {
        validators.validatePositiveNumber(total, 'total');
    }

    if (estado) {
        validators.validateOrderStatus(estado);
    }

    // ─────────────────────────────
    // VALIDAR MESA
    // ─────────────────────────────

    let mesa = null;

    if (mesa_id) {

        mesa = await prisma.mesas.findUnique({
            where: {
                id: Number(mesa_id)
            }
        });

        if (!mesa) {
            throw new ApiError('Mesa no encontrada', 404);
        }

        if (mesa.estado === 'ocupada') {
            throw new ApiError(
                'La mesa ya está ocupada',
                409
            );
        }
    }

    // ─────────────────────────────
    // CREAR ORDEN
    // ─────────────────────────────

    const order = await prisma.orders.create({
        data: {
            mesa_id: mesa_id || null,
            mesero_id: mesero_id || null,
            total: total || 0,
            estado: estado || 'abierto',
            cliente: cliente || null
        },
        include: {
            mesas: true,
            personal: true
        }
    });

    // ─────────────────────────────
    // OCUPAR MESA
    // ─────────────────────────────

    let mesaActualizada = null;

    if (mesa_id) {

        mesaActualizada = await prisma.mesas.update({
            where: {
                id: Number(mesa_id)
            },
            data: {
                estado: 'ocupada',
                cliente: cliente || null,
                mesero_id: mesero_id || null
            }
        });
    }

    logger.success('Orden creada', {
        orderId: order.id,
        mesa_id
    });

    // ─────────────────────────────
    // SOCKETS
    // ─────────────────────────────

    io.of('/orders').emit('order_created', {
        orden: order,
        mesa: mesaActualizada,
        timestamp: new Date().toISOString()
    });

    res.status(201).json({
        success: true,
        message: 'Orden creada correctamente',
        data: order,
        timestamp: new Date().toISOString()
    });
});

/**
 * PUT /api/orders/:id
 * Actualizar orden
 */
exports.updateOrder = asyncHandler(async (req, res) => {

    const orderId = validators.validateId(
        req.params.id,
        'ID de orden'
    );

    const {
        estado,
        total,
        mesa_id,
        mesero_id
    } = req.body;

    const io = req.app.get('io');

    const existingOrder = await prisma.orders.findUnique({
        where: {
            id: orderId
        }
    });

    if (!existingOrder) {
        throw new ApiError(
            'Orden no encontrada',
            404
        );
    }

    if (estado) {
        validators.validateOrderStatus(estado);
    }

    const updatedOrder = await prisma.orders.update({
        where: {
            id: orderId
        },
        data: {
            estado: estado || existingOrder.estado,
            total: total ?? existingOrder.total,
            mesa_id: mesa_id ?? existingOrder.mesa_id,
            mesero_id: mesero_id ?? existingOrder.mesero_id
        },
        include: {
            mesas: true,
            personal: true,
            order_items: true
        }
    });

    // ─────────────────────────────
    // LIBERAR MESA SI TERMINA
    // ─────────────────────────────

    let mesaActualizada = null;

    if (
        ['pagado', 'cancelado', 'finalizado']
            .includes(updatedOrder.estado)
        &&
        existingOrder.mesa_id
    ) {

        mesaActualizada = await prisma.mesas.update({
            where: {
                id: existingOrder.mesa_id
            },
            data: {
                estado: 'libre',
                cliente: null,
                total: 0,
                mesero_id: null
            }
        });
    }

    logger.info('Orden actualizada', {
        orderId,
        estado: updatedOrder.estado
    });

    io.of('/orders').emit('order_updated', {
        orden: updatedOrder,
        mesa: mesaActualizada,
        timestamp: new Date().toISOString()
    });

    res.json({
        success: true,
        message: 'Orden actualizada correctamente',
        data: updatedOrder,
        timestamp: new Date().toISOString()
    });
});

/**
 * DELETE /api/orders/:id
 * Eliminar orden
 */
exports.deleteOrder = asyncHandler(async (req, res) => {

    const orderId = validators.validateId(
        req.params.id,
        'ID de orden'
    );

    const io = req.app.get('io');

    const order = await prisma.orders.findUnique({
        where: {
            id: orderId
        }
    });

    if (!order) {
        throw new ApiError(
            'Orden no encontrada',
            404
        );
    }

    // ─────────────────────────────
    // TRANSACCIÓN
    // ─────────────────────────────

    await prisma.$transaction(async (tx) => {

        // Eliminar items
        await tx.order_items.deleteMany({
            where: {
                order_id: orderId
            }
        });

        // Liberar mesa
        if (order.mesa_id) {

            await tx.mesas.update({
                where: {
                    id: order.mesa_id
                },
                data: {
                    estado: 'libre',
                    cliente: null,
                    total: 0,
                    mesero_id: null
                }
            });
        }

        // Eliminar orden
        await tx.orders.delete({
            where: {
                id: orderId
            }
        });

    });

    logger.success('Orden eliminada', {
        orderId
    });

    io.of('/orders').emit('order_deleted', {
        orderId,
        timestamp: new Date().toISOString()
    });

    res.json({
        success: true,
        message: 'Orden eliminada correctamente',
        orderId,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/orders/create-with-items
 * Crear orden con items
 */
exports.createOrderWithItems = asyncHandler(async (req, res) => {

    const { order, items } = req.body;

    const io = req.app.get('io');

    if (!order) {
        throw new ApiError(
            'Datos de orden requeridos',
            400
        );
    }

    validators.validateNonEmptyArray(
        items,
        'items'
    );

    const result = await prisma.$transaction(async (tx) => {

        // ─────────────────────────────
        // CREAR ORDEN
        // ─────────────────────────────

        const newOrder = await tx.orders.create({
            data: {
                mesa_id: order.mesa_id || null,
                mesero_id: order.mesero_id || null,
                total: order.total || 0,
                estado: order.estado || 'abierto',
                cliente: order.cliente || null
            }
        });

        // ─────────────────────────────
        // CREAR ITEMS
        // ─────────────────────────────

        const createdItems = [];

        for (const item of items) {

            validators.validateRequired(
                item,
                ['nombre', 'precio_unitario', 'cantidad'],
                'Item'
            );

            const createdItem =
                await tx.order_items.create({
                    data: {
                        order_id: newOrder.id,
                        menu_item_id:
                            item.menu_item_id || null,
                        nombre: item.nombre,
                        precio_unitario:
                            item.precio_unitario,
                        cantidad: item.cantidad,
                        subtotal:
                            item.precio_unitario *
                            item.cantidad,
                        notas: item.notas || null,
                        estado:
                            item.estado || 'pendiente'
                    }
                });

            createdItems.push(createdItem);
        }

        // ─────────────────────────────
        // ACTUALIZAR TOTAL
        // ─────────────────────────────

        const totalCalculado =
            createdItems.reduce(
                (acc, item) =>
                    acc + Number(item.subtotal),
                0
            );

        const updatedOrder =
            await tx.orders.update({
                where: {
                    id: newOrder.id
                },
                data: {
                    total: totalCalculado
                },
                include: {
                    mesas: true,
                    personal: true,
                    order_items: true
                }
            });

        // ─────────────────────────────
        // OCUPAR MESA
        // ─────────────────────────────

        let mesaActualizada = null;

        if (order.mesa_id) {

            mesaActualizada =
                await tx.mesas.update({
                    where: {
                        id: order.mesa_id
                    },
                    data: {
                        estado: 'ocupada',
                        cliente:
                            order.cliente || null,
                        mesero_id:
                            order.mesero_id || null,
                        total: totalCalculado
                    }
                });
        }

        return {
            orden: updatedOrder,
            items: createdItems,
            mesa: mesaActualizada
        };
    });

    logger.success(
        'Orden con items creada',
        {
            orderId: result.orden.id,
            items: result.items.length
        }
    );

    // ─────────────────────────────
    // SOCKETS
    // ─────────────────────────────

    io.of('/orders').emit('order_created', {
        ...result,
        timestamp: new Date().toISOString()
    });

    res.status(201).json({
        success: true,
        message:
            'Orden creada correctamente',
        data: result,
        timestamp: new Date().toISOString()
    });
});
