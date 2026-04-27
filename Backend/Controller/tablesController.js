const service = require('../Services/tablesService');

/**
 * CONTROLADOR DE MESAS
 * Gestiona las peticiones HTTP y las conecta con la lógica de negocio (Service).
 * Mantiene los nombres de handlers originales para evitar romper las rutas.
 */

// 1. Obtener todas las mesas (Sincronizado con JOINs de Model)
exports.getMesasHandler = async (req, res) => {
  try {
    const mesas = await service.getMesas();
    res.json(mesas);
  } catch (err) {
    console.error("❌ Error en getMesasHandler:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Obtener lista de meseros
exports.getMeserosHandler = async (req, res) => {
  try {
    const meseros = await service.getMeseros();
    res.json(meseros);
  } catch (err) {
    console.error("❌ Error en getMeserosHandler:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. Crear una nueva mesa
exports.createMesaHandler = async (req, res) => {
  try {
    const mesa = await service.crearMesa(req.body);
    res.status(201).json(mesa);
  } catch (err) {
    console.error("❌ Error en createMesaHandler:", err);
    res.status(400).json({ error: err.message });
  }
};

// 4. Actualizar datos básicos de la mesa (Incluye posición X, Y)
exports.updateMesaHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const mesa = await service.actualizarMesa(id, req.body);
    res.json(mesa);
  } catch (err) {
    console.error("❌ Error en updateMesaHandler:", err);
    res.status(400).json({ error: err.message });
  }
};

// 5. Cambiar el estado de la mesa
exports.updateEstadoHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({ error: "El campo 'estado' es requerido" });
    }

    const mesa = await service.cambiarEstado(id, estado);
    res.json(mesa);
  } catch (err) {
    console.error("❌ Error en updateEstadoHandler:", err);
    res.status(400).json({ error: err.message });
  }
};

// 6. Asignar Mesero, Cliente y Total
exports.updateMeseroHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const mesa = await service.asignarMesero(id, req.body);
    res.json(mesa);
  } catch (err) {
    console.error("❌ Error en updateMeseroHandler:", err);
    res.status(400).json({ error: err.message });
  }
};

// 7. Proceso de Cobro (Checkout) - Con Transacción SQL en el Service
exports.checkoutHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { metodo_pago } = req.body;
    
    const result = await service.checkoutTable(id, metodo_pago);
    res.json(result);
  } catch (err) {
    console.error("❌ Error en checkoutHandler:", err);
    res.status(400).json({ error: err.message });
  }
};

// 8. Eliminar una mesa
exports.deleteMesaHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await service.eliminarMesa(id);
    res.json({ message: "Mesa eliminada exitosamente" });
  } catch (err) {
    console.error("❌ Error en deleteMesaHandler:", err);
    res.status(400).json({ error: err.message });
  }
};
