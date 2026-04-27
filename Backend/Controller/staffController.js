const StaffService = require('../Services/staffService');
const bcrypt = require('bcrypt');

// Obtener todo el personal
exports.getStaff = async (req, res) => {
  try { 
    res.json(await StaffService.getAllStaff()); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

// Crear empleado con seguridad
exports.createStaff = async (req, res) => {
  try {
    const data = req.body;
    const salt = await bcrypt.genSalt(10);
    data.password_hash = await bcrypt.hash(data.password, salt); 
    delete data.password; 
    res.status(201).json(await StaffService.createStaff(data));
  } catch (e) { 
    res.status(400).json({ error: e.message }); 
  }
};

// Obtener ausencias de un empleado específico
exports.getAbsences = async (req, res) => {
  try { 
    res.json(await StaffService.getEmployeeAbsences(req.params.id)); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

// Registrar una nueva ausencia
exports.addAbsence = async (req, res) => {
  try { 
    res.status(201).json(await StaffService.addAbsence(req.body)); 
  } catch (e) { 
    res.status(400).json({ error: e.message }); 
  }
};

// --- CONTROLADORES PARA LA MATRIZ DE HORARIO ---

// Obtener horarios del mes
exports.getSchedule = async (req, res) => {
  try {
    const { month, year } = req.query;
    if(!month || !year) return res.status(400).json({ error: "Mes y año son requeridos" });
    res.json(await StaffService.getMonthlySchedule(month, year));
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

// Actualizar un turno la celda la matriz
exports.updateShift = async (req, res) => {
  try {
    res.json(await StaffService.updateShift(req.body));
  } catch (e) { 
    res.status(400).json({ error: e.message }); 
  }
};
