const reservationsModel = require('../Models/reservationsModel');

exports.getReservations = async (req, res) => {
    try {
        const reservations = await reservationsModel.getReservations();
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReservationById = async (req, res) => {
    try {
        const reservation = await reservationsModel.getReservationById(req.params.id);
        if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createReservation = async (req, res) => {
    try {
        const reservation = await reservationsModel.createReservation(req.body);
        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const reservation = await reservationsModel.updateReservation(req.params.id, req.body);
        if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const result = await reservationsModel.deleteReservation(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
