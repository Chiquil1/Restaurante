// File: Orders.jsx
import { useEffect, useState } from "react";
import { OrderService, TableService, MenuService, SalesService } from "../../Services/Api";
import PaymentModal from "../../components/PaymentModal"; 
import {
  FiPlus, FiTrash2, FiCheckCircle, FiZap,
  FiPackage, FiAlertCircle, FiShoppingBag,
  FiMinus, FiPlus as FiPlusIcon, FiUser, FiMapPin,
  FiClock, FiDollarSign, FiEdit, FiX
} from "react-icons/fi";

// --- Componentes Inline (Para mantener este archivo autocontenido, 
// pero idealmente estarían en tu carpeta components) ---

const GlassCard = ({ children, className = "", gradient = null }) => (
  <div className={`
    relative overflow-hidden 
    bg-slate-800/40 backdrop-blur-xl 
    border border-white/10 
    rounded-3xl 
    transition-all duration-300 
    hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl
    ${className}
  `}>
    {gradient && (
      <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${gradient} opacity-20 blur-3xl rounded-full`} />
    )}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

const GlassButton = ({ children, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30",
    secondary: "bg-white/10 text-white border border-white/10 hover:bg-white/20",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30",
  };
  
  return (
    <button 
      className={`
        font-bold py-3 px-6 rounded-2xl 
        hover:scale-105 active:scale-95 
        transition-all duration-300 flex items-center justify-center gap-2
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [meseros, setMeseros] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('todas');

  // Estados para el proceso de cobro
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const [orderForm, setOrderForm] = useState({
    mesaId: "",
    meseroId: "",
    items: [],
    prioridad: "normal"
  });

  const formatCurrency = (amount) => `$${Number(amount).toFixed(2)}`;

  const getOrderTotal = (items) => {
    return items.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersData, mesasData, meserosData, menuData, categoriesData] = await Promise.all([
        OrderService.getAll(),
        TableService.getAll(),
        TableService.getWaiters(),
        MenuService.getItems(),
        MenuService.getCategories()
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData : (ordersData?.orders || []));
      setMesas(Array.isArray(mesasData) ? mesasData : (mesasData?.mesas || []));
      setMeseros(Array.isArray(meserosData) ? meserosData : (meserosData?.meseros || []));
      setMenuItems(Array.isArray(menuData) ? menuData : []);
      setMenuCategories(Array.isArray(categoriesData) ? categoriesData.map(c => c.categoria) : []);

    } catch (err) {
      console.error("❌ LOAD DATA ERROR:", err);
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItemFromMenu = (item) => {
    const existingItemIndex = orderForm.items.findIndex(i => i.menu_item_id === item.id);

    if (existingItemIndex > -1) {
      const newItems = [...orderForm.items];
      newItems[existingItemIndex].cantidad += 1;
      newItems[existingItemIndex].subtotal = newItems[existingItemIndex].cantidad * item.precio;
      setOrderForm(prev => ({ ...prev, items: newItems }));
    } else {
      const newItem = {
        menu_item_id: item.id,
        nombre: item.nombre,
        precio_unitario: item.precio,
        cantidad: 1,
        subtotal: item.precio,
        notas: ""
      };
      setOrderForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
  };

  const handleRemoveItem = (index) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleCreateOrder = async () => {
    if (orderForm.items.length === 0) {
      setError("Debe seleccionar al menos un plato del menú");
      return;
    }
    try {
      setActionLoading(true);
      await OrderService.create({
        mesaId: orderForm.mesaId || null,
        meseroId: orderForm.meseroId || null,
        items: orderForm.items,
        estado: 'pendiente',
        prioridad: orderForm.prioridad
      });
      setOrderForm({ mesaId: "", meseroId: "", items: [], prioridad: "normal" });
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // LÓGICA PARA COBRAR CUENTA
  const handleCobrarCuenta = async (orderId) => {
    try {
      setActionLoading(true);
      setError(null);
      const response = await SalesService.getSaleByOrderId(orderId);
      
      if (response.success) {
        setSelectedSale(response.data);
        setIsPaymentModalOpen(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMenuItems = selectedCategory === 'todas'
    ? menuItems
    : menuItems.filter(item => item.categoria === selectedCategory);

  // Estilos reutilizables para inputs en modo oscuro
  const inputStyle = "w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all";
  const labelStyle = "block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider";

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <FiPackage className="h-12 w-12 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-8 font-sans">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Pedidos</h1>
          <p className="text-slate-400 mt-2 text-lg">Gestión de comandas en tiempo real</p>
        </div>
        <GlassButton onClick={() => setShowForm(true)} variant="primary">
          <FiPlus /> Nuevo Pedido
        </GlassButton>
      </div>

      {/* Error Alert */}
      {error && (
        <GlassCard className="mb-6 border-red-500/30 bg-red-900/20">
          <div className="p-4 flex items-center gap-3 text-red-200">
            <FiAlertCircle className="text-red-500" /> 
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto hover:text-white"><FiX /></button>
          </div>
        </GlassCard>
      )}

      {/* Grid de Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (
          <GlassCard key={order.id} className="p-6 flex flex-col h-full" gradient="from-orange-500 to-amber-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Pedido #{order.id}</h3>
                <span className="text-xs text-slate-400 font-mono mt-1 block">
                  {new Date(order.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <span className={`
                px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border
                ${order.estado === 'entregado' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}
              `}>
                {order.estado}
              </span>
            </div>

            <div className="space-y-3 mb-6 text-sm text-slate-300 flex-1">
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                <FiMapPin className="text-orange-400" /> 
                <span>Mesa #{order.mesa_numero || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                <FiUser className="text-blue-400" /> 
                <span>{order.mesero_nombre || 'Sin asignar'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                <FiPackage className="text-purple-400" /> 
                <span>{order.items_count} items</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-400">Total:</span>
              <span className="text-2xl font-black text-emerald-400 drop-shadow-md">
                {formatCurrency(order.total_calculado || order.total)}
              </span>
            </div>
            
            {order.estado === 'entregado' && (
              <GlassButton 
                onClick={() => handleCobrarCuenta(order.id)}
                disabled={actionLoading}
                variant="success"
                className="w-full text-sm py-2"
              >
                <FiDollarSign /> {actionLoading ? 'Procesando...' : 'Cobrar Cuenta'}
              </GlassButton>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Modal de Creación */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-800/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col relative">
            
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Crear Pedido</h2>
                <p className="text-slate-400 text-sm">Selecciona productos y asigna mesa</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Columna Izquierda: Menú */}
              <div className="w-1/2 p-6 border-r border-white/10 overflow-y-auto bg-slate-900/30 custom-scrollbar">
                <div className="mb-6 sticky top-0 z-10 bg-[#0f172a]/90 backdrop-blur pb-4">
                  <label className={labelStyle}>Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="todas">Todas las categorías</option>
                    {menuCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredMenuItems.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleAddItemFromMenu(item)}
                      className="group bg-slate-800/50 hover:bg-slate-700/80 p-4 rounded-2xl border border-white/5 hover:border-orange-500/50 cursor-pointer transition-all duration-200 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-200 group-hover:text-white transition-colors">{item.nombre}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.descripcion}</p>
                      </div>
                      <div className="text-right pl-4">
                        <p className="font-black text-emerald-400">{formatCurrency(item.precio)}</p>
                        <p className="text-[10px] text-slate-500 uppercase bg-slate-900/50 inline-block px-2 py-0.5 rounded mt-1">{item.categoria}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna Derecha: Resumen y Formulario */}
              <div className="w-1/2 p-8 flex flex-col bg-slate-800/20">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={labelStyle}>Mesa</label>
                    <select value={orderForm.mesaId} onChange={e => setOrderForm({...orderForm, mesaId: e.target.value})} className={inputStyle}>
                      <option value="">Para llevar</option>
                      {mesas.map(m => <option key={m.id} value={m.id}>Mesa #{m.numero}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Mesero</label>
                    <select value={orderForm.meseroId} onChange={e => setOrderForm({...orderForm, meseroId: e.target.value})} className={inputStyle}>
                      <option value="">Sin asignar</option>
                      {meseros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
                  <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                    <FiShoppingBag className="text-orange-500" /> Platos seleccionados
                  </h4>
                  {orderForm.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                      <FiShoppingBag className="h-16 w-16 mb-2" />
                      <p className="text-sm">El pedido está vacío</p>
                    </div>
                  ) : (
                    orderForm.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{item.nombre}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.cantidad} x {formatCurrency(item.precio_unitario)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-white">{formatCurrency(item.subtotal)}</span>
                          <button 
                            onClick={() => handleRemoveItem(index)} 
                            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-6 border-t border-white/10 bg-slate-900/50 -mx-8 -mb-8 p-8 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-400 font-medium">Total Estimado:</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                      {formatCurrency(getOrderTotal(orderForm.items))}
                    </span>
                  </div>
                  <GlassButton
                    onClick={handleCreateOrder}
                    disabled={actionLoading || orderForm.items.length === 0}
                    variant="primary"
                    className="w-full py-4 text-lg"
                  >
                    {actionLoading ? (
                      <span className="flex items-center gap-2"><FiZap className="animate-spin"/> Procesando...</span>
                    ) : (
                      "Confirmar y Enviar a Cocina"
                    )}
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <PaymentModal 
          sale={selectedSale} 
          onClose={() => setIsPaymentModalOpen(false)} 
          onPaymentSuccess={() => {
            setIsPaymentModalOpen(false);
            loadData();
          }} 
        />
      )}
    </div>
  );
}
