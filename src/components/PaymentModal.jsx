import { useState, useEffect } from 'react';
import { PaymentService } from "../Services/Api";
import { FiX, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';

// --- Clases Reutilizables (Basadas en tu guía) ---
const glassCardBase = "bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl";
const inputField = "w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all";
const labelStyle = "block text-xs font-black text-slate-400 uppercase tracking-wider mb-2";

export default function PaymentModal({ sale, onClose, onPaymentSuccess }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('efectivo');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Corregido: useEffect para cargar historial
  useEffect(() => { 
    loadHistory(); 
  }, []);

  const loadHistory = async () => {
    try {
      const data = await PaymentService.getDetails(sale.id);
      setHistory(data.pagos || data.payments || []);
    } catch (error) {
      console.error("Error cargando historial", error);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay con Blur */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className={`
        relative w-full max-w-4xl 
        ${glassCardBase} 
        shadow-2xl shadow-black/50
        animate-in fade-in zoom-in duration-300
        flex flex-col md:flex-row overflow-hidden
      `}>
        
        {/* Decoración de fondo (Glow effect) */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        {/* SECCIÓN IZQUIERDA: Formulario */}
        <div className="relative z-10 p-8 w-full md:w-1/2 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-center">
          
          {/* Header del Modal */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Registrar Pago</h3>
              <p className="text-slate-400 text-sm mt-1">Venta #{sale.id}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Tarjeta de Saldo Pendiente (Estilo Glass) */}
          <div className="mb-8 p-5 bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/20 blur-xl rounded-full -mr-10 -mt-10 transition-all group-hover:bg-orange-500/30" />
            <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1 relative z-10">Saldo Pendiente</p>
            <p className="text-4xl font-black text-white relative z-10 drop-shadow-lg">
              ${(sale.saldo_pendiente || sale.total).toFixed(2)}
            </p>
          </div>

          <form onSubmit={handlePayment} className="space-y-5 relative z-10">
            <div>
              <label className={labelStyle}>Monto a Pagar</label>
              <div className="relative">
                <FiDollarSign className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="number" step="0.01" required 
                  className={inputField}
                  value={amount} onChange={e => setAmount(e.target.value)} 
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Método de Pago</label>
              <div className="relative">
                <select 
                  className={`${inputField} appearance-none cursor-pointer`}
                  value={method} onChange={e => setMethod(e.target.value)}
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta de Crédito/Débito</option>
                  <option value="transferencia">🏦 Transferencia Bancaria</option>
                  <option value="otro">📦 Otro</option>
                </select>
                {/* Flecha personalizada para el select */}
                <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Notas (Opcional)</label>
              <textarea 
                className={inputField}
                value={notes} onChange={e => setNotes(e.target.value)} rows="2"
                placeholder="Ej: Pago parcial, cambio no disponible..."
              />
            </div>

            <button 
              disabled={loading}
              className={`
                w-full mt-4 py-4 rounded-2xl font-black text-white tracking-wide uppercase
                bg-gradient-to-r from-orange-500 to-amber-500 
                shadow-lg shadow-orange-500/30
                hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : 'Confirmar Pago'}
            </button>
          </form>
        </div>

        {/* SECCIÓN DERECHA: Historial */}
        <div className="relative z-10 p-8 w-full md:w-1/2 bg-slate-900/20 flex flex-col">
          <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <FiClock className="text-orange-500" /> Historial de Movimientos
          </h4>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <FiDollarSign className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm">Aún no hay pagos registrados</p>
              </div>
            ) : (
              history.map((p, index) => (
                <div 
                  key={p.id} 
                  className={`
                    group p-4 rounded-2xl border border-white/5 
                    bg-white/5 hover:bg-white/10 hover:border-white/20
                    transition-all duration-300 flex justify-between items-center
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${p.metodo_pago === 'efectivo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}
                    `}>
                      {p.metodo_pago === 'efectivo' ? '💵' : '💳'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200 capitalize">{p.metodo_pago}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{new Date(p.fecha).toLocaleDateString()} • {new Date(p.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-emerald-400 text-lg">+${p.monto}</span>
                    {p.notas && <span className="text-[10px] text-slate-500 truncate max-w-[100px] block">{p.notas}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
