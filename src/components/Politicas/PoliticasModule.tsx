import React, { useState } from 'react';
import { InventoryPolicy, Material, User } from '../../types/mrp';
import { Sliders, ShieldAlert, Edit, Save, History, Check } from 'lucide-react';

interface PoliticasModuleProps {
  policies: InventoryPolicy[];
  materials: Material[];
  currentUser: User;
  onUpdatePolicy: (updated: InventoryPolicy) => void;
}

export const PoliticasModule: React.FC<PoliticasModuleProps> = ({
  policies,
  materials,
  currentUser,
  onUpdatePolicy,
}) => {
  const [editingPolicy, setEditingPolicy] = useState<InventoryPolicy | null>(null);
  const [newCoverageWeeks, setNewCoverageWeeks] = useState<number>(2.2);
  const [newLeadTimeWeeks, setNewLeadTimeWeeks] = useState<number>(1);
  const [changeReason, setChangeReason] = useState<string>('Ajuste de política de inventario y lead time');

  const isJefe = currentUser.role === 'Jefe de Planificación' || currentUser.role === 'Administrador';

  const handleOpenEdit = (pol: InventoryPolicy) => {
    const mat = materials.find((m) => m.id === pol.materialId);
    setEditingPolicy(pol);
    setNewCoverageWeeks(pol.targetCoverageWeeks);
    setNewLeadTimeWeeks(mat?.leadTimeWeeks || 1);
    setChangeReason('Ajuste de política de inventario y lead time');
  };

  const handleSaveEdit = () => {
    if (!editingPolicy) return;
    const finalReason = changeReason.trim() || 'Ajuste de política de inventario y lead time';
    const updated: InventoryPolicy = {
      ...editingPolicy,
      targetCoverageWeeks: newCoverageWeeks,
      updatedBy: currentUser.name,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      changeReason: finalReason,
    };
    onUpdatePolicy(updated);
    setEditingPolicy(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6 text-slate-800 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-600" />
            <span>Políticas de Inventario y Cobertura (HU-21, HU-22)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configuración de rangos objetivos de cobertura (Semanas) y semáforo de inventario (Quiebre, Bajo, Óptimo, Sobre).
          </p>
        </div>

        {!isJefe && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-xl text-xs flex items-center space-x-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Los ajustes manuales requieren nivel de autorización de Jefatura.</span>
          </div>
        )}
      </div>

      {/* Threshold Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">🔴 Rojo</span>
            <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded">Abajo de Política</span>
          </div>
          <div className="text-2xl font-extrabold text-red-900 mt-2 font-mono">&lt; 1.0 Semanas</div>
          <p className="text-[11px] text-red-700 mt-1">Quiebre de stock y desabastecimiento.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">🟡 Amarillo</span>
            <span className="text-[10px] bg-yellow-400 text-slate-950 font-bold px-2 py-0.5 rounded">En Riesgo</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-950 mt-2 font-mono">1.0 - 1.5 Semanas</div>
          <p className="text-[11px] text-amber-800 mt-1">Bajo stock cercano al nivel crítico.</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">🟢 Verde</span>
            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">Dentro de Política</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 mt-2 font-mono">1.5 - 3.0 Semanas</div>
          <p className="text-[11px] text-emerald-700 mt-1">Nivel óptimo y seguro de cobertura.</p>
        </div>

        <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">⚫ Negro</span>
            <span className="text-[10px] bg-slate-800 text-slate-100 font-bold px-2 py-0.5 rounded border border-slate-700">Fuera de Política</span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">&gt; 3.0 Semanas</div>
          <p className="text-[11px] text-slate-400 mt-1">Sobre stock y exceso de capital inmovilizado.</p>
        </div>
      </div>

      {/* Policies List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Configuración por Material & Bitácora de Auditoría
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4 text-center">Lead Time</th>
                <th className="py-3 px-4 text-center">Cobertura Objetivo (Semanas)</th>
                <th className="py-3 px-4 text-center">Último Cambio por</th>
                <th className="py-3 px-4">Motivo / Justificación</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {policies.map((pol) => {
                const mat = materials.find((m) => m.id === pol.materialId);

                return (
                  <tr key={pol.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-700">{mat?.code}</div>
                      <div className="font-semibold text-slate-900">{mat?.name}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-extrabold text-amber-700">
                      <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                        {mat?.leadTimeWeeks || 1} sem.
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-extrabold text-emerald-700 text-sm">
                      <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded">
                        {pol.targetCoverageWeeks} sem.
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="font-semibold text-slate-800">{pol.updatedBy || 'Sistema'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{pol.updatedAt}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 italic">
                      "{pol.changeReason || 'Configuración estándar'}"
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(pol)}
                        className="bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 mx-auto shadow-2xs"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-700" />
                        <span>Ajustar Política</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Edit Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 text-slate-800">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 text-slate-900">
              <Sliders className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold">Ajuste Manual de Política de Stock</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nueva Cobertura Objetivo (Semanas):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  value={newCoverageWeeks}
                  onChange={(e) => setNewCoverageWeeks(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-base focus:outline-none focus:border-amber-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">Nivel de inventario objetivo expresado en Weeks on Hand (WOH).</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Motivo de Ajuste (Bitácora de Auditoría):
                </label>
                <textarea
                  rows={3}
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="Escriba la razón operativa para cambiar la política..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingPolicy(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1 shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Ajuste</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
