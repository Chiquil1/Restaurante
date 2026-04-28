const ordersModel = require('../Models/ordersModel');

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await ordersModel.getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await ordersModel.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const order = await ordersModel.createOrder(req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await ordersModel.updateOrderStatus(req.params.id, status);
        if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        await ordersModel.deleteOrder(req.params.id);
        res.json({ message: 'Pedido eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
