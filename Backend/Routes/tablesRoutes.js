const express = require('express');
const router = express.Router();
const tablesController = require('../Controller/tablesController');

// Rutas principales
router.get('/', tablesController.getAllTables);
router.get('/:id', tablesController.getTableById);

// Métodos de escritura
router.post('/', tablesController.createTable);
router.put('/:id', tablesController.updateTable);
router.delete('/:id', tablesController.deleteTable);

// Ruta opcional para cambio rápido de estado (si la necesitas en el frontend)
// router.put('/:id/estado', tablesController.updateStatus); 

module.exports = router;
