const logger = require('../middleware/logger');
const socketErrorHandler = require('../middleware/socketErrorHandler');

/**
 * Servicio de Socket.io centralizado
 * Gestiona todas las conexiones y eventos en tiempo real
 */
class SocketService {
  constructor() {
    this.io = null;
    this.errorHandler = null;
    this.connectedClients = new Map();
  }

  /**
   * Inicializar Socket.io con configuración profesional
   */
  init(server) {
    const socketIO = require('socket.io');
    
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        methods: ['GET', 'POST'],
        credentials: process.env.CORS_CREDENTIALS === 'true'
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: parseInt(process.env.SOCKET_RECONNECT_DELAY || 5000, 10),
      pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL || 25000, 10),
      maxHttpBufferSize: 1e6, // 1MB
      allowUpgrades: true
    });

    this.errorHandler = socketErrorHandler(this.io);
    this.setupGlobalListeners();
    this.setupNamespaces();

    logger.success('Socket.io inicializado correctamente');
    return this.io;
  }

  /**
   * Configurar listeners globales
   */
  setupGlobalListeners() {
    this.io.on('connection', (socket) => {
      const clientId = socket.id;
      this.connectedClients.set(clientId, {
        id: clientId,
        connectedAt: new Date(),
        namespace: '/'
      });

      logger.info('Cliente conectado', {
        socketId: clientId,
        totalClients: this.connectedClients.size
      });

      // Health check del cliente
      socket.emit('connection_established', {
        socketId: clientId,
        timestamp: new Date().toISOString()
      });

      socket.on('ping', () => {
        socket.emit('pong');
      });

      socket.on('disconnect', (reason) => {
        this.connectedClients.delete(clientId);
        this.errorHandler.handleDisconnect(socket, reason);
      });

      socket.on('reconnect', () => {
        this.errorHandler.handleReconnect(socket);
      });

      socket.on('error', (error) => {
        this.errorHandler.handleSocketError(socket, new Error(error));
      });
    });
  }

  /**
   * Configurar namespaces para diferentes módulos
   */
  setupNamespaces() {
    // Namespace para órdenes
    this.setupOrdersNamespace();
    
    // Namespace para mesas
    this.setupTablesNamespace();
    
    // Namespace para reservaciones
    this.setupReservationsNamespace();
    
    // Namespace para pagos
    this.setupPaymentsNamespace();
  }

  /**
   * Namespace: Órdenes
   */
  setupOrdersNamespace() {
    const ordersNs = this.io.of('/orders');
    
    ordersNs.on('connection', (socket) => {
      logger.info('Cliente conectado a namespace /orders', { socketId: socket.id });

      socket.on('order_created', (data) => {
        logger.debug('Evento: Orden creada', { data });
        ordersNs.emit('order_created', data);
      });

      socket.on('order_updated', (data) => {
        logger.debug('Evento: Orden actualizada', { data });
        ordersNs.emit('order_updated', data);
      });

      socket.on('order_completed', (data) => {
        logger.debug('Evento: Orden completada', { data });
        ordersNs.emit('order_completed', data);
      });

      socket.on('order_cancelled', (data) => {
        logger.debug('Evento: Orden cancelada', { data });
        ordersNs.emit('order_cancelled', data);
      });

      socket.on('disconnect', () => {
        logger.info('Cliente desconectado de namespace /orders', { socketId: socket.id });
      });
    });
  }

  /**
   * Namespace: Mesas
   */
  setupTablesNamespace() {
    const tablesNs = this.io.of('/tables');
    
    tablesNs.on('connection', (socket) => {
      logger.info('Cliente conectado a namespace /tables', { socketId: socket.id });

      socket.on('table_status_changed', (data) => {
        logger.debug('Evento: Estado de mesa cambiado', { data });
        tablesNs.emit('table_status_changed', data);
      });

      socket.on('table_occupied', (data) => {
        logger.debug('Evento: Mesa ocupada', { data });
        tablesNs.emit('table_occupied', data);
      });

      socket.on('table_freed', (data) => {
        logger.debug('Evento: Mesa liberada', { data });
        tablesNs.emit('table_freed', data);
      });

      socket.on('disconnect', () => {
        logger.info('Cliente desconectado de namespace /tables', { socketId: socket.id });
      });
    });
  }

  /**
   * Namespace: Reservaciones
   */
  setupReservationsNamespace() {
    const reservationsNs = this.io.of('/reservations');
    
    reservationsNs.on('connection', (socket) => {
      logger.info('Cliente conectado a namespace /reservations', { socketId: socket.id });

      socket.on('reservation_created', (data) => {
        logger.debug('Evento: Reservación creada', { data });
        reservationsNs.emit('reservation_created', data);
      });

      socket.on('reservation_updated', (data) => {
        logger.debug('Evento: Reservación actualizada', { data });
        reservationsNs.emit('reservation_updated', data);
      });

      socket.on('reservation_cancelled', (data) => {
        logger.debug('Evento: Reservación cancelada', { data });
        reservationsNs.emit('reservation_cancelled', data);
      });

      socket.on('disconnect', () => {
        logger.info('Cliente desconectado de namespace /reservations', { socketId: socket.id });
      });
    });
  }

  /**
   * Namespace: Pagos
   */
  setupPaymentsNamespace() {
    const paymentsNs = this.io.of('/payments');
    
    paymentsNs.on('connection', (socket) => {
      logger.info('Cliente conectado a namespace /payments', { socketId: socket.id });

      socket.on('payment_processed', (data) => {
        logger.debug('Evento: Pago procesado', { data });
        paymentsNs.emit('payment_processed', data);
      });

      socket.on('payment_failed', (data) => {
        logger.debug('Evento: Pago fallido', { data });
        paymentsNs.emit('payment_failed', data);
      });

      socket.on('disconnect', () => {
        logger.info('Cliente desconectado de namespace /payments', { socketId: socket.id });
      });
    });
  }

  /**
   * Emitir evento en namespace específico
   */
  emitToNamespace(namespace, event, data) {
    if (this.io.of(namespace)) {
      this.io.of(namespace).emit(event, data);
      logger.debug(`Evento emitido a ${namespace}`, { event, data });
    }
  }

  /**
   * Emitir evento global
   */
  emitGlobal(event, data) {
    this.io.emit(event, data);
    logger.debug('Evento emitido globalmente', { event, data });
  }

  /**
   * Obtener número de clientes conectados
   */
  getConnectedClientsCount() {
    return this.connectedClients.size;
  }

  /**
   * Obtener información de clientes conectados
   */
  getConnectedClientsInfo() {
    return Array.from(this.connectedClients.values());
  }

  /**
   * Obtener instancia de Socket.io
   */
  getIo() {
    return this.io;
  }
}

module.exports = new SocketService();
