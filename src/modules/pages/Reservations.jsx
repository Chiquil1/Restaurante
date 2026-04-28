import { useEffect, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { ReservationService, StaffService, TableService } from "../../Services/Api"; 

// ── ESTILOS GLOBALES (Simulando tu guía de estilos) ──
const styles = {
  cardBase: "bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden",
  inputField: "bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all w-full",
  label: "text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block",
  btnPrimary: "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 justify-center",
  btnSecondary: "bg-white/10 text-white font-bold py-3 px-6 rounded-2xl border border-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-300 flex items-center gap-2 justify-center",
  btnDanger: "bg-white/10 text-red-400 font-bold py-2 px-3 rounded-xl border border-white/10 hover:bg-red-500/20 hover:text-red-300 transition-all",
  badge: "text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter",
};

const initialForm = {
  nombre: '', apellido: '', telefono: '', email: '',
  fecha: '', hora: '', 
  numero_personas: 1, estado: 'solicitada',
  mesero_asignado: '', 
  mesas_asignadas: '', 
  notas: '',
};

export default function Reservations() {
  const [data, setData] = useState([]);
  const [staff, setStaff] = useState([]); 
  const [tables, setTables] = useState([]); 
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [tablesData, reservationsData] = await Promise.all([
        TableService.getAll(), 
        ReservationService.getAll()
      ]);
      setTables(tablesData);
      setData(reservationsData);
    } catch (e) {
      setError(e.message || 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const staffData = await StaffService.getAll();
      setStaff(staffData);
    } catch (e) {
      console.error("Error cargando staff:", e);
    }
  };

  useEffect(() => {
    load();
    loadStaff();
  }, []);

  const handleNewReservation = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        nombre_cliente: `${form.nombre} ${form.apellido}`.trim(),
        telefono_cliente: form.telefono,
        email: form.email,
        fecha: form.fecha,
        hora: form.hora,
        numero_personas: parseInt(form.numero_personas),
        mesas_asignadas: form.mesas_asignadas,
        notas: form.notas,
        estado: form.estado,
        mesero_asignado: form.mesero_asignado
      };

      if (editingId) {
        await ReservationService.update(editingId, payload);
        setSuccess('Reserva actualizada correctamente');
      } else {
        await ReservationService.create(payload);
        setSuccess('Reserva creada exitosamente');
      }
      
      setShowForm(false);
      setEditingId(null);
      load();
    } catch (e) {
      setError(e.message || 'Error al guardar la reserva');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reserva?')) return;
    try {
      await ReservationService.delete(id);
      setSuccess('Reserva eliminada');
      load();
    } catch (e) {
      setError(e.message || 'Error al eliminar');
    }
  };

  const edit = (r) => {
    const nameParts = r.nombre_cliente ? r.nombre_cliente.split(' ') : ['', ''];
    const formattedDate = r.fecha ? r.fecha.split('T')[0] : '';
    const formattedTime = r.hora ? r.hora.substring(0, 5) : '';

    setForm({
      ...r,
      nombre: nameParts[0] || '',
      apellido: nameParts.slice(1).join(' ') || '',
      fecha: formattedDate,
      hora: formattedTime,
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  // Helper para colores de estado
  const getStatusStyle = (status) => {
    switch(status) {
      case 'confirmada': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'cancelada': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans selection:bg-orange-500/30">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Reservas</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-2xl font-light">Gestión</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Administra las mesas y clientes de tu restaurante.</p>
        </div>
        <button
          onClick={handleNewReservation}
          className={styles.btnPrimary}
        >
          <PlusIcon className="w-5 h-5" /> Nueva Reserva
        </button>
      </div>

      {/* ── NOTIFICACIONES ── */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex gap-3 items-center backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <XMarkIcon className="w-5 h-5 flex-shrink-0" /> <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex gap-3 items-center backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckIcon className="w-5 h-5 flex-shrink-0" /> <span>{success}</span>
        </div>
      )}

      {/* ── FORMULARIO (GLASS CARD) ── */}
      {showForm && (
        <div className={`${styles.cardBase} p-8 mb-8 animate-in fade-in zoom-in-95 duration-300`}>
          {/* Glow effect background */}
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-gradient-to-br from-orange-500 to-amber-500 opacity-10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">
              {editingId ? '✏️ Editar Reserva' : '✨ Crear Nueva Reserva'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={styles.label}>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} className={styles.inputField} placeholder="Ej. Juan" required />
              </div>
              <div>
                <label className={styles.label}>Apellido</label>
                <input name="apellido" value={form.apellido} onChange={handleChange} className={styles.inputField} placeholder="Ej. Pérez" required />
              </div>
              <div>
                <label className={styles.label}>Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handleChange} className={styles.inputField} placeholder="+54 9 11..." />
              </div>
              
              <div>
                <label className={styles.label}>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={styles.inputField} placeholder="cliente@email.com" />
              </div>

              <div className="relative">
                <label className={styles.label}>Fecha</label>
                <div className="relative">
                  <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className={`${styles.inputField} pl-10`} required />
                  <CalendarDaysIcon className="w-5 h-5 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="relative">
                <label className={styles.label}>Hora</label>
                <div className="relative">
                  <input type="time" name="hora" value={form.hora} onChange={handleChange} className={`${styles.inputField} pl-10`} required />
                  <ClockIcon className="w-5 h-5 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="relative">
                <label className={styles.label}>Personas</label>
                <div className="relative">
                  <input type="number" name="numero_personas" value={form.numero_personas} onChange={handleChange} className={`${styles.inputField} pl-10`} required />
                  <UserGroupIcon className="w-5 h-5 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={styles.label}>Mesa Asignada</label>
                <select name="mesas_asignadas" value={form.mesas_asignadas} onChange={handleChange} className={styles.inputField}>
                  <option value="">Sin mesa específica</option>
                  {tables.map(t => <option key={t.id} value={t.id}>Mesa #{t.numero}</option>)}
                </select>
              </div>

              <div>
                <label className={styles.label}>Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange} className={styles.inputField}>
                  <option value="solicitada">Solicitada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className={styles.label}>Mesero Asignado</label>
                <select name="mesero_asignado" value={form.mesero_asignado} onChange={handleChange} className={styles.inputField}>
                  <option value="">Sin asignar</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.nombre} {s.apellido || ''}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className={styles.label}>Notas Adicionales</label>
              <textarea
                name="notas"
                value={form.notas}
                onChange={handleChange}
                className={`${styles.inputField} h-24 resize-none`}
                placeholder="Alergias, ocasiones especiales, etc."
              />
            </div>

            <div className="flex gap-4 justify-end pt-8 mt-4 border-t border-white/10">
              <button type="button" onClick={() => setShowForm(false)} className={styles.btnSecondary}>
                Cancelar
              </button>
              <button type="submit" className={styles.btnPrimary}>
                {editingId ? 'Actualizar Reserva' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TABLA DE DATOS (GLASS CARD) ── */}
      <div className={`${styles.cardBase} overflow-hidden`}>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Fecha & Hora</th>
                <th className="px-6 py-5 text-center">Pax</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-500 animate-pulse">Cargando datos...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-500">No hay reservas registradas.</td></tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="group hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{r.nombre_cliente}</div>
                      <div className="text-xs text-slate-500">{r.email || r.telefono_cliente}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-medium">
                      <div className="flex flex-col">
                        <span>{r.fecha}</span>
                        <span className="text-slate-500 text-xs">{r.hora}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50 text-slate-300 text-xs font-bold border border-white/10">
                        {r.numero_personas}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${styles.badge} ${getStatusStyle(r.estado)} border`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => edit(r)} className="p-2 hover:bg-blue-500/20 rounded-xl transition-all text-blue-400 hover:text-blue-300">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => remove(r.id)} className="p-2 hover:bg-red-500/20 rounded-xl transition-all text-red-400 hover:text-red-300">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
