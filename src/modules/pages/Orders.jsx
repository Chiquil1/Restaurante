import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PlusIcon, 
  TrashIcon, 
  XMarkIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// IMPORTACIONES OBLIGATORIAS
import GlassCard from "../../components/GlassCard";
import GlassButton from "../../components/GlassButton";
import { getErrorMessage } from "../../Services/Api";

const API_URL = '/api/orders';
const MENU_URL = '/api/menu';
const TABLES_URL = '/api/tables';

export default function OrdersPOS() {
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado para el formulario de checkout
  const [checkoutData, setCheckoutData] = useState({
    mesa_id: '',
    cliente: '',
    notas: ''
  });

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      setLoading(true);
      // Cargamos todo en paralelo
      const [menuRes, tablesRes, ordersRes] = await Promise.all([
        axios.get(MENU_URL).catch(() => ({ data: [] })),
        axios.get(TABLES_URL).catch(() => ({ data: [] })),
        axios.get(API_URL).catch(() => ({ data: [] }))
      ]);

      // Manejar estructura de respuesta { success, data, count, ... }
      const menuData = Array.isArray(menuRes.data) ? menuRes.data : (menuRes.data?.data || []);
      const tablesData = Array.isArray(tablesRes.data) ? tablesRes.data : (tablesRes.data?.data || []);
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.data || []);
      
      setMenuItems(menuData);
      setTables(tablesData);
      setOrders(ordersData);
    } catch (err) {
      console.error("Error cargando datos iniciales:", err);
      setError("No se pudieron cargar los datos del sistema.");
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica del Carrito ---
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.precio) * item.cantidad), 0);

  // --- Filtrado de Menú ---
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.categoria === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(menuItems.map(item => item.categoria))].filter(Boolean);

  // --- Crear Pedido ---
  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      setError("El carrito está vacío");
      return;
    }

    try {
      // 1. Preparar la orden cabecera
      const orderPayload = {
        mesa_id: checkoutData.mesa_id ? Number(checkoutData.mesa_id) : null,
        mesero_id: 1, // TODO: Obtener del usuario logueado
        total: cartTotal,
        estado: 'abierto',
        cliente: checkoutData.cliente || null
      };

      // 2. Preparar items de la orden
      const itemsPayload = cart.map(item => ({
        menu_item_id: item.id,
        nombre: item.nombre,
        precio_unitario: Number(item.precio),
        cantidad: item.cantidad,
        subtotal: Number(item.precio) * item.cantidad,
        estado: 'pendiente'
      }));

      // 3. Enviar orden + items en una sola solicitud
      const response = await axios.post(`${API_URL}/create-with-items`, {
        order: orderPayload,
        items: itemsPayload
      });

      console.log("✅ Orden creada exitosamente:", response.data);
      setSuccess("Pedido creado exitosamente");
      setCart([]);
      setShowCheckout(false);
      setCheckoutData({ mesa_id: '', cliente: '', notas: '' });
      
      // Recargar datos después de 500ms
      setTimeout(() => initData(), 500);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error creando pedido:", err);
      setError(getErrorMessage(err, "Error al crear el pedido. Revisa la consola."));
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-orange-500 font-bold text-xl animate-pulse">Cargando sistema...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-6 font-sans flex flex-col lg:flex-row gap-6">
      
      {/* --- COLUMNA IZQUIERDA: MENÚ --- */}
      <div className="flex-1 flex flex-col h-[calc(100vh-2rem)] overflow-hidden">
        {/* Header y Filtros */}
        <GlassCard className="p-4 mb-4 shrink-0 border-white/10">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 mb-4">
            Punto de Venta
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar plato..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              />
            </div>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-orange-500/50 outline-none cursor-pointer min-w-[150px]"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </GlassCard>

        {/* Grid de Productos */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div key={item.id} className="relative group">
                  <GlassCard 
                    className={`p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-orange-500/20 border-white/10 h-full flex flex-col ${!item.disponible ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-orange-500/50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                        {item.categoria}
                      </span>
                      {!item.disponible && <span className="text-[10px] font-bold text-red-400">Agotado</span>}
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{item.nombre}</h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2 h-8">{item.descripcion}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-lg font-black text-white">${Number(item.precio).toFixed(2)}</span>
                    </div>
                  </GlassCard>
                  
                  {item.disponible && (
                    <button 
                      onClick={() => addToCart(item)}
                      className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-orange-500/50 hover:scale-110 group-hover:scale-100"
                    >
                      <PlusIcon className="w-6 h-6" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-slate-500">
                No se encontraron productos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: CARRITO / PEDIDOS ACTIVOS --- */}
      <div className="w-full lg:w-96 flex flex-col gap-6 h-[calc(100vh-2rem)] overflow-hidden">
        
        {/* Carrito Actual */}
        <GlassCard className="flex-1 flex flex-col p-4 border-white/10 bg-slate-800/40 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBagIcon className="w-6 h-6 text-orange-500" />
              Orden Actual
            </h2>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-red-300">
                Limpiar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <ShoppingBagIcon className="w-16 h-16 mb-2" />
                <p className="text-sm">Carrito vacío</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white line-clamp-1">{item.nombre}</h4>
                    <p className="text-xs text-orange-400 font-medium">${Number(item.precio).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600">-</button>
                    <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600">+</button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-2 text-slate-500 hover:text-red-400">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white text-xl font-black">
              <span>Total</span>
              <span className="text-orange-500">${cartTotal.toFixed(2)}</span>
            </div>
            
            <GlassButton 
              onClick={() => setShowCheckout(true)} 
              disabled={cart.length === 0}
              variant="primary" 
              className="w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Procesar Pedido
            </GlassButton>
          </div>
        </GlassCard>

        {/* Lista rápida de pedidos recientes (Opcional visual) */}
        <GlassCard className="h-1/3 p-4 border-white/10 overflow-hidden flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Pedidos Recientes</h3>
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-900/30 border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">Mesa {order.mesa_id ? `#${order.mesa_id}` : 'Para llevar'}</p>
                  <p className="text-[10px] text-slate-500">{new Date(order.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                </div>
                <span className="text-xs font-bold text-emerald-400">${Number(order.total).toFixed(2)}</span>
              </div>
            ))}
            {orders.length === 0 && <p className="text-xs text-slate-600 text-center mt-4">Sin pedidos hoy</p>}
          </div>
        </GlassCard>
      </div>

      {/* --- MODAL DE CHECKOUT --- */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200 border-white/20">
            <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Finalizar Pedido</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Asignar Mesa (Opcional)</label>
                <select 
                  value={checkoutData.mesa_id}
                  onChange={(e) => setCheckoutData({...checkoutData, mesa_id: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
                >
                  <option value="">Para llevar / Sin mesa</option>
                  {tables.filter(t => t.estado === 'libre' || t.estado === 'ocupada').map(t => (
                    <option key={t.id} value={t.id}>Mesa #{t.numero} ({t.ubicacion})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Nombre Cliente (Opcional)</label>
                <input 
                  type="text" 
                  value={checkoutData.cliente}
                  onChange={(e) => setCheckoutData({...checkoutData, cliente: e.target.value})}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-400">Total a Pagar:</span>
                  <span className="text-3xl font-black text-orange-500">${cartTotal.toFixed(2)}</span>
                </div>

                <GlassButton onClick={handleCreateOrder} variant="primary" className="w-full py-4 text-lg shadow-lg shadow-orange-500/20">
                  <CheckCircleIcon className="w-6 h-6 mr-2" />
                  Confirmar y Enviar a Cocina
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Notificaciones Flotantes */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 backdrop-blur text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-400/30 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <XMarkIcon className="w-6 h-6" />
            <span className="font-bold">{error}</span>
          </div>
        </div>
      )}
      {success && (
        <div className="fixed bottom-4 right-4 bg-emerald-500/90 backdrop-blur text-white px-6 py-4 rounded-2xl shadow-2xl border border-emerald-400/30 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6" />
            <span className="font-bold">{success}</span>
          </div>
        </div>
      )}
    </div>
  );
}
