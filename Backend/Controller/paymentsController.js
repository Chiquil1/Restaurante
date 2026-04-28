const paymentsModel = require('../Models/paymentsModel');

exports.getPaymentsBySale = async (req, res) => {
    try {
        const payments = await paymentsModel.getPaymentsBySale(req.params.venta_id);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const payment = await paymentsModel.getPaymentById(req.params.id);
        if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPayment = async (req, res) => {
    try {
        const payment = await paymentsModel.createPayment(req.body);
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSaleBalance = async (req, res) => {
    try {
        const balance = await paymentsModel.getSaleBalance(req.params.venta_id);
        if (!balance) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(balance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
