const reservationsModel = require('../Models/reservationsModel');

// Obtener todas las reservaciones (acepta filtros por query: ?estado=pendiente&fecha=2023-10-20)
exports.getReservations = async (req, res) => {
    try {
        const reservations = await reservationsModel.getAllReservations(req.query);
        res.json(reservations);
    } catch (error) {
        console.error("Error en getReservations:", error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener reservación por ID
exports.getReservationById = async (req, res) => {
    try {
        const reservation = await reservationsModel.getReservationById(req.params.id);
        if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear reservación
exports.createReservation = async (req, res) => {
    try {
        const reservation = await reservationsModel.createReservation(req.body);
        res.status(201).json(reservation);
    } catch (error) {
        console.error("Error creando reserva:", error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar reservación
exports.updateReservation = async (req, res) => {
    try {
        const reservation = await reservationsModel.updateReservation(req.params.id, req.body);
        if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar reservación
exports.deleteReservation = async (req, res) => {
    try {
        const result = await reservationsModel.deleteReservation(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
