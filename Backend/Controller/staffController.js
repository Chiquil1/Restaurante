const bcrypt = require('bcrypt');

const staffModel = require('../Models/staffModel');

const logger = require('../middleware/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { validators } = require('../middleware/validators');

/**
 * GET /api/staff
 * Obtener todo el personal
 */
exports.getAllStaff = asyncHandler(async (req, res) => {
    const { estado, puesto } = req.query;

    const staff = await staffModel.getAllStaff({
        estado,
        puesto
    });

    logger.info('Personal obtenido', {
        total: staff.length,
        filtros: { estado, puesto }
    });

    res.json({
        success: true,
        data: staff,
        count: staff.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/staff/:id
 * Obtener personal por ID
 */
exports.getStaffById = asyncHandler(async (req, res) => {
    const staffId = validators.validateId(
        req.params.id,
        'ID del personal'
    );

    const staff = await staffModel.getStaffById(staffId);

    if (!staff) {
        throw new ApiError('Personal no encontrado', 404);
    }

    logger.info('Personal obtenido', { staffId });

    res.json({
        success: true,
        data: staff,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/staff
 * Crear nuevo empleado
 */
exports.createStaff = asyncHandler(async (req, res) => {
    const io = req.app.get('io');

    const {
        nombre,
        apellido,
        dni_curp,
        email,
        telefono,
        direccion,
        puesto,
        salario,
        turno,
        username,
        password,
        rol_permisos,
        estado
    } = req.body;

    // ─────────────────────────────
    // Validaciones
    // ─────────────────────────────

    validators.validateRequired(
        {
            nombre,
            apellido,
            email,
            puesto,
            username,
            password
        },
        [
            'nombre',
            'apellido',
            'email',
            'puesto',
            'username',
            'password'
        ],
        'Personal'
    );

    validators.validateEmail(email);

    validators.validateStringLength(
        password,
        6,
        100,
        'password'
    );

    if (salario) {
        validators.validatePositiveNumber(
            salario,
            'salario'
        );
    }

    // ─────────────────────────────
    // Verificar duplicados
    // ─────────────────────────────

    const existingUser =
        await staffModel.getStaffByUsername(username);

    if (existingUser) {
        throw new ApiError(
            'El username ya está en uso',
            409
        );
    }

    const existingEmail =
        await staffModel.getStaffByEmail(email);

    if (existingEmail) {
        throw new ApiError(
            'El email ya está registrado',
            409
        );
    }

    // ─────────────────────────────
    // Hash password
    // ─────────────────────────────

    const password_hash = await bcrypt.hash(password, 10);

    // ─────────────────────────────
    // Crear empleado
    // ─────────────────────────────

    const staff = await staffModel.createStaff({
        nombre,
        apellido,
        dni_curp,
        email,
        telefono,
        direccion,
        puesto,
        salario,
        turno,
        username,
        password_hash,
        rol_permisos,
        estado: estado || 'activo'
    });

    logger.success('Empleado creado', {
        staffId: staff.id,
        username
    });

    // Socket realtime
    io.of('/staff').emit('staff_created', {
        empleado: staff,
        timestamp: new Date().toISOString()
    });

    res.status(201).json({
        success: true,
        message: 'Empleado creado correctamente',
        data: staff,
        timestamp: new Date().toISOString()
    });
});

/**
 * PUT /api/staff/:id
 * Actualizar empleado
 */
exports.updateStaff = asyncHandler(async (req, res) => {
    const io = req.app.get('io');

    const staffId = validators.validateId(
        req.params.id,
        'ID del personal'
    );

    const existing =
        await staffModel.getStaffById(staffId);

    if (!existing) {
        throw new ApiError(
            'Personal no encontrado',
            404
        );
    }

    const {
        nombre,
        apellido,
        dni_curp,
        email,
        telefono,
        direccion,
        puesto,
        salario,
        turno,
        rol_permisos,
        estado
    } = req.body;

    if (email) {
        validators.validateEmail(email);
    }

    if (salario) {
        validators.validatePositiveNumber(
            salario,
            'salario'
        );
    }

    const updatedStaff =
        await staffModel.updateStaff(staffId, {
            nombre: nombre || existing.nombre,
            apellido: apellido || existing.apellido,
            dni_curp:
                dni_curp || existing.dni_curp,
            email: email || existing.email,
            telefono:
                telefono || existing.telefono,
            direccion:
                direccion || existing.direccion,
            puesto: puesto || existing.puesto,
            salario:
                salario || existing.salario,
            turno: turno || existing.turno,
            rol_permisos:
                rol_permisos ||
                existing.rol_permisos,
            estado: estado || existing.estado
        });

    logger.info('Empleado actualizado', {
        staffId
    });

    io.of('/staff').emit('staff_updated', {
        empleado: updatedStaff,
        timestamp: new Date().toISOString()
    });

    res.json({
        success: true,
        message: 'Empleado actualizado correctamente',
        data: updatedStaff,
        timestamp: new Date().toISOString()
    });
});

/**
 * DELETE /api/staff/:id
 * Eliminar empleado
 */
exports.deleteStaff = asyncHandler(async (req, res) => {
    const io = req.app.get('io');

    const staffId = validators.validateId(
        req.params.id,
        'ID del personal'
    );

    const existing =
        await staffModel.getStaffById(staffId);

    if (!existing) {
        throw new ApiError(
            'Personal no encontrado',
            404
        );
    }

    await staffModel.deleteStaff(staffId);

    logger.success('Empleado eliminado', {
        staffId
    });

    io.of('/staff').emit('staff_deleted', {
        staffId,
        timestamp: new Date().toISOString()
    });

    res.json({
        success: true,
        message: 'Empleado eliminado correctamente',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/staff/:id/ausencias
 * Obtener ausencias del empleado
 */
exports.getAusencias = asyncHandler(async (req, res) => {
    const personalId = validators.validateId(
        req.params.personal_id,
        'ID del personal'
    );

    const ausencias =
        await staffModel.getAusencias(personalId);

    res.json({
        success: true,
        data: ausencias,
        count: ausencias.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/staff/ausencias
 * Registrar ausencia
 */
exports.createAusencia = asyncHandler(async (req, res) => {
    const io = req.app.get('io');

    const {
        personal_id,
        tipo,
        fecha_inicio,
        fecha_fin,
        motivo
    } = req.body;

    validators.validateRequired(
        {
            personal_id,
            tipo,
            fecha_inicio
        },
        [
            'personal_id',
            'tipo',
            'fecha_inicio'
        ],
        'Ausencia'
    );

    validators.validateId(
        personal_id,
        'ID del personal'
    );

    const ausencia =
        await staffModel.createAusencia({
            personal_id,
            tipo,
            fecha_inicio,
            fecha_fin,
            motivo
        });

    logger.success('Ausencia registrada', {
        ausenciaId: ausencia.id,
        personal_id
    });

    io.of('/staff').emit('absence_created', {
        ausencia,
        timestamp: new Date().toISOString()
    });

    res.status(201).json({
        success: true,
        message: 'Ausencia registrada correctamente',
        data: ausencia,
        timestamp: new Date().toISOString()
    });
});
