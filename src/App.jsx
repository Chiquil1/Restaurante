import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar"; 

// Páginas existentes
import Dashboard from "./modules/pages/Dashboard";
import MenuManager from "./modules/pages/MenuManager";
import KitchenView from "./modules/pages/KitchenView";
import Orders from "./modules/pages/Orders";
import TablesMap from "./modules/pages/TablesMap";
import Reports from "./modules/pages/Reports";
;

// Páginas nuevas (Asegúrate de crear estos archivos en modules/pages)
import Reservations from "./modules/pages/Reservations";
import Staff from "./modules/pages/Staff";
import Sales from "./modules/pages/Sales";
import Settings from "./modules/pages/Settings";

function App() {
  return (
    <Router>
      {/* Contenedor con h-screen para evitar scrolls dobles en tu Mac */}
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        
        {/* Sidebar corregido con flex-shrink-0 */}
        <Sidebar />
        
        {/* El main debe tener su propio scroll */}
        <main className="flex-1 h-full overflow-y-auto bg-slate-50">
          <Routes>
            {/* Servicio */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/mesas" element={<TablesMap />} />
            <Route path="/pedidos" element={<Orders />} />
            <Route path="/cocina" element={<KitchenView />} />
            <Route path="/reservas" element={<Reservations />} />
            
            {/* Gestión */}
            <Route path="/menu" element={<MenuManager />} />
            <Route path="/personal" element={<Staff />} />
            <Route path="/ventas" element={<Sales />} />
            <Route path="/reportes" element={<Reports />} />
            <Route path="/config" element={<Settings />} />
            
            {/* Otros */}
            
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;