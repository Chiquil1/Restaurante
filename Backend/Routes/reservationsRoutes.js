const express = require('express');
const router = express.Router();
const reservationsController = require('../Controller/reservationsController');

// GET - Obtener reservaciones
router.get('/', reservationsController.getAllReservations);
router.get('/stats', reservationsController.getReservationStats);
router.get('/search', reservationsController.searchReservations);
router.get('/fecha/:fecha', reservationsController.getReservationsByDate);
router.get('/estado/:estado', reservationsController.getReservationsByStatus);
router.get('/:id', reservationsController.getReservationById);

// POST - Crear reservación
router.post('/', reservationsController.createReservation);

// PUT - Actualizar
router.put('/:id', reservationsController.updateReservation);
router.put('/:id/estado', reservationsController.updateReservationStatus);
router.put('/:id/confirmar', reservationsController.confirmReservation);
router.put('/:id/ocupada', reservationsController.markAsOccupied);

// DELETE
router.delete('/:id', reservationsController.deleteReservation);

// POST - Atajo para cancelar
router.post('/:id/cancelar', reservationsController.cancelReservation);

module.exports = router;