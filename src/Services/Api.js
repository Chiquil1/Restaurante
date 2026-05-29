// --- File: src/Api.js ---
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
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

export const unwrap = (payload, fallback = null) => {
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data ?? fallback;
  return payload ?? fallback;
};

export const unwrapArray = (payload) => {
  const data = unwrap(payload, []);
  return Array.isArray(data) ? data : [];
};

export const unwrapObject = (payload, fallback = {}) => {
  const data = unwrap(payload, fallback);
  return data && typeof data === 'object' && !Array.isArray(data) ? data : fallback;
};

export const getErrorMessage = (error, fallback = 'Ocurrió un error') => {
  const payload = error?.response?.data;
  const apiError = payload?.error;

  if (typeof apiError === 'string') return apiError;
  if (apiError?.message) return apiError.message;
  if (payload?.message) return payload.message;
  if (error?.message) return error.message;

  return fallback;
};

const paramsFromArgs = (startDate, endDate) => {
  if (startDate && typeof startDate === 'object') return startDate;
  return { startDate, endDate };
};

// ── Dashboard ──
export const DashboardService = {
  getSummary: () => api.get('/dashboard').then((res) => unwrapObject(res.data)),
  getVentasHoy: () => api.get('/dashboard/ventas-hoy').then((res) => unwrap(res.data, 0)),
  getClientesHoy: () => api.get('/dashboard/clientes-hoy').then((res) => unwrap(res.data, 0)),
  getPedidosActivos: () => api.get('/dashboard/pedidos-activos').then((res) => unwrap(res.data, 0)),
  getMesasOcupadas: () => api.get('/dashboard/mesas-ocupadas').then((res) => unwrap(res.data, 0)),
  getTotalMesas: () => api.get('/dashboard/total-mesas').then((res) => unwrap(res.data, 0)),
};

// ── Menú ──
export const MenuService = {
  getAll: (filters) => api.get('/menu', { params: filters }).then((res) => unwrapArray(res.data)),
  getCategories: () => api.get('/menu/categories').then((res) => unwrapArray(res.data)),
  getById: (id) => api.get(`/menu/${id}`).then((res) => unwrapObject(res.data)),
  create: (data) => api.post('/menu', data).then((res) => unwrap(res.data)),
  update: (id, data) => api.put(`/menu/${id}`, data).then((res) => unwrap(res.data)),
  delete: (id) => api.delete(`/menu/${id}`).then((res) => unwrap(res.data)),
};

// ── Mesas ──
export const TableService = {
  getAll: () => api.get('/tables').then((res) => unwrapArray(res.data)),
  getWaiters: () => api.get('/tables/waiters').then((res) => unwrapArray(res.data)),
  getById: (id) => api.get(`/tables/${id}`).then((res) => unwrapObject(res.data)),
  create: (data) => api.post('/tables', data).then((res) => unwrap(res.data)),
  update: (id, data) => api.put(`/tables/${id}`, data).then((res) => unwrap(res.data)),
  delete: (id) => api.delete(`/tables/${id}`).then((res) => unwrap(res.data)),
};

// ── Pedidos (Orders) ──
export const OrderService = {
  getAll: () => api.get('/orders').then((res) => unwrapArray(res.data)),
  getById: (id) => api.get(`/orders/${id}`).then((res) => unwrapObject(res.data)),
  create: (data) => api.post('/orders', data).then((res) => unwrap(res.data)),
  createWithItems: (orderData, items) => api.post('/orders/create-with-items', { order: orderData, items }).then((res) => unwrap(res.data)),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { estado: status }).then((res) => unwrap(res.data)),
  delete: (id) => api.delete(`/orders/${id}`).then((res) => unwrap(res.data)),
};

// ── Items de Pedido ──
export const OrderItemService = {
  getByOrder: (orderId) => api.get(`/orderitems/order/${orderId}`).then((res) => unwrapArray(res.data)),
  create: (data) => api.post('/orderitems', data).then((res) => unwrap(res.data)),
  updateStatus: (id, status) => api.put(`/orderitems/${id}/status`, { status }).then((res) => unwrap(res.data)),
  updateQuantity: (id, cantidad) => api.put(`/orderitems/${id}/quantity`, { cantidad }).then((res) => unwrap(res.data)),
  delete: (id) => api.delete(`/orderitems/${id}`).then((res) => unwrap(res.data)),
};

// ── Reservaciones ──
export const ReservationService = {
  getAll: (params) => api.get('/reservations', { params }).then((res) => unwrapArray(res.data)),
  getById: (id) => api.get(`/reservations/${id}`).then((res) => unwrapObject(res.data)),
  create: (data) => api.post('/reservations', data).then((res) => unwrap(res.data)),
  update: (id, data) => api.put(`/reservations/${id}`, data).then((res) => unwrap(res.data)),
  delete: (id) => api.delete(`/reservations/${id}`).then((res) => unwrap(res.data)),
};



// ── Ventas ──
export const SalesService = {
  getAll: (startDate, endDate) => api.get('/sales', { params: paramsFromArgs(startDate, endDate) }).then((res) => unwrapArray(res.data)),
  getById: (id) => api.get(`/sales/${id}`).then((res) => unwrapObject(res.data)),
  getSummary: (startDate, endDate) => api.get('/sales/summary', { params: paramsFromArgs(startDate, endDate) }).then((res) => unwrapObject(res.data)),
  getPaymentSummary: (startDate, endDate) => api.get('/sales/payment-summary', { params: paramsFromArgs(startDate, endDate) }).then((res) => unwrapArray(res.data)),
  getTotal: (startDate, endDate) => api.get('/sales/total', { params: paramsFromArgs(startDate, endDate) }).then((res) => unwrapObject(res.data)),
  create: (data) => api.post('/sales', data).then((res) => unwrap(res.data)),
  updateStatus: (id, status) => api.put(`/sales/${id}/status`, { status }).then((res) => unwrap(res.data)),
};

// ── Pagos ──
export const PaymentService = {
  getBySale: (venta_id) => api.get(`/payments/sale/${venta_id}`).then((res) => unwrapArray(res.data)),
  getDetails: (venta_id) => api.get(`/payments/sale/${venta_id}/balance`).then((res) => unwrapObject(res.data)),
  create: (data) => api.post('/payments', data).then((res) => unwrap(res.data)),
  getSaleBalance: (venta_id) => api.get(`/payments/sale/${venta_id}/balance`).then((res) => unwrapObject(res.data)),
};

// ── Personal (Staff) ──
export const StaffService = {
  getAll: () => api.get('/staff').then((res) => unwrapArray(res.data)),
  getById: (id) => api.get(`/staff/${id}`).then((res) => unwrapObject(res.data)),
  create: (data) => api.post('/staff', data).then((res) => unwrap(res.data)),
  update: (id, data) => api.put(`/staff/${id}`, data).then((res) => unwrap(res.data)),
  delete: (id) => api.delete(`/staff/${id}`).then((res) => unwrap(res.data)),
  getAusencias: () => api.get('/staff/ausencias').then((res) => unwrapArray(res.data)),
  createAusencia: (data) => api.post('/staff/ausencias', data).then((res) => unwrap(res.data)),
};

// ── Reportes ──
export const ReportsService = {
  getSalesReport: (dateFrom, dateTo) => api.get('/reports/sales', { params: { dateFrom, dateTo } }).then((res) => unwrap(res.data)),
  getReservationsReport: (dateFrom, dateTo) => api.get('/reports/reservations', { params: { dateFrom, dateTo } }).then((res) => unwrap(res.data)),
  getOccupancyReport: () => api.get('/reports/occupancy').then((res) => unwrap(res.data)),
  getMenuPopularity: (dateFrom, dateTo) => api.get('/reports/menu-popularity', { params: { dateFrom, dateTo } }).then((res) => unwrap(res.data)),
  getStaffPerformance: (dateFrom, dateTo) => api.get('/reports/staff-performance', { params: { dateFrom, dateTo } }).then((res) => unwrap(res.data)),
};

// ── Configuración (Settings) ──
export const SettingsService = {
  getGeneral: () => api.get('/settings/general').then((res) => unwrapObject(res.data)),
  updateGeneral: (data) => api.put('/settings/general', data).then((res) => unwrap(res.data)),
  getBranch: () => api.get('/settings/branch').then((res) => unwrapObject(res.data)),
  updateBranch: (data) => api.put('/settings/branch', data).then((res) => unwrap(res.data)),
  createBackup: (sucursalId) => api.post('/settings/backup', { sucursalId }).then((res) => unwrap(res.data)),
};

export default api;
// --- End of Api.js ---
