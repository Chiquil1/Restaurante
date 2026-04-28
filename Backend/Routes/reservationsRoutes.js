const express = require('express');
const router = express.Router();
const reservationsController = require('../Controller/reservationsController');

// Rutas principales
router.get('/', reservationsController.getReservations);
router.get('/:id', reservationsController.getReservationById);

// Métodos de escritura
router.post('/', reservationsController.createReservation);
router.put('/:id', reservationsController.updateReservation);
router.delete('/:id', reservationsController.deleteReservation);

module.exports = router;