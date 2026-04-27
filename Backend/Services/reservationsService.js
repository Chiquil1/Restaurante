const model = require('../Models/reservationsModel');
const TableModel = require('../Models/tablesModel');

/**
 * SERVICIO DE RESERVAS
 * Orquestador que sincroniza las Reservas con el Mapa de Mesas.
 */

// =============================================================================
// 1. FLUJO DE CREACIÓN DE RESERVA
// =============================================================================
const createReservation = async (data) => {
  try {
    // 1. Crear la reserva en la tabla 'reservas'
    // Ya no llamamos a 'createGuest' porque los datos del cliente van dentro de la reserva
    const reservation = await model.createReservation(data);

    // 2. SINCRONIZACIÓN AUTOMÁTICA CON EL MAPA DE MESAS
    // Verificamos si la reserva tiene una mesa asignada (mesas_asignadas)
    if (reservation.mesas_asignadas) {
      const mesaId = parseInt(reservation.mesas_asignadas);
      
      // Definimos el estado de la mesa: 'reservada' si la reserva es confirmada o solicitada
      const estadoMesa = (reservation.estado === 'confirmada' || reservation.estado === 'solicitada') 
        ? 'reservada' 
        : 'disponible';
      
      // A. Cambiar el estado de la mesa en el mapa
      await TableModel.updateEstado(mesaId, estadoMesa);

      // B. Inyectar Cliente y Mesero en la mesa
      // Usamos el nombre_cliente que viene directamente de la reserva
      await TableModel.updateMesero(mesaId, {
        mesero_id: data.mesero_asignado || null, // El mesero que elijas en el form
        cliente: reservation.nombre_cliente,     // Sincronización automática del nombre
        total: 0 // Al crear la reserva, el total inicia en 0
      });
    }
    return reservation;
  } catch (err) {
    console.error("❌ Error en createReservation la lógica de sincronización:", err);
    throw err;
  }
};

// =============================================================================
// 2. OBTENER RESERVAS
// =============================================================================
const getReservations = () => model.getReservations();

// =============================================================================
// 3. ACTUALIZACIÓN DE RESERVA Y RE-SINCRONIZACIÓN
// =============================================================================
const updateReservation = async (id, data) => {
  try {
    const updated = await model.updateReservation(id, data);
    
    // Si la reserva tiene una mesa asignada, debemos actualizar el mapa de mesas
    if (updated.mesas_asignadas) {
      const mesaId = parseInt(updated.mesas_asignadas);

      // 1. Actualizar estado de la mesa
      let nuevoEstado = 'disponible';
      if (updated.estado === 'confirmada' || updated.estado === 'solicitada') {
        nuevoEstado = 'reservada';
      }
      await TableModel.updateEstado(mesaId, nuevoEstado);
      
      // 2. Actualizar datos del cliente y mesero en la mesa
      // Usamos el nombre actualizado de la reserva
      await TableModel.updateMesero(mesaId, {
        mesero_id: data.mesero_asignado || null,
        cliente: updated.nombre_cliente, 
        total: 0 // El total se maneja generalmente en el módulo de pedidos/ventas
      });
    }
    return updated;
  } catch (err) {
    console.error("❌ Error en updateReservation sincronización:", err);
    throw err;
  }
};

// =============================================================================
// 4. ELIMINAR RESERVA Y LIBERAR MESA
// =============================================================================
const deleteReservation = async (id) => {
  try {
    // Primero buscamos la reserva para saber qué mesa liberar
    const reservation = await model.getReservationById(id); 
    
    if (reservation && reservation.mesas_asignadas) {
      const mesaId = parseInt(reservation.mesas_asignadas);
      
      // A. Devolver la mesa a estado disponible
      await TableModel.updateEstado(mesaId, 'disponible');
      
      // B. Limpiar los datos del cliente y mesero de la mesa
      await TableModel.updateMesero(mesaId, { 
        total: 0, 
        cliente: '', 
        mesero_id: null 
      });
    }
    
    return await model.deleteReservation(id);
  } catch (err) {
    console.error("❌ Error en deleteReservation liberación de mesa:", err);
    throw err;
  }
};

module.exports = {
  createReservation,
  getReservations,
  updateReservation,
  deleteReservation
};
