const express = require('express');
const router = express.Router();

// Importamos el controlador que acabamos de crear
const controller = require('../Controller/tablesController');

/**
 * RUTAS DE MESAS
 * Estas rutas se montan en el server.js bajo la ruta "/api"
 * Por lo tanto, la URL completa será http://localhost:3000/api/mesas, etc.
 */

// --- Gestión de Mesas ---

// Obtener todas las mesas (Sincronizado con TableService.getAll)
router.get('/mesas', controller.getMesasHandler);

// Crear una nueva mesa (Sincronizado con TableService.create)
router.post('/mesas', controller.createMesaHandler);

// Actualizar datos de la mesa (Sincronizado con TableService.update)
router.put('/mesas/:id', controller.updateMesaHandler);

// Cambiar estado de la mesa (Sincronizado con TableService.updateStatus)
// Usamos PATCH porque es una actualización parcial (solo el estado)
router.patch('/mesas/:id/estado', controller.updateEstadoHandler);

// Asignar Mesero y Cliente (Sincronizado con TableService.assignWaiter)
router.patch('/mesas/:id/mesero', controller.updateMeseroHandler);

// Proceso de Cobro / Salida (Sincronizado con TableService.checkout)
router.post('/mesas/:id/checkout', controller.checkoutHandler);

// Eliminar una mesa (Sincronizado con TableService.delete)
router.delete('/mesas/:id', controller.deleteMesaHandler);


// --- Gestión de Personal/Meseros ---

// Obtener lista de meseros para el dropdown (Sincronizado con TableService.getWaiters)
router.get('/meseros', controller.getMeserosHandler);

module.exports = router;
