const prisma = require('../lib/prisma');

// ── Reporte de Ventas por Fecha ──

exports.getSalesReport = async (
    fecha_inicio,
    fecha_fin
) => {

    const sales = await prisma.ventas.groupBy({
        by: ['fecha'],

        where: {
            fecha: {
                gte: new Date(fecha_inicio),
                lte: new Date(fecha_fin)
            }
        },

        _sum: {
            total: true
        },

        _count: {
            id: true
        },

        orderBy: {
            fecha: 'asc'
        }
    });

    return sales.map(item => ({
        fecha: item.fecha,
        total: item._sum.total || 0,
        cantidad: item._count.id
    }));
};

// ── Productos Más Vendidos ──

exports.getTopProducts = async (
    fecha_inicio,
    fecha_fin,
    limit = 10
) => {

    const products =
        await prisma.order_items.groupBy({

        by: ['menu_item_id'],

        where: {

            orders: {
                fecha: {
                    gte: new Date(fecha_inicio),
                    lte: new Date(fecha_fin)
                }
            }
        },

        _sum: {
            cantidad: true,
            subtotal: true
        },

        orderBy: {
            _sum: {
                cantidad: 'desc'
            }
        },

        take: limit
    });

    const productsWithNames =
        await Promise.all(

        products
            .filter(item => item.menu_item_id)
            .map(async item => {

            const menu =
                await prisma.menu.findUnique({
                    where: {
                        id: item.menu_item_id
                    }
                });

            return {
                id: menu?.id || item.menu_item_id,
                nombre:
                    menu?.nombre || 'Producto',
                categoria:
                    menu?.categoria || 'General',

                cantidad_vendida:
                    item._sum.cantidad || 0,
                total_vendido:
                    item._sum.cantidad || 0,

                subtotal:
                    item._sum.subtotal || 0,
                total_ingresos:
                    item._sum.subtotal || 0
            };
        })
    );

    return productsWithNames;
};

// ── Reporte de Meseros ──

exports.getWaiterReport = async (
    fecha_inicio,
    fecha_fin
) => {

    const waiters =
        await prisma.personal.findMany({

        include: {

            orders: {

                where: {
                    fecha: {
                        gte: new Date(fecha_inicio),
                        lte: new Date(fecha_fin)
                    }
                }
            }
        }
    });

    return waiters.map(waiter => ({

        nombre: waiter.nombre,

        apellido: waiter.apellido,

        pedidos_atendidos:
            waiter.orders.length,

        total_ventas:
            waiter.orders.reduce(
                (acc, order) =>
                    acc + Number(order.total || 0),
                0
            )
    }))
    .sort((a, b) =>
        b.total_ventas - a.total_ventas
    );
};

// ── Reporte de Mesas ──

exports.getTableReport = async () => {

    const tables =
        await prisma.mesas.groupBy({

        by: ['estado'],

        _count: {
            id: true
        },

        _sum: {
            total: true
        }
    });

    return tables.map(item => ({
        estado: item.estado,
        cantidad: item._count.id,
        total_ventas:
            item._sum.total || 0
    }));
};

// ── Reporte de Reservaciones ──

exports.getReservationsReport = async (
    fecha_inicio,
    fecha_fin
) => {

    const reservations =
        await prisma.reservations.groupBy({

        by: ['estado'],

        where: {
            fecha: {
                gte: new Date(fecha_inicio),
                lte: new Date(fecha_fin)
            }
        },

        _count: {
            id: true
        }
    });

    return reservations.map(item => ({
        estado: item.estado,
        cantidad: item._count.id
    }));
};

exports.getOccupancyReport = exports.getTableReport;

exports.getMenuPopularityReport = async (fecha_inicio, fecha_fin) => {
    return exports.getTopProducts(fecha_inicio, fecha_fin, 50);
};

exports.getStaffPerformanceReport = exports.getWaiterReport;

exports.getDashboardSummary = async () => {
    const [salesTotal, activeOrders, occupiedTables, totalTables] = await Promise.all([
        prisma.ventas.aggregate({ _sum: { total: true }, _count: { id: true } }),
        prisma.orders.count({ where: { estado: { in: ['abierto', 'pendiente', 'preparando', 'listo'] } } }),
        prisma.mesas.count({ where: { estado: 'ocupada' } }),
        prisma.mesas.count()
    ]);

    return {
        ventas_totales: Number(salesTotal._sum.total || 0),
        ventas_count: salesTotal._count.id || 0,
        pedidos_activos: activeOrders,
        mesas_ocupadas: occupiedTables,
        total_mesas: totalTables
    };
};
