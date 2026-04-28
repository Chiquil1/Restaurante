const express = require('express');
const router = express.Router();
const salesController = require('../Controller/salesController');

// 1. RUTAS ESTÁTICAS PRIMERO (Para que no se confundan con el ID)
router.get('/total', salesController.getTotal);
router.get('/resumen', salesController.getSummary);
router.get('/pagos/resumen', salesController.getPaymentSummary);

// 2. RUTAS DINÁMICAS DESPUÉS
router.get('/', salesController.getAllSales);
router.get('/:id', salesController.getSaleById);

// 3. MÉTODOS DE ESCRITURA
router.post('/', salesController.createSale);
router.put('/:id/estado', salesController.updateSaleStatus);
router.delete('/:id', salesController.deleteSale);

module.exports = router;
