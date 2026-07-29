import React, { useState } from 'react';
import { Bolson, Material, Supplier, User, WeekColumn } from '../../types/mrp';
import { getWOHStatus } from '../../utils/mrpCalculations';
import { Settings, Users, Calendar, AlertTriangle, Play, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ConfiguracionModuleProps {
  users: User[];
  bolsones: Bolson[];
  suppliers: Supplier[];
  materials: Material[];
  weeks: WeekColumn[];
  onAssignBolsonToUser: (userId: string, bolsonId: string) => void;
  onAdvanceRollingGridWeek: () => void;
}

export const ConfiguracionModule: React.FC<ConfiguracionModuleProps> = ({
  users,
  bolsones,
  suppliers,
  materials,
  weeks,
  onAssignBolsonToUser,
  onAdvanceRollingGridWeek,
}) => {
  const [activeTab, setActiveTab] = useState<'bolsones' | 'semanas' | 'criticas' | 'rolling'>('bolsones');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6 text-slate-800 font-sans">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>Módulo de Configuración del Sistema (HU-34 - HU-37)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Administración de usuarios y Bolsones de Proveedores, semanas calendario multi-año, visualización de semanas críticas y simulador Rolling 24 semanas.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('bolsones')}
          className={`pb-3 px-1 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'bolsones'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Bolsones de Proveedores (HU-34)</span>
        </button>

        <button
          onClick={() => setActiveTab('semanas')}
          className={`pb-3 px-1 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'semanas'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Semanas Calendario Multi-Año (HU-35)</span>
        </button>

        <button
          onClick={() => setActiveTab('criticas')}
          className={`pb-3 px-1 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'criticas'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Semanas Críticas 4 Semanas (HU-36)</span>
        </button>

        <button
          onClick={() => setActiveTab('rolling')}
          className={`pb-3 px-1 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'rolling'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Play className="w-4 h-4 text-emerald-600" />
          <span>Simulador Rolling 24 Semanas (HU-37)</span>
        </button>
      </div>

      {/* TAB 1: Bolsones */}
      {activeTab === 'bolsones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bolsones.map((bol) => {
            const assignedUser = users.find((u) => u.id === bol.assignedUserId);
            const assignedSups = suppliers.filter((s) => bol.assignedSupplierIds.includes(s.id));

            return (
              <div key={bol.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 text-base">{bol.name}</h3>
                  <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded font-mono font-bold">
                    {assignedSups.length} Proveedores
                  </span>
                </div>

                <p className="text-xs text-slate-600">{bol.description}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="text-slate-500 font-semibold block">Usuario Asignado:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{assignedUser?.name || 'Sin Asignar'}</span>
                    <span className="text-slate-500 text-[10px]">{assignedUser?.role}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Proveedores en el Bolsón:
                  </span>
                  <ul className="space-y-1 text-xs font-mono text-blue-700">
                    {assignedSups.map((s) => (
                      <li key={s.id} className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                        • {s.code} - {s.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Semanas Calendario (HU-35) */}
      {activeTab === 'semanas' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Distribución de Semanas Calendario Carga N Años (HU-35)
            </h3>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 transition">
              Subir Archivo de Semanas CSV/Excel
            </button>
          </div>

          <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead className="sticky top-0 bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">LUNES</th>
                  <th className="py-2.5 px-4">DOMINGO</th>
                  <th className="py-2.5 px-4 text-center">SEMANA #</th>
                  <th className="py-2.5 px-4 text-center">AÑO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {weeks.map((w) => (
                  <tr key={w.weekIndex} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-4 text-blue-700 font-bold">{w.startDate}</td>
                    <td className="py-2 px-4 text-slate-400">---</td>
                    <td className="py-2 px-4 text-center font-bold text-amber-700">{w.weekNumber}</td>
                    <td className="py-2 px-4 text-center text-slate-600">{w.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Semanas Críticas 4 Semanas (HU-36) */}
      {activeTab === 'criticas' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Visión Consolidada de Semanas Críticas a 4 Semanas Futuras (HU-36)
            </h3>
            <span className="text-xs text-slate-500">
              Muestra la cantidad de semanas disponibles (WOH) respetando los colores de la política de stock
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Código Material</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4">Proveedor Principal</th>
                  <th className="py-3 px-4 text-center">Semana 1</th>
                  <th className="py-3 px-4 text-center">Semana 2</th>
                  <th className="py-3 px-4 text-center">Semana 3</th>
                  <th className="py-3 px-4 text-center">Semana 4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {materials.map((m) => {
                  const sup = suppliers.find((s) => s.id === m.primarySupplierId);
                  const woh1 = getWOHStatus(2.1);
                  const woh2 = getWOHStatus(1.3);
                  const woh3 = getWOHStatus(0.8);
                  const woh4 = getWOHStatus(3.5);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-blue-700">{m.code}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">{m.name}</td>
                      <td className="py-3 px-4 font-sans text-slate-600">{sup?.name}</td>
                      <td className={`py-3 px-4 text-center font-bold ${woh1.bgColor}`}>{woh1.label} (2.1)</td>
                      <td className={`py-3 px-4 text-center font-bold ${woh2.bgColor}`}>{woh2.label} (1.3)</td>
                      <td className={`py-3 px-4 text-center font-bold ${woh3.bgColor}`}>{woh3.label} (0.8)</td>
                      <td className={`py-3 px-4 text-center font-bold ${woh4.bgColor}`}>{woh4.label} (3.5)</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Rolling 24-Week Grid Simulator (HU-37) */}
      {activeTab === 'rolling' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Play className="w-5 h-5 text-emerald-600" />
                <span>Simulador de Actualización del GRID (Rolling 24 Semanas - HU-37)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Al terminar cada semana, el grid se desplaza: la semana 1 pasa al histórico, la semana 2 se convierte en la posición 1 y se agrega la semana 25 al final.
              </p>
            </div>

            <button
              onClick={onAdvanceRollingGridWeek}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs flex items-center space-x-2 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Avanzar 1 Semana en la Cuadrícula</span>
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
            <span className="text-slate-600 font-sans font-semibold">Ventana Actual de 24 Semanas Visibles:</span>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {weeks.map((w) => (
                <span key={w.weekIndex} className="bg-white px-2 py-1 rounded border border-slate-200 text-blue-700 font-bold shadow-2xs">
                  W{w.weekNumber} ({w.dateLabel})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
