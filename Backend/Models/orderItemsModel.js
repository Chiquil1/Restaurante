const prisma = require('../lib/prisma');

// Obtener todos los items
exports.getAllOrderItems = async () => {
    return await prisma.order_items.findMany({
        include: {
            orders: {
                select: {
                    mesa_id: true
                }
            },
            menu: {
                select: {
                    nombre: true
                }
            }
        },
        orderBy: {
            fecha: 'desc'
        }
    });
};

// Obtener items por orden
exports.getOrderItems = async (order_id) => {
    return await prisma.order_items.findMany({
        where: {
            order_id: Number(order_id)
        },
        orderBy: {
            id: 'asc'
        }
    });
};

// Obtener item por ID
exports.getOrderItemsById = async (id) => {
    return await prisma.order_items.findUnique({
        where: {
            id: Number(id)
        }
    });
};

// Alias
exports.getOrderItemById = exports.getOrderItemsById;

// Obtener items por order
exports.getOrderItemsByOrder = async (order_id) => {
    return await prisma.order_items.findMany({
        where: {
            order_id: Number(order_id)
        },
        orderBy: {
            id: 'asc'
        }
    });
};

// Crear item
exports.createOrderItem = async (item) => {
    const {
        order_id,
        menu_item_id,
        nombre,
        precio_unitario,
        cantidad,
        subtotal,
        notas,
        estado
    } = item;

    return await prisma.order_items.create({
        data: {
            order_id,
            menu_item_id,
            nombre,
            precio_unitario,
            cantidad,
            subtotal,
            notas,
            estado: estado || 'pendiente'
        }
    });
};

// Actualizar item
exports.updateOrderItem = async (id, item) => {
    return await prisma.order_items.update({
        where: {
            id: Number(id)
        },
        data: {
            ...item
        }
    });
};

// Eliminar item
exports.deleteOrderItem = async (id) => {
    await prisma.order_items.delete({
        where: {
            id: Number(id)
        }
    });

    return {
        message: 'Item eliminado'
    };
};

// Actualizar estado
exports.updateOrderItemStatus = async (id, estado) => {
    return await prisma.order_items.update({
        where: {
            id: Number(id)
        },
        data: {
            estado
        }
    });
};

// Alias
exports.updateItemStatus = exports.updateOrderItemStatus;

// Actualizar cantidad
exports.updateItemQuantity = async (id, cantidad) => {
    return await prisma.order_items.update({
        where: {
            id: Number(id)
        },
        data: {
            cantidad
        }
    });
};

// Calcular total orden
exports.calcularTotalOrden = async (order_id) => {

    const result = await prisma.order_items.aggregate({
        where: {
            order_id: Number(order_id)
        },
        _sum: {
            subtotal: true
        }
    });

    return result._sum.subtotal || 0;
};