const reportsModel = require('../Models/reportsModel');

exports.getSalesReport = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const report = await reportsModel.getSalesReport(dateFrom, dateTo);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReservationsReport = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const report = await reportsModel.getReservationsReport(dateFrom, dateTo);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOccupancyReport = async (req, res) => {
    try {
        const report = await reportsModel.getOccupancyReport();
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMenuPopularity = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const report = await reportsModel.getMenuPopularityReport(dateFrom, dateTo);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStaffPerformance = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const report = await reportsModel.getStaffPerformanceReport(dateFrom, dateTo);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
