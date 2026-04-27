const service = require('../Services/reservationsService');

/**
 * CONTROLADOR DE RESERVAS
 * Gestiona las peticiones HTTP y las conecta con la lógica de negocio.
 */

// 1. Obtener todas las reservas
exports.getReservationsHandler = async (req, res) => {
  try {
    // Permitimos que el frontend envíe un filtro de estado (ej: ?estado=pendiente)
    const { estado } = req.query;
    const data = await service.getReservations(estado);
    res.json(data);
  } catch (err) {
    console.error("❌ Error en getReservationsHandler:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Crear una nueva reserva
exports.createReservationHandler = async (req, res) => {
  try {
    // Validamos que el cuerpo de la petición no esté vacío
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Los datos de la reserva son requeridos" });
    }

    const data = await service.createReservation(req.body);
    res.status(201).json({
      message: "Reserva creada exitosamente",
      reservation: data
    });
  } catch (err) {
    console.error("❌ Error en createReservationHandler:", err);
    res.status(400).json({ error: err.message });
  }
};

// 3. Actualizar una reserva (Incluye el cambio de estado y asignación de mesa)
exports.updateReservationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "El ID de la reserva es requerido" });
    }

    const data = await service.updateReservation(id, req.body);
    res.json({
      message: "Reserva actualizada exitosamente",
      reservation: data
    });
  } catch (err) {
    console.error("❌ Error en updateReservationHandler:", err);
    res.status(400).json({ error: err.message });
  }
};

// 4. Eliminar una reserva
exports.deleteReservationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "El ID de la reserva es requerido" });
    }

    await service.deleteReservation(id);
    res.json({ message: 'Reserva eliminada exitosamente' });
  } catch (err) {
    console.error("❌ Error en deleteReservationHandler:", err);
    res.status(400).json({ error: err.message });
  }
};
