import { useEffect, useState } from "react";
import {
  BanknotesIcon,
  UsersIcon,
  ShoppingBagIcon,
  TableCellsIcon,
  FireIcon
} from "@heroicons/react/24/outline";

const API = "/api";

function Dashboard() {

  const [stats,setStats] = useState({
    ventasHoy:0,
    clientesHoy:0,
    pedidosActivos:0,
    mesasOcupadas:0,
    totalMesas:0
  });

  const [ultimosPedidos,setUltimosPedidos] = useState([]);

  const [loading,setLoading] = useState(true);


  // =========================
  // CARGAR DASHBOARD
  // =========================

  useEffect(()=>{

    cargarDashboard();

  },[]);



  const cargarDashboard = async()=>{

   try{

      // -------- métricas --------
      const resStats = await fetch(`${API}/dashboard`);
      const dataStats = await resStats.json();
      setStats(dataStats);

      // -------- últimas órdenes --------
      const resOrders = await fetch(`${API}/orders`);
      if (resOrders.ok) {
        const ordersResponse = await resOrders.json();
        const ordersList = Array.isArray(ordersResponse)
          ? ordersResponse
          : Array.isArray(ordersResponse?.orders)
            ? ordersResponse.orders
            : [];
        setUltimosPedidos(ordersList.slice(0, 4));
      } else {
        console.warn(`Error cargando órdenes: ${resOrders.status}`);
        setUltimosPedidos([]);
      }

   }
   catch(error){

      console.error(
       "Error cargando dashboard:",
       error
      );

   }
   finally{

      setLoading(false);

   }

  };



  const metricas = [

    {
      id:1,
      label:"Ventas del Día",
      valor:`$${stats.ventasHoy}`,
      icon:<BanknotesIcon className="h-6 w-6"/>,
      color:"text-green-500",
      bg:"bg-green-500/10",
      tendencia:"+12.5%"
    },

    {
      id:2,
      label:"Clientes",
      valor:stats.clientesHoy,
      icon:<UsersIcon className="h-6 w-6"/>,
      color:"text-blue-500",
      bg:"bg-blue-500/10",
      tendencia:"+4"
    },

    {
      id:3,
      label:"Pedidos Activos",
      valor:stats.pedidosActivos,
      icon:<FireIcon className="h-6 w-6"/>,
      color:"text-orange-500",
      bg:"bg-orange-500/10",
      tendencia:"Cocina"
    },

    {
      id:4,
      label:"Mesas Ocupadas",
      valor:`${stats.mesasOcupadas}/${stats.totalMesas}`,
      icon:<TableCellsIcon className="h-6 w-6"/>,
      color:"text-purple-500",
      bg:"bg-purple-500/10",
      tendencia:
       stats.totalMesas
       ? `${Math.round(
         (stats.mesasOcupadas /
         stats.totalMesas)*100
         )}%`
       : "0%"
    }

  ];



if(loading){

 return(
  <div className="p-8">
   Cargando Dashboard...
  </div>
 );

}



  return (

    <div className="p-6 bg-slate-50 min-h-screen">

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">
          Panel de Control
        </h1>

        <p className="text-slate-500">
          Bienvenido de nuevo, Admin.
        </p>

      </div>



      {/* TARJETAS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {metricas.map(item=>(

          <div
           key={item.id}
           className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >

            <div className="flex justify-between items-start mb-4">

              <div className={`${item.bg} ${item.color} p-3 rounded-xl`}>
                {item.icon}
              </div>

              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase">
                {item.tendencia}
              </span>

            </div>

            <p className="text-slate-500 text-sm font-medium">
             {item.label}
            </p>

            <h3 className="text-2xl font-black text-slate-900">
             {item.valor}
            </h3>

          </div>

        ))}

      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* PRODUCTOS */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBagIcon className="h-5 w-5 text-orange-500"/>
              Productos más populares
            </h3>
          </div>


          <div className="p-6">

            {[
              {name:"Hamburguesa Especial",sales:45,progress:"w-[85%]"},
              {name:"Papas Fritas",sales:38,progress:"w-[70%]"},
              {name:"Cerveza Nacional",sales:30,progress:"w-[60%]"},
              {name:"Tacos de Pastor",sales:25,progress:"w-[45%]"}
            ].map((product,i)=>(

             <div key={i} className="mb-6">

               <div className="flex justify-between text-sm mb-1">
                 <span className="font-bold">
                   {product.name}
                 </span>

                 <span>
                   {product.sales} ventas
                 </span>

               </div>

               <div className="w-full bg-slate-100 h-2 rounded-full">

                 <div className={`bg-[#f97316] h-full ${product.progress}`}>
                 </div>

               </div>

             </div>

            ))}

          </div>

        </div>



        {/* PEDIDOS EN VIVO */}

        <div className="bg-[#111827] rounded-2xl shadow-xl text-white">

          <div className="p-6 border-b border-white/10 flex justify-between">

            <h3 className="font-bold">
              Últimos Pedidos
            </h3>

            <span className="text-[10px] text-orange-500 font-black">
              EN VIVO
            </span>

          </div>


          <div className="p-6">

           <ul className="space-y-4">

            {ultimosPedidos.map((order,i)=>(

              <li
               key={i}
               className="flex justify-between items-center border-b border-white/5 pb-3"
              >

                <div className="flex gap-3">

                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center font-black text-[#f97316]">
                    #{order.id}
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      Pedido #{order.id} • Mesa {order.mesa || 'N/A'}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Estado: {order.estado || order.status}
                    </p>
                  </div>

                </div>


                <span className="text-[9px] font-black px-2 py-1 rounded bg-orange-500/20 text-orange-400">
                  {order.estado || order.status}
                </span>

              </li>

            ))}

           </ul>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;
