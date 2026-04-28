const express = require('express');
const router = express.Router();
const tablesController = require('../Controller/tablesController');

// 1. Rutas Estáticas PRIMERO (Para evitar que Express confunda 'waiters' con un ID)
router.get('/waiters', tablesController.getWaiters);

// 2. Rutas Dinámicas DESPUÉS
router.get('/', tablesController.getAllTables);
router.get('/:id', tablesController.getTableById);

// 3. Métodos de escritura
router.post('/', tablesController.createTable);
router.put('/:id', tablesController.updateTable);
router.delete('/:id', tablesController.deleteTable);

module.exports = router;
