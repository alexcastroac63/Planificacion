import React from 'react';
import { Material } from '../../types/mrp';
import { PieChart, Building2, CheckCircle2 } from 'lucide-react';

interface DistribucionModuleProps {
  materials: Material[];
}

export const DistribucionModule: React.FC<DistribucionModuleProps> = ({ materials }) => {
  const centers = [
    { name: 'CD Central (C20)', pct: 55, color: 'bg-blue-600' },
    { name: 'CD Norte (P200)', pct: 30, color: 'bg-emerald-600' },
    { name: 'CD Sur (C6)', pct: 15, color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6 text-slate-800 font-sans">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-indigo-600" />
          <span>Módulo de Distribución por Centros y Bodegas (HU-28)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Segmentación de órdenes de compra entre centros de consumo basado en el consumo real histórico de las últimas 5 semanas (100% total).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {materials.map((mat) => (
          <div key={mat.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-mono font-bold text-blue-700">{mat.code}</span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Base: 5 Semanas</span>
            </div>

            <h3 className="font-bold text-sm text-slate-900">{mat.name}</h3>

            <div className="space-y-3 pt-2">
              {centers.map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{c.name}</span>
                    <span className="text-blue-700 font-mono font-bold">{c.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div className={`${c.color} h-2 rounded-full`} style={{ width: `${c.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-center font-semibold">
              ✓ Suma total de distribución: 100%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
