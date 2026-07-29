import React from 'react';
import { Material, TransitPO } from '../../types/mrp';
import { Truck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface EntregasModuleProps {
  transits: TransitPO[];
  materials: Material[];
}

export const EntregasModule: React.FC<EntregasModuleProps> = ({ transits, materials }) => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6 text-slate-800 font-sans">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Truck className="w-5 h-5 text-emerald-600" />
          <span>Módulo de Seguimiento de Entregas y Cumplimiento (HU-29)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Control de recepciones reales frente a lo ordenado, gestión de entregas parciales/completas y retención de tránsito por backorder (4 semanas).
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4"># Orden Compra</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4 text-right">Cant. Ordenada</th>
                <th className="py-3 px-4 text-right">Cant. Recibida</th>
                <th className="py-3 px-4 text-right">Pendiente (Backorder)</th>
                <th className="py-3 px-4 text-center">Fecha Requerida</th>
                <th className="py-3 px-4 text-center">Estatus Cumplimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {transits.map((po) => {
                const mat = materials.find((m) => m.id === po.materialId);
                const pending = po.orderedQty - po.receivedQty;

                return (
                  <tr key={po.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-blue-700">{po.poNumber}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                      {mat?.code} - {mat?.name}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{po.orderedQty}</td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-bold">{po.receivedQty}</td>
                    <td className="py-3 px-4 text-right font-bold text-amber-700">{pending}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{po.requiredDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                          po.status === 'BACKORDER'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {po.status} (Mantener 4 Semanas)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
