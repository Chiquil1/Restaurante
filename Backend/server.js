/**
 * ============================================
 * SERVIDOR PRINCIPAL - API RESTAURANTE
 * ============================================
 * Backend profesional para gestión de restaurante
 * con soporte de tiempo real mediante Socket.io
 */

// ============================================
// DEPENDENCIAS Y CONFIGURACIÓN INICIAL
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

// Importar middleware y servicios
const logger = require('./middleware/logger');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');
const { validateJsonPayload } = require('./middleware/validators');
const pool = require('./config/Db');
const socketService = require('./services/socketService');

// ============================================
// INICIALIZACIÓN DE EXPRESS Y HTTP
// ============================================
const app = express();
const server = http.createServer(app);

// ============================================
// SOCKET.IO SETUP
// ============================================
socketService.init(server);
app.set('io', socketService.getIo());

// ============================================
// MIDDLEWARE GLOBAL
// ============================================
// CORS mejorado
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parser con límite
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logger de requests
app.use(logger.middleware());

// Validación de payload JSON
app.use(validateJsonPayload);

// Security headers básicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ============================================
// RUTAS DE HEALTH CHECK
// ============================================
app.get('/health', asyncHandler(async (req, res) => {
  const dbConnected = await pool.testConnection();
  const clientsConnected = socketService.getConnectedClientsCount();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    socketClients: clientsConnected,
    uptime: process.uptime()
  });
}));

app.get('/api/status', asyncHandler(async (req, res) => {
  res.json({
    message: 'API Restaurante ✅',
    version: '1.0.0',
    status: 'online',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    connectedClients: socketService.getConnectedClientsCount()
  });
}));

// ============================================
// RUTAS API
// ============================================

// Dashboard
const dashboardRoutes = require('./Routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// Menú
const menuRoutes = require('./Routes/menuRoutes');
app.use('/api/menu', menuRoutes);

// Pedidos (Orders)
const ordersRoutes = require('./Routes/ordersRoutes');
app.use('/api/orders', ordersRoutes);

// Items de Pedido
const orderItemsRoutes = require('./Routes/orderItemsRoutes');
app.use('/api/orderitems', orderItemsRoutes);

// Mesas
const tablesRoutes = require('./Routes/tablesRoutes');
app.use('/api/tables', tablesRoutes);

// Reservaciones
const reservationsRoutes = require('./Routes/reservationsRoutes');
app.use('/api/reservations', reservationsRoutes);

// Ventas
const salesRoutes = require('./Routes/salesRoutes');
app.use('/api/sales', salesRoutes);

// Pagos
const paymentsRoutes = require('./Routes/paymentsRoutes');
app.use('/api/payments', paymentsRoutes);

// Personal (Staff)
const staffRoutes = require('./Routes/staffRoutes');
app.use('/api/staff', staffRoutes);

// Reportes
const reportsRoutes = require('./Routes/reportsRoutes');
app.use('/api/reports', reportsRoutes);

// Configuración (Settings)
const settingsRoutes = require('./Routes/settingsRoutes');
app.use('/api/settings', settingsRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================
// 404 - No encontrado
app.use(notFoundHandler);

// Error handler global (debe ser el último middleware)
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

server.listen(PORT, () => {
  logger.success('🚀 Servidor iniciado correctamente', {
    port: PORT,
    environment: NODE_ENV,
    socketEnabled: true
  });

  logger.info('📡 Namespaces Socket.io disponibles:', {
    namespaces: ['/orders', '/tables', '/reservations', '/payments']
  });

  if (NODE_ENV === 'development') {
    logger.info('📚 Documentación:', {
      health: `http://localhost:${PORT}/health`,
      status: `http://localhost:${PORT}/api/status`,
      apiPrefix: 'http://localhost:' + PORT + '/api'
    });
  }
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
  logger.info('📍 SIGTERM recibido, iniciando shutdown gracefully...');
  server.close(() => {
    logger.success('✅ Servidor cerrado correctamente');
    pool.closeGracefully().then(() => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('📍 SIGINT recibido, iniciando shutdown gracefully...');
  server.close(() => {
    logger.success('✅ Servidor cerrado correctamente');
    pool.closeGracefully().then(() => {
      process.exit(0);
    });
  });
});

// ============================================
// MANEJO DE EXCEPCIONES NO CAPTURADAS
// ============================================
process.on('uncaughtException', (error) => {
  logger.error('💥 Excepción no capturada', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Promesa rechazada sin manejar', new Error(String(reason)), {
    promise: String(promise)
  });
});

module.exports = app;

