const Orders = require("../Models/ordersModel");
const OrderItems = require("../Models/orderItemsModel");
const db = require("../config/Db");

/* =========================================================
   📦 SERVICIO DE PEDIDOS (Lógica de Negocio)
========================================================= */

const getOrders = async () => {
  return await Orders.getAllOrders();
};

const getOrderById = async (id) => {
  return await Orders.getOrderById(id);
};

const createOrder = async (data) => {
  // Normalización de datos para evitar errores de Frontend (mesaId vs mesa_id)
  const orderData = {
    mesaId: data.mesa_id || data.mesaId,
    meseroId: data.mesero_id || data.meseroId,
    items: data.items || [],
    estado: data.estado || 'pendiente',
    prioridad: data.prioridad || 'normal'
  };
  return await Orders.createOrder(orderData);
};

const addItemToOrder = async (orderId, itemData) => {
  // 1. Crear el item
  const newItem = await OrderItems.createOrderItem({
    orderId: parseInt(orderId),
    menuItemId: itemData.menu_item_id || itemData.menuItemId,
    nombre: itemData.nombre,
    precioUnitario: itemData.precio_unitario || itemData.precioUnitario,
    cantidad: itemData.cantidad,
    notas: itemData.notas
  });

  // 2. Recalcular el total de la orden en la base de datos
  const order = await Orders.getOrderById(orderId);
  const newTotal = order.total_calculado;
  
  await db.runAsync(`UPDATE orders SET total = $1 WHERE id = $2`, [newTotal, orderId]);

  // 3. Actualizar el total de la mesa si existe
  if (order.mesa_id) {
    await db.runAsync(`UPDATE mesas SET total = COALESCE(total, 0) + $1 WHERE id = $2`, 
      [newItem.subtotal, order.mesa_id]);
  }

  return newItem;
};

const updateOrderStatus = async (id, status) => {
  return await Orders.updateOrderStatus(id, status);
};

const updateItemStatus = async (itemId, status) => {
  return await OrderItems.updateItemStatus(itemId, status);
};

const updateItemQuantity = async (itemId, cantidad) => {
  return await OrderItems.updateItemQuantity(itemId, cantidad);
};

const deleteOrder = async (id) => {
  return await Orders.deleteOrder(id);
};

const deleteOrderItem = async (itemId) => {
  return await OrderItems.deleteOrderItem(itemId);
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
