import { useState } from 'react';
import { PaymentService } from "../Services/Api";
import { FiX, FiDollarSign, FiClock } from 'react-icons/fi';

export default function PaymentModal({ sale, onClose, onPaymentSuccess }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('efectivo');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    const data = await PaymentService.getDetails(sale.id);
    setHistory(data.payments);
  };

  useState(() => { loadHistory(); }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await PaymentService.create({
        venta_id: sale.id,
        monto: parseFloat(amount),
        metodo_pago: method,
        notas: notes,
        usuario_id: 1 // Debería venir del context de auth
      });
      onPaymentSuccess();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Gestionar Pago: Venta #{sale.id}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FiX className="h-6 w-6" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Formulario de Pago */}
          <div className="p-6 border-r border-slate-100">
            <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-xs font-bold text-orange-600 uppercase mb-1">Saldo Pendiente</p>
              <p className="text-3xl font-black text-orange-700">${sale.saldo_pendiente || sale.total}</p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Monto a Pagar</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="number" step="0.01" required 
                    className="w-full pl-9 pr-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                    value={amount} onChange={e => setAmount(e.target.value)} 
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Método de Pago</label>
                <select 
                  className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                  value={method} onChange={e => setMethod(e.target.value)}
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="otro">📦 Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notas</label>
                <textarea 
                  className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                  value={notes} onChange={e => setNotes(e.target.value)} rows="2"
                />
              </div>

              <button 
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200"
              >
                {loading ? 'Procesando...' : 'Registrar Abono'}
              </button>
            </form>
          </div>

          {/* Historial de Pagos */}
          <div className="p-6 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
              <FiClock /> Historial de Pagos
            </h4>
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No hay pagos registrados</p>
              ) : (
                history.map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{p.metodo_pago}</p>
                      <p className="text-[10px] text-slate-400">{new Date(p.fecha).toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-emerald-600">${p.monto}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
