const ordersService = require("../Services/ordersService");

/* =========================================================
   📦 CONTROLADOR DE PEDIDOS
========================================================= */

const getOrders = async (req, res) => {
  try {
    const data = await ordersService.getOrders();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const data = await ordersService.getOrderById(req.params.id);
    if (!data) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const data = await ordersService.createOrder(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addItemToOrder = async (req, res) => {
  try {
    const data = await ordersService.addItemToOrder(req.params.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const data = await ordersService.updateOrderStatus(req.params.id, status);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const data = await ordersService.updateItemStatus(req.params.itemId, status);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateItemQuantity = async (req, res) => {
  try {
    const { cantidad } = req.body;
    const data = await ordersService.updateItemQuantity(req.params.itemId, cantidad);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    await ordersService.deleteOrder(req.params.id);
    res.json({ message: "Pedido eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteOrderItem = async (req, res) => {
  try {
    const data = await ordersService.deleteOrderItem(req.params.itemId);
    res.json({ message: "Item eliminado", item: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  addItemToOrder,
  updateOrderStatus,
  updateItemStatus,
  updateItemQuantity,
  deleteOrder,
  deleteOrderItem
};
