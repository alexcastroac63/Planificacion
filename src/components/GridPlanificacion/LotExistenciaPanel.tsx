import React from 'react';
import { LotInventory, Material } from '../../types/mrp';
import { PackageCheck, Calendar, Info } from 'lucide-react';

interface LotExistenciaPanelProps {
  material: Material;
  lots: LotInventory[];
}

export const LotExistenciaPanel: React.FC<LotExistenciaPanelProps> = ({ material, lots }) => {
  const materialLots = lots.filter((l) => l.materialId === material.id);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-800 flex flex-col h-full shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <PackageCheck className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Existencia por Lote y Vencimiento (HU-19)
          </h4>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          RFS Factor: 1 {material.purchaseUnit} = {material.rfsToPurchaseFactor} {material.rfsUnit}s
        </span>
      </div>

      {materialLots.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-slate-400 text-xs text-center">
          <Info className="w-6 h-6 mb-1 text-slate-400" />
          <span>No hay lotes registrados para este material</span>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2 px-3 text-center">Lote</th>
                <th className="py-2 px-3 text-right">Cant. RFS ({material.rfsUnit})</th>
                <th className="py-2 px-3 text-right text-blue-700 font-bold">
                  Cant. Convertida ({material.purchaseUnit})
                </th>
                <th className="py-2 px-3 text-center">Fecha Vence</th>
                <th className="py-2 px-3 text-center">Bodega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {materialLots.map((lot) => (
                <tr key={lot.id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 text-center font-bold text-slate-900">{lot.lotNumber}</td>
                  <td className="py-2 px-3 text-right text-slate-500">{lot.rfsQuantity}</td>
                  <td className="py-2 px-3 text-right font-bold text-blue-700 bg-blue-50/50">
                    {lot.convertedPurchaseQuantity} {lot.purchaseUnit}
                  </td>
                  <td className="py-2 px-3 text-center flex items-center justify-center space-x-1 text-amber-700 font-semibold">
                    <Calendar className="w-3 h-3" />
                    <span>{lot.expirationDate}</span>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-500 text-[11px] font-sans">
                    {lot.warehouse}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
