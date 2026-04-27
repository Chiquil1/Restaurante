const Sales = require('../Models/salesModel');

const salesService = {
    async getAllSales(startDate, endDate) {
        return await Sales.getAllSales(startDate, endDate);
    },

    async getSummary(startDate, endDate) {
        return await Sales.getSummary(startDate, endDate);
    },

    async getPaymentSummary(startDate, endDate) {
        return await Sales.getPaymentSummary(startDate, endDate);
    },

    async getSaleByOrderId(orderId) {
        if (!orderId) throw new Error('El ID del pedido es requerido.');
        return await Sales.findByOrderId(orderId);
    },

    async getTotalSales() {
        return await Sales.getTotalSales();
    },

    async createSale(data) {
        return await Sales.createSale(data);
    },

    async updateStatus(id, status) {
        return await Sales.updateStatus(id, status);
    }
};

module.exports = salesService;
