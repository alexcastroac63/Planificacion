import React, { useState } from 'react';
import { Material, Supplier, User } from '../../types/mrp';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import * as XLSX from 'xlsx';
import { BarChart3, Download, Filter, FileSpreadsheet, Layers } from 'lucide-react';

interface ReporteriaModuleProps {
  materials: Material[];
  suppliers: Supplier[];
  users: User[];
}

export const ReporteriaModule: React.FC<ReporteriaModuleProps> = ({
  materials,
  suppliers,
  users,
}) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('mat-220062');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [selectedPlannerId, setSelectedPlannerId] = useState<string>('all');

  const activeMaterial = materials.find((m) => m.id === selectedMaterialId) || materials[0];

  // Recharts Chart Data (Compras vs Consumo por Semana)
  const chartData = [
    { semana: 'WK 40', compras: 120, consumo: 100 },
    { semana: 'WK 41', compras: 0, consumo: 40 },
    { semana: 'WK 42', compras: 80, consumo: 20 },
    { semana: 'WK 43', compras: 0, consumo: 25 },
    { semana: 'WK 44', compras: 80, consumo: 35 },
    { semana: 'WK 45', compras: 0, consumo: 24 },
    { semana: 'WK 46', compras: 200, consumo: 18 },
    { semana: 'WK 47', compras: 0, consumo: 45 },
  ];

  // Native Export to Excel (.xlsx) using 'xlsx' library
  const handleExportToExcel = () => {
    const reportData = materials.map((m) => {
      const sup = suppliers.find((s) => s.id === m.primarySupplierId);
      return {
        'Código Material': m.code,
        'Nombre Material': m.name,
        'Unidad Compra': m.purchaseUnit,
        'Precio Compra ($)': m.purchasePrice,
        Categoría: m.category,
        'Lead Time (Semanas)': m.leadTimeWeeks,
        'Mínimo Compra (MOQ)': m.moq,
        'Proveedor Principal': sup ? `${sup.code} - ${sup.name}` : 'N/A',
        Estado: m.status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maestro_Planificacion');
    XLSX.writeFile(workbook, `Reporte_Maestro_Planificacion_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6 text-slate-800 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Reportería Operativa & Exportación a Excel (HU-30 - HU-33)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualización gráfica de Compras vs Consumo, reportes por Planificador/Proveedor/Material y exportación nativa en formato .xlsx.
          </p>
        </div>

        <button
          onClick={handleExportToExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar Maestro a Excel (.xlsx)</span>
        </button>
      </div>

      {/* Filters Bar (HU-32) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-xs shadow-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-700">Filtros:</span>
        </div>

        <div>
          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
            Material:
          </label>
          <select
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} - {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
            Proveedor:
          </label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
          >
            <option value="all">Todos los Proveedores</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
            Planificador:
          </label>
          <select
            value={selectedPlannerId}
            onChange={(e) => setSelectedPlannerId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
          >
            <option value="all">Todos los Planificadores</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recharts Chart: Compras Vs Consumo (HU-31) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Gráfico de Transacciones: Compras Vs Consumo (HU-31)
            </h3>
            <p className="text-xs text-blue-700 font-mono font-semibold mt-0.5">
              Material: {activeMaterial?.code} - {activeMaterial?.name}
            </p>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="semana" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
                itemStyle={{ color: '#0f172a' }}
              />
              <Legend />
              <Bar dataKey="compras" fill="#2563eb" name="Órdenes de Compra ($)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="consumo" fill="#059669" name="Consumo Estimado/Inferido" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
