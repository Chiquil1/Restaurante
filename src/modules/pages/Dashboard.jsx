import { useEffect, useState } from "react";
import {
  BanknotesIcon,
  UsersIcon,
  ShoppingBagIcon,
  TableCellsIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

// Importación de componentes obligatorios
import GlassCard from "../../components/GlassCard";
import GlassButton from "../../components/GlassButton";

const API = "/api";

// --- Componente de Tarjeta de Estadística (Ahora basado en GlassCard) ---
const StatCard = ({ name, value, icon: Icon, color, subtext, progress }) => (
  <GlassCard className={`group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${color.shadow}`}>
    {/* Fondo decorativo brillante */}
    <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${color.bg} opacity-20 blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-30 pointer-events-none`} />
    
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${color.bg} text-white shadow-lg ring-1 ring-white/10`}>
          <Icon className="h-6 w-6" />
        </div>
        {subtext && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            +{subtext}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-400 tracking-wide">{name}</p>
        <h3 className="text-3xl font-black text-white mt-1 tracking-tight">{value}</h3>
        
        {/* Barra de progreso para Mesas */}
        {progress !== undefined && (
          <div className="mt-3 w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  </GlassCard>
);

function Dashboard() {
  const [stats, setStats] = useState({
    ventasHoy: 0,
    clientesHoy: 0,
    pedidosActivos: 0,
    mesasOcupadas: 0,
    totalMesas: 0
  });

  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      await new Promise(r => setTimeout(r, 600));
      const resStats = await fetch(`${API}/dashboard`);
      if (!resStats.ok) throw new Error("Error stats");
      const dataStats = await resStats.json();
      setStats(dataStats);

      const resOrders = await fetch(`${API}/orders`);
      if (resOrders.ok) {
        const ordersResponse = await resOrders.json();
        const ordersList = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse.orders || [];
        setUltimosPedidos(ordersList.slice(0, 5));
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const ocupacionPorcentaje = stats.totalMesas > 0 
    ? Math.round((stats.mesasOcupadas / stats.totalMesas) * 100) 
    : 0;

  const statCards = [
    { 
      name: 'Ventas del Día', 
      value: formatCurrency(stats.ventasHoy), 
      icon: BanknotesIcon, 
      color: { bg: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' },
      subtext: 12
    },
    { 
      name: 'Clientes Hoy', 
      value: stats.clientesHoy, 
      icon: UsersIcon, 
      color: { bg: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
      subtext: 5
    },
    { 
      name: 'Pedidos Activos', 
      value: stats.pedidosActivos, 
      icon: ShoppingBagIcon, 
      color: { bg: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' }
    },
    { 
      name: 'Ocupación Mesas', 
      value: `${stats.mesasOcupadas} / ${stats.totalMesas}`, 
      icon: TableCellsIcon, 
      color: { bg: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
      progress: ocupacionPorcentaje
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-8 font-sans selection:bg-orange-500/30">
      
      {/* Header */}
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="animate-fade-in-down">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Panel de Control
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base max-w-lg">
            Resumen en tiempo real del rendimiento de tu restaurante.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Sistema en Vivo
          </span>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((item, idx) => (
          <StatCard key={idx} {...item} />
        ))}
      </div>

      {/* Sección Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Pedidos Recientes */}
        <GlassCard className="lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <ClockIcon className="h-5 w-5 text-orange-500" />
              </div>
              Actividad Reciente
            </h3>
            <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
              Ver historial completo 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
            {ultimosPedidos.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No hay pedidos recientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ultimosPedidos.map((order, i) => (
                  <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 transition-all border border-white/5 hover:border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                        <span className="text-slate-300 font-bold text-xs">#{order.id}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Mesa {order.mesa_numero || 'Piso'}</p>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                           {order.mesero_nombre || 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-mono text-slate-400">
                          {new Date(order.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter border ${
                        order.estado === 'completado' || order.estado === 'pagado'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {order.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Panel de Rendimiento */}
        <GlassCard className="relative overflow-hidden flex flex-col justify-between border-orange-500/20">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-white mb-1">Resumen de Ventas</h3>
                <p className="text-slate-400 text-sm opacity-90">Últimos 7 días</p>
              </div>
              <div className="bg-orange-500/20 p-2 rounded-lg backdrop-blur-sm border border-orange-500/30">
                <ArrowTrendingUpIcon className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-4xl font-black text-white mb-2">{formatCurrency(stats.ventasHoy)}</p>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
                <CheckCircleIcon className="h-4 w-4" />
                <span>Objetivo diario cumplido</span>
              </div>
            </div>

            {/* Gráfico de Barras */}
            <div className="h-40 flex items-end justify-between gap-2 mb-6">
                {[35, 55, 40, 70, 60, 85, 100].map((h, i) => (
                    <div key={i} className="w-full flex flex-col justify-end group">
                        <div 
                          style={{height: `${h}%`}} 
                          className="w-full bg-orange-500/30 rounded-t-md group-hover:bg-orange-500/50 transition-all duration-300 relative overflow-hidden border-t border-orange-500/50"
                        >
                          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-orange-600/20 to-transparent" />
                        </div>
                        <span className="text-[10px] text-center mt-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
                        </span>
                    </div>
                ))}
            </div>

            <GlassButton variant="primary" className="w-full py-4 flex items-center justify-center gap-2">
              <span>Descargar Reporte PDF</span>
            </GlassButton>
          </div>
          
          {/* Decoración de fondo sutil */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        </GlassCard>

      </div>
    </div>
  );
}

export default Dashboard;
