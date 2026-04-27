const service = require("../Services/reportsService");

exports.getSalesReport = async (req, res) => {
  try {
    const fechaInicio = req.query.fechaInicio || req.query.startDate;
    const fechaFin = req.query.fechaFin || req.query.endDate;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: "Se requieren fechaInicio y fechaFin" });
    }

    const report = await service.getSalesReport(fechaInicio, fechaFin);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReservationsReport = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: "Se requieren fechaInicio y fechaFin" });
    }

    const report = await service.getReservationsReport(fechaInicio, fechaFin);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOccupancyReport = async (req, res) => {
  try {
    const report = await service.getOccupancyReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMenuPopularityReport = async (req, res) => {
  try {
    const fechaInicio = req.query.fechaInicio || req.query.startDate;
    const fechaFin = req.query.fechaFin || req.query.endDate;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: "Se requieren fechaInicio y fechaFin" });
    }

    const report = await service.getMenuPopularityReport(fechaInicio, fechaFin);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStaffPerformanceReport = async (req, res) => {
  try {
    const fechaInicio = req.query.fechaInicio || req.query.startDate;
    const fechaFin = req.query.fechaFin || req.query.endDate;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: "Se requieren fechaInicio y fechaFin" });
    }

    const report = await service.getStaffPerformanceReport(fechaInicio, fechaFin);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
