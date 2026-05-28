const logger = require('./logger');

class ApiError extends Error {
  constructor(message, statusCode = 500, meta = {}) {
    super(message);
    this.statusCode = statusCode;
    this.meta = meta;
    this.name = 'ApiError';
  }
}

// Middleware de manejo centralizado de errores
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  const meta = err.meta || {};

  // Log del error
  logger.error(message, err, {
    path: req.path,
    method: req.method,
    statusCode,
    ...meta
  });

  // Response estandarizado
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        meta
      })
    },
    timestamp: new Date().toISOString()
  });
};

// Middleware para capturar errores en rutas no encontradas
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    `Ruta no encontrada: ${req.method} ${req.path}`,
    404,
    { path: req.path, method: req.method }
  );
  next(error);
};

// Wrapper para rutas async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
