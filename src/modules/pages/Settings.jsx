import { useEffect, useState } from "react";
import {
  CogIcon, BellIcon, ShieldCheckIcon, GlobeAltIcon, FireIcon,
  CheckCircleIcon, ExclamationTriangleIcon, EyeIcon, EyeSlashIcon,
  ArrowRightIcon, CreditCardIcon, ClockIcon, EnvelopeIcon, PhoneIcon, MapPinIcon
} from "@heroicons/react/24/outline";

export default function Settings() {
  // --- ESTADOS DE DATOS ---
  const [generalSettings, setGeneralSettings] = useState({
    nombreNegocio: "GustoSoft Restaurante",
    moneda: "MXN",
    horarioApertura: "09:00",
    horarioCierre: "23:00",
    telefonoContacto: "984-123-4567",
    email: "info@gustosoft.com",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    alertasPreparacion: true,
    alertasStock: true,
    alertasReservas: true,
    correoAdminOrden: true,
    avisoSonoro: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordActual: "",
    passwordNueva: "",
    passwordConfirmar: "",
    autenticacionDosFactores: false,
  });

  const [branchSettings, setBranchSettings] = useState({
    nombreSucursal: "Playa del Carmen",
    direccion: "Av. Paseo del Cenote, Playa del Carmen",
    ciudad: "Playa del Carmen",
    estado: "Quintana Roo",
    codigoPostal: "77710",
    telefono: "984-123-4567",
    ultimoBackup: "No registrado",
  });

  const userSettings = {
    nombreUsuario: "Nestor Alejandro",
    email: "nestor@gustosoft.com",
    rol: "Administrador",
  };

  // --- ESTADOS DE UI ---
  const [activeSection, setActiveSection] = useState("general");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // --- CARGA DE DATOS (Sincronizado con Backend Corregido) ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) return;
        const data = await response.json();
        const { general, notificaciones, sucursal } = data;

        if (general) {
          setGeneralSettings({
            nombreNegocio: general.nombreNegocio || "GustoSoft",
            moneda: general.moneda || "MXN",
            horarioApertura: general.horario_apertura || "09:00",
            horarioCierre: general.horario_cierre || "23:00",
            telefonoContacto: general.telefono || "",
            email: general.email || "",
          });
        }
        if (notificaciones) {
          setNotificationSettings({
            alertasPreparacion: !!notificaciones.alertasPreparacion,
            alertasStock: !!notificaciones.alertasStock,
            alertasReservas: !!notificaciones.alertasReservas,
            correoAdminOrden: !!notificaciones.correoAdmin,
            avisoSonoro: !!notificaciones.avisoSonoro,
          });
        }
        if (sucursal) {
          setBranchSettings(prev => ({
            ...prev,
            nombreSucursal: sucursal.nombreSucursal || "",
            direccion: sucursal.direccion || "",
            ciudad: sucursal.ciudad || "",
            estado: sucursal.estado || "",
            codigoPostal: sucursal.codigoPostal || "",
            telefono: sucursal.telefono || "",
          }));
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    loadSettings();
  }, []);

  // --- HANDLERS DE GUARDADO ---
  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generalSettings),
      });
      if (!response.ok) throw new Error();
      showMessage("success", "Configuración general actualizada con éxito");
    } catch (err) {
      showMessage("error", "Error al guardar la configuración");
    } finally { setLoading(false); }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationSettings),
      });
      if (!response.ok) throw new Error();
      showMessage("success", "Preferencias de notificación guardadas");
    } catch (err) {
      showMessage("error", "Error al actualizar notificaciones");
    } finally { setLoading(false); }
  };

  const handleSaveBranch = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings/branch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchSettings),
      });
      if (!response.ok) throw new Error();
      showMessage("success", "Datos de sucursal actualizados");
    } catch (err) {
      showMessage("error", "Error al guardar sucursal");
    } finally { setLoading(false); }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings/backup", { method: "POST" });
      if (!response.ok) throw new Error();
      setBranchSettings(prev => ({ ...prev, ultimoBackup: new Date().toLocaleString() }));
      showMessage("success", "Backup de base de datos creado exitosamente");
    } catch (err) {
      showMessage("error", "Error al ejecutar backup");
    } finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (securitySettings.passwordNueva !== securitySettings.passwordConfirmar) {
      return showMessage("error", "Las contraseñas no coinciden");
    }
    setLoading(true);
    try {
      const response = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordActual: securitySettings.passwordActual,
          passwordNueva: securitySettings.passwordNueva,
        }),
      });
      if (!response.ok) throw new Error();
      setSecuritySettings(prev => ({ ...prev, passwordActual: "", passwordNueva: "", passwordConfirmar: "" }));
      showMessage("success", "Contraseña actualizada correctamente");
    } catch (err) {
      showMessage("error", "Error al cambiar la contraseña");
    } finally { setLoading(false); }
  };

  // --- COMPONENTES DE UI ---
  const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <input
          {...props}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-slate-700 font-medium"
        />
      </div>
    </div>
  );

  const ToggleItem = ({ label, key }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer group">
      <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
      <button
        onClick={() => setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }))}
        className={`w-12 h-6 rounded-full transition-all relative ${notificationSettings[key] ? 'bg-orange-500' : 'bg-slate-300'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${notificationSettings[key] ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const sections = [
    { id: "general", title: "General", desc: "Identidad y Horarios", icon: CogIcon },
    { id: "notifications", title: "Notificaciones", desc: "Alertas y Sonidos", icon: BellIcon },
    { id: "security", title: "Seguridad", desc: "Acceso y Privacidad", icon: ShieldCheckIcon },
    { id: "branch", title: "Sucursal", desc: "Ubicación y Backup", icon: GlobeAltIcon },
  ];

  return (
    <div className="p-6 lg:p-10 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      {/* TOP HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg text-white rotate-3">
              <CogIcon className="h-8 w-8" />
            </div>
            Ajustes del Sistema
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-12">Personaliza la experiencia de GustoSoft POS</p>
        </div>

        {/* USER QUICK CARD */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 flex items-center justify-center text-white font-bold shadow-lg">
            {userSettings.nombreUsuario[0]}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">{userSettings.nombreUsuario}</p>
            <p className="text-xs text-slate-500 font-medium">{userSettings.rol}</p>
          </div>
        </div>
      </div>

      {/* MESSAGE NOTIFICATION */}
      {message.text && (
        <div className={`fixed top-6 right-6 z-50 animate-bounce-in p-4 rounded-2xl border shadow-xl flex items-center gap-3 max-w-sm ${
          message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
        }`}>
          {message.type === "success" ? <CheckCircleIcon className="h-6 w-6" /> : <ExclamationTriangleIcon className="h-6 w-6" />}
          <p className="font-bold text-sm">{message.text}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Menú de Configuración</p>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all group ${
                activeSection === section.id 
                ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-2" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${activeSection === section.id ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400 group-hover:text-orange-500"}`}>
                <section.icon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">{section.title}</p>
                <p className={`text-xs ${activeSection === section.id ? "text-slate-400" : "text-slate-400"}`}>{section.desc}</p>
              </div>
              <ArrowRightIcon className={`h-4 w-4 ml-auto transition-transform ${activeSection === section.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
            </button>
          ))}

          {/* SUPPORT MINI CARD */}
          <div className="mt-10 p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-orange-200">
            <div className="relative z-10">
              <h4 className="font-black italic text-lg mb-2">¿Soporte Técnico?</h4>
              <p className="text-orange-100 text-xs mb-4 opacity-80">Estamos disponibles 24/7 para ayudarte.</p>
              <button className="w-full py-2 bg-white text-orange-600 rounded-xl font-bold text-xs hover:bg-orange-50 transition-colors">
                Contactar Soporte
              </button>
            </div>
            <FireIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-white/20 rotate-12" />
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 min-h-[600px] transition-all">
            
            {/* GENERAL SECTION */}
            {activeSection === "general" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <CogIcon className="h-8 w-8 text-orange-500" />
                  <h2 className="text-2xl font-black text-slate-800 uppercase italic">Configuración General</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InputField 
                    label="Nombre del Negocio" icon={CogIcon} 
                    value={generalSettings.nombreNegocio}
                    onChange={e => setGeneralSettings({...generalSettings, nombreNegocio: e.target.value})}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Moneda</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                        <CreditCardIcon className="h-5 w-5" />
                      </div>
                      <select
                        value={generalSettings.moneda}
                        onChange={e => setGeneralSettings({...generalSettings, moneda: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-slate-700 font-medium"
                      >
                        <option>MXN</option><option>USD</option><option>EUR</option>
                      </select>
                    </div>
                  </div>
                  <InputField 
                    label="Apertura" icon={ClockIcon} type="time"
                    value={generalSettings.horarioApertura}
                    onChange={e => setGeneralSettings({...generalSettings, horarioApertura: e.target.value})}
                  />
                  <InputField 
                    label="Cierre" icon={ClockIcon} type="time"
                    value={generalSettings.horarioCierre}
                    onChange={e => setGeneralSettings({...generalSettings, horarioCierre: e.target.value})}
                  />
                  <InputField 
                    label="Teléfono" icon={PhoneIcon} type="tel"
                    value={generalSettings.telefonoContacto}
                    onChange={e => setGeneralSettings({...generalSettings, telefonoContacto: e.target.value})}
                  />
                  <InputField 
                    label="Email" icon={EnvelopeIcon} type="email"
                    value={generalSettings.email}
                    onChange={e => setGeneralSettings({...generalSettings, email: e.target.value})}
                  />
                </div>

                <button
                  onClick={handleSaveGeneral}
                  disabled={loading}
                  className="w-full mt-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:bg-slate-400 shadow-xl shadow-slate-200"
                >
                  {loading ? "Guardando..." : "💾 Guardar Cambios Generales"}
                </button>
              </div>
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeSection === "notifications" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <BellIcon className="h-8 w-8 text-orange-500" />
                  <h2 className="text-2xl font-black text-slate-800 uppercase italic">Preferencias de Alertas</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleItem label="Alertas de Preparación" key="alertasPreparacion" />
                  <ToggleItem label="Alertas de Stock Bajo" key="alertasStock" />
                  <ToggleItem label="Alertas de Reservas" key="alertasReservas" />
                  <ToggleItem label="Notificación Admin Email" key="correoAdminOrden" />
                  <ToggleItem label="Aviso Sonoro Activo" key="avisoSonoro" />
                </div>

                <button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="w-full mt-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:bg-slate-400"
                >
                  {loading ? "Guardando..." : "🔔 Guardar Notificaciones"}
                </button>
              </div>
            )}

            {/* SECURITY SECTION */}
            {activeSection === "security" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheckIcon className="h-8 w-8 text-orange-500" />
                  <h2 className="text-2xl font-black text-slate-800 uppercase italic">Seguridad de Cuenta</h2>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <InputField 
                      label="Contraseña Actual" icon={ShieldCheckIcon} type="password"
                      value={securitySettings.passwordActual}
                      onChange={e => setSecuritySettings({...securitySettings, passwordActual: e.target.value})}
                    />
                    <div className="relative">
                      <InputField 
                        label="Nueva Contraseña" icon={ShieldCheckIcon} 
                        type={showPassword ? "text" : "password"}
                        value={securitySettings.passwordNueva}
                        onChange={e => setSecuritySettings({...securitySettings, passwordNueva: e.target.value})}
                      />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-11 text-slate-400 hover:text-orange-500"
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    <InputField 
                      label="Confirmar Nueva Contraseña" icon={ShieldCheckIcon} type="password"
                      value={securitySettings.passwordConfirmar}
                      onChange={e => setSecuritySettings({...securitySettings, passwordConfirmar: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">Autenticación 2FA</p>
                      <p className="text-xs text-blue-700 opacity-70">Añade seguridad extra a tu acceso</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSecuritySettings(prev => ({...prev, autenticacionDosFactores: !prev.autenticacionDosFactores}))}
                    className={`w-12 h-6 rounded-full transition-all relative ${securitySettings.autenticacionDosFactores ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${securitySettings.autenticacionDosFactores ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all active:scale-95"
                >
                  {loading ? "Actualizando..." : "🔐 Actualizar Credenciales"}
                </button>
              </div>
            )}

            {/* BRANCH SECTION */}
            {activeSection === "branch" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <GlobeAltIcon className="h-8 w-8 text-orange-500" />
                  <h2 className="text-2xl font-black text-slate-800 uppercase italic">Datos de Sucursal</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputField label="Nombre Sucursal" icon={GlobeAltIcon} 
                      value={branchSettings.nombreSucursal}
                      onChange={e => setBranchSettings({...branchSettings, nombreSucursal: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <InputField label="Dirección Completa" icon={MapPinIcon} 
                      value={branchSettings.direccion}
                      onChange={e => setBranchSettings({...branchSettings, direccion: e.target.value})}
                    />
                  </div>
                  <InputField label="Ciudad" icon={MapPinIcon} 
                    value={branchSettings.ciudad}
                    onChange={e => setBranchSettings({...branchSettings, ciudad: e.target.value})}
                  />
                  <InputField label="Estado" icon={MapPinIcon} 
                    value={branchSettings.estado}
                    onChange={e => setBranchSettings({...branchSettings, estado: e.target.value})}
                  />
                  <InputField label="C.P." icon={MapPinIcon} 
                    value={branchSettings.codigoPostal}
                    onChange={e => setBranchSettings({...branchSettings, codigoPostal: e.target.value})}
                  />
                  <InputField label="Teléfono" icon={PhoneIcon} 
                    value={branchSettings.telefono}
                    onChange={e => setBranchSettings({...branchSettings, telefono: e.target.value})}
                  />
                </div>

                <div className="p-6 bg-slate-900 rounded-3xl text-white flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Último Backup de BD</p>
                    <p className="text-lg font-mono font-bold text-orange-400">{branchSettings.ultimoBackup}</p>
                  </div>
                  <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-sm transition-all active:scale-95"
                  >
                    {loading ? "Procesando..." : "☁️ Crear Backup"}
                  </button>
                </div>

                <button
                  onClick={handleSaveBranch}
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all active:scale-95"
                >
                  {loading ? "Guardando..." : "💾 Guardar Datos de Sucursal"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes bounce-in {
          0% { transform: translateX(100%); opacity: 0; }
          70% { transform: translateX(-10px); opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
}
