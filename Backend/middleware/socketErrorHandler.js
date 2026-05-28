const logger = require('./logger');

module.exports = (io) => {
  return {
    // Manejador de errores para Socket.io
    handleSocketError: (socket, error, context = {}) => {
      const errorData = {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
        ...context,
        error: error.message
      };

      logger.error('Socket.io Error', error, errorData);

      socket.emit('error', {
        message: error.message || 'Error en Socket.io',
        code: error.code || 'SOCKET_ERROR',
        timestamp: new Date().toISOString()
      });
    },

    // Manejador de desconexión
    handleDisconnect: (socket, reason) => {
      logger.info('Cliente desconectado', {
        socketId: socket.id,
        reason: reason
      });
    },

    // Manejador de reconexión
    handleReconnect: (socket) => {
      logger.success('Cliente reconectado', {
        socketId: socket.id
      });
    }
  };
};
