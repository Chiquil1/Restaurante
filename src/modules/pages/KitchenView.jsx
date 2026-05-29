import { useState, useEffect, useRef } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import { unwrapArray } from "../../Services/Api";

const API_BASE = "/api";

function KitchenView() {
  const [orders, setOrders] = useState([]);
  const init = useRef(false);

  useEffect(() => {
    if (!init.current) {
      init.current = true;
      loadOrders();
    }
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();

      const list = unwrapArray(data);

      const filtered = list.filter((o) =>
        ["pendiente", "cocinando"].includes(o.status || o.estado)
      );

      const mapped = filtered.map((o) => ({
        id: o.id,
        mesa: o.mesas?.numero || o.table_id || o.mesa_id || o.mesa || "N/A",
        status: o.status || o.estado,
        prioridad: o.priority || o.prioridad || "normal",
        created_at: o.created_at || o.fecha,
        tiempo: calculateTime(o.created_at || o.fecha),

        // 🔥 FIX CLAVE: soporta backend sin items
        items: Array.isArray(o.items) ? o.items : (Array.isArray(o.order_items) ? o.order_items : []),
      }));

      setOrders(mapped);
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrders([]);
    }
  };

  const calculateTime = (createdAt) => {
    if (!createdAt) return 0;
    const now = new Date();
    const created = new Date(createdAt);
    return Math.floor((now - created) / 60000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) =>
        prev.map((o) => ({ ...o, tiempo: o.tiempo + 1 }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const updateOrder = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Error update");

      await loadOrders(); // 🔥 mejor que filtrar localmente
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen text-white">

      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-black flex items-center gap-2">
          <FireIcon className="w-8 h-8 text-orange-500" />
          Kitchen View
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {orders.map((o) => (
          <div key={o.id} className="bg-slate-800 p-4 rounded-xl">

            <div className="flex justify-between">
              <h2 className="font-bold">Mesa {o.mesa}</h2>
              <span className="text-yellow-400">{o.status}</span>
            </div>

            <p className="text-sm text-slate-400">
              {o.tiempo} min
            </p>

            {/* ITEMS REALMENTE IMPORTANTES */}
            <div className="mt-3 space-y-1 text-sm">
              {o.items.length > 0 ? (
                o.items.map((i, idx) => (
                  <div key={idx}>
                    • {i.nombre} x{i.cantidad}
                    {i.notas && (
                      <p className="text-orange-300 text-xs ml-2">
                        📝 {i.notas}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Sin items cargados</p>
              )}
            </div>

            <div className="flex gap-2 mt-4">

              <button
                onClick={() => updateOrder(o.id, "cocinando")}
                className="flex-1 bg-yellow-500 text-black font-bold py-2 rounded"
              >
                Cocinar
              </button>

              <button
                onClick={() => updateOrder(o.id, "servido")}
                className="flex-1 bg-green-600 font-bold py-2 rounded"
              >
                <CheckCircleIcon className="w-5 h-5 inline" />
              </button>

            </div>

          </div>
        ))}

      </div>

      {orders.length === 0 && (
        <div className="text-center mt-32 text-slate-500">
          <BeakerIcon className="w-20 h-20 mx-auto mb-4" />
          Sin órdenes
        </div>
      )}

    </div>
  );
}

export default KitchenView;
