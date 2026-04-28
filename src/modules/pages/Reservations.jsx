import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PlusIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  TableCellsIcon,
  PhoneIcon,
  EnvelopeIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

// IMPORTACIONES OBLIGATORIAS
import GlassCard from "../../components/GlassCard";
import GlassButton from "../../components/GlassButton";

const API_URL = '/api/reservations';

// --- Estilos Consistentes (Glassmorphism) ---
const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all";
const labelClass = "block text-sm font-bold text-slate-300 mb-1.5 ml-1";
const selectClass = "w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all cursor-pointer";

export default function ReservationsManager() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filtros
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');

  const initialFormState = {
    nombre_cliente: '',
    telefono_cliente: '',
    email: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '',
    numero_personas: 2,
    mesas_asignadas: [], // Array de IDs de mesas
    notas: '',
    estado: 'pendiente'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, [filterDate, filterStatus]);

  // --- Lógica de Conexión con Backend ---
  
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterDate) params.fecha = filterDate;
      if (filterStatus) params.estado = filterStatus;

      const response = await axios.get(API_URL, { params });
      setReservations(response.data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError('Error al cargar las reservaciones.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      // Obtenemos solo mesas libres o disponibles para asignar
      const response = await axios.get('/api/tables'); 
      setTables(response.data);
    } catch (err) {
      console.error("Error cargando mesas:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validación básica
      if (!formData.hora) throw new Error("La hora es obligatoria");
      if (formData.mesas_asignadas.length === 0 && formData.numero_personas > 0) {
        // Advertencia suave, no bloqueo, pero bueno avisar
        // console.warn("Reserva sin mesas asignadas explícitamente");
      }

      const payload = {
        ...formData,
        numero_personas: Number(formData.numero_personas),
        // Convertir array de IDs a string JSON si la BD lo pide así, o dejarlo array si es JSONB
        mesas_asignadas: JSON.stringify(formData.mesas_asignadas) 
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        setSuccess('Reservación actualizada correctamente');
      } else {
        await axios.post(API_URL, payload);
        setSuccess('Reservación creada exitosamente');
      }
      handleCloseForm();
      fetchReservations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Error al guardar la reservación');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Cancelar esta reservación? Esta acción no se puede deshacer.')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setSuccess('Reservación cancelada');
        fetchReservations();
      } catch (err) {
        setError('Error al cancelar');
      }
    }
  };

  const handleEdit = (res) => {
    let mesasArray = [];
    try {
      mesasArray = typeof res.mesas_asignadas === 'string' ? JSON.parse(res.mesas_asignadas) : res.mesas_asignadas;
    } catch (e) { mesasArray = []; }

    setFormData({
      ...res,
      mesas_asignadas: mesasArray
    });
    setEditingId(res.id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTableSelection = (tableId) => {
    setFormData(prev => {
      const current = prev.mesas_asignadas;
      if (current.includes(tableId)) {
        return { ...prev, mesas_asignadas: current.filter(id => id !== tableId) };
      } else {
        return { ...prev, mesas_asignadas: [...current, tableId] };
      }
    });
  };

  // Helper para colores de estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'confirmada': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'cancelada': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'finalizada': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
            Reservaciones
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Gestiona las citas y asignación de mesas futuras.</p>
        </div>
        <GlassButton onClick={() => setShowForm(true)} variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Nueva Reserva
        </GlassButton>
      </div>

      {/* --- Alertas --- */}
      {error && (
        <GlassCard className="mb-6 border-l-4 border-l-red-500 bg-red-900/20 backdrop-blur-md animate-pulse">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-red-200">
              <ExclamationTriangleIcon className="w-6 h-6" /> 
              <span className="font-bold">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-white transition">✕</button>
          </div>
        </GlassCard>
      )}
      {success && (
        <GlassCard className="mb-6 border-l-4 border-l-emerald-500 bg-emerald-900/20 backdrop-blur-md">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-emerald-200">
              <CheckCircleIcon className="w-6 h-6" /> 
              <span className="font-bold">{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white transition">✕</button>
          </div>
        </GlassCard>
      )}

      {/* --- Controles y Filtros --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard className="p-4 flex flex-col justify-center border-white/10">
          <label className={labelClass}>Fecha:</label>
          <input 
            type="date" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
            className={inputClass} 
          />
        </GlassCard>
        
        <GlassCard className="p-4 flex flex-col justify-center border-white/10">
          <label className={labelClass}>Estado:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={selectClass}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-white/10 bg-orange-900/10">
          <span className="text-orange-400 text-xs uppercase font-bold tracking-wider">Total Reservas Día</span>
          <span className="text-3xl font-black text-white">{reservations.length}</span>
        </GlassCard>
      </div>

      {/* --- Formulario Modal Inline --- */}
      {showForm && (
        <GlassCard className="mb-8 p-8 animate-in fade-in slide-in-from-top-8 duration-300 border-white/10 bg-slate-800/40 relative z-20">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">
              {editingId ? 'Editar Reservación' : 'Nueva Reservación'}
            </h2>
            <button onClick={handleCloseForm} className="text-slate-400 hover:text-white transition">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos del Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Nombre Cliente</label>
                <input 
                  name="nombre_cliente" type="text" value={formData.nombre_cliente} onChange={handleInputChange}
                  className={inputClass} required placeholder="Ej. Juan Pérez"
                />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input 
                  name="telefono_cliente" type="tel" value={formData.telefono_cliente} onChange={handleInputChange}
                  className={inputClass} placeholder="+52 ..."
                />
              </div>
              <div>
                <label className={labelClass}>Email (Opcional)</label>
                <input 
                  name="email" type="email" value={formData.email} onChange={handleInputChange}
                  className={inputClass} placeholder="cliente@email.com"
                />
              </div>
            </div>

            {/* Detalles de la Reserva */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className={labelClass}>Fecha</label>
                <input 
                  name="fecha" type="date" value={formData.fecha} onChange={handleInputChange}
                  className={inputClass} required
                />
              </div>
              <div>
                <label className={labelClass}>Hora</label>
                <input 
                  name="hora" type="time" value={formData.hora} onChange={handleInputChange}
                  className={inputClass} required
                />
              </div>
              <div>
                <label className={labelClass}>Personas</label>
                <input 
                  name="numero_personas" type="number" min="1" value={formData.numero_personas} onChange={handleInputChange}
                  className={inputClass} required
                />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select name="estado" value={formData.estado} onChange={handleInputChange} className={selectClass}>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>
            </div>

            {/* Selector de Mesas (Visual) */}
            <div>
              <label className={labelClass}>Asignar Mesas (Selecciona múltiples si es necesario)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-2 max-h-48 overflow-y-auto p-2 bg-slate-900/30 rounded-2xl border border-white/5">
                {tables.length === 0 ? (
                  <p className="text-slate-500 text-sm col-span-full text-center py-4">No hay mesas registradas.</p>
                ) : (
                  tables.map(table => {
                    const isSelected = formData.mesas_asignadas.includes(table.id);
                    const isOccupied = table.estado === 'ocupada';
                    return (
                      <button
                        key={table.id}
                        type="button"
                        disabled={isOccupied && !isSelected} // Permitir deseleccionar si ya estaba
                        onClick={() => toggleTableSelection(table.id)}
                        className={`p-3 rounded-xl text-sm font-bold transition-all border ${
                          isSelected 
                            ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20 scale-105' 
                            : isOccupied
                              ? 'bg-red-900/20 text-red-400 border-red-900/50 opacity-50 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        Mesa {table.numero}
                      </button>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 ml-1">
                {formData.mesas_asignadas.length > 0 
                  ? `${formData.mesas_asignadas.length} mesa(s) seleccionada(s)` 
                  : 'Ninguna mesa asignada (se asignará al llegar)'}
              </p>
            </div>
            
            <div>
              <label className={labelClass}>Notas Adicionales</label>
              <textarea 
                name="notas" value={formData.notas} onChange={handleInputChange}
                className={`${inputClass} h-20`} placeholder="Ej. Alergia a nueces, cumpleaños, etc."
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <GlassButton type="submit" variant="primary" className="flex-1">
                {editingId ? 'Actualizar Reserva' : 'Confirmar Reserva'}
              </GlassButton>
              <GlassButton type="button" variant="secondary" onClick={handleCloseForm}>
                Cancelar
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* --- Lista de Reservaciones (Timeline/Card View) --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="font-bold tracking-widest uppercase">Cargando agenda...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <GlassCard className="text-center py-20 border-dashed border-white/10">
              <CalendarDaysIcon className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">No hay reservaciones para esta fecha.</p>
            </GlassCard>
          ) : (
            reservations.map((res) => {
               // Parsear mesas asignadas para mostrar
               let mesasIds = [];
               try { mesasIds = typeof res.mesas_asignadas === 'string' ? JSON.parse(res.mesas_asignadas) : res.mesas_asignadas; } catch(e){}
               const mesasNombres = tables.filter(t => mesasIds.includes(t.id)).map(t => `#${t.numero}`).join(', ');

               return (
                <GlassCard key={res.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:-translate-y-1 transition-transform duration-300 border-white/10 bg-slate-800/30">
                  
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl border ${getStatusColor(res.estado)} bg-opacity-10`}>
                      <ClockIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{res.nombre_cliente}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4"/> {res.hora}</span>
                        <span className="flex items-center gap-1"><UserGroupIcon className="w-4 h-4"/> {res.numero_personas} personas</span>
                        {mesasNombres && (
                          <span className="flex items-center gap-1 text-orange-400"><TableCellsIcon className="w-4 h-4"/> Mesas: {mesasNombres}</span>
                        )}
                      </div>
                      {res.notas && (
                        <p className="mt-2 text-xs text-slate-500 italic bg-slate-900/50 p-2 rounded-lg inline-block">
                          "{res.notas}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(res.estado)}`}>
                      {res.estado}
                    </span>
                    
                    <div className="flex gap-2 pl-2 border-l border-white/10">
                      <button onClick={() => handleEdit(res)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition" title="Editar">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      {res.estado !== 'cancelada' && (
                        <button onClick={() => handleDelete(res.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition" title="Cancelar">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
               );
            })
          )}
        </div>
      )}
    </div>
  );
};