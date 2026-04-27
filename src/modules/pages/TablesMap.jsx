import { useState, useEffect, useCallback } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, CheckCircleIcon, ExclamationTriangleIcon, UserGroupIcon, XMarkIcon, MagnifyingGlassIcon, ArrowPathIcon, TableCellsIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { TableService, SalesService } from "../../Services/Api"; 

// =============================================================================
// 🎨 CONFIGURACIÓN UNIFICADA DE ESTADOS
// Sincronizado con el módulo de Reservas y la Base de Datos
// =============================================================================
const ESTADO_CONFIG = {
  libre:       { label: "Libre",       color: "bg-emerald-500",  border: "border-emerald-600", text: "text-white",      badge: "bg-emerald-100 text-emerald-800" },
  disponible:  { label: "Disponible", color: "bg-emerald-500",  border: "border-emerald-600", text: "text-white",      badge: "bg-emerald-100 text-emerald-800" },
  solicitada:  { label: "Solicitada",  color: "bg-cyan-500",     border: "border-cyan-600",    text: "text-white",      badge: "bg-cyan-100 text-cyan-800"       },
  confirmada:   { label: "Confirmada",  color: "bg-blue-600",     border: "border-blue-700",    text: "text-white",      badge: "bg-blue-100 text-blue-800"       },
  reservada:    { label: "Reservada",  color: "bg-blue-500",     border: "border-blue-600",    text: "text-white",      badge: "bg-blue-100 text-blue-800"       },
  ocupada:      { label: "Ocupada",    color: "bg-orange-500",   border: "border-orange-600",  text: "text-white",      badge: "bg-orange-100 text-orange-800"   },
  cuenta:       { label: "Pagando",    color: "bg-red-500",      border: "border-red-600",     text: "text-white",      badge: "bg-red-100 text-red-800"         },
};

const CAPACIDADES = [2, 4, 6, 8, 10, 12];
const ESTADOS = Object.keys(ESTADO_CONFIG);
const PISOS = [1, 2, 3];
const FORM_DEFAULTS = { numero: "", capacidad: 4, piso: 1, ubicacion: "", estado: "libre", mesero_id: "", cliente: "", total: 0 };

// --- Componentes Pequeños ---
function StatCard({ label, value, color = "text-slate-900" }) {
  return <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-1"><p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">{label}</p><p className={`text-3xl font-black ${color}`}>{value}</p></div>;
}

function Toast({ message }) {
  if (!message.text) return null;
  const isError = message.type === "error";
  return <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all ${isError ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>{isError ? <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" /> : <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />}{message.text}</div>;
}

function FilterBar({ active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={() => onChange("todas")} className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-widest transition ${active === "todas" ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400"}`}>Todas</button>
      {ESTADOS.map((e) => (<button key={e} onClick={() => onChange(e)} className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-widest transition ${active === e ? `${ESTADO_CONFIG[e].color} text-white` : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400"}`}>{ESTADO_CONFIG[e].label}</button>))}
    </div>
  );
}

function MesaCard({ mesa, onAction }) {
  const cfg = ESTADO_CONFIG[mesa.estado] || ESTADO_CONFIG.libre;

  return (
    <div
      className={`group relative rounded-3xl border-4 shadow-lg transition-all duration-300 overflow-hidden flex flex-col ${cfg.color} ${cfg.border} ${cfg.text}`}
      style={{ minHeight: "220px" }}
    >
      <div className="flex items-start justify-between p-4 pb-2">
        <div>
          <span className="text-4xl font-black leading-none">#{mesa.numero}</span>
          {mesa.piso && (
            <p className="text-[10px] font-bold uppercase opacity-70 mt-0.5">Piso {mesa.piso}</p>
          )}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">{cfg.label}</span>
      </div>

      <div className="px-4 flex items-center gap-1.5 opacity-80">
        <UserGroupIcon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-xs font-bold">Cap. {mesa.capacidad}</span>
        {mesa.ubicacion && <span className="text-xs opacity-70 ml-1">· {mesa.ubicacion}</span>}
      </div>

      <div className="mt-auto px-4 pb-3 pt-2 text-[11px] font-semibold opacity-85 space-y-0.5">
        {mesa.mesero && <div className="flex items-center gap-1">👤 {mesa.mesero}</div>}
        {mesa.cliente && <div className="flex items-center gap-1">🪑 {mesa.cliente}</div>}
      </div>

      {Number(mesa.total) > 0 && (
        <div className="absolute top-3 right-3 bg-white/25 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[11px] font-black">
          ${Number(mesa.total).toFixed(2)}
        </div>
      )}

      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-3xl">
        {mesa.estado === 'cuenta' && (
          <button onClick={() => onAction("checkout", mesa)} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-full shadow-xl transition" title="Finalizar Pago">
            <CheckCircleIcon className="h-4 w-4" />
          </button>
        )}
        {[
          { type: "status", icon: CheckCircleIcon, bg: "bg-slate-700 hover:bg-slate-900" },
          { type: "assign", icon: UserGroupIcon, bg: "bg-blue-600 hover:bg-blue-700" },
          { type: "edit", icon: PencilSquareIcon, bg: "bg-orange-500 hover:bg-orange-600" },
          { type: "delete", icon: TrashIcon, bg: "bg-red-600 hover:bg-red-700" },
        ].map(({ type, icon: Icon, bg }) => (
          <button key={type} onClick={() => onAction(type, mesa)} className={`${bg} text-white p-2.5 rounded-full shadow-xl transition`}><Icon className="h-4 w-4" /></button>
        ))}
      </div>
    </div>
  );
}

function Modal({ type, mesa, meseros, formData, onChange, onSave, onClose, loading }) {
  const titles = { add: "Agregar Nueva Mesa", edit: `Editar Mesa #${mesa?.numero}`, status: `Estado — Mesa #${mesa?.numero}`, assign: `Asignar Mesero — Mesa #${mesa?.numero}` };
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b bg-slate-50">
          <h2 className="text-lg font-extrabold text-slate-800">{titles[type]}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <div className="p-6 space-y-4">
          {(type === "add" || type === "edit") && (
            <>
              <div className="mb-4"><label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">Número de Mesa *</label><input type="text" value={formData.numero} onChange={(e) => onChange("numero", e.target.value)} className="input" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4"><label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">Capacidad *</label><select value={formData.capacidad} onChange={(e) => onChange("capacidad", e.target.value)} className="input">{CAPACIDADES.map(n => <option key={n} value={n}>{n} personas</option>)}</select></div>
                <div className="mb-4"><label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">Piso</label><select value={formData.piso} onChange={(e) => onChange("piso", e.target.value)} className="input">{PISOS.map(p => <option key={p} value={p}>Piso {p}</option>)}</select></div>
              </div>
              <div className="mb-4"><label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">Ubicación</label><input type="text" value={formData.ubicacion} onChange={(e) => onChange("ubicacion", e.target.value)} className="input" /></div>
            </>
          )}
          {type === "status" && (
            <div className="mb-4"><label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">Nuevo Estado</label><select value={formData.estado} onChange={(e) => onChange("estado", e.target.value)} className="input">{ESTADOS.map(e => <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>)}</select></div>
          )}
          {type === "assign" && (
            <>
              <div className="mb-4"><label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">Mesero</label><select value={formData.mesero_id} onChange={(e) => onChange("mesero_id", e.target.value)} className="input"><option value="">— Sin mesero —</option>{meseros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}</select></div>
              <div className="mb-4"><label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">Cliente / Reserva</label><input type="text" value={formData.cliente} onChange={(e) => onChange("cliente", e.target.value)} className="input" /></div>
              <div className="mb-4"><label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">Total acumulada ($)</label><input type="number" value={formData.total} onChange={(e) => onChange("total", e.target.value)} className="input" /></div>
            </>
          )}
        </div>
        <div className="flex gap-3 px-6 py-5 border-t bg-slate-50">
          <button onClick={onClose} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-xl transition">Cancelar</button>
          <button onClick={onSave} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-xl transition">{loading ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

export default function TablesMap() {
  const [mesas, setMesas] = useState([]);
  const [meseros, setMeseros] = useState([]);
  const [totalVentas, setTotalVentas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "" });
  const [filterStatus, setFilterStatus] = useState("todas");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState(FORM_DEFAULTS);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast({ type: "", text: "" }), 3500); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mesasData, meserosData, salesTotal] = await Promise.all([
        TableService.getAll(), 
        TableService.getWaiters(),
        SalesService.getTotal()
      ]);
      setMesas(Array.isArray(mesasData) ? mesasData : (mesasData.mesas || []));
      setMeseros(Array.isArray(meserosData) ? meserosData : (meserosData.meseros || []));
      setTotalVentas(Number(salesTotal?.total || 0));
    } catch (err) { showToast("error", `Error: ${err.message}`); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openModal = (type, mesa = null) => {
    const base = mesa ? { ...mesa, piso: mesa.piso ?? 1, ubicacion: mesa.ubicacion ?? "", estado: mesa.estado ?? "libre", mesero_id: mesa.mesero_id ?? "", cliente: mesa.cliente ?? "", total: mesa.total ?? 0 } : FORM_DEFAULTS;
    setFormData(base);
    setModal({ type, mesa });
  };

  const handleFormChange = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!formData.numero && (modal.type === "add" || modal.type === "edit")) return showToast("error", "Número obligatorio");
    setSaving(true);
    try {
      if (modal.type === "add") {
        const created = await TableService.create(formData);
        setMesas([...mesas, created]);
        showToast("success", "Mesa creada");
      } else if (modal.type === "edit") {
        const updated = await TableService.update(modal.mesa.id, formData);
        setMesas(mesas.map(m => m.id === updated.id ? updated : m));
        showToast("success", "Mesa actualizada");
      } else if (modal.type === "status") {
        const updated = await TableService.updateStatus(modal.mesa.id, formData.estado);
        setMesas(mesas.map(m => m.id === updated.id ? updated : m));
        showToast("success", "Estado actualizado");
      } else if (modal.type === "assign") {
        const updated = await TableService.assignWaiter(modal.mesa.id, formData);
        setMesas(mesas.map(m => m.id === updated.id ? updated : m));
        showToast("success", "Mesero asignado");
      }
      setModal(null);
    } catch (err) { showToast("error", err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (mesa) => {
    if (!window.confirm(`¿Eliminar mesa #${mesa.numero}?`)) return;
    setSaving(true);
    try { await TableService.delete(mesa.id); setMesas(mesas.filter(m => m.id !== mesa.id)); showToast("success", "Mesa eliminada"); } catch (err) { showToast("error", err.message); } finally { setSaving(false); }
  };

  const handleAction = async (type, mesa) => {
    if (type === "delete") { handleDelete(mesa); return; }
    if (type === "checkout") {
      const metodo = window.prompt("Método de pago: (Efectivo, Tarjeta, Transferencia)", "Efectivo");
      if (!metodo) return;
      setSaving(true);
      try {
        await TableService.checkout(mesa.id, metodo);
        showToast("success", `Cobro realizado. Mesa #${mesa.numero} ahora está libre.`);
        await fetchAll(); 
      } catch (err) { showToast("error", `Error en el cobro: ${err.message}`); } finally { setSaving(false); }
      return;
    }
    openModal(type, mesa);
  };

  const filtered = (mesas || []).filter((m) => filterStatus === "todas" || m.estado === filterStatus).filter((m) => search.trim() === "" || String(m.numero).toLowerCase().includes(search.toLowerCase()));

  const stats = { 
    total: mesas.length, 
    libres: mesas.filter(m => m.estado === "libre" || m.estado === "disponible").length, 
    ocupadas: mesas.filter(m => m.estado === "ocupada").length, 
    reservadas: mesas.filter(m => m.estado === "reservada" || m.estado === "confirmada" || m.estado === "solicitada").length, 
    ingresosPendientes: mesas.reduce((s, m) => s + (Number(m.total) || 0), 0), 
    gananciasRegistradas: totalVentas, 
    totalPotencial: 0 
  };
  stats.totalPotencial = stats.ingresosPendientes + stats.gananciasRegistradas;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <Toast message={toast} />
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h1 className="text-4xl font-black text-slate-900 tracking-tight">Mapa de Mesas</h1><p className="text-slate-500 mt-1 text-sm">Gestión en tiempo real del salón</p></div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 transition"><ArrowPathIcon className="h-4 w-4" /> Actualizar</button>
          <button onClick={() => openModal("add")} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-md shadow-orange-200"><PlusIcon className="h-4 w-4" /> Agregar Mesa</button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Libres" value={stats.libres} color="text-emerald-600" />
        <StatCard label="Ocupadas" value={stats.ocupadas} color="text-orange-600" />
        <StatCard label="Reservadas" value={stats.reservadas} color="text-blue-600" />
        <StatCard label="Pendiente" value={`$${stats.ingresosPendientes.toFixed(2)}`} color="text-amber-600" />
        <StatCard label="Caja" value={`$${stats.gananciasRegistradas.toFixed(2)}`} color="text-emerald-700" />
        <StatCard label="Potencial" value={`$${stats.totalPotencial.toFixed(2)}`} color="text-purple-600" />
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-xs"><MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input type="text" placeholder="Buscar mesa, mesero…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" /></div>
        <FilterBar active={filterStatus} onChange={setFilterStatus} />
        <div className="flex gap-1 ml-auto border border-slate-200 rounded-xl overflow-hidden bg-white">
          {[ { id: "grid", icon: TableCellsIcon }, { id: "list", icon: ChartBarIcon } ].map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => setView(id)} className={`p-2.5 transition ${view === id ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"}`}><Icon className="h-4 w-4" /></button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-5 mb-6 bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs font-bold">
        {ESTADOS.map((e) => <div key={e} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full ${ESTADO_CONFIG[e].color}`} /> <span className="text-slate-600">{ESTADO_CONFIG[e].label}</span></div>)}
      </div>
      {loading ? <div className="flex items-center justify-center h-60 text-slate-400 text-sm gap-2"><ArrowPathIcon className="h-5 w-5 animate-spin" /> Cargando mesas…</div> : filtered.length === 0 ? <div className="flex flex-col items-center justify-center h-60 text-slate-400 gap-2 bg-white rounded-3xl border-2 border-dashed border-slate-200"><TableCellsIcon className="h-10 w-10 opacity-40" /><p className="font-semibold">No hay mesas que coincidan</p></div> : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filtered.map((mesa) => <MesaCard key={mesa.id} mesa={mesa} onAction={handleAction} />)}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr className="text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-400"><th className="px-4 py-3">Mesa</th><th className="px-4 py-3">Cap.</th><th className="px-4 py-3">Piso</th><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Mesero</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{filtered.map((mesa) => {
              const cfg = ESTADO_CONFIG[mesa.estado] || ESTADO_CONFIG.libre;
              return <tr key={mesa.id} className="hover:bg-slate-50 transition"><td className="px-4 py-3 font-black text-slate-900">#{mesa.numero}</td><td className="px-4 py-3 text-slate-600">{mesa.capacidad}</td><td className="px-4 py-3 text-slate-600">{mesa.piso ?? "—"}</td><td className="px-4 py-3 text-slate-600">{mesa.ubicacion || "—"}</td><td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${cfg.badge}`}>{cfg.label}</span></td><td className="px-4 py-3 text-slate-600">{mesa.mesero || "—"}</td><td className="px-4 py-3 text-slate-600">{mesa.cliente || "—"}</td><td className="px-4 py-3 font-semibold text-emerald-700">{Number(mesa.total) > 0 ? `$${Number(mesa.total).toFixed(2)}` : "—"}</td><td className="px-4 py-3 flex gap-1"><button onClick={() => handleAction("status", mesa)} className="p-1 text-slate-600 hover:text-slate-900"><CheckCircleIcon className="h-4 w-4" /></button><button onClick={() => handleAction("assign", mesa)} className="p-1 text-blue-500 hover:text-blue-700"><UserGroupIcon className="h-4 w-4" /></button><button onClick={() => handleAction("edit", mesa)} className="p-1 text-orange-500 hover:text-orange-700"><PencilSquareIcon className="h-4 w-4" /></button><button onClick={() => handleAction("delete", mesa)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button></td></tr>;
            })}</tbody></table>
          </div>
      )}
      {modal && <Modal type={modal.type} mesa={modal.mesa} meseros={meseros} formData={formData} onChange={handleFormChange} onSave={handleSave} onClose={() => setModal(null)} loading={saving} />}
      <style>{`.input{width:100%;padding:.5rem .75rem;border:1px solid #e2e8f0;border-radius:.75rem;font-size:.875rem;outline:none;transition:box-shadow .15s}.input:focus{box-shadow:0 0 0 2px #f97316;border-color:#f97316}`}</style>
    </div>
  );
}
