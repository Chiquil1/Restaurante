import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MenuService } from "../../Services/Api";
 // Importamos el servicio corregido

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: 0,
    ingredientes: '',
    tiempoPreparacion: 0,
    disponible: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [filterCategory]);

  // --- OPERACIONES DE DATOS ---

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await MenuService.getItems(filterCategory);
      setItems(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await MenuService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error cargando categorías:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await MenuService.update(editingId, formData);
        setSuccess('Plato actualizado correctamente');
      } else {
        await MenuService.create(formData);
        setSuccess('Plato creado exitosamente');
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchMenuItems();
    } catch (err) {
      setError(err.message || 'Error al guardar el plato');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este plato?')) {
      try {
        await MenuService.delete(id);
        setSuccess('Plato eliminado');
        fetchMenuItems();
      } catch (err) {
        setError(err.message || 'Error al eliminar');
      }
    }
  };

  // --- UTILIDADES ---

  const resetForm = () => {
    setFormData({
      nombre: '', descripcion: '', categoria: '', precio: 0,
      ingredientes: '', tiempoPreparacion: 0, disponible: true,
    });
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestor de Menú</h1>
        <button
          onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Plato
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-2"><XMarkIcon className="w-5 h-5" /> {error}</div>
          <button onClick={() => setError('')} className="font-bold">X</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-2"><CheckIcon className="w-5 h-5" /> {success}</div>
          <button onClick={() => setSuccess('')} className="font-bold">X</button>
        </div>
      )}

      {/* Filtro */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm w-fit">
        <label className="text-sm font-semibold text-slate-700">
          Filtrar por categoría:
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="ml-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.categoria} value={cat.categoria}>{cat.categoria}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 animate-in fade-in zoom-in duration-200">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar Plato' : 'Nuevo Plato'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="mt-1 w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <input list="catList" value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} className="mt-1 w-full p-2 border rounded-lg" required />
                <datalist id="catList">{categories.map(c => <option key={c.categoria} value={c.categoria} />)}</datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
                <input type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value)})} className="mt-1 w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tiempo Prep. (min)</label>
                <input type="number" value={formData.tiempoPreparacion} onChange={(e) => setFormData({...formData, tiempoPreparacion: parseInt(e.target.value)})} className="mt-1 w-full p-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="mt-1 w-full p-2 border rounded-lg" rows="2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ingredientes</label>
              <textarea value={formData.ingredientes} onChange={(e) => setFormData({...formData, ingredientes: e.target.value})} className="mt-1 w-full p-2 border rounded-lg" rows="2" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.disponible} onChange={(e) => setFormData({...formData, disponible: e.target.checked})} className="w-4 h-4" />
              <span className="text-sm font-medium">Disponible para venta</span>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Guardar Plato</button>
              <button type="button" onClick={() => {setShowForm(false); setEditingId(null);}} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Platos */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando platos del menú...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{item.nombre}</h3>
                  <span className="text-xs font-medium text-blue-500 uppercase">{item.categoria}</span>
                </div>
                {!item.disponible && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded uppercase">Agotado</span>}
              </div>
              <p className="text-gray-500 text-sm my-2 line-clamp-2">{item.descripcion}</p>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-xl font-bold text-gray-900">${item.precio}</span>
                  <span className="ml-2 text-xs text-gray-400">{item.tiempo_preparacion} min</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
