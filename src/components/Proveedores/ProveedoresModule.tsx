import React, { useState } from 'react';
import { Material, Supplier, SupplierMaterialParam } from '../../types/mrp';
import { Users, Truck, ShieldCheck, CheckCircle2, Clock, Edit2, Save } from 'lucide-react';

interface ProveedoresModuleProps {
  suppliers: Supplier[];
  materials: Material[];
  supplierParams: SupplierMaterialParam[];
  onSetPrimarySupplier: (materialId: string, supplierId: string) => void;
  onUpdateSupplierParam?: (updatedParam: SupplierMaterialParam) => void;
}

export const ProveedoresModule: React.FC<ProveedoresModuleProps> = ({
  suppliers,
  materials,
  supplierParams,
  onSetPrimarySupplier,
  onUpdateSupplierParam,
}) => {
  const [editingParam, setEditingParam] = useState<SupplierMaterialParam | null>(null);
  const [leadTimeWeeks, setLeadTimeWeeks] = useState<number>(1);
  const [deliveryFrequencyDays, setDeliveryFrequencyDays] = useState<number>(7);
  const [dispatchMultiple, setDispatchMultiple] = useState<number>(1);
  const [moq, setMoq] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(100);

  const handleOpenEdit = (sp: SupplierMaterialParam) => {
    setEditingParam(sp);
    setLeadTimeWeeks(sp.leadTimeWeeks);
    setDeliveryFrequencyDays(sp.deliveryFrequencyDays);
    setDispatchMultiple(sp.dispatchMultiple);
    setMoq(sp.moq);
    setUnitCost(sp.unitCost);
  };

  const handleSaveEdit = () => {
    if (!editingParam || !onUpdateSupplierParam) return;
    const updated: SupplierMaterialParam = {
      ...editingParam,
      leadTimeWeeks,
      deliveryFrequencyDays,
      dispatchMultiple,
      moq,
      unitCost,
    };
    onUpdateSupplierParam(updated);
    setEditingParam(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6 text-slate-800 font-sans">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <span>Gestión de Proveedores y Restricciones Logísticas (HU-23, HU-24)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configuración de lead times, frecuencias de entrega, mínimos de compra (MOQ) y definición de proveedor principal vs secundario.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Parámetros Logísticos y Comerciales por Material
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4 text-center">Lead Time</th>
                <th className="py-3 px-4 text-center">Frecuencia Entrega</th>
                <th className="py-3 px-4 text-center">Múltiplo Despacho</th>
                <th className="py-3 px-4 text-center">Mín. Compra (MOQ)</th>
                <th className="py-3 px-4 text-right">Costo Unitario</th>
                <th className="py-3 px-4 text-center">Tipo Proveedor (HU-24)</th>
                <th className="py-3 px-4 text-center">Editar Leadtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {materials.map((mat) => {
                const params = supplierParams.filter((sp) => sp.materialId === mat.id);

                return (
                  <React.Fragment key={mat.id}>
                    {params.map((sp, idx) => {
                      const isPrimary = mat.primarySupplierId === sp.supplierId;

                      return (
                        <tr key={`${mat.id}-${sp.supplierId}`} className="hover:bg-slate-50 transition">
                          {idx === 0 && (
                            <td rowSpan={params.length} className="py-3 px-4 border-r border-slate-100 bg-slate-50/50">
                              <div className="font-mono font-bold text-blue-700">{mat.code}</div>
                              <div className="font-semibold text-slate-900">{mat.name}</div>
                            </td>
                          )}

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{sp.supplierName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{sp.supplierCode} ({sp.origin})</div>
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-amber-700">
                            <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-extrabold">
                              {sp.leadTimeWeeks} sem.
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-mono text-slate-600">
                            Cada {sp.deliveryFrequencyDays} días
                          </td>

                          <td className="py-3 px-4 text-center font-mono text-slate-600">
                            {sp.dispatchMultiple}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-sky-700">
                            {sp.moq} {mat.purchaseUnit}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            ${sp.unitCost.toFixed(4)}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {isPrimary ? (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold text-[11px] inline-flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Principal Activo</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => onSetPrimarySupplier(mat.id, sp.supplierId)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-[11px] font-semibold transition"
                              >
                                Establecer como Principal
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleOpenEdit(sp)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs font-bold transition inline-flex items-center space-x-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Parameter Edit Modal */}
      {editingParam && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 text-slate-800">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Editar Lead Time y Parámetros</h3>
                <p className="text-xs text-slate-500 font-mono">{editingParam.supplierName}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Lead Time (Semanas):</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={leadTimeWeeks}
                    onChange={(e) => setLeadTimeWeeks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-base focus:outline-none focus:border-amber-600"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 font-medium">sem.</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Frecuencia Entrega (Días):</label>
                  <input
                    type="number"
                    min="1"
                    value={deliveryFrequencyDays}
                    onChange={(e) => setDeliveryFrequencyDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Múltiplo Despacho:</label>
                  <input
                    type="number"
                    min="1"
                    value={dispatchMultiple}
                    onChange={(e) => setDispatchMultiple(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mínimo Compra (MOQ):</label>
                  <input
                    type="number"
                    min="1"
                    value={moq}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Costo Unitario ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingParam(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Parámetros</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
