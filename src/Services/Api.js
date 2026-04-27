import axios from 'axios';

/**
 * CONFIGURACIÓN DE AXIOS
 */
const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
  headers: { 'Content-Type': 'application/json' }
});

/**
 * INTERCEPTOR DE RESPUESTAS
 */
api.interceptors.response.use(
  (res) => res.data, 
  (err) => {
    const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error de servidor";
    return Promise.reject(new Error(errorMessage));
  }
);

// --- SERVICIOS ---

export const DashboardService = {
  getStats: () => api.get('/dashboard'),
  getLatestOrders: () => api.get('/orders'),
};

export const OrderService = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  addItem: (orderId, itemData) => api.post(`/orders/${orderId}/items`, itemData),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
  updateItemStatus: (itemId, status) => api.put(`/orders/items/${itemId}/status`, { status }),
  updateItemQuantity: (itemId, cantidad) => api.put(`/orders/items/${itemId}/quantity`, { cantidad }),
  delete: (id) => api.delete(`/orders/${id}`),
  deleteItem: (itemId) => api.delete(`/orders/items/${itemId}`),
};

export const TableService = {
  getAll: () => api.get('/mesas'), 
  getWaiters: () => api.get('/meseros'),
  create: (data) => api.post('/mesas', data),
  update: (id, data) => api.put(`/mesas/${id}`, data),
  updateStatus: (id, status) => api.patch(`/mesas/${id}/estado`, { estado: status }),
  assignWaiter: (id, data) => api.patch(`/mesas/${id}/mesero`, { data }),
  checkout: (id, metodoPago) => api.post(`/mesas/${id}/checkout`, { metodo_pago: metodoPago }),
  delete: (id) => api.delete(`/mesas/${id}`),
};

export const MenuService = {
  getItems: (cat = '') => api.get(`/menu${cat ? `?categoria=${cat}` : ''}`),
  getCategories: () => api.get('/menu/categories'),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
};

export const ReservationService = {
  getAll: () => api.get('/reservations'),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
};

export const StaffService = {
  getAll: () => api.get('/staff'),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
  getAbsences: (id) => api.get(`/staff/${id}/ausencias`),
  addAbsence: (data) => api.post('/staff/ausencias', data),
  getSchedule: (params) => api.get('/staff/schedule', { params }),
};

export const SettingsService = {
  getSettings: () => api.get('/settings'),
  updateGeneral: (data) => api.put('/settings/general', data),
  updateNotifications: (data) => api.put('/settings/notifications', data),
  updateBranch: (data) => api.put('/settings/branch', data),
  updatePassword: (data) => api.put('/settings/password', data),
  createBackup: () => api.post('/settings/backup'),
};

export const SalesService = {
  getAll: (params) => api.get('/sales', { params }),
  getSummary: (params) => api.get('/sales/summary', { params }),
  getPaymentSummary: (params) => api.get('/sales/payment-summary', { params }),
  getTotal: () => api.get('/sales/total'),
  create: (data) => api.post('/sales', data),
  updateStatus: (id, status) => api.put(`/sales/${id}/status`, { status }),
  // NUEVO MÉTODO IMPLEMENTADO:
  getSaleByOrderId: (orderId) => api.get(`/sales/by-order/${orderId}`),
};

export const ReportsService = {
  getAll: (params) => api.get('/reports', { params }),
  getDaily: () => api.get('/reports/daily'),
  getMonthly: () => api.get('/reports/monthly'),
};

export const PaymentService = {
  create: (data) => api.post('/payments', data),
  getDetails: (ventaId) => api.get(`/payments/${ventaId}`),
};
