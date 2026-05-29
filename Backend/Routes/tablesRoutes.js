const express = require('express');
const router = express.Router();
const tablesController = require('../Controller/tablesController');
const prisma = require('../config/prisma');

// Rutas principales
router.get('/', tablesController.getAllTables);
router.get('/estado', tablesController.getTableStates);  // 🆕 Para sincronización
router.get('/waiters', async (req, res, next) => {
  try {
    const waiters = await prisma.personal.findMany({
      where: {
        OR: [
          { puesto: { contains: 'mesero', mode: 'insensitive' } },
          { puesto: { contains: 'waiter', mode: 'insensitive' } }
        ],
        estado: 'activo'
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        puesto: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json({
      success: true,
      data: waiters,
      count: waiters.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});
router.get('/:id', tablesController.getTableById);

// Métodos de escritura
router.post('/', tablesController.createTable);
router.put('/:id', tablesController.updateTable);
router.delete('/:id', tablesController.deleteTable);

// Rutas adicionales
router.put('/:id/estado', tablesController.updateStatus);  // 🆕 Cambio rápido de estado
router.put('/:id/status', tablesController.updateStatus);
router.put('/:id/liberar', tablesController.liberarMesa);   // 🆕 Liberar mesa

module.exports = router;
