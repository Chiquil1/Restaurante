import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  PlusIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  TableCellsIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

import GlassCard from "../../components/GlassCard";
import GlassButton from "../../components/GlassButton";
import { getErrorMessage, unwrapArray } from "../../Services/Api";

const API_URL = '/api/reservations';
const TABLES_API = '/api/tables';

const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all";
const labelClass = "block text-sm font-bold text-slate-300 mb-1.5 ml-1";
const selectClass = "w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all cursor-pointer";

const toInputDate = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
};

const toInputTime = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
};

const parseAssignedTables = (mesas) => {
  if (!mesas) return [];

  try {
    const parsed = typeof mesas === 'string' ? JSON.parse(mesas) : mesas;
    return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const normalizeReservation = (reservation) => ({
  ...reservation,
  fecha: toInputDate(reservation.fecha),
  hora: toInputTime(reservation.hora),
  mesas_asignadas: parseAssignedTables(reservation.mesas_asignadas)
});

export default function ReservationsManager() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTableStatus, setShowTableStatus] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');

  const initialFormState = {
    nombre_cliente: '',
    telefono_cliente: '',
    email: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '',
    numero_personas: 2,
    mesas_asignadas: [],
    notas: '',
    estado: 'pendiente'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Socket.io Connection
  useEffect(() => {
    const newSocket = io();
    
    newSocket.on('actualizacion', (data) => {
      console.log('📡 Evento recibido:', data.tipo);
      
      if (['reserva_creada', 'reservacion_actualizada', 'reserva_cancelada'].includes(data.tipo)) {
        cargarDatos();
        actualizarEstadoMesas();
      }
      
      if (data.tipo === 'mesa_actualizada') {
        cargarMesas();
      }
    });

    return () => newSocket.disconnect();
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, [filterDate, filterStatus]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate) params.fecha = filterDate;
      if (filterStatus) params.estado = filterStatus;
      
      const [resRes, tablesRes] = await Promise.all([
        axios.get(API_URL, { params }),
        axios.get(TABLES_API)
      ]);
      
      setReservations(unwrapArray(resRes.data).map(normalizeReservation));
      setTables(unwrapArray(tablesRes.data));
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError(getErrorMessage(err, 'Error al cargar los datos'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const cargarMesas = async () => {
    try {
      const response = await axios.get(TABLES_API);
      setTables(unwrapArray(response.data));
    } catch (err) {
      console.error("Error cargando mesas:", err);
    }
  };

  const actualizarEstadoMesas = async () => {
    try {
      const response = await axios.get(TABLES_API);
      setTables(unwrapArray(response.data));
    } catch (err) {
      console.error("Error actualizando estado mesas:", err);
      // Si hay error, recargar normalmente
      await cargarMesas();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.hora) throw new Error("La hora es obligatoria");

      const payload = {
        ...formData,
        numero_personas: Number(formData.numero_personas),
        mesas_asignadas: JSON.stringify(formData.mesas_asignadas.map(Number))
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        setSuccess('Reservación actualizada correctamente');
      } else {
        await axios.post(API_URL, payload);
        setSuccess('Reservación creada exitosamente');
      }

      handleCloseForm();
      await new Promise(resolve => setTimeout(resolve, 300));
      await cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al guardar'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Cancelar esta reservación?')) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSuccess('Reservación cancelada');
      await cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cancelar'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEdit = (res) => {
    setFormData(normalizeReservation(res));
    setEditingId(res.id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      ...initialFormState,
      fecha: new Date().toISOString().split('T')[0],
      mesas_asignadas: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTableSelection = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    
    // No permitir seleccionar mesas ocupadas a menos que ya estén seleccionadas
    if (table?.estado === 'ocupada' && !formData.mesas_asignadas.includes(tableId)) {
      setError('Esta mesa está ocupada y no puede ser asignada');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setFormData(prev => ({
      ...prev,
      mesas_asignadas: prev.mesas_asignadas.includes(tableId)
        ? prev.mesas_asignadas.filter(id => id !== tableId)
        : [...prev.mesas_asignadas, tableId]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'pendiente': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'confirmada': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'cancelada': 'bg-red-500/20 text-red-400 border-red-500/30',
      'finalizada': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getTableStateColor = (estado) => {
    const colors = {
      'disponible': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'ocupada': 'bg-red-500/20 text-red-400 border-red-500/30',
      'reservada': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'mantenimiento': 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    return colors[estado] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getTableNombres = (mesasIds) => {
    return tables
      .filter(t => mesasIds.includes(t.id))
      .map(t => `#${t.numero}`)
      .join(', ');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
            Reservaciones
          </h1>
          <p className="text-slate-400 mt-2">Gestiona las citas y asignación de mesas</p>
        </div>
        <div className="flex gap-4">
          <GlassButton onClick={() => setShowTableStatus(true)} variant="secondary">
            <EyeIcon className="w-5 h-5 mr-2" />
            Estado Mesas
          </GlassButton>
          <GlassButton onClick={() => setShowForm(true)} variant="primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Reserva
          </GlassButton>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <GlassCard className="mb-6 border-l-4 border-l-red-500 bg-red-900/20 animate-pulse">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-red-200">
              <ExclamationTriangleIcon className="w-6 h-6" /> 
              <span className="font-bold">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-white">✕</button>
          </div>
        </GlassCard>
      )}
      {success && (
        <GlassCard className="mb-6 border-l-4 border-l-emerald-500 bg-emerald-900/20">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-emerald-200">
              <CheckCircleIcon className="w-6 h-6" /> 
              <span className="font-bold">{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        </GlassCard>
      )}

      {/* Modal Estado de Mesas */}
      {showTableStatus && (
        <GlassCard className="mb-8 p-8 animate-in fade-in border-white/10 bg-slate-800/40 relative z-20">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <TableCellsIcon className="w-7 h-7 text-orange-400" />
              Estado de Mesas
            </h2>
            <button onClick={() => setShowTableStatus(false)} className="text-slate-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto p-4 bg-slate-900/20 rounded-2xl border border-white/5">
            {tables.length === 0 ? (
              <p className="text-slate-500 text-sm col-span-full text-center py-8">No hay mesas registradas</p>
            ) : (
              tables.map(table => (
                <div
                  key={table.id}
                  className={`p-4 rounded-xl text-center border transition-all cursor-default group hover:scale-105 ${getTableStateColor(table.estado)}`}
                >
                  <div className="text-lg font-black text-white">
                    #{table.numero}
                  </div>
                  <div className="text-xs uppercase font-bold mt-2 opacity-75">
                    {table.estado}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {table.capacidad} pax
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Leyenda */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-300">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-300">Ocupada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-slate-300">Reservada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span className="text-slate-300">Mantenimiento</span>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <GlassButton type="button" variant="primary" onClick={() => cargarMesas()} className="flex-1">
              Actualizar Estado
            </GlassButton>
            <GlassButton type="button" variant="secondary" onClick={() => setShowTableStatus(false)}>
              Cerrar
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard className="p-4 border-white/10">
          <label className={labelClass}>Fecha</label>
          <input 
            type="date" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
            className={inputClass} 
          />
        </GlassCard>
        
        <GlassCard className="p-4 border-white/10">
          <label className={labelClass}>Estado</label>
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

        <GlassCard className="p-4 border-white/10 bg-orange-900/10 flex flex-col justify-center items-center text-center">
          <span className="text-orange-400 text-xs uppercase font-bold">Total Reservas</span>
          <span className="text-3xl font-black text-white">{reservations.length}</span>
        </GlassCard>
      </div>

      {/* Formulario Modal */}
      {showForm && (
        <GlassCard className="mb-8 p-8 animate-in fade-in border-white/10 bg-slate-800/40 relative z-20 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 sticky top-0 bg-slate-800/40">
            <h2 className="text-2xl font-bold text-white">
              {editingId ? 'Editar Reservación' : 'Nueva Reservación'}
            </h2>
            <button onClick={handleCloseForm} className="text-slate-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos del Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Nombre Cliente</label>
                <input 
                  name="nombre_cliente" 
                  type="text" 
                  value={formData.nombre_cliente} 
                  onChange={handleInputChange}
                  className={inputClass} 
                  required 
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input 
                  name="telefono_cliente" 
                  type="tel" 
                  value={formData.telefono_cliente} 
                  onChange={handleInputChange}
                  className={inputClass} 
                  placeholder="+52 ..."
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  className={inputClass} 
                  placeholder="cliente@email.com"
                />
              </div>
            </div>

            {/* Detalles de la Reserva */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className={labelClass}>Fecha</label>
                <input 
                  name="fecha" 
                  type="date" 
                  value={formData.fecha} 
                  onChange={handleInputChange}
                  className={inputClass} 
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Hora</label>
                <input 
                  name="hora" 
                  type="time" 
                  value={formData.hora} 
                  onChange={handleInputChange}
                  className={inputClass} 
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Personas</label>
                <input 
                  name="numero_personas" 
                  type="number" 
                  min="1" 
                  value={formData.numero_personas} 
                  onChange={handleInputChange}
                  className={inputClass} 
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select 
                  name="estado" 
                  value={formData.estado} 
                  onChange={handleInputChange} 
                  className={selectClass}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>
            </div>

            {/* Selector de Mesas */}
            <div>
              <label className={labelClass}>Asignar Mesas</label>
              <p className="text-xs text-slate-500 mb-3 ml-1">Las mesas en rojo están ocupadas y no pueden ser asignadas</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-2 max-h-48 overflow-y-auto p-2 bg-slate-900/30 rounded-2xl border border-white/5">
                {tables.length === 0 ? (
                  <p className="text-slate-500 text-sm col-span-full text-center py-4">No hay mesas registradas</p>
                ) : (
                  tables.map(table => {
                    const isSelected = formData.mesas_asignadas.includes(table.id);
                    const isOccupied = table.estado === 'ocupada';
                    const canSelect = !isOccupied || isSelected;

                    return (
                      <button
                        key={table.id}
                        type="button"
                        disabled={!canSelect}
                        onClick={() => toggleTableSelection(table.id)}
                        className={`p-3 rounded-xl text-sm font-bold transition-all border ${
                          isSelected 
                            ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20 scale-105' 
                            : isOccupied
                              ? 'bg-red-900/20 text-red-400 border-red-900/50 opacity-50 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700 hover:border-white/20 cursor-pointer'
                        }`}
                        title={isOccupied ? 'Esta mesa está ocupada' : `Mesa ${table.numero}`}
                      >
                        <div className="text-lg">#</div>
                        <div>{table.numero}</div>
                        <div className="text-xs opacity-75">{table.estado}</div>
                      </button>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3 ml-1">
                {formData.mesas_asignadas.length > 0 
                  ? `${formData.mesas_asignadas.length} mesa(s) seleccionada(s)` 
                  : 'Sin mesas asignadas'}
              </p>
            </div>
            
            <div>
              <label className={labelClass}>Notas Adicionales</label>
              <textarea 
                name="notas" 
                value={formData.notas} 
                onChange={handleInputChange}
                className={`${inputClass} h-20 resize-none`} 
                placeholder="Ej. Alergia a nueces, cumpleaños, etc."
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <GlassButton type="submit" variant="primary" className="flex-1">
                {editingId ? 'Actualizar' : 'Confirmar'}
              </GlassButton>
              <GlassButton type="button" variant="secondary" onClick={handleCloseForm}>
                Cancelar
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Lista de Reservaciones */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="font-bold tracking-widest uppercase">Cargando...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <GlassCard className="text-center py-20 border-dashed border-white/10">
              <CalendarDaysIcon className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">No hay reservaciones para esta fecha</p>
            </GlassCard>
          ) : (
            reservations.map((res) => {
              const mesasIds = parseAssignedTables(res.mesas_asignadas);
              const mesasNombres = getTableNombres(mesasIds);

              return (
                <GlassCard key={res.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:-translate-y-1 transition-transform border-white/10 bg-slate-800/30">
                  
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-2xl border ${getStatusColor(res.estado)} bg-opacity-10`}>
                      <ClockIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{res.nombre_cliente}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4"/> {res.hora}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4"/> {res.numero_personas} personas
                        </span>
                        {mesasNombres && (
                          <span className="flex items-center gap-1 text-orange-400 font-semibold">
                            <TableCellsIcon className="w-4 h-4"/> Mesas: {mesasNombres}
                          </span>
                        )}
                      </div>
                      {res.notas && (
                        <p className="mt-2 text-xs text-slate-500 italic">
                          💡 "{res.notas}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusColor(res.estado)}`}>
                      {res.estado}
                    </span>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(res)} 
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      {res.estado !== 'cancelada' && (
                        <button 
                          onClick={() => handleDelete(res.id)} 
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                          title="Cancelar"
                        >
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
}
