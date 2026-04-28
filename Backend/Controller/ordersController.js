const ordersModel = require('../Models/ordersModel');

// Obtener todas las órdenes
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await ordersModel.getAllOrders();
        res.json(orders);
    } catch (error) {
        console.error("Error en getAllOrders:", error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener orden por ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await ordersModel.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear orden
exports.createOrder = async (req, res) => {
    try {
        const order = await ordersModel.createOrder(req.body);
        res.status(201).json(order);
    } catch (error) {
        console.error("Error creando orden:", error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar estado (ej. a 'pagado')
exports.updateOrderStatus = async (req, res) => {
    try {
        const { estado } = req.body;
        const order = await ordersModel.updateOrderStatus(req.params.id, estado);
        if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar orden
exports.deleteOrder = async (req, res) => {
    try {
        await ordersModel.deleteOrder(req.params.id);
        res.json({ message: 'Orden cancelada/eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
