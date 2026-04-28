const orderItemsModel = require('../models/orderItemsModel');

exports.getOrderItems = async (req, res) => {
    try {
        const items = await orderItemsModel.getOrderItems(req.params.orderId);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOrderItemById = async (req, res) => {
    try {
        const item = await orderItemsModel.getOrderItemById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item no encontrado' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createOrderItem = async (req, res) => {
    try {
        const item = await orderItemsModel.createOrderItem(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateItemStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const item = await orderItemsModel.updateItemStatus(req.params.id, status);
        if (!item) return res.status(404).json({ error: 'Item no encontrado' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateItemQuantity = async (req, res) => {
    try {
        const { cantidad } = req.body;
        const item = await orderItemsModel.updateItemQuantity(req.params.id, cantidad);
        if (!item) return res.status(404).json({ error: 'Item no encontrado' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteOrderItem = async (req, res) => {
    try {
        const result = await orderItemsModel.deleteOrderItem(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
