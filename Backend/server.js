require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* =========================================================
   ⚙️ CONFIGURACIÓN DEL SERVIDOR
   👉 Define el puerto del backend
========================================================= */
const PORT = parseInt(process.env.SERVER_PORT) || 3000;

/* =========================================================
   🌐 MIDDLEWARES GLOBALES
   👉 Preparan el servidor para recibir requests
========================================================= */

// 🔒 CORS - CORREGIDO para aceptar cualquier puerto de localhost durante desarrollo
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir peticiones sin origen (como Insomnia o Postman)
      // O permitir cualquier dirección que sea localhost (sin importar el puerto)
      if (!origin || /localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        // Si no es localhost, intenta usar la variable de entorno o falla
        const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
        if (origin === allowedOrigin) {
          callback(null, true);
        } else {
          callback(new Error("No permitido por CORS"));
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 📦 Permite leer JSON en requests
app.use(express.json());

// 📄 Permite formularios HTML
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   🧾 LOGGER (DEBUG)
   👉 Muestra todas las peticiones al backend
========================================================= */
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

/* =========================================================
   🧩 CARGA DE RUTAS (SIN OCULTAR ERRORES)
   👉 IMPORTANTE: aquí se monta cada módulo del sistema
========================================================= */

const loadRoute = (path, file) => {
  try {
    const route = require(file);
    app.use(path, route);
    console.log(`✔ RUTA CARGADA: ${path}`);
  } catch (err) {
    console.error("====================================");
    console.error(`❌ ERROR EN RUTA: ${path}`);
    console.error("====================================");
    console.error(err.message);
    console.error(err.stack);
  }
};

/* =========================================================
   🗂️ MÓDULOS DEL SISTEMA RESTAURANTE
========================================================= */

loadRoute("/api/settings", "./Routes/settingsRoutes");
loadRoute("/api/reservations", "./Routes/reservationsRoutes");
loadRoute("/api/menu", "./Routes/menuRoutes");
loadRoute("/api/dashboard", "./Routes/dashboardRoutes");

// 🍽️ PEDIDOS (ORDERS - CRÍTICO)
loadRoute("/api/orders", "./Routes/ordersRoutes");

// 🪑 MESAS
loadRoute("/api", "./Routes/tablesRoutes");

// 👨‍🍳 PERSONAL
loadRoute("/api/staff", "./Routes/staffRoutes");

// 💰 VENTAS
loadRoute("/api/sales", "./Routes/salesRoutes");

// 📊 REPORTES
loadRoute("/api/reports", "./Routes/reportsRoutes");

/* =========================================================
   🧪 HEALTH CHECK
   👉 Verifica que el servidor está vivo
========================================================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Servidor funcionando correctamente",
    timestamp: new Date()
  });
});

/* =========================================================
   🧪 TEST DASHBOARD
   👉 Endpoint de prueba rápida
========================================================= */
app.get("/api/dashboard-test", (req, res) => {
  res.json({
    ok: true,
    message: "Dashboard OK"
  });
});

/* =========================================================
   ❌ 404 - RUTA NO ENCONTRADA
========================================================= */
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl
  });
});

/* =========================================================
   🚨 MANEJO GLOBAL DE ERRORES
========================================================= */
app.use((err, req, res, next) => {
  console.error("🔥 ERROR DEL SERVIDOR:");
  console.error(err.stack);

  res.status(500).json({
    error: err.message || "Internal Server Error"
  });
});

/* =========================================================
   🚀 INICIO DEL SERVIDOR
========================================================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log("==================================");
  console.log("🍽️ SISTEMA RESTAURANTE INICIADO");
  console.log("==================================");
  console.log(`🚀 Puerto: ${PORT}`);
  console.log(`🌐 Frontend permitido: Cualquier puerto de localhost`);
  console.log(`🕒 ${new Date().toLocaleString()}`);
});
