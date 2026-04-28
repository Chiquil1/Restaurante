import { useEffect, useState } from "react";
import {
  CogIcon, BellIcon, ShieldCheckIcon, GlobeAltIcon, FireIcon,
  CheckCircleIcon, ExclamationTriangleIcon, EyeIcon, EyeSlashIcon,
  ArrowRightIcon, CreditCardIcon, ClockIcon, EnvelopeIcon, PhoneIcon, MapPinIcon
} from "@heroicons/react/24/outline";

// --- COMPONENTES REUTILIZABLES (Estilo Glassmorphism) ---

const GlassCard = ({ children, className = "", gradient = null }) => (
  <div className={`
    relative overflow-hidden 
    bg-slate-800/40 backdrop-blur-xl 
    border border-white/10 
    rounded-3xl 
    transition-all duration-300 
    hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl
    ${className}
  `}>
    {gradient && (
      <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${gradient} opacity-20 blur-3xl rounded-full`} />
    )}
    <div className="relative z-10">{children}</div>
  </div>
);

const GlassButton = ({ children, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30",
    secondary: "bg-white/10 text-white border border-white/10 hover:bg-white/20",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30",
    dark: "bg-slate-900 text-white border border-white/10 hover:bg-slate-800",
  };
  
  return (
    <button 
      className={`
        font-bold py-3 px-6 rounded-2xl 
        hover:scale-105 active:scale-95 
        transition-all duration-300 flex items-center justify-center gap-2
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-2xl 
        text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 
        outline-none transition-all font-medium"
      />
    </div>
  </div>
);

const ToggleItem = ({ label, active, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-white/5 hover:bg-slate-900/50 transition-all cursor-pointer group">
    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{label}</span>
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-slate-700'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function Settings() {
  // --- ESTADOS DE DATOS (Mismos que antes) ---
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

  // --- CARGA DE DATOS ---
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

  // --- HANDLERS DE GUARDADO (Mismos que antes) ---
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

  const sections = [
    { id: "general", title: "General", desc: "Identidad y Horarios", icon: CogIcon },
    { id: "notifications", title: "Notificaciones", desc: "Alertas y Sonidos", icon: BellIcon },
    { id: "security", title: "Seguridad", desc: "Acceso y Privacidad", icon: ShieldCheckIcon },
    { id: "branch", title: "Sucursal", desc: "Ubicación y Backup", icon: GlobeAltIcon },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans selection:bg-orange-500/30">
      
      {/* TOP HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/20 rotate-3">
              <CogIcon className="h-8 w-8" />
            </div>
            Ajustes del Sistema
          </h1>
          <p className="text-slate-400 font-medium mt-2 ml-1">Personaliza la experiencia de GustoSoft POS</p>
        </div>

        {/* USER QUICK CARD */}
        <GlassCard className="flex items-center gap-4 p-3 pr-6 !rounded-full !hover:translate-y-0 !border-white/5">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg">
            {userSettings.nombreUsuario[0]}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">{userSettings.nombreUsuario}</p>
            <p className="text-xs text-orange-400 font-medium">{userSettings.rol}</p>
          </div>
        </GlassCard>
      </div>

      {/* MESSAGE NOTIFICATION (Glass Style) */}
      {message.text && (
        <div className={`fixed top-6 right-6 z-50 animate-bounce-in p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-sm ${
          message.type === "success" ? "bg-emerald-900/80 border-emerald-500/30 text-emerald-100" : "bg-rose-900/80 border-rose-500/30 text-rose-100"
        }`}>
          {message.type === "success" ? <CheckCircleIcon className="h-6 w-6" /> : <ExclamationTriangleIcon className="h-6 w-6" />}
          <p className="font-bold text-sm">{message.text}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Menú de Configuración</p>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all group border ${
                activeSection === section.id 
                ? "bg-slate-800/80 border-orange-500/30 text-white shadow-lg shadow-orange-900/20 translate-x-1" 
                : "bg-slate-800/20 border-white/5 text-slate-400 hover:bg-slate-800/60 hover:border-white/10"
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${activeSection === section.id ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg" : "bg-slate-800 text-slate-500 group-hover:text-white"}`}>
                <section.icon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">{section.title}</p>
                <p className={`text-xs ${activeSection === section.id ? "text-orange-400" : "text-slate-500"}`}>{section.desc}</p>
              </div>
              <ArrowRightIcon className={`h-4 w-4 ml-auto transition-all ${activeSection === section.id ? "translate-x-0 opacity-100 text-orange-500" : "-translate-x-2 opacity-0"}`} />
            </button>
          ))}

          {/* SUPPORT MINI CARD */}
          <div className="mt-8 p-6 bg-gradient-to-br from-orange-600 to-rose-600 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-orange-900/40 group hover:scale-[1.02] transition-transform">
            <div className="relative z-10">
              <h4 className="font-black italic text-lg mb-2">¿Soporte Técnico?</h4>
              <p className="text-orange-100 text-xs mb-4 opacity-80">Estamos disponibles 24/7 para ayudarte.</p>
              <button className="w-full py-2 bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/30 transition-colors">
                Contactar Soporte
              </button>
            </div>
            <FireIcon className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="lg:col-span-8">
          <GlassCard className="p-8 min-h-[600px]" gradient="from-blue-500 to-indigo-500">
            
            {/* GENERAL SECTION */}
            {activeSection === "general" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <CogIcon className="h-8 w-8 text-orange-500" />
                  <h2 className="text-2xl font-black text-white uppercase italic">Configuración General</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InputField 
                    label="Nombre del Negocio" icon={CogIcon} 
                    value={generalSettings.nombreNegocio}
                    onChange={e => setGeneralSettings({...generalSettings, nombreNegocio: e.target.value})}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Moneda</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors">
                        <CreditCardIcon className="h-5 w-5" />
                      </div>
                      <select
                        value={generalSettings.moneda}
                        onChange={e => setGeneralSettings({...generalSettings, moneda: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-2xl 
                        text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 
                        outline-none transition-all font-medium appearance-none"
                      >
                        <option>MXN</option><option>USD</option><option>EUR</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">▼</div>
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

                <div className="pt-4">
                  <GlassButton onClick={handleSaveGeneral} disabled={loading} className="w-full">
                    {loading ? "Guardando..." : "💾 Guardar Cambios Generales"}
                  </GlassButton>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeSection === "notifications" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <BellIcon className="h-8 w-8 text-orange-500" />
                  <h2 className="text-2xl font-black text-white uppercase italic">Preferencias de Alertas</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleItem label="Alertas de Preparación" active={notificationSettings.alertasPreparacion} onToggle={() => setNotificationSettings(prev => ({ ...prev, alertasPreparacion: !prev.alertasPreparacion }))} />
                  <ToggleItem label="Alertas de Stock Bajo" active={notificationSettings.alertasStock} onToggle={() => setNotificationSettings(prev => ({ ...prev, alertasStock: !prev.alertasStock }))} />
                  <ToggleItem label="Alertas de Reservas" active={notificationSettings.alertasReservas} onToggle={() => setNotificationSettings(prev => ({ ...prev, alertasReservas: !prev.alertasReservas }))} />
                  <ToggleItem label="Notificación Admin Email" active={notificationSettings.correoAdminOrden} onToggle={() => setNotificationSettings(prev => ({ ...prev, correoAdminOrden: !prev.correoAdminOrden }))} />
                  <ToggleItem label="Aviso Sonoro Activo" active={notificationSettings.avisoSonoro} onToggle={() => setNotificationSettings(prev => ({ ...prev, avisoSonoro: !prev.avisoSonoro }))} />
                </div>

                <div className="pt-4">
                  <GlassButton onClick={handleSaveNotifications} disabled={loading} className="w-full">
                    {loading ? "Guardando..." : "🔔 Guardar Notificaciones"}
                  </GlassButton>
                </div>
              </div>
            )}

            {/* SECURITY SECTION */}
            {activeSection === "security" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-orange-500" />
                  <h2 className="text-2xl font-black text-white uppercase italic">Seguridad de Cuenta</h2>
                </div>
                
                <GlassCard className="p-6 bg-slate-900/40 !border-white/5 !hover:translate-y-0" gradient="from-purple-500 to-pink-500">
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
                        className="absolute right-3 top-10 text-slate-500 hover:text-orange-500 transition-colors"
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
                </GlassCard>

                <div className="p-4 bg-blue-900/20 rounded-2xl border border-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
                    <div>
                      <p className="text-sm font-bold text-blue-100">Autenticación 2FA</p>
                      <p className="text-xs text-blue-300/70">Añade seguridad extra a tu acceso</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSecuritySettings(prev => ({...prev, autenticacionDosFactores: !prev.autenticacionDosFactores}))}
                    className={`w-12 h-6 rounded-full transition-all relative ${securitySettings.autenticacionDosFactores ? 'bg-blue-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${securitySettings.autenticacionDosFactores ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-4">
                  <GlassButton onClick={handleChangePassword} disabled={loading} className="w-full">
                    {loading ? "Actualizando..." : "🔐 Actualizar Credenciales"}
                  </GlassButton>
                </div>
              </div>
            )}

            {/* BRANCH SECTION */}
            {activeSection === "branch" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <GlobeAltIcon className="h-8 w-8 text-orange-500" />
                  <h2 className="text-2xl font-black text-white uppercase italic">Datos de Sucursal</h2>
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

                <GlassCard className="p-6 flex items-center justify-between !bg-slate-900/80 !border-white/10" gradient="from-emerald-500 to-teal-500">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Último Backup de BD</p>
                    <p className="text-lg font-mono font-bold text-emerald-400">{branchSettings.ultimoBackup}</p>
                  </div>
                  <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/30 text-white"
                  >
                    {loading ? "Procesando..." : "☁️ Crear Backup"}
                  </button>
                </GlassCard>

                <div className="pt-4">
                  <GlassButton onClick={handleSaveBranch} disabled={loading} className="w-full">
                    {loading ? "Guardando..." : "💾 Guardar Datos de Sucursal"}
                  </GlassButton>
                </div>
              </div>
            )}
          </GlassCard>
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
