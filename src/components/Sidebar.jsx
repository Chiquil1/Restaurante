import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  TableCellsIcon,
  QueueListIcon,
  BanknotesIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  // Usamos 'size-5' que es la clase estándar de Tailwind v4 para iconos
  const iconSize = "size-5 shrink-0"; 

  const linkClass = (path) => {
    const isActive =
      path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path);

    return `flex items-center gap-3 px-3 py-2 rounded-lg transition-all no-underline ${
      isActive
        ? "bg-orange-500/20 text-[#f97316] font-bold"
        : "text-slate-300 hover:bg-white/10 hover:text-[#f97316]"
    }`;
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-[#111827] text-white h-screen overflow-y-auto p-4 flex flex-col transition-all duration-300 border-r border-white/10 flex-shrink-0 sticky top-0`}
    >
      {/* CABECERA - LOGO */}
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-6 shrink-0`}>
        {!isCollapsed && (
          <h2 className="text-xl font-bold truncate text-[#f97316] tracking-tighter">
            GustoSoft POS
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-white/10 rounded text-slate-400 transition-colors"
        >
          <Bars3Icon className="size-7" />
        </button>
      </div>

      {/* PERFIL DE USUARIO */}
      {!isCollapsed && (
        <div className="flex items-center gap-3 mb-6 p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
          <UserCircleIcon className="size-8 text-[#f97316] shrink-0" />
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">Admin Restaurante</p>
            <p className="text-[10px] text-green-400 font-medium">Turno Abierto</p>
          </div>
        </div>
      )}

      {/* BUSCADOR RÁPIDO */}
      {!isCollapsed && (
        <div className="relative mb-6 px-1 shrink-0">
          <MagnifyingGlassIcon className="size-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full bg-white/5 text-sm text-white rounded-md py-2 pl-8 pr-2 focus:outline-none border border-white/10 focus:border-[#f97316]/50 transition-all"
          />
        </div>
      )}

      {/* NAVEGACIÓN PRINCIPAL */}
      <div className="flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
        {/* SECCIÓN: PISO DE VENTA */}
        <div>
          {!isCollapsed && (
            <p className="text-slate-500 text-[10px] mb-2 uppercase tracking-[2px] font-black px-1">
              Servicio
            </p>
          )}
          <nav className="flex flex-col gap-1">
            <Link to="/" className={linkClass("/")}>
              <HomeIcon className={iconSize} />
              {!isCollapsed && <span className="text-sm">Inicio</span>}
            </Link>
            <Link to="/mesas" className={linkClass("/mesas")}>
              <TableCellsIcon className={iconSize} />
              {!isCollapsed && <span className="text-sm">Mapa de Mesas</span>}
            </Link>
            <Link to="/pedidos" className={linkClass("/pedidos")}>
              <ShoppingBagIcon className={iconSize} />
              {!isCollapsed && <span className="text-sm">Pedidos</span>}
            </Link>
            <Link to="/cocina" className={linkClass("/cocina")}>
              <ClockIcon className={iconSize} />
              {!isCollapsed && <span className="text-sm">Cocina</span>}
            </Link>
            <Link to="/reservas" className={linkClass("/reservas")}>
              <CalendarDaysIcon className={iconSize} />
              {!isCollapsed && <span className="text-sm">Reservaciones</span>}
            </Link>
          </nav>
        </div>

        {/* SECCIÓN: ADMINISTRACIÓN */}
        <div>
          {!isCollapsed && (
            <p className="text-slate-500 text-[10px] mb-2 uppercase tracking-[2px] font-black px-1">
              Gestión
            </p>
          )}
          <nav className="flex flex-col gap-1">
            <Link to="/menu" className={linkClass("/menu")}>
              <QueueListIcon className={iconSize} />
              {!isCollapsed && <span className="text-sm">Menú / Platillos</span>}
            </Link>
            <Link to="/personal" className={linkClass("/personal")}>
              <UserGroupIcon className={iconSize} />
              {!isCollapsed && <span className="text-sm">Personal</span>}
            </Link>
            <Link to="/ventas" className={linkClass("/ventas")}>
              <BanknotesIcon className={iconSize} />
              {!isCollapsed && <span className="text-sm">Caja</span>}
            </Link>
            <Link to="/reportes" className={linkClass("/reportes")}>
              <DocumentChartBarIcon className={iconSize} />
              {!isCollapsed && <span className="text-sm">Estadísticas</span>}
            </Link>
            <Link to="/config" className={linkClass("/config")}>
              <Cog6ToothIcon className={iconSize} />
              {!isCollapsed && <span className="text-sm">Ajustes</span>}
            </Link>
          </nav>
        </div>
      </div>

      {/* BOTÓN CERRAR SESIÓN */}
      <div className={`mt-auto pt-4 border-t border-white/10 ${isCollapsed ? "flex justify-center" : ""}`}>
        {!isCollapsed ? (
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all hover:bg-red-500/10 group text-red-500">
            <ArrowLeftOnRectangleIcon className={iconSize} />
            <span className="text-sm font-bold group-hover:text-red-400">
              Cerrar Turno
            </span>
          </button>
        ) : (
          <button title="Cerrar Turno" className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <ArrowLeftOnRectangleIcon className={iconSize} />
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;