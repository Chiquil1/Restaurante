/**
 * GUÍA DE MEJORES PRÁCTICAS PARA CONTROLADORES
 * =============================================
 * Este archivo documenta las mejores prácticas para desarrollar
 * controladores profesionales y mantenibles.
 */

/**
 * ESTRUCTURA RECOMENDADA DE UN CONTROLADOR
 */

// 1. IMPORTS en orden
const modelName = require('../Models/modelName');
const logger = require('../middleware/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { validators } = require('../middleware/validators');

/**
 * 2. DOCUMENTAR CADA FUNCIÓN
 * - Método HTTP
 * - Ruta
 * - Descripción
 * - Parámetros
 * - Response
 */

/**
 * GET /api/resource
 * Obtener todos los recursos
 * @returns {Object} Lista de recursos
 */
exports.getAll = asyncHandler(async (req, res) => {
    // Lógica aquí
    logger.info('Recursos obtenidos');
    res.json({
        success: true,
        data: [],
        count: 0
    });
});

/**
 * GET /api/resource/:id
 * Obtener recurso por ID
 * @param {number} id - ID del recurso
 * @returns {Object} Recurso encontrado
 */
exports.getById = asyncHandler(async (req, res) => {
    // 1. Validar entrada
    const id = validators.validateId(req.params.id, 'ID');
    
    // 2. Obtener datos
    const data = await modelName.getById(id);
    
    // 3. Validar resultado
    if (!data) {
        throw new ApiError('Recurso no encontrado', 404);
    }
    
    // 4. Log
    logger.info('Recurso obtenido', { id });
    
    // 5. Response estandarizado
    res.json({
        success: true,
        data: data,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/resource
 * Crear nuevo recurso
 * @body {Object} datos - Datos del recurso
 * @returns {Object} Recurso creado
 */
exports.create = asyncHandler(async (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    
    // 1. Validar entrada
    validators.validateRequired({ nombre, descripcion }, ['nombre', 'descripcion'], 'Recurso');
    validators.validateStringLength(nombre, 1, 255, 'nombre');
    validators.validatePositiveNumber(precio, 'precio');
    
    // 2. Crear
    const result = await modelName.create({
        nombre,
        descripcion,
        precio
    });
    
    // 3. Log y evento
    logger.success('Recurso creado', { id: result.id });
    const io = req.app.get('io');
    io.emit('resource_created', result);
    
    // 4. Response
    res.status(201).json({
        success: true,
        message: 'Recurso creado correctamente',
        data: result,
        timestamp: new Date().toISOString()
    });
});

/**
 * PUT /api/resource/:id
 * Actualizar recurso
 * @param {number} id - ID del recurso
 * @body {Object} updates - Campos a actualizar
 * @returns {Object} Recurso actualizado
 */
exports.update = asyncHandler(async (req, res) => {
    const id = validators.validateId(req.params.id, 'ID');
    const { nombre, descripcion, precio } = req.body;
    
    // 1. Validar que existe
    const existing = await modelName.getById(id);
    if (!existing) {
        throw new ApiError('Recurso no encontrado', 404);
    }
    
    // 2. Validar entrada (solo lo que se actualiza)
    if (nombre) validators.validateStringLength(nombre, 1, 255, 'nombre');
    if (precio) validators.validatePositiveNumber(precio, 'precio');
    
    // 3. Actualizar
    const result = await modelName.update(id, {
        nombre: nombre || existing.nombre,
        descripcion: descripcion || existing.descripcion,
        precio: precio !== undefined ? precio : existing.precio
    });
    
    // 4. Log y evento
    logger.info('Recurso actualizado', { id });
    const io = req.app.get('io');
    io.emit('resource_updated', result);
    
    // 5. Response
    res.json({
        success: true,
        message: 'Recurso actualizado correctamente',
        data: result,
        timestamp: new Date().toISOString()
    });
});

/**
 * DELETE /api/resource/:id
 * Eliminar recurso
 * @param {number} id - ID del recurso
 * @returns {Object} Mensaje de confirmación
 */
exports.delete = asyncHandler(async (req, res) => {
    const id = validators.validateId(req.params.id, 'ID');
    
    // 1. Validar que existe
    const existing = await modelName.getById(id);
    if (!existing) {
        throw new ApiError('Recurso no encontrado', 404);
    }
    
    // 2. Eliminar
    await modelName.delete(id);
    
    // 3. Log y evento
    logger.success('Recurso eliminado', { id });
    const io = req.app.get('io');
    io.emit('resource_deleted', { id });
    
    // 4. Response
    res.json({
        success: true,
        message: 'Recurso eliminado correctamente',
        id: id,
        timestamp: new Date().toISOString()
    });
});

/**
 * =============================================
 * PATRONES CLAVE
 * =============================================
 * 
 * 1. SIEMPRE usar asyncHandler para rutas async
 * 2. VALIDAR entrada al principio de cada función
 * 3. USAR ApiError para errores controlados
 * 4. LOGUEAR todas las operaciones (info, success, error)
 * 5. Emitir EVENTOS Socket.io para cambios importantes
 * 6. Responder con formato ESTANDARIZADO:
 *    {
 *      success: boolean,
 *      message?: string,
 *      data?: any,
 *      error?: {message, statusCode},
 *      timestamp: ISO string
 *    }
 * 7. USAR validators para validaciones comunes
 * 8. Documentar cada función con JSDoc
 * 9. MANEJAR transacciones en operaciones críticas
 * 10. Permitir ROLLBACK automático en caso de error
 */

/**
 * VALIDADORES DISPONIBLES
 * =======================
 * validators.validateId(id, fieldName)
 * validators.validateRequired(obj, fields, objectName)
 * validators.validateOrderStatus(status)
 * validators.validateTableStatus(status)
 * validators.validateEmail(email)
 * validators.validatePositiveNumber(num, fieldName)
 * validators.validateNumberRange(num, min, max, fieldName)
 * validators.validateStringLength(str, minLength, maxLength, fieldName)
 * validators.validateDate(dateString)
 * validators.validateNonEmptyArray(arr, fieldName)
 */
