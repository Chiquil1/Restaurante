import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

// IMPORTACIONES OBLIGATORIAS SEGÚN REGLAS
import GlassCard from "../../components/GlassCard";
import GlassButton from "../../components/GlassButton";

const API_URL = '/api/menu';

// --- Estilos de Inputs Consistentes (Glassmorphism) ---
const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all";
const labelClass = "block text-sm font-bold text-slate-300 mb-1.5 ml-1";

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const initialFormState = {
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: '',
    ingredientes: '',
    tiempoPreparacion: '', // Frontend usa camelCase
    disponible: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  // --- Lógica de Conexión con Backend (API Directa) ---
  
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar errores previos
      const params = filterCategory ? { params: { categoria: filterCategory } } : {};
      
      const response = await axios.get(API_URL, params);
      setItems(response.data);
    } catch (err) {
      console.error("Error detallado fetching menu:", err);
      const msg = err.response?.data?.error || err.message || 'Error al cargar el menú';
      setError(`Error ${err.response?.status || 500}: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.warn("No se pudieron cargar categorías (quizás la ruta no existe aún):", err.message);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      // 🛠 CORRECCIÓN CRÍTICA: Adaptar datos del Frontend a la DB
      const payload = {
        ...formData,
        // Convertir camelCase a snake_case para la DB
        tiempo_preparacion: formData.tiempoPreparacion === '' ? null : Number(formData.tiempoPreparacion),
        precio: Number(formData.precio)
      };
      
      // Eliminar la propiedad antigua para no confundir al backend
      delete payload.tiempoPreparacion;

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        setSuccess('Plato actualizado correctamente');
      } else {
        const res = await axios.post(API_URL, payload);
        console.log("Plato creado:", res.data);
        setSuccess('Plato creado exitosamente');
      }
      
      handleCloseForm();
      await fetchMenuItems(); // Recargar lista inmediatamente
      
      // Auto-ocultar éxito
      setTimeout(() => setSuccess(''), 4000);
      
    } catch (err) {
      console.error("Error al guardar:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error desconocido al guardar';
      setError(`Fallo al guardar: ${errorMsg}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este plato?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setSuccess('Plato eliminado');
        fetchMenuItems();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al eliminar');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      precio: item.precio.toString(),
      // Asegurar que leemos la columna correcta de la DB
      tiempoPreparacion: item.tiempo_preparacion ? item.tiempo_preparacion.toString() : ''
    });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormState);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
            Gestor de Menú
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Administra tus platos y categorías con estilo premium.</p>
        </div>
        <GlassButton onClick={() => setShowForm(true)} variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuevo Plato
        </GlassButton>
      </div>

      {/* --- Alertas --- */}
      {error && (
        <GlassCard className="mb-6 border-l-4 border-l-red-500 bg-red-900/20 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
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
        <GlassCard className="mb-6 border-l-4 border-l-emerald-500 bg-emerald-900/20 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-emerald-200">
              <CheckIcon className="w-6 h-6" /> 
              <span className="font-bold">{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white transition">✕</button>
          </div>
        </GlassCard>
      )}

      {/* --- Filtros --- */}
      <GlassCard className="mb-8 p-4 flex flex-col md:flex-row items-center gap-4 backdrop-blur-xl border-white/10">
        <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Filtrar por categoría:
        </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`${inputClass} w-full md:w-auto cursor-pointer`}
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </GlassCard>

      {/* --- Formulario (Modal Inline) --- */}
      {showForm && (
        <GlassCard className="mb-8 p-8 animate-in fade-in slide-in-from-top-8 duration-300 border-white/10 bg-slate-800/40 shadow-2xl shadow-orange-500/10">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">
              {editingId ? 'Editar Plato' : 'Crear Nuevo Plato'}
            </h2>
            <button onClick={handleCloseForm} className="text-slate-400 hover:text-white transition">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nombre del Plato</label>
                <input 
                  name="nombre" type="text" value={formData.nombre} onChange={handleInputChange}
                  className={inputClass} required placeholder="Ej. Hamburguesa Royal"
                />
              </div>
              <div>
                <label className={labelClass}>Categoría</label>
                <input 
                  name="categoria" list="catList" value={formData.categoria} onChange={handleInputChange}
                  className={inputClass} required placeholder="Ej. Principal"
                />
                <datalist id="catList">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>Precio ($)</label>
                <input 
                  name="precio" type="number" step="0.01" min="0" value={formData.precio} onChange={handleInputChange}
                  className={inputClass} required placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>Tiempo Prep. (min)</label>
                <input 
                  name="tiempoPreparacion" type="number" min="0" value={formData.tiempoPreparacion} onChange={handleInputChange}
                  className={inputClass} placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea 
                name="descripcion" value={formData.descripcion} onChange={handleInputChange}
                className={`${inputClass} h-24`} placeholder="Detalles del plato..."
              />
            </div>
            
            <div>
              <label className={labelClass}>Ingredientes / Alérgenos</label>
              <textarea 
                name="ingredientes" value={formData.ingredientes} onChange={handleInputChange}
                className={`${inputClass} h-24`} placeholder="Separados por comas..."
              />
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-2xl border border-white/5">
              <input 
                type="checkbox" name="disponible" id="disponible"
                checked={formData.disponible} onChange={handleInputChange}
                className="w-6 h-6 text-orange-500 rounded focus:ring-orange-500/20 bg-slate-700 border-white/10" 
              />
              <label htmlFor="disponible" className="text-lg font-bold text-white select-none cursor-pointer">
                Disponible para venta
              </label>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <GlassButton type="submit" variant="primary" className="flex-1">
                {editingId ? 'Actualizar Plato' : 'Guardar Plato'}
              </GlassButton>
              <GlassButton type="button" variant="secondary" onClick={handleCloseForm}>
                Cancelar
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* --- Grid de Platos --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="font-bold tracking-widest uppercase">Cargando menú...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.length === 0 ? (
            <GlassCard className="col-span-full text-center py-20 border-dashed border-white/10">
              <p className="text-slate-400 text-lg">No se encontraron platos.</p>
              {!filterCategory && <p className="text-sm text-slate-500 mt-2">¡Agrega uno nuevo para comenzar!</p>}
            </GlassCard>
          ) : (
            items.map((item) => (
              <GlassCard key={item.id} className="p-6 flex flex-col h-full group hover:-translate-y-1 transition-transform duration-300 border-white/10 bg-slate-800/30">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-black text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full uppercase tracking-wider border border-orange-500/20">
                    {item.categoria}
                  </span>
                  {!item.disponible && (
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-1 rounded-full uppercase border border-red-500/20">
                      Agotado
                    </span>
                  )}
                </div>
                
                <h3 className="font-black text-xl text-white mb-2 group-hover:text-orange-400 transition-colors">{item.nombre}</h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">{item.descripcion || 'Sin descripción disponible'}</p>
                
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-white/10">
                  <div>
                    <span className="text-2xl font-black text-white tracking-tight">${Number(item.precio).toFixed(2)}</span>
                    {item.tiempo_preparacion && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 font-medium">
                        <ClockIcon className="w-3 h-3" /> {item.tiempo_preparacion} min
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
                      title="Editar"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
};