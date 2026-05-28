// --- File: src/Api.js ---
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Interceptor Request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor Response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // window.location.href = '/login'; // Descomentar si hay login
    }
    return Promise.reject(error);
  }
);

// ── Dashboard ──
export const DashboardService = {
  getVentasHoy: () => api.get('/dashboard/ventas-hoy').then((res) => res.data),
  getClientesHoy: () => api.get('/dashboard/clientes-hoy').then((res) => res.data),
  getPedidosActivos: () => api.get('/dashboard/pedidos-activos').then((res) => res.data),
  getMesasOcupadas: () => api.get('/dashboard/mesas-ocupadas').then((res) => res.data),
  getTotalMesas: () => api.get('/dashboard/total-mesas').then((res) => res.data),
};

// ── Menú ──
export const MenuService = {
  getAll: (filters) => api.get('/menu', { params: filters }).then((res) => res.data),
  getCategories: () => api.get('/menu/categories').then((res) => res.data),
  getById: (id) => api.get(`/menu/${id}`).then((res) => res.data),
  create: (data) => api.post('/menu', data).then((res) => res.data),
  update: (id, data) => api.put(`/menu/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/menu/${id}`).then((res) => res.data),
};

// ── Mesas ──
export const TableService = {
  getAll: () => api.get('/tables').then((res) => res.data),
  getWaiters: () => api.get('/tables/waiters').then((res) => res.data),
  getById: (id) => api.get(`/tables/${id}`).then((res) => res.data),
  create: (data) => api.post('/tables', data).then((res) => res.data),
  update: (id, data) => api.put(`/tables/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/tables/${id}`).then((res) => res.data),
};

// ── Pedidos (Orders) ──
export const OrderService = {
  getAll: () => api.get('/orders').then((res) => res.data),
  getById: (id) => api.get(`/orders/${id}`).then((res) => res.data),
  create: (data) => api.post('/orders', data).then((res) => res.data),
  createWithItems: (orderData, items) => api.post('/orders/create-with-items', { order: orderData, items }).then((res) => res.data),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { estado: status }).then((res) => res.data),
  delete: (id) => api.delete(`/orders/${id}`).then((res) => res.data),
};

// ── Items de Pedido ──
export const OrderItemService = {
  getByOrder: (orderId) => api.get(`/orderitems/order/${orderId}`).then((res) => res.data),
  create: (data) => api.post('/orderitems', data).then((res) => res.data),
  updateStatus: (id, status) => api.put(`/orderitems/${id}/status`, { status }).then((res) => res.data),
  updateQuantity: (id, cantidad) => api.put(`/orderitems/${id}/quantity`, { cantidad }).then((res) => res.data),
  delete: (id) => api.delete(`/orderitems/${id}`).then((res) => res.data),
};

// ── Reservaciones ──
export const ReservationService = {
  getAll: () => api.get('/reservations').then((res) => res.data),
  getById: (id) => api.get(`/reservations/${id}`).then((res) => res.data),
  create: (data) => api.post('/reservations', data).then((res) => res.data),
  update: (id, data) => api.put(`/reservations/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/reservations/${id}`).then((res) => res.data),
};



// ── Ventas ──
export const SalesService = {
  getAll: (startDate, endDate) => api.get('/sales', { params: { startDate, endDate } }).then((res) => res.data),
  getById: (id) => api.get(`/sales/${id}`).then((res) => res.data),
  getSummary: (startDate, endDate) => api.get('/sales/summary', { params: { startDate, endDate } }).then((res) => res.data),
  
  // AÑADE ESTA LÍNEA:
  getTotal: (startDate, endDate) => api.get('/sales/total', { params: { startDate, endDate } }).then((res) => res.data), 
  
  create: (data) => api.post('/sales', data).then((res) => res.data),
  updateStatus: (id, status) => api.put(`/sales/${id}/status`, { status }).then((res) => res.data),
};

// ── Pagos ──
export const PaymentService = {
  getBySale: (venta_id) => api.get(`/payments/sale/${venta_id}`).then((res) => res.data),
  create: (data) => api.post('/payments', data).then((res) => res.data),
  getSaleBalance: (venta_id) => api.get(`/payments/sale/${venta_id}/balance`).then((res) => res.data),
};

// ── Personal (Staff) ──
export const StaffService = {
  getAll: () => api.get('/staff').then((res) => res.data),
  getById: (id) => api.get(`/staff/${id}`).then((res) => res.data),
  create: (data) => api.post('/staff', data).then((res) => res.data),
  update: (id, data) => api.put(`/staff/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/staff/${id}`).then((res) => res.data),
  getAusencias: (personal_id) => api.get(`/staff/${personal_id}/ausencias`).then((res) => res.data),
  createAusencia: (data) => api.post('/staff/ausencias', data).then((res) => res.data),
};

// ── Reportes ──
export const ReportsService = {
  getSalesReport: (dateFrom, dateTo) => api.get('/reports/sales', { params: { dateFrom, dateTo } }).then((res) => res.data),
  getReservationsReport: (dateFrom, dateTo) => api.get('/reports/reservations', { params: { dateFrom, dateTo } }).then((res) => res.data),
  getOccupancyReport: () => api.get('/reports/occupancy').then((res) => res.data),
  getMenuPopularity: (dateFrom, dateTo) => api.get('/reports/menu-popularity', { params: { dateFrom, dateTo } }).then((res) => res.data),
  getStaffPerformance: (dateFrom, dateTo) => api.get('/reports/staff-performance', { params: { dateFrom, dateTo } }).then((res) => res.data),
};

// ── Configuración (Settings) ──
export const SettingsService = {
  getGeneral: () => api.get('/settings/general').then((res) => res.data),
  updateGeneral: (data) => api.put('/settings/general', data).then((res) => res.data),
  getBranch: () => api.get('/settings/branch').then((res) => res.data),
  updateBranch: (data) => api.put('/settings/branch', data).then((res) => res.data),
  createBackup: (sucursalId) => api.post('/settings/backup', { sucursalId }).then((res) => res.data),
};

export default api;
// --- End of Api.js ---
