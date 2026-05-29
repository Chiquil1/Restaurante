const { ApiError } = require('./errorHandler');

module.exports = (req, res, next) => {
  const authRequired = process.env.AUTH_REQUIRED === 'true';
  const header = req.headers.authorization || '';

  if (!header && authRequired) {
    throw new ApiError('Token de autenticación requerido', 401);
  }

  req.user = req.user || {
    id: 1,
    rol: process.env.DEV_USER_ROLE || 'admin'
  };

  next();
};
