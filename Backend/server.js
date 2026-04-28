const express = require("express");
const cors = require("cors");

// Crear app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ================== ROUTES ==================

// Dashboard
const dashboardRoutes = require("./Routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

// Menú
const menuRoutes = require("./Routes/menuRoutes");
app.use("/api/menu", menuRoutes);

// Pedidos (Orders)
const ordersRoutes = require("./Routes/ordersRoutes");
app.use("/api/orders", ordersRoutes);

// Items de Pedido
const orderItemsRoutes = require("./Routes/orderItemsRoutes");
app.use("/api/orderitems", orderItemsRoutes);

// Mesas
const tablesRoutes = require("./Routes/tablesRoutes");
app.use("/api/tables", tablesRoutes);

// Reservaciones
const reservationsRoutes = require("./Routes/reservationsRoutes");
app.use("/api/reservations", reservationsRoutes);

// Ventas
const salesRoutes = require("./Routes/salesRoutes");
app.use("/api/sales", salesRoutes);

// Pagos
const paymentsRoutes = require("./Routes/paymentsRoutes");
app.use("/api/payments", paymentsRoutes);

// Personal (Staff)
const staffRoutes = require("./Routes/staffRoutes");
app.use("/api/staff", staffRoutes);

// Reportes
const reportsRoutes = require("./Routes/reportsRoutes");
app.use("/api/reports", reportsRoutes);

// Configuración (Settings)
const settingsRoutes = require("./Routes/settingsRoutes");
app.use("/api/settings", settingsRoutes);

// ============================================

// Ruta base
app.get("/", (req, res) => {
  res.send("API Restaurante funcionando 🚀");
});

// Puerto
const PORT = process.env.PORT || 3000;

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
