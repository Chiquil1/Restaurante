const StaffModel = require('../Models/staffModel');

const StaffService = {
  async getAllStaff() { return await StaffModel.getAll(); },
  async createStaff(data) { return await StaffModel.create(data); },
  async updateStaff(id, data) { return await StaffModel.update(id, data); },
  async deleteStaff(id) { return await StaffModel.delete(id); },
  async getEmployeeAbsences(id) { return await StaffModel.getAusencias(id); },
  async addAbsence(data) { return await StaffModel.createAusencia(data); },
  
  // --- NUEVOS MÉTODOS ---
  async getMonthlySchedule(month, year) { return await StaffModel.getMonthlySchedule(month, year); },
  async updateShift(data) { return await StaffModel.updateShift(data.personal_id, data.fecha, data.tipo_turno); }
};

module.exports = StaffService;
