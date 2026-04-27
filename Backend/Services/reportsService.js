const model = require('../Models/reportsModel');

const getSalesReport = (fechaInicio, fechaFin) => model.getSalesReport(fechaInicio, fechaFin);
const getReservationsReport = (fechaInicio, fechaFin) => model.getReservationsReport(fechaInicio, fechaFin);
const getOccupancyReport = () => model.getOccupancyReport();
const getMenuPopularityReport = (fechaInicio, fechaFin) => model.getMenuPopularityReport(fechaInicio, fechaFin);
const getStaffPerformanceReport = (fechaInicio, fechaFin) => model.getStaffPerformanceReport(fechaInicio, fechaFin);

module.exports = {
  getSalesReport,
  getReservationsReport,
  getOccupancyReport,
  getMenuPopularityReport,
  getStaffPerformanceReport,
};
