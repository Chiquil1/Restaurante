const salesService = require('../Services/salesService');

const salesController = {
    // GET /api/sales
    async getAllSales(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const sales = await salesService.getAllSales(startDate, endDate);
            res.json({ success: true, data: sales });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // GET /api/sales/summary
    async getSummary(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const summary = await salesService.getSummary(startDate, endDate);
            res.json({ success: true, data: summary });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // GET /api/sales/payment-summary
    async getPaymentSummary(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const summary = await salesService.getPaymentSummary(startDate, endDate);
            res.json({ success: true, data: summary });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // GET /api/sales/by-order/:orderId
    async getSaleByOrderId(req, res) {
        try {
            const { orderId } = req.params;
            const sale = await salesService.getSaleByOrderId(orderId);
            if (!sale) return res.status(404).json({ success: false, message: 'Venta no encontrada.' });
            res.json({ success: true, data: sale });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // GET /api/sales/total
    async getTotalSales(req, res) {
        try {
            const total = await salesService.getTotalSales();
            res.json({ success: true, data: total });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // POST /api/sales
    async createSale(req, res) {
        try {
            const sale = await salesService.createSale(req.body);
            res.status(201).json({ success: true, data: sale });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // PUT /api/sales/:id/status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const sale = await salesService.updateStatus(id, status);
            res.json({ success: true, data: sale });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = salesController;
