import { useEffect, useState } from "react";
import { SalesService } from "../../Services/Api";
import PaymentModal from "../../components/PaymentModal";
; // Asegúrate de que la ruta sea correcta
import { 
  FiDollarSign, FiShoppingBag, FiTrendingUp, 
  FiCalendar, FiFilter, FiCreditCard, FiEye 
} from "react-icons/fi";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ ingresos_totales: 0, total_pedidos: 0, ticket_promedio: 0 });
  const [paymentStats, setPaymentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADO PARA EL MODAL DE PAGOS
  const [paymentSale, setPaymentSale] = useState(null);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const formatCurrency = (amount) => `$${Number(amount).toFixed(2)}`;

  const loadData = async () => {
    try {
      setLoading(true);
      const params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
      
      const [salesData, summaryData, paymentsData] = await Promise.all([
        SalesService.getAll(params),
        SalesService.getSummary(params),
        SalesService.getPaymentSummary(params)
      ]);

      setSales(salesData);
      setSummary(summaryData);
      setPaymentStats(paymentsData);
    } catch (err) {
      console.error("Error loading sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <FiTrendingUp className="h-6 w-6 animate-spin mr-2" />
        Cargando reportes financieros...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ventas</h1>
          <p className="text-slate-500 mt-1 text-sm">Análisis de ingresos y gestión de cobranza</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
            <FiCalendar className="text-orange-500" />
            Rango de fechas:
          </div>
          <input 
            type="date" 
            className="text-sm border-none focus:ring-0 font-semibold"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <span className="text-slate-400">a</span>
          <input 
            type="date" 
            className="text-sm border-none focus:ring-0 font-semibold"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <FiDollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase">Ingresos Totales</p>
              <h3 className="text-2xl font-black text-slate-900">{formatCurrency(summary.ingresos_totales || 0)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <FiShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase">Pedidos Completados</p>
              <h3 className="text-2xl font-black text-slate-900">{summary.total_pedidos || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
              <FiTrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase">Ticket Promedio</p>
              <h3 className="text-2xl font-black text-slate-900">{formatCurrency(summary.ticket_promedio || 0)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sales Table */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Historial Detallado y Cobros</h3>
            <button className="text-slate-400 hover:text-slate-600 transition">
              <FiFilter />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="text-slate-500 text-xs uppercase font-bold">
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Mesa/Mesero</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Saldo Pendiente</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(sale.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-800">Mesa #{sale.mesa_numero || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{sale.personal_nombre || 'Sin asignar'}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${sale.saldo_pendiente > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {formatCurrency(sale.saldo_pendiente || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                        sale.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' : 
                        sale.estado === 'parcial' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sale.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button 
                        onClick={() => setPaymentSale(sale)} 
                        className="p-2 bg-orange-50 text-orange-500 hover:bg-orange-100 rounded-lg transition-all shadow-sm"
                        title="Gestionar Pagos"
                      >
                        <FiCreditCard className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition">
                        <FiEye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 italic">
                      No se encontraron ventas en este periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FiCreditCard className="text-orange-500" />
            Métodos de Pago
          </h3>
          <div className="space-y-4">
            {paymentStats.map((pay) => (
              <div key={pay.metodo_pago} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-600 capitalize">{pay.metodo_pago}</span>
                  <span className="text-xs font-bold text-slate-400">{pay.cantidad} ventas</span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {formatCurrency(pay.total)}
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3">
                  <div 
                    className="bg-orange-500 h-1.5 rounded-full" 
                    style={{ width: `${(pay.total / summary.ingresos_totales) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {paymentStats.length === 0 && (
              <p className="text-slate-400 text-sm italic text-center">Sin datos de pagos</p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE PAGOS */}
      {paymentSale && (
        <PaymentModal 
          sale={paymentSale} 
          onClose={() => setPaymentSale(null)} 
          onPaymentSuccess={() => {
            loadData(); // Recargar datos para actualizar saldos y estados
            setPaymentSale(null);
          }} 
        />
      )}
    </div>
  );
}
