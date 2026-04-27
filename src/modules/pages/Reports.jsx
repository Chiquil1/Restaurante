import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allData, setAllData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRows, setDetailRows] = useState([]);
  const [detailItem, setDetailItem] = useState(null);

  // Categorías de comida para filtrar (Entradas, Platos Fuertes, etc.)
  const categories = useMemo(
    () => ["Todas", ...new Set(allData.map((d) => d.categoria))],
    [allData]
  );

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setSearchError("Por favor selecciona un rango de fechas para el reporte de ventas");
      return;
    }

    setLoading(true);
    setSearchError("");

    try {
      // Ajusté la URL a una genérica de tu nuevo backend
      const response = await fetch(
        `/api/reports/sales?startDate=${startDate}&endDate=${endDate}`
      );

      const payload = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(payload.error || "Error al obtener reporte de ventas");
      }

      const data = Array.isArray(payload) ? payload : [];
      setAllData(data);
    } catch (err) {
      console.error("Error:", err);
      setSearchError("No se pudo conectar con el servidor del restaurante.");
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
    doc.setFontSize(18);
    doc.setTextColor(249, 115, 22); // Color Naranja GustoSoft
    doc.text("GustoSoft - Reporte de Ventas", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Periodo: ${startDate} al ${endDate}`, 14, 22);
    doc.text(`Categoría: ${selectedCategory}`, 14, 29);

    autoTable(doc, {
      startY: 35,
      head: [["ID", "Platillo", "Vendidos", "Precio Unit.", "Subtotal"]],
      body: filteredData.map((item) => [
        item.id,
        item.nombre,
        item.cantidad_vendida,
        `$${item.precio}`,
        `$${item.subtotal}`,
      ]),
      headStyles: { fillColor: [17, 24, 39] }, // Color oscuro del Sidebar
    });

    doc.save(`reporte_ventas_${startDate}_${endDate}.pdf`);
  };

  const openItemDetail = async (item) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailItem(item);

    try {
      const response = await fetch(`/api/reports/item/${item.id}/details`);
      const payload = await response.json().catch(() => []);
      setDetailRows(Array.isArray(payload) ? payload : []);
    } catch (_err) {
      console.error("Error loading item details:", _err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* HEADER */}
      <div className="bg-[#111827] text-white p-6 shadow-lg border-b-4 border-[#f97316]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reportes de Venta</h1>
            <p className="text-slate-400 text-sm">Análisis de consumo y rendimiento del menú</p>
          </div>

          {filteredData.length > 0 && (
            <button
              onClick={exportPDF}
              className="bg-[#f97316] text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg"
            >
              Exportar PDF
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* FILTROS */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Desde</label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#f97316] outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasta</label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#f97316] outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#f97316] outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-[#111827] text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition disabled:bg-slate-400"
              >
                {loading ? "Procesando..." : "Consultar Ventas"}
              </button>
            </div>
          </div>
          {searchError && <p className="text-red-500 text-sm mt-2">{searchError}</p>}
        </div>

        {/* TABLA DE RESULTADOS */}
        {filteredData.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-4 font-bold">Platillo</th>
                  <th className="p-4 font-bold">Categoría</th>
                  <th className="p-4 text-center font-bold">Vendidos</th>
                  <th className="p-4 text-right font-bold">Ingresos</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-0 hover:bg-orange-50 transition cursor-pointer"
                    onClick={() => openItemDetail(item)}
                  >
                    <td className="p-4 font-medium text-slate-800">{item.nombre}</td>
                    <td className="p-4 text-slate-500">{item.categoria}</td>
                    <td className="p-4 text-center font-bold text-slate-700">{item.cantidad_vendida}</td>
                    <td className="p-4 text-right font-bold text-green-600">${item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTALES */}
            <div className="bg-slate-900 text-white p-4 flex justify-end gap-12">
              <div className="text-right">
                <p className="text-slate-400 text-xs">TOTAL VENTAS</p>
                <p className="text-xl font-bold text-[#f97316]">
                  ${filteredData.reduce((a, b) => a + Number(b.subtotal || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-xl p-20 text-center border-2 border-dashed border-slate-300">
              <p className="text-slate-400 font-medium">No hay datos para el rango seleccionado</p>
            </div>
          )
        )}
      </div>

      {/* MODAL DE DETALLE (Igual al anterior pero con datos de comanda) */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{detailItem?.nombre}</h3>
                <p className="text-sm text-[#f97316] font-bold">Historial de pedidos</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <div className="animate-pulse flex space-y-4 flex-col">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-slate-500 border-b">
                    <tr>
                      <th className="py-2 text-left">Fecha</th>
                      <th className="py-2 text-left">Mesa</th>
                      <th className="py-2 text-right">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRows.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 text-slate-600">{row.fecha}</td>
                        <td className="py-3 font-bold text-slate-700">Mesa #{row.mesa_id}</td>
                        <td className="py-3 text-right font-bold">{row.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;