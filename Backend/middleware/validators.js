const { ApiError } = require('./errorHandler');

// Validadores de tipos comunes
const validators = {
  // Validar ID (debe ser número)
  validateId: (id, fieldName = 'ID') => {
    if (!id || isNaN(id)) {
      throw new ApiError(`${fieldName} inválido`, 400);
    }
    return parseInt(id, 10);
  },

  // Validar que un objeto tenga campos requeridos
  validateRequired: (obj, fields, objectName = 'objeto') => {
    const missing = fields.filter(field => !obj[field]);
    if (missing.length > 0) {
      throw new ApiError(
        `${objectName} - Campos requeridos: ${missing.join(', ')}`,
        400
      );
    }
  },

  // Validar estado de orden
  validateOrderStatus: (status) => {
    const validStatuses = ['abierto', 'pendiente', 'preparando', 'listo', 'pagado', 'cancelado'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(
        `Estado de orden inválido. Valores válidos: ${validStatuses.join(', ')}`,
        400
      );
    }
  },

  validateSaleStatus: (status) => {
    const validStatuses = ['pendiente', 'pagado', 'completada', 'cancelada', 'reembolsada'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(
        `Estado de venta inválido. Valores válidos: ${validStatuses.join(', ')}`,
        400
      );
    }
  },

  validateReservationStatus: (status) => {
    const validStatuses = ['pendiente', 'confirmada', 'ocupada', 'cancelada', 'completada', 'finalizada'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(
        `Estado de reservación inválido. Valores válidos: ${validStatuses.join(', ')}`,
        400
      );
    }
  },

  // Validar estado de mesa
  validateTableStatus: (status) => {
    const validStatuses = ['libre', 'ocupada', 'reservada', 'mantenimiento'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(
        `Estado de mesa inválido. Valores válidos: ${validStatuses.join(', ')}`,
        400
      );
    }
  },

  // Validar email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError('Email inválido', 400);
    }
  },

  // Validar número positivo
  validatePositiveNumber: (num, fieldName = 'número') => {
    const number = parseFloat(num);
    if (isNaN(number) || number < 0) {
      throw new ApiError(`${fieldName} debe ser un número positivo`, 400);
    }
    return number;
  },

  // Validar rango de números
  validateNumberRange: (num, min, max, fieldName = 'número') => {
    const number = parseFloat(num);
    if (isNaN(number) || number < min || number > max) {
      throw new ApiError(
        `${fieldName} debe estar entre ${min} y ${max}`,
        400
      );
    }
    return number;
  },

  // Validar largo de string
  validateStringLength: (str, minLength, maxLength, fieldName = 'texto') => {
    if (typeof str !== 'string' || str.length < minLength || str.length > maxLength) {
      throw new ApiError(
        `${fieldName} debe tener entre ${minLength} y ${maxLength} caracteres`,
        400
      );
    }
    return str.trim();
  },

  // Validar fecha ISO
  validateDate: (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new ApiError('Fecha inválida. Use formato ISO (YYYY-MM-DD)', 400);
    }
    return date;
  },

  // Validar array no vacío
  validateNonEmptyArray: (arr, fieldName = 'array') => {
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new ApiError(`${fieldName} no puede estar vacío`, 400);
    }
    return arr;
  }
};

// Middleware para validar payload JSON
const validateJsonPayload = (req, res, next) => {
  if (req.body === undefined || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      throw new ApiError('Payload JSON requerido', 400);
    }
  }
  next();
};

module.exports = {
  validators,
  validateJsonPayload
};
