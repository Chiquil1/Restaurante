const prisma = require('../lib/prisma');

// Obtener todos los pagos
exports.getAllPayments = async () => {

    return await prisma.pagos.findMany({
        include: {

            ventas: {
                select: {
                    total: true
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

// Obtener pago por ID
exports.getPaymentById = async (id) => {

    return await prisma.pagos.findUnique({
        where: {
            id: Number(id)
        }
    });
};

// Crear pago
exports.createPayment = async (
    payment
) => {

    const {
        venta_id,
        monto,
        metodo_pago,
        notas,
        usuario_id
    } = payment;

    return await prisma.pagos.create({
        data: {
            venta_id,
            monto,
            metodo_pago,
            notas,
            usuario_id
        }
    });
};

// Actualizar pago
exports.updatePayment = async (
    id,
    payment
) => {

    return await prisma.pagos.update({
        where: {
            id: Number(id)
        },

        data: {
            ...payment
        }
    });
};

// Eliminar pago
exports.deletePayment = async (
    id
) => {

    await prisma.pagos.delete({
        where: {
            id: Number(id)
        }
    });

    return {
        message: 'Pago eliminado'
    };
};

// Obtener pagos por venta
exports.getPaymentsBySale = async (
    venta_id
) => {

    return await prisma.pagos.findMany({
        where: {
            venta_id: Number(venta_id)
        },

        orderBy: {
            fecha: 'asc'
        }
    });
};

// Obtener total pagos
exports.getTotalPayments = async () => {

    const result = await prisma.pagos.aggregate({
        _sum: {
            monto: true
        }
    });

    return {
        total:
            result._sum.monto || 0
    };
};