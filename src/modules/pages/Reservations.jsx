import { useEffect, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ReservationService, StaffService, TableService } from "../../Services/Api"; 

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

  // 🟢 FIX: Función para resetear TODO antes de crear una nueva
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
      setEditingId(null); // Limpiar ID después de guardar
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

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">🍽 Sistema de Reservas</h1>
        <button
          onClick={handleNewReservation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex gap-2 transition-all shadow-sm font-bold"
        >
          <PlusIcon className="w-5 h-5" /> Nueva Reserva
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex gap-2 items-center shadow-sm">
          <XMarkIcon className="w-5 h-5" /> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex gap-2 items-center shadow-sm">
          <CheckIcon className="w-5 h-5" /> {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl space-y-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-gray-700 border-b pb-3">
            {editingId ? 'Editar Reserva' : 'Crear Nueva Reserva'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase text-gray-400">Nombre</p>
                <input name="nombre" value={form.nombre} onChange={handleChange} className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" required />
             </div>
             <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase text-gray-400">Apellido</p>
                <input name="apellido" value={form.apellido} onChange={handleChange} className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" required />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase text-gray-400">Fecha</p>
                <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase text-gray-400">Hora</p>
                <input type="time" name="hora" value={form.hora} onChange={handleChange} className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase text-gray-400">Personas</p>
                <input type="number" name="numero_personas" value={form.numero_personas} onChange={handleChange} className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase text-gray-400">Mesa</p>
              <select name="mesas_asignadas" value={form.mesas_asignadas} onChange={handleChange} className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Sin mesa</option>
                {tables.map(t => <option key={t.id} value={t.id}>Mesa #{t.numero}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase text-gray-400">Estado</p>
              <select name="estado" value={form.estado} onChange={handleChange} className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400">
                <option value="solicitada">Solicitada</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase text-gray-400">Mesero</p>
              <select name="mesero_asignado" value={form.mesero_asignado} onChange={handleChange} className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Sin asignar</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.nombre} {s.apellido || ''}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-600">Notas adicionales</label>
            <textarea
              name="notas"
              value={form.notas}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl h-24 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl hover:bg-gray-200 transition-colors font-semibold">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-md">
              {editingId ? 'Actualizar Reserva' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Fecha/Hora</th>
              <th className="px-6 py-4">Pax</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400 animate-pulse">Cargando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400">No hay reservas.</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{r.nombre_cliente}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{r.fecha} {r.hora}</td>
                  <td className="px-6 py-4 text-gray-600 font-semibold">{r.numero_personas}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      r.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-700' : 
                      r.estado === 'cancelada' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2 justify-center">
                    <button onClick={() => edit(r)} className="p-2 hover:bg-blue-50 rounded-lg transition-all">
                      <PencilIcon className="w-5 h-5 text-blue-500" />
                    </button>
                    <button onClick={() => remove(r.id)} className="p-2 hover:bg-red-50 rounded-lg transition-all">
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
