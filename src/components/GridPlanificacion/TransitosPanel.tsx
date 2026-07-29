import React from 'react';
import { Material, TransitPO } from '../../types/mrp';
import { Truck, Clock, AlertCircle } from 'lucide-react';

interface TransitosPanelProps {
  material: Material;
  transits: TransitPO[];
}

export const TransitosPanel: React.FC<TransitosPanelProps> = ({ material, transits }) => {
  const materialTransits = transits.filter((t) => t.materialId === material.id);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-800 flex flex-col h-full shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Tránsitos Semanales y Ordenes Aprobadas (HU-06)
          </h4>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          Retención de Backorder: 4 Semanas
        </span>
      </div>

      {materialTransits.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-slate-400 text-xs text-center">
          <Clock className="w-6 h-6 mb-1 text-slate-400" />
          <span>No hay órdenes de compra en tránsito actualmente</span>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2 px-3 text-left">ORDEN_COMPRA</th>
                <th className="py-2 px-3 text-right">C.ORDENAD</th>
                <th className="py-2 px-3 text-right">C.RECIBIDA</th>
                <th className="py-2 px-3 text-center">FECHA_REQUERIDA</th>
                <th className="py-2 px-3 text-right">PRECIO</th>
                <th className="py-2 px-3 text-center">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {materialTransits.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 text-left font-bold text-blue-700">{po.poNumber}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">{po.orderedQty}</td>
                  <td className="py-2 px-3 text-right text-slate-500">{po.receivedQty}</td>
                  <td className="py-2 px-3 text-center text-slate-600">{po.requiredDate}</td>
                  <td className="py-2 px-3 text-right text-slate-700">
                    ${po.price.toFixed(4)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-sans font-bold uppercase tracking-wider ${
                        po.status === 'BACKORDER'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {po.status}
                    </span>
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
