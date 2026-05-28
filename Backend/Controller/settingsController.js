/**
 * CONTROLLER: Configuración
 * Configuración general, sucursales y backups
 */

const settingsModel = require('../Models/settingsModel');

const logger = require('../middleware/logger');

const {
    ApiError,
    asyncHandler
} = require('../middleware/errorHandler');

const {
    validators
} = require('../middleware/validators');

/**
 * Helper Socket
 */
const emitSettingsEvent = (req, event, payload) => {
    const io = req.app.get('io');

    io.of('/settings').emit(event, {
        ...payload,
        timestamp: new Date().toISOString()
    });
};

/**
 * GET GENERAL SETTINGS
 * GET /api/settings/general
 */
exports.getGeneral = asyncHandler(async (req, res) => {

    const config = await settingsModel.getGeneral();

    if (!config) {
        throw new ApiError(
            'Configuración general no encontrada',
            404
        );
    }

    logger.info('Configuración general obtenida');

    res.json({
        success: true,
        data: config,
        timestamp: new Date().toISOString()
    });
});

/**
 * UPDATE GENERAL SETTINGS
 * PUT /api/settings/general
 */
exports.updateGeneral = asyncHandler(async (req, res) => {

    const {
        nombreNegocio,
        moneda,
        horario_apertura,
        horario_cierre,
        telefono,
        email
    } = req.body;

    // Validaciones
    if (email) {
        validators.validateEmail(email);
    }

    if (nombreNegocio) {
        validators.validateStringLength(
            nombreNegocio,
            2,
            255,
            'nombreNegocio'
        );
    }

    const updated =
        await settingsModel.updateGeneral({
            nombreNegocio,
            moneda,
            horario_apertura,
            horario_cierre,
            telefono,
            email
        });

    logger.success(
        'Configuración general actualizada'
    );

    emitSettingsEvent(req, 'general_updated', {
        config: updated
    });

    res.json({
        success: true,
        message:
            'Configuración general actualizada correctamente',
        data: updated,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET BRANCH
 * GET /api/settings/branch
 */
exports.getBranch = asyncHandler(async (req, res) => {

    const branch = await settingsModel.getBranch();

    if (!branch) {
        throw new ApiError(
            'Sucursal no encontrada',
            404
        );
    }

    logger.info('Sucursal obtenida');

    res.json({
        success: true,
        data: branch,
        timestamp: new Date().toISOString()
    });
});

/**
 * UPDATE BRANCH
 * PUT /api/settings/branch
 */
exports.updateBranch = asyncHandler(async (req, res) => {

    const {
        nombreSucursal,
        direccion,
        ciudad,
        estado,
        codigoPostal,
        telefono
    } = req.body;

    if (nombreSucursal) {
        validators.validateStringLength(
            nombreSucursal,
            2,
            255,
            'nombreSucursal'
        );
    }

    const updated =
        await settingsModel.updateBranch({
            nombreSucursal,
            direccion,
            ciudad,
            estado,
            codigoPostal,
            telefono
        });

    logger.success('Sucursal actualizada');

    emitSettingsEvent(req, 'branch_updated', {
        branch: updated
    });

    res.json({
        success: true,
        message:
            'Sucursal actualizada correctamente',
        data: updated,
        timestamp: new Date().toISOString()
    });
});

/**
 * CREATE BACKUP
 * POST /api/settings/backup
 */
exports.createBackup = asyncHandler(async (req, res) => {

    const {
        sucursalId
    } = req.body;

    if (sucursalId) {
        validators.validateId(
            sucursalId,
            'sucursalId'
        );
    }

    logger.info('Iniciando backup', {
        sucursalId
    });

    const backup =
        await settingsModel.createBackup(
            sucursalId
        );

    logger.success('Backup creado', {
        backupId: backup?.id || null
    });

    emitSettingsEvent(req, 'backup_created', {
        backup
    });

    res.status(201).json({
        success: true,
        message: 'Backup creado correctamente',
        data: backup,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET BACKUP HISTORY
 * GET /api/settings/backups
 */
exports.getBackupHistory = asyncHandler(async (req, res) => {

    const backups =
        await settingsModel.getBackupHistory();

    logger.info('Historial de backups obtenido', {
        count: backups.length
    });

    res.json({
        success: true,
        data: backups,
        count: backups.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * RESTORE BACKUP
 * POST /api/settings/restore/:id
 */
exports.restoreBackup = asyncHandler(async (req, res) => {

    const backupId = validators.validateId(
        req.params.id,
        'backupId'
    );

    logger.warning('Restauración iniciada', {
        backupId
    });

    const restored =
        await settingsModel.restoreBackup(
            backupId
        );

    if (!restored) {
        throw new ApiError(
            'Backup no encontrado',
            404
        );
    }

    logger.success('Backup restaurado', {
        backupId
    });

    emitSettingsEvent(req, 'backup_restored', {
        backupId
    });

    res.json({
        success: true,
        message:
            'Backup restaurado correctamente',
        data: restored,
        timestamp: new Date().toISOString()
    });
});