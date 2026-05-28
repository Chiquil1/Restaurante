const prisma = require('../lib/prisma');

// Obtener todas las órdenes
exports.getAllOrders = async () => {
    return await prisma.orders.findMany({
        include: {
            mesas: {
                select: {
                    numero: true
                }
            },
            personal: {
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

// Obtener orden por ID
exports.getOrderById = async (id) => {
    return await prisma.orders.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            mesas: {
                select: {
                    numero: true
                }
            },
            personal: {
                select: {
                    nombre: true
                }
            },
            order_items: true
        }
    });
};

// Crear nueva orden
exports.createOrder = async (orderData) => {
    const {
        mesa_id,
        mesero_id,
        total,
        estado
    } = orderData;

    return await prisma.orders.create({
        data: {
            mesa_id: mesa_id || null,
            mesero_id: mesero_id || null,
            total: total || 0,
            estado: estado || 'abierto'
        }
    });
};

// Actualizar estado de orden
exports.updateOrderStatus = async (id, estado) => {
    return await prisma.orders.update({
        where: {
            id: Number(id)
        },
        data: {
            estado,
            fecha: new Date()
        }
    });
};

// Actualizar orden
exports.updateOrder = async (id, updates) => {
    return await prisma.orders.update({
        where: {
            id: Number(id)
        },
        data: {
            ...updates,
            fecha: new Date()
        }
    });
};

// Eliminar orden
exports.deleteOrder = async (id) => {

    // Prisma elimina automáticamente si tienes:
    // ON DELETE CASCADE

    await prisma.orders.delete({
        where: {
            id: Number(id)
        }
    });

    return {
        message: 'Orden eliminada correctamente'
    };
};