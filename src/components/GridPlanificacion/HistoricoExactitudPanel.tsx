import React from 'react';
import { AccuracyHistoryWeek } from '../../types/mrp';
import { BarChart2, TrendingUp, TrendingDown } from 'lucide-react';

interface HistoricoExactitudPanelProps {
  accuracyHistory: AccuracyHistoryWeek[];
}

export const HistoricoExactitudPanel: React.FC<HistoricoExactitudPanelProps> = ({
  accuracyHistory,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-800 flex flex-col h-full shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Histórico de Exactitud (12 Semanas Cerradas - HU-20)
          </h4>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          Fórmula: (Inferidos / Consumo Real) * 100
        </span>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <th className="py-2 px-3 text-center">WK</th>
              <th className="py-2 px-3 text-right">Inferidos</th>
              <th className="py-2 px-3 text-right">Consumo Real</th>
              <th className="py-2 px-3 text-center">% Exactitud</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
            {accuracyHistory.slice(0, 12).map((item) => {
              const isExact = Math.abs(item.accuracyPercent - 100) < 5;
              const isOver = item.accuracyPercent > 105;

              return (
                <tr key={item.weekNumber} className="hover:bg-slate-50 transition">
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">
                    WK {item.weekNumber}
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-600">{item.inferidos}</td>
                  <td className="py-1.5 px-3 text-right text-slate-600">{item.consumoReal}</td>
                  <td className="py-1.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded font-bold ${
                        isExact
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isOver
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <span>{item.accuracyPercent.toFixed(1)}%</span>
                      {item.accuracyPercent >= 100 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
