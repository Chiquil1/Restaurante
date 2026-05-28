const prisma = require('../lib/prisma');

// ── Ventas de Hoy ──

exports.getVentasHoy = async () => {

    const result =
        await prisma.ventas.aggregate({

        _sum: {
            total: true
        },

        where: {
            fecha: {
                gte: new Date(
                    new Date().setHours(0, 0, 0, 0)
                ),

                lte: new Date(
                    new Date().setHours(23, 59, 59, 999)
                )
            }
        }
    });

    return {
        total:
            result._sum.total || 0
    };
};

// ── Clientes de Hoy ──

exports.getClientesHoy = async () => {

    const clientes =
        await prisma.ventas.findMany({

        where: {
            fecha: {
                gte: new Date(
                    new Date().setHours(0, 0, 0, 0)
                ),

                lte: new Date(
                    new Date().setHours(23, 59, 59, 999)
                )
            }
        },

        distinct: ['mesa_id'],

        select: {
            mesa_id: true
        }
    });

    return {
        total: clientes.length
    };
};

// ── Pedidos Activos ──

exports.getPedidosActivos = async () => {

    const total =
        await prisma.orders.count({

        where: {
            estado: 'abierto'
        }
    });

    return {
        total
    };
};

// ── Mesas Ocupadas ──

exports.getMesasOcupadas = async () => {

    const total =
        await prisma.mesas.count({

        where: {
            estado: 'ocupada'
        }
    });

    return {
        total
    };
};

// ── Total Mesas ──

exports.getTotalMesas = async () => {

    const total =
        await prisma.mesas.count();

    return {
        total
    };
};

// ── Dashboard Completo ──

exports.getDashboardSummary =
async () => {

    const [
        ventasHoy,
        clientesHoy,
        pedidosActivos,
        mesasOcupadas,
        totalMesas
    ] = await Promise.all([

        this.getVentasHoy(),

        this.getClientesHoy(),

        this.getPedidosActivos(),

        this.getMesasOcupadas(),

        this.getTotalMesas()
    ]);

    return {

        ventasHoy:
            ventasHoy.total,

        clientesHoy:
            clientesHoy.total,

        pedidosActivos:
            pedidosActivos.total,

        mesasOcupadas:
            mesasOcupadas.total,

        totalMesas:
            totalMesas.total
    };
};