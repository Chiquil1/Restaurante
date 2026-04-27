const express = require("express");
const router = express.Router();
const controller = require("../Controller/ordersController");

/* =========================================================
   🍽️ RUTAS DE PEDIDOS (ORDERS)
========================================================= */

// 📥 Obtener todos los pedidos (Lista general)
router.get("/", controller.getOrders);

// 📥 Obtener un pedido específico por ID
router.get("/:id", controller.getOrderById);

// ➕ Crear un nuevo pedido con sus items
router.post("/", controller.createOrder);

// ➕ Agregar un plato extra a un pedido ya existente
router.post("/:id/items", controller.addItemToOrder);

// 🔄 Actualizar el estado global del pedido (Ej: 'pendiente' -> 'entregado')
router.put("/:id", controller.updateOrderStatus);

// 🔄 Actualizar el estado de un plato específico (Ej: 'pendiente' -> 'preparando')
router.put("/items/:itemId/status", controller.updateItemStatus);

// 🔄 Cambiar la cantidad de un plato
router.put("/items/:itemId/quantity", controller.updateItemQuantity);

// ❌ Eliminar un pedido completo
router.delete("/:id", controller.deleteOrder);

// ❌ Eliminar un plato específico de un pedido
router.delete("/items/:itemId", controller.deleteOrderItem);

module.exports = router;
