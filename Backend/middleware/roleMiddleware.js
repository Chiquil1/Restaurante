const { ApiError } = require('./errorHandler');

module.exports = (allowedRoles = []) => (req, res, next) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const userRole = req.user?.rol || req.user?.role || process.env.DEV_USER_ROLE || 'admin';

  if (process.env.AUTH_REQUIRED === 'true' && roles.length > 0 && !roles.includes(userRole)) {
    throw new ApiError('No tienes permisos para esta acción', 403);
  }

  next();
};
