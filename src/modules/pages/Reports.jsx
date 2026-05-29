import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getErrorMessage, unwrapArray } from "../../Services/Api";

// Importamos los componentes base definidos en tu guía
import { GlassCard, GlassButton } from "@/components";

function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allData, setAllData] = useState([]);
  
  // Estado para el filtro de categoría (se llena dinámicamente)
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Estados del Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRows, setDetailRows] = useState([]);
  const [detailItem, setDetailItem] = useState(null);

  // Extraemos categorías únicas de los datos cargados
  const categories = useMemo(
    () => ["Todas", ...new Set(allData.map((d) => d.categoria || "General"))],
    [allData]
  );

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setSearchError("Por favor selecciona un rango de fechas para el reporte.");
      return;
    }

    setLoading(true);
    setSearchError("");
    setAllData([]); // Limpiar datos anteriores

    try {
      // LLAMADA AL BACKEND: Coincide con getMenuPopularityReport
      const response = await fetch(
        `/api/reports/menu-popularity?dateFrom=${startDate}&dateTo=${endDate}`
      );

      const payload = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(getErrorMessage({ response: { data: payload } }, "Error al obtener reporte"));
      }

      const data = unwrapArray(payload);
      setAllData(data);
    } catch (err) {
      console.error("Error:", err);
      setSearchError("No se pudo conectar con el servidor. Verifica la API.");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let result = allData;
    if (selectedCategory !== "Todas") {
      result = result.filter((item) => item.categoria === selectedCategory);
    }
    return result;
  }, [selectedCategory, allData]);

  const exportPDF = () => {
    if (filteredData.length === 0) return;

    const doc = new jsPDF();
    // Estilos PDF consistentes con el tema Dark
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("GustoSoft - Reporte de Ventas", 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`Periodo: ${startDate} al ${endDate}`, 14, 35);

    autoTable(doc, {
      startY: 45,
      head: [["Platillo", "Categoría", "Vendidos", "Ingresos Totales"]],
      body: filteredData.map((item) => [
        item.nombre,
        item.categoria || "General",
        item.cantidad_vendida,
        `$${Number(item.subtotal).toLocaleString()}`,
      ]),
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] }, // Slate 700
      styles: { textColor: [241, 245, 249], fontSize: 9 },
      alternateRowStyles: { fillColor: [30, 41, 59] }, // Slate 800
    });

    doc.save(`reporte_ventas_${startDate}.pdf`);
  };

  const openItemDetail = async (item) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailItem(item);
    setDetailRows([]);

    try {
      // LLAMADA AL BACKEND: Coincide con getMenuItemDetails
      const response = await fetch(
        `/api/reports/item-details?name=${encodeURIComponent(item.nombre)}&dateFrom=${startDate}&dateTo=${endDate}`
      );
      const payload = await response.json().catch(() => []);
      setDetailRows(unwrapArray(payload));
    } catch (_err) {
      console.error("Error loading item details:", _err);
      setDetailRows([]);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    // FONDO PRINCIPAL: Slate 900
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
      
      {/* HEADER CONSISTENTE */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">
            Reportes de Ventas
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">
            Análisis de popularidad y rendimiento del menú
          </p>
        </div>

        {filteredData.length > 0 && (
          <GlassButton variant="secondary" onClick={exportPDF} className="flex items-center gap-2 shadow-xl">
            <span>📄</span> Exportar PDF
          </GlassButton>
        )}
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* FILTROS EN GLASS CARD */}
        <GlassCard className="p-6 md:p-8" gradient="from-blue-500 to-indigo-500">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Desde</label>
              <input
                type="date"
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Hasta</label>
              <input
                type="date"
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
              <select
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat} className="bg-slate-800 text-slate-200">{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <GlassButton 
                onClick={handleSearch} 
                disabled={loading}
                className="w-full flex justify-center items-center shadow-lg shadow-orange-500/20"
              >
                {loading ? (
                  <span className="animate-pulse">Procesando...</span>
                ) : (
                  "Consultar Ventas"
                )}
              </GlassButton>
            </div>
          </div>
          
          {searchError && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 backdrop-blur-sm">
              <span>⚠️</span> {searchError}
            </div>
          )}
        </GlassCard>

        {/* TABLA DE RESULTADOS */}
        {filteredData.length > 0 ? (
          <GlassCard className="overflow-hidden p-0" gradient="from-emerald-500 to-teal-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/50 border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-6 font-bold">Platillo</th>
                    <th className="p-6 font-bold">Categoría</th>
                    <th className="p-6 text-center font-bold">Vendidos</th>
                    <th className="p-6 text-right font-bold">Ingresos</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredData.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => openItemDetail(item)}
                    >
                      <td className="p-6 font-medium text-white group-hover:text-orange-400 transition-colors flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                        {item.nombre}
                      </td>
                      <td className="p-6 text-slate-400">
                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-300">
                          {item.categoria || "General"}
                        </span>
                      </td>
                      <td className="p-6 text-center font-bold text-slate-300">
                        {item.cantidad_vendida}
                      </td>
                      <td className="p-6 text-right font-bold text-emerald-400 text-lg drop-shadow-sm">
                        ${Number(item.subtotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALES FOOTER */}
            <div className="bg-slate-900/80 backdrop-blur-md p-6 border-t border-white/10 flex justify-between items-center">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                Mostrando {filteredData.length} productos
              </p>
              <div className="text-right">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Ventas</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 drop-shadow-lg">
                  ${filteredData.reduce((a, b) => a + Number(b.subtotal || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </GlassCard>
        ) : (
          !loading && (
            <GlassCard className="p-20 text-center flex flex-col items-center justify-center min-h-[300px] border-dashed">
              <div className="text-6xl mb-4 opacity-20 filter drop-shadow-lg">📊</div>
              <p className="text-slate-400 font-medium text-lg">No hay datos para el rango seleccionado</p>
              <p className="text-slate-600 text-sm mt-2">Intenta cambiar las fechas o verifica las ventas</p>
            </GlassCard>
          )
        )}
      </div>

      {/* MODAL DE DETALLE - GLASSMORPHISM */}
      {showDetailModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" 
          onClick={() => setShowDetailModal(false)}
        >
          <GlassCard 
            className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl shadow-black/50 border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/40 backdrop-blur-xl">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">{detailItem?.nombre}</h3>
                <p className="text-sm text-orange-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Historial de pedidos
                </p>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-900/20">
              {detailLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-800/50 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/40">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase">
                      <tr>
                        <th className="py-3 px-4 text-left font-bold">Fecha</th>
                        <th className="py-3 px-4 text-left font-bold">Mesa</th>
                        <th className="py-3 px-4 text-right font-bold">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {detailRows.length > 0 ? (
                        detailRows.map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-mono text-xs text-slate-400">{row.fecha}</td>
                            <td className="py-3 px-4 font-bold text-white">
                              <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs border border-indigo-500/20 shadow-sm">
                                Mesa #{row.mesa_id}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-400">
                              +{row.cantidad}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="py-8 text-center text-slate-500">
                            No hay detalles registrados para este periodo
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-slate-900/40 backdrop-blur-xl flex justify-end">
              <GlassButton variant="secondary" onClick={() => setShowDetailModal(false)}>
                Cerrar
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

export default Reports;
