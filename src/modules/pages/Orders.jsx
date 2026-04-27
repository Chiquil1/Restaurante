import { useEffect, useState } from "react";
import { OrderService, TableService, MenuService, SalesService } from "../../Services/Api";
// CORRECCIÓN DE RUTA: Subimos dos niveles para llegar a src/components
import PaymentModal from "../../components/PaymentModal"; 
import {
  FiPlus, FiTrash2, FiCheckCircle, FiZap,
  FiPackage, FiAlertCircle, FiShoppingBag,
  FiMinus, FiPlus as FiPlusIcon, FiUser, FiMapPin,
  FiClock, FiDollarSign, FiEdit, FiX
} from "react-icons/fi";

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

  if (loading) return <div className="flex items-center justify-center h-64"><FiPackage className="h-6 w-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pedidos</h1>
          <p className="text-slate-500 text-sm">Selecciona platos del menú para crear órdenes rápidas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-md flex gap-2">
          <FiPlus /> Nuevo Pedido
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <FiAlertCircle /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><FiX /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900">Pedido #{order.id}</h3>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${order.estado === 'entregado' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {order.estado}
              </span>
            </div>
            <div className="space-y-2 mb-4 text-sm text-slate-600">
              <div className="flex items-center gap-2"><FiMapPin /> Mesa #{order.mesa_numero}</div>
              <div className="flex items-center gap-2"><FiUser /> {order.mesero_nombre}</div>
              <div className="flex items-center gap-2"><FiPackage /> {order.items_count} items</div>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">Total:</span>
              <span className="text-lg font-black text-emerald-600">{formatCurrency(order.total_calculado || order.total)}</span>
            </div>
            
            {order.estado === 'entregado' && (
              <button 
                onClick={() => handleCobrarCuenta(order.id)}
                disabled={actionLoading}
                className="mt-4 w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <FiDollarSign /> {actionLoading ? 'Buscando cuenta...' : 'Cobrar Cuenta'}
              </button>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-extrabold text-slate-800">Crear Pedido Sincronizado</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700"><FiX className="h-6 w-6" /></button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 p-6 border-r overflow-y-auto bg-slate-50/50">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Categoría de Platos</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-orange-400"
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
                      className="bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-all group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-orange-600">{item.nombre}</p>
                          <p className="text-xs text-slate-500">{item.descripcion}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-600">{formatCurrency(item.precio)}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{item.categoria}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-1/2 p-6 flex flex-col bg-white">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mesa</label>
                    <select value={orderForm.mesaId} onChange={e => setOrderForm({...orderForm, mesaId: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-400">
                      <option value="">Para llevar</option>
                      {mesas.map(m => <option key={m.id} value={m.id}>Mesa #{m.numero}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mesero</label>
                    <select value={orderForm.meseroId} onChange={e => setOrderForm({...orderForm, meseroId: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-400">
                      <option value="">Sin asignar</option>
                      {meseros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-6">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><FiShoppingBag /> Platos seleccionados</h4>
                  {orderForm.items.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 italic text-sm">Haz clic en los platos del menú para agregarlos</div>
                  ) : (
                    orderForm.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.nombre}</p>
                          <p className="text-xs text-slate-500">{item.cantidad} x {formatCurrency(item.precio_unitario)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700">{formatCurrency(item.subtotal)}</span>
                          <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:bg-red-100 p-1 rounded-lg transition"><FiTrash2 /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 font-medium">Total Pedido:</span>
                    <span className="text-2xl font-black text-emerald-600">{formatCurrency(getOrderTotal(orderForm.items))}</span>
                  </div>
                  <button
                    onClick={handleCreateOrder}
                    disabled={actionLoading || orderForm.items.length === 0}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200"
                  >
                    {actionLoading ? "Creando Pedido..." : "Confirmar y Enviar a Cocina"}
                  </button>
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
