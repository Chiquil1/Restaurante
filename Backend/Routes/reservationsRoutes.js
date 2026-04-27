const express = require('express');
const router = express.Router();

const {
  getReservationsHandler,
  createReservationHandler,
  updateReservationHandler,
  deleteReservationHandler
} = require('../Controller/reservationsController');

router.get('/', getReservationsHandler);
router.post('/', createReservationHandler);
router.put('/:id', updateReservationHandler);
router.delete('/:id', deleteReservationHandler);

module.exports = router;