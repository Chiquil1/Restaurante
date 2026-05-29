const prisma = require('../lib/prisma');

const normalizeTime = (time) => {
    if (!time) return undefined;
    if (time instanceof Date) return time;

    const value = String(time);
    if (value.includes('T')) return new Date(value);

    const [hours = '00', minutes = '00', seconds = '00'] = value.split(':');
    return new Date(`1970-01-01T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.000Z`);
};

// Obtener todas las reservaciones
exports.getAllReservations = async (filters = {}) => {

    return await prisma.reservations.findMany({
        where: {
            ...(filters.fecha && {
                fecha: new Date(filters.fecha)
            }),

            ...(filters.estado && {
                estado: filters.estado
            })
        },

        orderBy: [
            { fecha: 'desc' },
            { hora: 'desc' }
        ]
    });
};

// Obtener reservación por ID
exports.getReservationById = async (id) => {

    return await prisma.reservations.findUnique({
        where: {
            id: Number(id)
        }
    });
};

// Obtener reservaciones por fecha
exports.getReservationsByDate = async (fecha) => {

    return await prisma.reservations.findMany({
        where: {
            fecha: new Date(fecha)
        },

        orderBy: {
            hora: 'asc'
        }
    });
};

// Obtener reservaciones por estado
exports.getReservationsByStatus = async (estado) => {

    return await prisma.reservations.findMany({
        where: {
            estado
        },

        orderBy: [
            { fecha: 'desc' },
            { hora: 'desc' }
        ]
    });
};

// Verificar conflicto
exports.checkConflict = async (
    fecha,
    hora,
    nombreCliente
) => {

    return await prisma.reservations.findFirst({
        where: {
            fecha: new Date(fecha),
            hora: normalizeTime(hora),
            nombre_cliente: nombreCliente,

            NOT: {
                estado: 'cancelada'
            }
        }
    });
};

// Crear reservación
exports.createReservation = async (
    reservationData
) => {

    const {
        nombre_cliente,
        telefono_cliente,
        email,
        fecha,
        hora,
        numero_personas,
        mesas_asignadas,
        notas,
        estado
    } = reservationData;

    return await prisma.reservations.create({
        data: {
            nombre_cliente,
            telefono_cliente,
            email,
            fecha: new Date(fecha),
            hora: normalizeTime(hora),
            numero_personas,
            mesas_asignadas: mesas_asignadas || '[]',
            notas: notas || '',
            estado: estado || 'pendiente'
        }
    });
};

// Actualizar reservación
exports.updateReservation = async (
    id,
    updates
) => {

    return await prisma.reservations.update({
        where: {
            id: Number(id)
        },

        data: {
            ...updates,

            ...(updates.fecha && {
                fecha: new Date(updates.fecha)
            }),

            ...(updates.hora && {
                hora: normalizeTime(updates.hora)
            })
        }
    });
};

// Eliminar reservación
exports.deleteReservation = async (id) => {

    await prisma.reservations.delete({
        where: {
            id: Number(id)
        }
    });

    return {
        message: 'Reservación eliminada'
    };
};

// Estadísticas
exports.getReservationStats = async (
    fecha
) => {

    const where = fecha
        ? {
            fecha: new Date(fecha)
        }
        : {};

    const [
        pendientes,
        confirmadas,
        finalizadas,
        canceladas,
        total
    ] = await Promise.all([

        prisma.reservations.count({
            where: {
                ...where,
                estado: 'pendiente'
            }
        }),

        prisma.reservations.count({
            where: {
                ...where,
                estado: 'confirmada'
            }
        }),

        prisma.reservations.count({
            where: {
                ...where,
                estado: 'finalizada'
            }
        }),

        prisma.reservations.count({
            where: {
                ...where,
                estado: 'cancelada'
            }
        }),

        prisma.reservations.count({
            where
        })
    ]);

    return {
        pendientes,
        confirmadas,
        finalizadas,
        canceladas,
        total
    };
};

// Buscar reservaciones
exports.searchReservations = async (q) => {

    return await prisma.reservations.findMany({
        where: {
            OR: [
                {
                    nombre_cliente: {
                        contains: q,
                        mode: 'insensitive'
                    }
                },

                {
                    telefono_cliente: {
                        contains: q,
                        mode: 'insensitive'
                    }
                },

                {
                    email: {
                        contains: q,
                        mode: 'insensitive'
                    }
                }
            ]
        },

        orderBy: [
            { fecha: 'desc' },
            { hora: 'desc' }
        ],

        take: 20
    });
};
