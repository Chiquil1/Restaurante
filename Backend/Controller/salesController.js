const salesModel = require('../Models/salesModel');

exports.getAllSales = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const sales = await salesModel.getAllSales(startDate, endDate);
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSaleById = async (req, res) => {
    try {
        const sale = await salesModel.getSaleById(req.params.id);
        if (!sale) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const summary = await salesModel.getSummary(startDate, endDate);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPaymentSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const summary = await salesModel.getPaymentSummary(startDate, endDate);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSale = async (req, res) => {
    try {
        const sale = await salesModel.createSale(req.body);
        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSaleStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const sale = await salesModel.updateSaleStatus(req.params.id, status);
        if (!sale) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSale = async (req, res) => {
    try {
        const result = await salesModel.deleteSale(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTotal = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await salesModel.getTotalSales(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error("Error al calcular total de ventas:", error);
        res.status(500).json({ error: "Error interno al calcular el total de ventas" });
    }
};
