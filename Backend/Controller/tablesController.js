const tablesModel = require('../Models/tablesModel');

const logger = require('../middleware/logger');

const {
    ApiError,
    asyncHandler
} = require('../middleware/errorHandler');

const {
    validators
} = require('../middleware/validators');

/**
 * Helper para respuestas exitosas
 */
const sendResponse = (
    res,
    {
        success = true,
        message = null,
        data = null,
        extra = {},
        status = 200
    }
) => {

    return res.status(status).json({
        success,
        message,
        data,
        ...extra,
        timestamp: new Date().toISOString()
    });
};

/**
 * GET /api/tables
 * Obtener todas las mesas
 */

exports.getAllTables = asyncHandler(
async (req, res) => {

    const { estado } = req.query;

    // Validar estado
    if (estado !== undefined) {
        validators.validateTableStatus(estado);
    }

    const tables =
        await tablesModel.getAllTables({
            estado
        });

    logger.info(
        'Mesas obtenidas',
        {
            count: tables.length,
            filtroEstado: estado || 'todos'
        }
    );

    return sendResponse(res, {
        data: tables,
        extra: {
            count: tables.length,
            filters: {
                estado: estado || 'todos'
            }
        }
    });
});

/**
 * GET /api/tables/states
 * Obtener estados de mesas
 */

exports.getTableStates = asyncHandler(
async (req, res) => {

    const tables =
        await tablesModel.getTableStates();

    logger.info(
        'Estados de mesas obtenidos',
        {
            count: tables.length
        }
    );

    return sendResponse(res, {
        data: tables,
        extra: {
            count: tables.length
        }
    });
});

/**
 * GET /api/tables/:id
 * Obtener mesa por ID
 */

exports.getTableById = asyncHandler(
async (req, res) => {

    const tableId =
        validators.validateId(
            req.params.id,
            'ID de mesa'
        );

    const table =
        await tablesModel.getTableById(
            tableId
        );

    if (!table) {
        throw new ApiError(
            'Mesa no encontrada',
            404
        );
    }

    logger.info(
        'Mesa obtenida',
        {
            tableId
        }
    );

    return sendResponse(res, {
        data: table
    });
});

/**
 * POST /api/tables
 * Crear nueva mesa
 */

exports.createTable = asyncHandler(
async (req, res) => {

    const {
        numero,
        ubicacion,
        capacidad,
        tipo,
        piso,
        mesero_id,
        cliente
    } = req.body;

    const io =
        req.app.get('io');

    // Validaciones
    validators.validateRequired(
        {
            numero,
            capacidad
        },
        ['numero', 'capacidad'],
        'Mesa'
    );

    validators.validatePositiveNumber(
        numero,
        'numero de mesa'
    );

    validators.validateNumberRange(
        capacidad,
        1,
        100,
        'capacidad'
    );

    try {

        const table =
            await tablesModel.createTable({

            numero,
            ubicacion:
                ubicacion || null,

            capacidad,

            tipo:
                tipo || 'standard',

            piso:
                piso || null,

            mesero_id:
                mesero_id || null,

            cliente:
                cliente || null,

            estado: 'libre'
        });

        logger.success(
            'Mesa creada',
            {
                tableId: table.id,
                numero
            }
        );

        // Socket realtime
        if (io) {

            io.of('/tables').emit(
                'table_created',
                {
                    mesa: table,
                    timestamp:
                        new Date().toISOString()
                }
            );
        }

        return sendResponse(res, {
            status: 201,
            message:
                'Mesa creada correctamente',
            data: table
        });

    } catch (error) {

        if (error.code === '23505') {

            throw new ApiError(
                'Ya existe una mesa con este número',
                400
            );
        }

        logger.error(
            'Error al crear mesa',
            error,
            {
                numero,
                capacidad
            }
        );

        throw error;
    }
});

/**
 * PUT /api/tables/:id
 * Actualizar mesa
 */

exports.updateTable = asyncHandler(
async (req, res) => {

    const tableId =
        validators.validateId(
            req.params.id,
            'ID de mesa'
        );

    const {
        numero,
        ubicacion,
        capacidad,
        tipo,
        piso,
        estado,
        mesero_id,
        cliente,
        total
    } = req.body;

    const io =
        req.app.get('io');

    const existing =
        await tablesModel.getTableById(
            tableId
        );

    if (!existing) {

        throw new ApiError(
            'Mesa no encontrada',
            404
        );
    }

    // Validaciones
    if (numero !== undefined) {

        validators.validatePositiveNumber(
            numero,
            'numero de mesa'
        );
    }

    if (capacidad !== undefined) {

        validators.validateNumberRange(
            capacidad,
            1,
            100,
            'capacidad'
        );
    }

    if (estado !== undefined) {

        validators.validateTableStatus(
            estado
        );
    }

    try {

        const updatedData = {

            numero:
                numero !== undefined
                    ? numero
                    : existing.numero,

            ubicacion:
                ubicacion !== undefined
                    ? ubicacion
                    : existing.ubicacion,

            capacidad:
                capacidad !== undefined
                    ? capacidad
                    : existing.capacidad,

            tipo:
                tipo !== undefined
                    ? tipo
                    : existing.tipo,

            piso:
                piso !== undefined
                    ? piso
                    : existing.piso,

            estado:
                estado !== undefined
                    ? estado
                    : existing.estado,

            mesero_id:
                mesero_id !== undefined
                    ? mesero_id
                    : existing.mesero_id,

            cliente:
                cliente !== undefined
                    ? cliente
                    : existing.cliente,

            total:
                total !== undefined
                    ? total
                    : existing.total
        };

        const table =
            await tablesModel.updateTable(
                tableId,
                updatedData
            );

        logger.info(
            'Mesa actualizada',
            {
                tableId,
                cambios: updatedData
            }
        );

        // Socket realtime
        if (io) {

            io.of('/tables').emit(
                'table_updated',
                {
                    mesa: table,
                    timestamp:
                        new Date().toISOString()
                }
            );
        }

        return sendResponse(res, {
            message:
                'Mesa actualizada correctamente',
            data: table
        });

    } catch (error) {

        if (error.code === '23505') {

            throw new ApiError(
                'Ya existe una mesa con este número',
                400
            );
        }

        logger.error(
            'Error al actualizar mesa',
            error,
            {
                tableId
            }
        );

        throw error;
    }
});

/**
 * DELETE /api/tables/:id
 * Eliminar mesa
 */

exports.deleteTable = asyncHandler(
async (req, res) => {

    const tableId =
        validators.validateId(
            req.params.id,
            'ID de mesa'
        );

    const io =
        req.app.get('io');

    const existing =
        await tablesModel.getTableById(
            tableId
        );

    if (!existing) {

        throw new ApiError(
            'Mesa no encontrada',
            404
        );
    }

    // Validar estado
    if (
        existing.estado === 'ocupada'
    ) {

        throw new ApiError(
            'No se puede eliminar una mesa ocupada',
            409
        );
    }

    await tablesModel.deleteTable(
        tableId
    );

    logger.success(
        'Mesa eliminada',
        {
            tableId,
            numero: existing.numero
        }
    );

    // Socket realtime
    if (io) {

        io.of('/tables').emit(
            'table_deleted',
            {
                tableId,
                timestamp:
                    new Date().toISOString()
            }
        );
    }

    return sendResponse(res, {
        message:
            'Mesa eliminada correctamente',
        data: {
            id: tableId
        }
    });
});

/**
 * PATCH /api/tables/:id/status
 * Cambiar estado rápidamente
 */

exports.updateStatus = asyncHandler(
async (req, res) => {

    const tableId =
        validators.validateId(
            req.params.id,
            'ID de mesa'
        );

    const {
        estado,
        mesero_id,
        cliente
    } = req.body;

    const io =
        req.app.get('io');

    if (!estado) {

        throw new ApiError(
            'El estado es obligatorio',
            400
        );
    }

    validators.validateTableStatus(
        estado
    );

    const existing =
        await tablesModel.getTableById(
            tableId
        );

    if (!existing) {

        throw new ApiError(
            'Mesa no encontrada',
            404
        );
    }

    try {

        const table =
            await tablesModel.updateTableStatus(

            tableId,

            estado,

            mesero_id !== undefined
                ? mesero_id
                : existing.mesero_id,

            cliente !== undefined
                ? cliente
                : existing.cliente
        );

        logger.info(
            'Estado actualizado',
            {
                tableId,
                estadoAnterior:
                    existing.estado,
                nuevoEstado:
                    estado
            }
        );

        // Socket realtime
        if (io) {

            io.of('/tables').emit(
                'table_status_changed',
                {
                    mesa: table,
                    estadoAnterior:
                        existing.estado,

                    timestamp:
                        new Date().toISOString()
                }
            );
        }

        return sendResponse(res, {
            message:
                `Mesa actualizada a estado "${estado}"`,
            data: table
        });

    } catch (error) {

        logger.error(
            'Error al cambiar estado',
            error,
            {
                tableId,
                estado
            }
        );

        throw error;
    }
});

/**
 * POST /api/tables/:id/liberar
 * Liberar mesa
 */

exports.liberarMesa = asyncHandler(
async (req, res) => {

    const tableId =
        validators.validateId(
            req.params.id,
            'ID de mesa'
        );

    const io =
        req.app.get('io');

    const existing =
        await tablesModel.getTableById(
            tableId
        );

    if (!existing) {

        throw new ApiError(
            'Mesa no encontrada',
            404
        );
    }

    if (
        existing.estado !== 'ocupada'
    ) {

        throw new ApiError(
            'La mesa no está ocupada',
            409
        );
    }

    try {

        // Validar órdenes abiertas
        const activeOrders =
            await require('../Models/ordersModel')
            .getAllOrders();

        const mesaConOrden =
            activeOrders.find(
                order =>
                    order.mesa_id === tableId &&
                    order.estado !== 'cerrada'
            );

        if (mesaConOrden) {

            throw new ApiError(
                'No se puede liberar una mesa con órdenes activas',
                409
            );
        }

        const table =
            await tablesModel.liberarMesa(
                tableId
            );

        logger.success(
            'Mesa liberada',
            {
                tableId,
                numero:
                    existing.numero
            }
        );

        // Socket realtime
        if (io) {

            io.of('/tables').emit(
                'table_freed',
                {
                    mesa: table,
                    timestamp:
                        new Date().toISOString()
                }
            );
        }

        return sendResponse(res, {
            message:
                'Mesa liberada correctamente',
            data: table
        });

    } catch (error) {

        logger.error(
            'Error liberando mesa',
            error,
            {
                tableId
            }
        );

        throw error;
    }
});

