import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  UserGroupIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

import GlassCard from "../../components/GlassCard";
import GlassButton from "../../components/GlassButton";

const API_URL = '/api/tables';

const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all";
const labelClass = "block text-sm font-bold text-slate-300 mb-1.5 ml-1";
const selectClass = "w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all cursor-pointer";

export default function TablesMap() {
  const [tables, setTables] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [socket, setSocket] = useState(null);

  const initialFormState = {
    numero: '',
    capacidad: 2,
    piso: 1,
    ubicacion: '',
    estado: 'libre',
    mesero_id: '',
    cliente: '',
    total: 0,
    posicion_x: 0,
    posicion_y: 0
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- Socket.io Connection ---
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    // Escuchar actualizaciones en tiempo real
    newSocket.on('actualizacion', (data) => {
      console.log('📡 Actualización recibida en TablesMap:', data);
      
      // Recargar cuando hay cambios en mesas, órdenes o reservaciones
      if (data.tipo && ['orden_creada', 'orden_cancelada', 'orden_actualizada', 'mesa_actualizada', 'mesa_liberada', 'reserva_creada', 'reserva_cancelada', 'mesa_creada'].includes(data.tipo)) {
        console.log('🔄 Recargando estado de mesas...');
        fetchTables();
      }
    });

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    fetchTables();
    fetchStaff();
  }, [filterStatus]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const params = filterStatus ? { params: { estado: filterStatus } } : {};
      const response = await axios.get(API_URL, params);
      // Manejar respuesta con estructura { success, data, count, ... }
      const tablesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setTables(tablesData);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError('Error al cargar las mesas. Verifica la API.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get('/api/staff');
      // Manejar respuesta con estructura { success, data, count, ... }
      const staffData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setStaff(staffData);
    } catch (err) {
      console.log("No se pudo cargar el personal");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        numero: Number(formData.numero),
        capacidad: Number(formData.capacidad),
        piso: Number(formData.piso),
        total: Number(formData.total),
        mesero_id: formData.mesero_id ? Number(formData.mesero_id) : null
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        setSuccess('Mesa actualizada correctamente');
      } else {
        await axios.post(API_URL, payload);
        setSuccess('Mesa creada exitosamente');
      }
      handleCloseForm();
      fetchTables();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al guardar la mesa');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta mesa?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setSuccess('Mesa eliminada');
        fetchTables();
      } catch (err) {
        setError('Error al eliminar');
      }
    }
  };

  const handleEdit = (table) => {
    setFormData({
      ...table,
      mesero_id: table.mesero_id || ''
    });
    setEditingId(table.id);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'libre': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'ocupada': return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'reservada': return 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
            Mapa de Mesas
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Gestiona la disposición y estado de tu salón.</p>
        </div>
        <GlassButton onClick={() => setShowForm(true)} variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Nueva Mesa
        </GlassButton>
      </div>

      {error && (
        <GlassCard className="mb-6 border-l-4 border-l-red-500 bg-red-900/20 backdrop-blur-md">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-red-200">
              <XMarkIcon className="w-6 h-6" /> 
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-white/10">
          <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Mesas</span>
          <span className="text-3xl font-black text-white">{tables.length}</span>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-white/10 bg-emerald-900/10">
          <span className="text-emerald-400 text-xs uppercase font-bold tracking-wider">Libres</span>
          <span className="text-3xl font-black text-emerald-400">{tables.filter(t => t.estado === 'libre').length}</span>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-white/10 bg-red-900/10">
          <span className="text-red-400 text-xs uppercase font-bold tracking-wider">Ocupadas</span>
          <span className="text-3xl font-black text-red-400">{tables.filter(t => t.estado === 'ocupada').length}</span>
        </GlassCard>
        
        <GlassCard className="p-4 flex items-center justify-between border-white/10">
           <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Filtrar:</label>
           <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${selectClass} w-auto text-sm py-2`}
          >
            <option value="">Todas</option>
            <option value="libre">Libres</option>
            <option value="ocupada">Ocupadas</option>
            <option value="reservada">Reservadas</option>
          </select>
        </GlassCard>
      </div>

      {showForm && (
        <GlassCard className="mb-8 p-8 animate-in fade-in slide-in-from-top-8 duration-300 border-white/10 bg-slate-800/40">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">
              {editingId ? 'Editar Mesa' : 'Crear Nueva Mesa'}
            </h2>
            <button onClick={handleCloseForm} className="text-slate-400 hover:text-white transition">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Número de Mesa</label>
                <input 
                  name="numero" type="number" value={formData.numero} onChange={handleInputChange}
                  className={inputClass} required placeholder="Ej. 1"
                />
              </div>
              <div>
                <label className={labelClass}>Capacidad (Personas)</label>
                <input 
                  name="capacidad" type="number" value={formData.capacidad} onChange={handleInputChange}
                  className={inputClass} required placeholder="Ej. 4"
                />
              </div>
              <div>
                <label className={labelClass}>Ubicación / Zona</label>
                <input 
                  name="ubicacion" type="text" value={formData.ubicacion} onChange={handleInputChange}
                  className={inputClass} placeholder="Ej. Terraza, Ventana"
                />
              </div>
              <div>
                <label className={labelClass}>Piso</label>
                <input 
                  name="piso" type="number" value={formData.piso} onChange={handleInputChange}
                  className={inputClass} placeholder="1"
                />
              </div>
              <div>
                <label className={labelClass}>Estado Inicial</label>
                <select name="estado" value={formData.estado} onChange={handleInputChange} className={selectClass}>
                  <option value="libre">Libre</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="reservada">Reservada</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Asignar Mesero (Opcional)</label>
                <select name="mesero_id" value={formData.mesero_id} onChange={handleInputChange} className={selectClass}>
                  <option value="">Sin asignar</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} {s.apellido}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <GlassButton type="submit" variant="primary" className="flex-1">
                {editingId ? 'Actualizar Mesa' : 'Guardar Mesa'}
              </GlassButton>
              <GlassButton type="button" variant="secondary" onClick={handleCloseForm}>
                Cancelar
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="font-bold tracking-widest uppercase">Cargando mapa...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.length === 0 ? (
            <GlassCard className="col-span-full text-center py-20 border-dashed border-white/10">
              <MapPinIcon className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">No hay mesas registradas.</p>
            </GlassCard>
          ) : (
            tables.map((table) => (
              <GlassCard key={table.id} className={`p-6 flex flex-col h-full group hover:-translate-y-2 transition-transform duration-300 border-white/10 relative overflow-hidden ${getStatusColor(table.estado).split(' ')[0]}`}>
                
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none`} />

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(table.estado)}`}>
                    {table.estado}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(table)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(table.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-6 relative z-10 flex-grow">
                  <h3 className="text-3xl font-black text-white mb-1">Mesa #{table.numero}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{table.ubicacion || 'Sin ubicación'} • Piso {table.piso}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>Capacidad: <strong className="text-white">{table.capacidad}</strong> pax</span>
                  </div>
                  
                  {table.cliente && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                       <p className="text-xs text-slate-500 uppercase font-bold">Cliente Actual</p>
                       <p className="text-white font-medium truncate">{table.cliente}</p>
                    </div>
                  )}
                  
                  {table.estado === 'ocupada' && (
                     <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-slate-400">Consumo:</span>
                        <span className="text-orange-400 font-bold">${Number(table.total || 0).toFixed(2)}</span>
                     </div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-white/10 relative z-10">
                   {table.mesero_id ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <ClockIcon className="w-3 h-3" />
                        <span>Atendido por Staff ID: {table.mesero_id}</span>
                      </div>
                   ) : (
                      <span className="text-xs text-slate-600 italic">Sin mesero asignado</span>
                   )}
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}