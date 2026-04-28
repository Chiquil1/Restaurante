import { useState, useEffect } from "react";
import {
  PlusIcon, UserCircleIcon, CalendarDaysIcon, XMarkIcon,
  EnvelopeIcon, CurrencyDollarIcon, ClockIcon, UsersIcon,
  ChevronLeftIcon, ChevronRightIcon
} from "@heroicons/react/24/outline";
import GlassCard from "../../components/GlassCard";
import GlassButton from "../../components/GlassButton";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function Staff() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const [scheduleData, setScheduleData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [editingCell, setEditingCell] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dni_curp: '', email: '',
    telefono: '', direccion: '', puesto: '', salario: '',
    turno: 'Mañana', username: '', password: '', rol_permisos: 'empleado'
  });

  useEffect(() => {
    loadStaff();
    loadSchedule();
  }, [currentMonth, currentYear]);

  const loadStaff = async () => {
    try {
      const response = await axios.get(`${API_URL}/staff`);
      setEmployees(response.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadSchedule = async () => {
    try {
      const response = await axios.get(`${API_URL}/staff/schedule`, { params: { month: currentMonth, year: currentYear } });
      setScheduleData(response.data);
    } catch (err) { console.error("Error cargando horario", err); }
  };

  const loadAbsences = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/staff/${id}/ausencias`);
      setAbsences(response.data);
    } catch (err) { console.error(err); }
  };

  const handleEmployeeClick = (emp) => {
    setSelectedEmployee(emp);
    loadAbsences(emp.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/staff`, formData);
      alert("Empleado creado con éxito");
      setShowForm(false);
      setFormData({ nombre: '', apellido: '', dni_curp: '', email: '', telefono: '', direccion: '', puesto: '', salario: '', turno: 'Mañana', username: '', password: '', rol_permisos: 'empleado' });
      loadStaff();
    } catch (err) {
      alert("Error al crear empleado: " + err.message);
    }
  };

  const changeMonth = (offset) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleUpdateShift = async (empId, day, newShift) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      await axios.put(`${API_URL}/staff/shift`, { personal_id: empId, fecha: dateStr, tipo_turno: newShift });
      setEditingCell(null);
      loadSchedule();
    } catch (err) {
      alert("Error al actualizar turno");
    }
  };

  const shiftOptions = ['AM', 'PM', 'PSG', 'D', 'INCAPACIDAD', '-'];
  const shiftColors = {
    'AM': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'PM': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'PSG': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'D': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'INCAPACIDAD': 'bg-red-500/20 text-red-400 border-red-500/30',
    '-': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'default': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getShift = (empId, day) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const record = scheduleData.find(r => {
      if (!r.fecha) return false;
      const dbDate = new Date(r.fecha).toISOString().split('T')[0];
      return r.personal_id === empId && dbDate === dateStr;
    });

    return record ? record.tipo_turno : '-';
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-orange-500 text-xl font-bold animate-pulse">Cargando Personal...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Staff</span>
          </h1>
          <p className="text-slate-400 mt-2">Administración de recursos humanos y horarios</p>
        </div>
        <GlassButton variant="primary" onClick={() => setShowForm(true)}>
          <PlusIcon className="w-5 h-5" /> Agregar Empleado
        </GlassButton>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white/5 p-1 w-fit rounded-2xl border border-white/10 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'list'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UsersIcon className="w-4 h-4" /> Lista de Personal
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'schedule'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ClockIcon className="w-4 h-4" /> Horario Laboral
        </button>
      </div>

      {/* Lista de Personal */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {employees.map(emp => (
            <GlassCard key={emp.id} className="group cursor-pointer hover:-translate-y-1 transition-all duration-300" onClick={() => handleEmployeeClick(emp)}>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl border border-orange-500/20 group-hover:border-orange-500/40 transition-colors">
                    <UserCircleIcon className="w-10 h-10 text-orange-400" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-white truncate">{emp.nombre} {emp.apellido}</h3>
                    <p className="text-xs text-slate-400 font-black uppercase truncate">{emp.puesto}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                    emp.estado === 'activo'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {emp.estado || 'activo'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{emp.turno}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Horario */}
      {activeTab === 'schedule' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-6">
             <div className="flex gap-2 items-center bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white">
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <span className="font-black text-white px-4 uppercase tracking-widest">
                   {new Date(currentYear, currentMonth - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white">
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
             </div>
             <div className="flex gap-3">
                {Object.entries(shiftColors).filter(([k]) => k !== 'default' && k !== '-').map(([key, color]) => (
                  <div key={key} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${color} backdrop-blur-sm`}>
                    {key}
                  </div>
                ))}
             </div>
          </div>

          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 sticky left-0 z-10 bg-slate-800/80 backdrop-blur-xl border-b border-r border-white/10 min-w-[200px] text-slate-400 text-xs font-black uppercase">
                      Empleado
                    </th>
                    {daysArray.map(day => (
                      <th key={day} className="p-2 border-b border-white/10 text-center min-w-[45px] text-slate-400 text-[10px] font-black uppercase">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 sticky left-0 z-10 bg-slate-900/80 group-hover:bg-slate-800/80 backdrop-blur-xl border-r border-white/10 font-bold text-white text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full text-white text-[10px] flex items-center justify-center font-black">
                            {emp.nombre[0]}
                          </div>
                          {emp.nombre} {emp.apellido}
                        </div>
                      </td>
                      {daysArray.map(day => {
                        const shift = getShift(emp.id, day);
                        return (
                          <td key={day} className="p-1 border-b border-white/10 text-center relative">
                            <div
                              onClick={() => setEditingCell({ empId: emp.id, day })}
                              className={`py-2 px-1 rounded-lg text-[10px] font-black cursor-pointer transition-all hover:scale-110 border ${shiftColors[shift] || shiftColors.default}`}
                            >
                              {shift}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {editingCell && (
            <div className="fixed z-50 bg-slate-800 shadow-2xl border border-white/10 p-4 rounded-3xl flex gap-2 animate-in zoom-in duration-200 backdrop-blur-xl"
                 style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div className="text-[10px] font-black text-slate-400 uppercase p-2 flex items-center">Cambiar Turno:</div>
              <div className="flex gap-2">
                {shiftOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleUpdateShift(editingCell.empId, editingCell.day, opt)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${shiftColors[opt] || shiftColors.default}`}
                  >
                    {opt}
                  </button>
                ))}
                <button onClick={() => setEditingCell(null)} className="p-1 text-slate-400 hover:text-red-400">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulario Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-black text-white">Nuevo Empleado</h2>
              <button onClick={() => setShowForm(false)}>
                <XMarkIcon className="w-6 h-6 text-slate-400 hover:text-white transition" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto grid grid-cols-2 gap-4">
              <Input label="Nombre" type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
              <Input label="Apellido" type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} required />
              <Input label="DNI / CURP" type="text" value={formData.dni_curp} onChange={(e) => setFormData({...formData, dni_curp: e.target.value})} required />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <Input label="Teléfono" type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
              <Input label="Puesto" type="text" value={formData.puesto} onChange={(e) => setFormData({...formData, puesto: e.target.value})} required />
              <Input label="Salario" type="number" value={formData.salario} onChange={(e) => setFormData({...formData, salario: e.target.value})} />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Turno</label>
                <select className="p-3 rounded-xl border border-white/10 bg-slate-800 text-white text-sm font-bold outline-none focus:border-orange-500 transition" value={formData.turno} onChange={(e) => setFormData({...formData, turno: e.target.value})}>
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>
              <Input label="Username" type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
              <Input label="Contraseña" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Rol</label>
                <select className="p-3 rounded-xl border border-white/10 bg-slate-800 text-white text-sm font-bold outline-none focus:border-orange-500 transition" value={formData.rol_permisos} onChange={(e) => setFormData({...formData, rol_permisos: e.target.value})}>
                  <option value="admin">Administrador</option>
                  <option value="empleado">Empleado</option>
                  <option value="mesero">Mesero</option>
                  <option value="cocina">Cocina</option>
                </select>
              </div>
              <div className="col-span-2">
                <Input label="Dirección" type="text" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
              </div>
              <GlassButton variant="primary" type="submit" className="col-span-2 mt-4">
                Guardar Empleado
              </GlassButton>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Modal Detalles Empleado */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-4xl max-h-[80vh] overflow-hidden flex">
            <div className="w-1/3 bg-white/5 p-8 border-r border-white/10">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-black mb-4">
                  {selectedEmployee.nombre[0]}
                </div>
                <h2 className="text-xl font-black text-white">{selectedEmployee.nombre} {selectedEmployee.apellido}</h2>
                <p className="text-orange-400 font-bold text-sm uppercase">{selectedEmployee.puesto}</p>
              </div>
              <div className="mt-8 space-y-4">
                <DetailItem icon={<EnvelopeIcon className="w-4 h-4" />} label="Email" value={selectedEmployee.email} />
                <DetailItem icon={<CurrencyDollarIcon className="w-4 h-4" />} label="Salario" value={`$${selectedEmployee.salario}`} />
                <DetailItem icon={<CalendarDaysIcon className="w-4 h-4" />} label="Turno" value={selectedEmployee.turno} />
              </div>
            </div>
            <div className="w-2/3 p-8 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-white">Control de Asistencia</h3>
                <button onClick={() => setSelectedEmployee(null)}>
                  <XMarkIcon className="w-6 h-6 text-slate-400 hover:text-white transition" />
                </button>
              </div>
              <div className="flex gap-4 mb-6">
                <GlassButton variant="primary">+ Solicitar Vacaciones / Permiso</GlassButton>
              </div>
              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="text-slate-400 text-xs uppercase font-bold border-b border-white/10">
                    <tr>
                      <th className="py-3">Tipo</th>
                      <th className="py-3">Periodo</th>
                      <th className="py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {absences.map(abs => (
                      <tr key={abs.id} className="text-sm">
                        <td className="py-4 font-bold text-white">{abs.tipo}</td>
                        <td className="py-4 text-slate-400">{abs.fecha_inicio} → {abs.fecha_fin}</td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-lg bg-white/10 text-slate-300 text-[10px] font-black uppercase">
                            {abs.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase">{label}</label>
    <input
      {...props}
      className="p-3 rounded-xl border border-white/10 bg-slate-800 text-white text-sm font-bold outline-none focus:border-orange-500 transition-all placeholder-slate-500"
    />
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
    <div className="text-orange-400">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
      <p className="text-sm font-bold text-white">{value || 'N/A'}</p>
    </div>
  </div>
);

export default Staff;
