import { useState, useEffect, useCallback } from "react";
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckCircleIcon,
  ExclamationTriangleIcon, UserGroupIcon, XMarkIcon,
  MagnifyingGlassIcon, ArrowPathIcon, TableCellsIcon,
  ChartBarIcon, CurrencyDollarIcon, BanknotesIcon
} from "@heroicons/react/24/outline";
import { TableService, SalesService } from "../../Services/Api";
import GlassCard from "../../components/GlassCard";
import GlassButton from "../../components/GlassButton";

// =============================================================================
// 🎨 CONFIGURACIÓN DE ESTADOS
// =============================================================================
const ESTADO_CONFIG = {
  libre:      { label: "Libre",      color: "bg-emerald-500",  border: "border-emerald-500/50", badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
  disponible: { label: "Disponible", color: "bg-emerald-500",  border: "border-emerald-500/50", badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
  solicitada: { label: "Solicitada", color: "bg-cyan-500",     border: "border-cyan-500/50",    badge: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" },
  confirmada: { label: "Confirmada", color: "bg-blue-600",     border: "border-blue-500/50",    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  reservada:  { label: "Reservada",  color: "bg-blue-500",     border: "border-blue-500/50",    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  ocupada:    { label: "Ocupada",    color: "bg-orange-500",   border: "border-orange-500/50",  badge: "bg-orange-500/20 text-orange-300 border border-orange-500/30" },
  cuenta:     { label: "Pagando",    color: "bg-red-500",      border: "border-red-500/50",     badge: "bg-red-500/20 text-red-300 border border-red-500/30" },
  pagando:    { label: "Pagando",    color: "bg-red-500",      border: "border-red-500/50",     badge: "bg-red-500/20 text-red-300 border border-red-500/30" },
};

const CAPACIDADES = [2, 4, 6, 8, 10, 12];
const ESTADOS = Object.keys(ESTADO_CONFIG);
const PISOS = [1, 2, 3];
const METODOS_PAGO = ["Efectivo", "Tarjeta", "Transferencia", "QR / Wallet"];

const FORM_DEFAULTS = {
  numero: "", capacidad: 4, piso: 1, ubicacion: "",
  estado: "libre", mesero_id: "", cliente: "", total: 0,
  posicion_x: 0, posicion_y: 0
};

// =============================================================================
// 🧩 SUB-COMPONENTES
// =============================================================================

/** Toast de notificación */
function Toast({ message }) {
  if (!message.text) return null;
  const isError = message.type === "error";
  return (
    <div className={`fixed top-5 right-5 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md text-sm font-bold transition-all animate-fade-in ${
      isError
        ? "bg-red-900/80 border-red-500/50 text-red-100"
        : "bg-emerald-900/80 border-emerald-500/50 text-emerald-100"
    }`}>
      {isError
        ? <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
        : <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
      }
      {message.text}
    </div>
  );
}

/** Filtros de estado */
function FilterBar({ active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onChange("todas")}
        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
          active === "todas"
            ? "bg-white text-slate-900 border-white shadow-lg shadow-white/20"
            : "bg-slate-800/50 text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
        }`}
      >
        Todas
      </button>
      {ESTADOS.map((e) => (
        <button
          key={e}
          onClick={() => onChange(e)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
            active === e
              ? "bg-slate-800 text-white border-white/30 shadow-lg"
              : "bg-slate-800/50 text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
          }`}
        >
          {ESTADO_CONFIG[e].label}
        </button>
      ))}
    </div>
  );
}

/** Card de estadística usando GlassCard */
function StatCard({ label, value, color = "text-white" }) {
  return (
    <GlassCard className="p-5 flex flex-col gap-1 hover:-translate-y-1 hover:shadow-2xl transition-all duration-200 relative overflow-hidden">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-xl pointer-events-none" />
    </GlassCard>
  );
}

/** Card de mesa individual */
function MesaCard({ mesa, onAction }) {
  const cfg = ESTADO_CONFIG[mesa.estado] || ESTADO_CONFIG.libre;
  return (
    <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg hover:shadow-2xl hover:border-white/20 hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-[240px]">
      {/* Barra de estado */}
      <div className={`h-2 w-full ${cfg.color} opacity-80`} />

      <div className="p-5 flex flex-col flex-1 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-4xl font-black leading-none text-white tracking-tighter">#{mesa.numero}</span>
            {mesa.piso && <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Piso {mesa.piso}</p>}
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <UserGroupIcon className="h-4 w-4 text-slate-500" />
            <span className="font-semibold">Cap. {mesa.capacidad}</span>
            {mesa.ubicacion && <span className="text-slate-500 text-xs">· {mesa.ubicacion}</span>}
          </div>
          {mesa.mesero && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 rounded-lg p-2 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {mesa.mesero}
            </div>
          )}
          {mesa.cliente && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 rounded-lg p-2 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {mesa.cliente}
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
          {Number(mesa.total) > 0 ? (
            <span className="text-lg font-black text-emerald-400 tracking-tight">
              ${Number(mesa.total).toFixed(2)}
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-600 uppercase">Sin consumo</span>
          )}
        </div>
      </div>

      {/* Overlay de acciones al hover */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
        {(mesa.estado === "cuenta" || mesa.estado === "pagando") && (
          <button
            onClick={() => onAction("checkout", mesa)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg shadow-emerald-500/40 transition-transform hover:scale-110"
            title="Finalizar Pago"
          >
            <BanknotesIcon className="h-6 w-6" />
          </button>
        )}
        {[
          { type: "status", icon: CheckCircleIcon, cls: "text-slate-200 hover:text-white bg-slate-700 hover:bg-slate-600" },
          { type: "assign", icon: UserGroupIcon,   cls: "text-blue-200 hover:text-white bg-blue-600/20 hover:bg-blue-600" },
          { type: "edit",   icon: PencilSquareIcon,cls: "text-orange-200 hover:text-white bg-orange-600/20 hover:bg-orange-600" },
          { type: "delete", icon: TrashIcon,        cls: "text-red-200 hover:text-white bg-red-600/20 hover:bg-red-600" },
        ].map(({ type, icon: Icon, cls }) => (
          <button
            key={type}
            onClick={() => onAction(type, mesa)}
            className={`${cls} p-3 rounded-full shadow-lg transition-transform hover:scale-110`}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// 🪟 MODAL UNIFICADO (Glass Premium)
// =============================================================================
function Modal({ type, mesa, meseros, formData, onChange, onSave, onClose, loading }) {
  const titles = {
    add:      "Agregar Nueva Mesa",
    edit:     `Editar Mesa #${mesa?.numero}`,
    status:   `Estado — Mesa #${mesa?.numero}`,
    assign:   `Asignar Mesero — Mesa #${mesa?.numero}`,
    checkout: `Cobrar Mesa #${mesa?.numero}`,
    delete:   `Eliminar Mesa #${mesa?.numero}`,
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md overflow-hidden relative shadow-2xl">
        {/* Decoración */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-black text-white tracking-tight">{titles[type]}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-full"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-4">

          {/* ── ADD / EDIT ── */}
          {(type === "add" || type === "edit") && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                  Número de Mesa *
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => onChange("numero", e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Capacidad</label>
                  <select
                    value={formData.capacidad}
                    onChange={(e) => onChange("capacidad", e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all appearance-none"
                  >
                    {CAPACIDADES.map(n => <option key={n} value={n}>{n} personas</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Piso</label>
                  <select
                    value={formData.piso}
                    onChange={(e) => onChange("piso", e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all appearance-none"
                  >
                    {PISOS.map(p => <option key={p} value={p}>Piso {p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Ubicación</label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => onChange("ubicacion", e.target.value)}
                  placeholder="Ej: Ventana, Terraza, Barra…"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                />
              </div>
            </>
          )}

          {/* ── STATUS ── */}
          {type === "status" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Nuevo Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => onChange("estado", e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all appearance-none"
              >
                {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>)}
              </select>
            </div>
          )}

          {/* ── ASSIGN ── */}
          {type === "assign" && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Mesero</label>
                <select
                  value={formData.mesero_id}
                  onChange={(e) => onChange("mesero_id", e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all appearance-none"
                >
                  <option value="">— Sin mesero —</option>
                  {meseros.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} {m.apellido ?? ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Cliente / Reserva</label>
                <input
                  type="text"
                  value={formData.cliente}
                  onChange={(e) => onChange("cliente", e.target.value)}
                  placeholder="Nombre del cliente…"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Total acumulado ($)</label>
                <input
                  type="number"
                  value={formData.total}
                  onChange={(e) => onChange("total", e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                />
              </div>
            </>
          )}

          {/* ── CHECKOUT ── */}
          {type === "checkout" && (
            <>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4">
                <CurrencyDollarIcon className="h-10 w-10 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Total a cobrar</p>
                  <p className="text-3xl font-black text-emerald-400">
                    ${Number(mesa?.total ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  {METODOS_PAGO.map((metodo) => (
                    <button
                      key={metodo}
                      onClick={() => onChange("metodo_pago", metodo)}
                      className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                        formData.metodo_pago === metodo
                          ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30"
                          : "bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {metodo}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── DELETE ── */}
          {type === "delete" && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <TrashIcon className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">¿Eliminar Mesa #{mesa?.numero}?</p>
                <p className="text-slate-400 text-sm mt-1">
                  Esta acción no se puede deshacer. Se eliminará la mesa y todos sus registros asociados.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-white/10 bg-white/5">
          <GlassButton variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </GlassButton>
          <GlassButton
            variant={type === "delete" ? "danger" : "primary"}
            onClick={onSave}
            disabled={loading || (type === "checkout" && !formData.metodo_pago)}
            className="flex-1"
          >
            {loading
              ? "Procesando…"
              : type === "delete"
              ? "Sí, eliminar"
              : type === "checkout"
              ? "Confirmar Cobro"
              : "Guardar"}
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}

// =============================================================================
// 🎯 COMPONENTE PRINCIPAL
// =============================================================================
export default function TablesMap() {
  const [mesas,       setMesas]       = useState([]);
  const [meseros,     setMeseros]     = useState([]);
  const [totalVentas, setTotalVentas] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState({ type: "", text: "" });
  const [filterStatus,setFilterStatus]= useState("todas");
  const [search,      setSearch]      = useState("");
  const [view,        setView]        = useState("grid");
  const [modal,       setModal]       = useState(null);   // { type, mesa }
  const [formData,    setFormData]    = useState(FORM_DEFAULTS);

  // ── Helpers ──
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 3500);
  };

  // ── Carga de datos ──
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mesasData, meserosData, salesTotal] = await Promise.all([
        TableService.getAll(),
        TableService.getWaiters(),
        SalesService.getTotal(),
      ]);
      setMesas(Array.isArray(mesasData) ? mesasData : (mesasData?.mesas ?? []));
      // Bug corregido: usar meserosData (no mesasData.meseros)
      setMeseros(Array.isArray(meserosData) ? meserosData : (meserosData?.meseros ?? []));
      setTotalVentas(Number(salesTotal?.total ?? 0));
    } catch (err) {
      showToast("error", `Error al cargar: ${err.message ?? err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Modal helpers ──
  const openModal = (type, mesa = null) => {
    const base = mesa
      ? {
          ...mesa,
          piso:       mesa.piso       ?? 1,
          ubicacion:  mesa.ubicacion  ?? "",
          estado:     mesa.estado     ?? "libre",
          mesero_id:  mesa.mesero_id  ?? "",
          cliente:    mesa.cliente    ?? "",
          total:      mesa.total      ?? 0,
          posicion_x: mesa.posicion_x ?? 0,
          posicion_y: mesa.posicion_y ?? 0,
          metodo_pago: "",
        }
      : { ...FORM_DEFAULTS, metodo_pago: "" };
    setFormData(base);
    setModal({ type, mesa });
  };

  const handleFormChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // ── Guardar / Ejecutar ──
  const handleSave = async () => {
    if (!formData.numero && (modal.type === "add" || modal.type === "edit")) {
      return showToast("error", "El número de mesa es obligatorio");
    }
    if (modal.type === "checkout" && !formData.metodo_pago) {
      return showToast("error", "Selecciona un método de pago");
    }

    setSaving(true);
    try {
      switch (modal.type) {
        case "add": {
          const created = await TableService.create(formData);
          setMesas((prev) => [...prev, created]);
          showToast("success", `Mesa #${created.numero} creada`);
          break;
        }
        case "edit": {
          const updated = await TableService.update(modal.mesa.id, formData);
          setMesas((prev) => prev.map(m => m.id === updated.id ? updated : m));
          showToast("success", `Mesa #${updated.numero} actualizada`);
          break;
        }
        case "status": {
          const updated = await TableService.updateStatus(modal.mesa.id, formData.estado);
          setMesas((prev) => prev.map(m => m.id === updated.id ? updated : m));
          showToast("success", "Estado actualizado");
          break;
        }
        case "assign": {
          const updated = await TableService.assignWaiter(modal.mesa.id, formData);
          setMesas((prev) => prev.map(m => m.id === updated.id ? updated : m));
          showToast("success", "Mesero asignado correctamente");
          break;
        }
        case "checkout": {
          await TableService.checkout(modal.mesa.id, formData.metodo_pago);
          showToast("success", `Cobro registrado. Mesa #${modal.mesa.numero} liberada.`);
          await fetchAll();
          break;
        }
        case "delete": {
          await TableService.delete(modal.mesa.id);
          setMesas((prev) => prev.filter(m => m.id !== modal.mesa.id));
          showToast("success", `Mesa #${modal.mesa.numero} eliminada`);
          break;
        }
        default:
          break;
      }
      setModal(null);
    } catch (err) {
      showToast("error", err.message ?? String(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Dispatch de acciones desde tarjetas ──
  const handleAction = (type, mesa) => openModal(type, mesa);

  // ── Filtrado ──
  const filtered = (mesas ?? [])
    .filter(m => filterStatus === "todas" || m.estado === filterStatus)
    .filter(m => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        String(m.numero).includes(q) ||
        (m.cliente  ?? "").toLowerCase().includes(q) ||
        (m.mesero   ?? "").toLowerCase().includes(q) ||
        (m.ubicacion ?? "").toLowerCase().includes(q)
      );
    });

  // ── Estadísticas ──
  const stats = {
    total:               mesas.length,
    libres:              mesas.filter(m => m.estado === "libre" || m.estado === "disponible").length,
    ocupadas:            mesas.filter(m => m.estado === "ocupada").length,
    reservadas:          mesas.filter(m => ["reservada","confirmada","solicitada"].includes(m.estado)).length,
    ingresosPendientes:  mesas.reduce((s, m) => s + (Number(m.total) || 0), 0),
    gananciasRegistradas: totalVentas,
  };
  stats.totalPotencial = stats.ingresosPendientes + stats.gananciasRegistradas;

  // ==========================================================================
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-8 font-sans selection:bg-orange-500 selection:text-white">
      <Toast message={toast} />

      {/* ── Header ── */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Mapa de Mesas</h1>
          <p className="text-slate-400 text-sm font-medium">Gestión en tiempo real del salón</p>
        </div>
        <div className="flex gap-3">
          <GlassButton
            variant="secondary"
            onClick={fetchAll}
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" /> Actualizar
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={() => openModal("add")}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" /> Agregar Mesa
          </GlassButton>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <StatCard label="Total"    value={stats.total} />
        <StatCard label="Libres"   value={stats.libres}    color="text-emerald-400" />
        <StatCard label="Ocupadas" value={stats.ocupadas}  color="text-orange-400" />
        <StatCard label="Reservadas" value={stats.reservadas} color="text-blue-400" />
        <StatCard label="Pendiente" value={`$${stats.ingresosPendientes.toFixed(2)}`} color="text-amber-400" />
        <StatCard label="Caja"     value={`$${stats.gananciasRegistradas.toFixed(2)}`} color="text-emerald-300" />
        <StatCard label="Potencial" value={`$${stats.totalPotencial.toFixed(2)}`}    color="text-purple-400" />
      </div>

      {/* ── Controles ── */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar mesa, mesero, cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all backdrop-blur-sm"
          />
        </div>
        <FilterBar active={filterStatus} onChange={setFilterStatus} />
        <div className="flex gap-1 p-1 bg-slate-800/50 border border-white/10 rounded-2xl backdrop-blur-sm h-fit">
          {[
            { id: "grid", icon: TableCellsIcon },
            { id: "list", icon: ChartBarIcon },
          ].map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`p-2.5 rounded-xl transition-all ${
                view === id
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Leyenda ── */}
      <div className="flex flex-wrap gap-4 mb-6 bg-slate-800/30 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
        {ESTADOS.map((e) => (
          <div key={e} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${ESTADO_CONFIG[e].color}`} />
            <span className="text-xs font-bold text-slate-400">{ESTADO_CONFIG[e].label}</span>
          </div>
        ))}
      </div>

      {/* ── Contenido ── */}
      {loading ? (
        <div className="flex items-center justify-center h-60 text-slate-500 text-sm gap-3">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-orange-500" /> Cargando mesas…
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center h-60 gap-4">
          <TableCellsIcon className="h-12 w-12 opacity-20" />
          <p className="font-bold text-slate-500">No hay mesas que coincidan</p>
        </GlassCard>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((mesa) => (
            <MesaCard key={mesa.id} mesa={mesa} onAction={handleAction} />
          ))}
        </div>
      ) : (
        /* ── Vista Lista ── */
        <GlassCard className="overflow-hidden shadow-xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50 border-b border-white/10">
              <tr className="text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                {["Mesa","Cap.","Piso","Ubicación","Estado","Mesero","Cliente","Total","Acciones"].map(h => (
                  <th key={h} className={`px-6 py-4${h === "Acciones" ? " text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((mesa) => {
                const cfg = ESTADO_CONFIG[mesa.estado] || ESTADO_CONFIG.libre;
                return (
                  <tr key={mesa.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-black text-white">#{mesa.numero}</td>
                    <td className="px-6 py-4 text-slate-400">{mesa.capacidad}</td>
                    <td className="px-6 py-4 text-slate-400">{mesa.piso ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-400">{mesa.ubicacion || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{mesa.mesero || "—"}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{mesa.cliente || "—"}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      {Number(mesa.total) > 0 ? `$${Number(mesa.total).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(mesa.estado === "cuenta" || mesa.estado === "pagando") && (
                          <button
                            onClick={() => handleAction("checkout", mesa)}
                            className="p-2 text-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/20 rounded-lg transition"
                            title="Cobrar"
                          >
                            <BanknotesIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => handleAction("status", mesa)}  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"><CheckCircleIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleAction("assign", mesa)}  className="p-2 text-blue-400 hover:text-blue-200 hover:bg-blue-500/20 rounded-lg transition"><UserGroupIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleAction("edit", mesa)}    className="p-2 text-orange-400 hover:text-orange-200 hover:bg-orange-500/20 rounded-lg transition"><PencilSquareIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleAction("delete", mesa)}  className="p-2 text-red-400 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}

      {/* ── Modal ── */}
      {modal && (
        <Modal
          type={modal.type}
          mesa={modal.mesa}
          meseros={meseros}
          formData={formData}
          onChange={handleFormChange}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
    </div>
  );
};