/**
 * CONTROLLER: Reservaciones
 * Sistema completo de reservaciones para restaurante
 */

const reservationsModel = require('../Models/reservationsModel');
const tablesModel = require('../Models/tablesModel');

const logger = require('../middleware/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { validators } = require('../middleware/validators');

/**
 * Helper: Parsear mesas asignadas
 */
const parseMesas = (mesas) => {
    if (!mesas) return [];

    try {
        return typeof mesas === 'string'
            ? JSON.parse(mesas)
            : mesas;
    } catch {
        throw new ApiError('Formato inválido de mesas_asignadas', 400);
    }
};

/**
 * Helper: Emitir socket
 */
const emitReservationEvent = (req, event, payload) => {
    const io = req.app.get('io');

    io.of('/reservations').emit(event, {
        ...payload,
        timestamp: new Date().toISOString()
    });
};

/**
 * GET ALL
 */
exports.getAllReservations = asyncHandler(async (req, res) => {
    const reservations = await reservationsModel.getAllReservations(req.query);

    res.json({
        success: true,
        data: reservations,
        count: reservations.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET BY ID
 */
exports.getReservationById = asyncHandler(async (req, res) => {
    const id = validators.validateId(req.params.id, 'ID reservación');

    const reservation = await reservationsModel.getReservationById(id);

    if (!reservation) {
        throw new ApiError('Reservación no encontrada', 404);
    }

    res.json({
        success: true,
        data: reservation
    });
});

/**
 * CREATE
 */
exports.createReservation = asyncHandler(async (req, res) => {
    const io = req.app.get('io');

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
    } = req.body;

    validators.validateRequired(
        {
            nombre_cliente,
            fecha,
            hora,
            numero_personas
        },
        ['nombre_cliente', 'fecha', 'hora', 'numero_personas'],
        'Reservación'
    );

    validators.validatePositiveNumber(
        numero_personas,
        'numero_personas'
    );

    if (email) {
        validators.validateEmail(email);
    }

    const mesasArray = parseMesas(mesas_asignadas);

    // Validar conflicto
    const conflict = await reservationsModel.checkConflict(
        fecha,
        hora,
        nombre_cliente
    );

    if (conflict) {
        throw new ApiError(
            'Ya existe una reservación para este cliente en esa fecha/hora',
            409
        );
    }

    // Validar mesas
    if (mesasArray.length > 0) {
        const mesas = await tablesModel.getTablesByIds(mesasArray);

        if (mesas.length !== mesasArray.length) {
            throw new ApiError('Una o más mesas no existen', 404);
        }

        const ocupadas = mesas.filter(
            mesa => mesa.estado === 'ocupada'
        );

        if (ocupadas.length > 0) {
            throw new ApiError(
                `Mesas ocupadas: ${ocupadas.map(m => m.numero).join(', ')}`,
                409
            );
        }

        const capacidad = mesas.reduce(
            (acc, mesa) => acc + mesa.capacidad,
            0
        );

        if (capacidad < numero_personas) {
            throw new ApiError(
                `Capacidad insuficiente (${capacidad})`,
                400
            );
        }
    }

    // Crear reservación
    const reservation = await reservationsModel.createReservation({
        nombre_cliente,
        telefono_cliente,
        email,
        fecha,
        hora,
        numero_personas,
        mesas_asignadas: JSON.stringify(mesasArray),
        notas,
        estado: estado || 'pendiente'
    });

    // Actualizar mesas
    for (const mesaId of mesasArray) {
        await tablesModel.updateTableStatus(
            mesaId,
            'reservada',
            null,
            nombre_cliente
        );
    }

    logger.success('Reservación creada', {
        reservationId: reservation.id
    });

    emitReservationEvent(req, 'reservation_created', {
        reservation
    });

    res.status(201).json({
        success: true,
        message: 'Reservación creada correctamente',
        data: reservation
    });
});

/**
 * UPDATE
 */
exports.updateReservation = asyncHandler(async (req, res) => {
    const id = validators.validateId(req.params.id);

    const existing =
        await reservationsModel.getReservationById(id);

    if (!existing) {
        throw new ApiError('Reservación no encontrada', 404);
    }

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
    } = req.body;

    const mesasNuevas = parseMesas(mesas_asignadas);
    const mesasAnteriores = parseMesas(
        existing.mesas_asignadas
    );

    // Liberar mesas antiguas
    const liberar = mesasAnteriores.filter(
        mesa => !mesasNuevas.includes(mesa)
    );

    for (const mesaId of liberar) {
        await tablesModel.updateTableStatus(
            mesaId,
            'libre'
        );
    }

    // Reservar nuevas
    for (const mesaId of mesasNuevas) {
        await tablesModel.updateTableStatus(
            mesaId,
            'reservada',
            null,
            nombre_cliente || existing.nombre_cliente
        );
    }

    const updated =
        await reservationsModel.updateReservation(id, {
            nombre_cliente,
            telefono_cliente,
            email,
            fecha,
            hora,
            numero_personas,
            mesas_asignadas:
                JSON.stringify(mesasNuevas),
            notas,
            estado
        });

    logger.info('Reservación actualizada', { id });

    emitReservationEvent(req, 'reservation_updated', {
        reservation: updated
    });

    res.json({
        success: true,
        message: 'Reservación actualizada',
        data: updated
    });
});

/**
 * UPDATE STATUS
 */
exports.updateReservationStatus = asyncHandler(async (req, res) => {
    const id = validators.validateId(req.params.id);

    const { estado } = req.body;

    validators.validateReservationStatus(estado);

    const reservation =
        await reservationsModel.getReservationById(id);

    if (!reservation) {
        throw new ApiError('Reservación no encontrada', 404);
    }

    const mesas = parseMesas(
        reservation.mesas_asignadas
    );

    // Cancelar -> liberar mesas
    if (estado === 'cancelada') {
        for (const mesaId of mesas) {
            await tablesModel.updateTableStatus(
                mesaId,
                'libre'
            );
        }
    }

    // Confirmar -> reservar mesas
    if (estado === 'confirmada') {
        for (const mesaId of mesas) {
            await tablesModel.updateTableStatus(
                mesaId,
                'reservada',
                null,
                reservation.nombre_cliente
            );
        }
    }

    // Cliente llegó
    if (estado === 'finalizada' || estado === 'ocupada') {
        for (const mesaId of mesas) {
            await tablesModel.updateTableStatus(
                mesaId,
                'ocupada',
                null,
                reservation.nombre_cliente
            );
        }
    }

    const updated =
        await reservationsModel.updateReservation(id, {
            estado
        });

    logger.info('Estado reservación actualizado', {
        id,
        estado
    });

    emitReservationEvent(req, 'reservation_status_updated', {
        reservation: updated
    });

    res.json({
        success: true,
        message: `Estado actualizado a ${estado}`,
        data: updated
    });
});

exports.confirmReservation = asyncHandler(async (req, res, next) => {
    req.body.estado = 'confirmada';
    return exports.updateReservationStatus(req, res, next);
});

exports.markAsOccupied = asyncHandler(async (req, res, next) => {
    req.body.estado = 'ocupada';
    return exports.updateReservationStatus(req, res, next);
});

exports.cancelReservation = asyncHandler(async (req, res, next) => {
    req.body.estado = 'cancelada';
    return exports.updateReservationStatus(req, res, next);
});

/**
 * DELETE
 */
exports.deleteReservation = asyncHandler(async (req, res) => {
    const id = validators.validateId(req.params.id);

    const reservation =
        await reservationsModel.getReservationById(id);

    if (!reservation) {
        throw new ApiError('Reservación no encontrada', 404);
    }

    // Liberar mesas
    const mesas = parseMesas(
        reservation.mesas_asignadas
    );

    for (const mesaId of mesas) {
        await tablesModel.updateTableStatus(
            mesaId,
            'libre'
        );
    }

    await reservationsModel.deleteReservation(id);

    logger.success('Reservación eliminada', { id });

    emitReservationEvent(req, 'reservation_deleted', {
        reservationId: id
    });

    res.json({
        success: true,
        message: 'Reservación eliminada'
    });
});

/**
 * GET BY DATE
 */
exports.getReservationsByDate = asyncHandler(async (req, res) => {
    const { fecha } = req.params;

    const reservations =
        await reservationsModel.getReservationsByDate(
            fecha
        );

    res.json({
        success: true,
        data: reservations
    });
});

/**
 * GET BY STATUS
 */
exports.getReservationsByStatus = asyncHandler(async (req, res) => {
    const { estado } = req.params;

    validators.validateReservationStatus(estado);

    const reservations =
        await reservationsModel.getReservationsByStatus(
            estado
        );

    res.json({
        success: true,
        data: reservations
    });
});

/**
 * SEARCH
 */
exports.searchReservations = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
        throw new ApiError(
            'La búsqueda requiere al menos 2 caracteres',
            400
        );
    }

    const reservations =
        await reservationsModel.searchReservations(q);

    res.json({
        success: true,
        data: reservations
    });
});

/**
 * STATS
 */
exports.getReservationStats = asyncHandler(async (req, res) => {
    const { fecha } = req.query;

    const stats =
        await reservationsModel.getReservationStats(
            fecha
        );

    res.json({
        success: true,
        data: stats
    });
});
