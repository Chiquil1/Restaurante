const express = require('express');
const router = express.Router();
const tablesController = require('../Controller/tablesController');

// Rutas principales
router.get('/', tablesController.getAllTables);
router.get('/estado', tablesController.getTableStates);  // 🆕 Para sincronización
router.get('/:id', tablesController.getTableById);

// Métodos de escritura
router.post('/', tablesController.createTable);
router.put('/:id', tablesController.updateTable);
router.delete('/:id', tablesController.deleteTable);

// Rutas adicionales
router.put('/:id/estado', tablesController.updateStatus);  // 🆕 Cambio rápido de estado
router.put('/:id/liberar', tablesController.liberarMesa);   // 🆕 Liberar mesa

module.exports = router;