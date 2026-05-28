const prisma = require('../lib/prisma');

// Obtener todas las ventas
exports.getAllSales = async () => {

    return await prisma.ventas.findMany({
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

// Obtener venta por ID
exports.getSaleById = async (id) => {

    return await prisma.ventas.findUnique({
        where: {
            id: Number(id)
        }
    });
};

// Crear venta
exports.createSale = async (sale) => {

    const {
        mesa_id,
        personal_id,
        detalles,
        total,
        metodo_pago,
        saldo_pendiente,
        estado,
        nota
    } = sale;

    return await prisma.ventas.create({
        data: {
            mesa_id,
            personal_id,

            detalles,

            total,

            metodo_pago,

            saldo_pendiente:
                saldo_pendiente || 0,

            estado:
                estado || 'pendiente',

            nota
        }
    });
};

// Actualizar venta
exports.updateSale = async (
    id,
    sale
) => {

    return await prisma.ventas.update({
        where: {
            id: Number(id)
        },

        data: {
            ...sale
        }
    });
};

// Eliminar venta
exports.deleteSale = async (id) => {

    await prisma.ventas.delete({
        where: {
            id: Number(id)
        }
    });

    return {
        message: 'Venta eliminada'
    };
};

// Ventas por fecha
exports.getSalesByDate = async (fecha) => {

    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);

    const end = new Date(fecha);
    end.setHours(23, 59, 59, 999);

    return await prisma.ventas.findMany({
        where: {
            fecha: {
                gte: start,
                lte: end
            }
        },

        orderBy: {
            fecha: 'desc'
        }
    });
};

// Ventas por estado
exports.getSalesByStatus = async (
    estado
) => {

    return await prisma.ventas.findMany({
        where: {
            estado
        },

        orderBy: {
            fecha: 'desc'
        }
    });
};

// Total ventas
exports.getTotalSales = async (
    startDate,
    endDate
) => {

    const where = {};

    if (startDate && endDate) {

        where.fecha = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        };
    }

    const result = await prisma.ventas.aggregate({
        where,

        _sum: {
            total: true
        }
    });

    return {
        total:
            result._sum.total || 0
    };
};