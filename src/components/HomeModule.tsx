import React, { useState } from 'react';
import { Material, Supplier, User } from '../types/mrp';
import { Home, Package, Shield, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface HomeModuleProps {
  currentUser: User;
  suppliers: Supplier[];
  materials: Material[];
  onSelectMaterialAndNavigate: (materialId: string, supplierId: string) => void;
}

export const HomeModule: React.FC<HomeModuleProps> = ({
  currentUser,
  suppliers,
  materials,
  onSelectMaterialAndNavigate,
}) => {
  const [filterSupplierId, setFilterSupplierId] = useState<string>('all');

  // Filter materials assigned to currentUser's Bolsón or all if Jefe
  const assignedMaterials = materials.filter((m) => {
    if (filterSupplierId !== 'all' && m.primarySupplierId !== filterSupplierId) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Home className="w-4 h-4" />
            <span>Dashboard Principal de Planificación (HU-01)</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bienvenido, {currentUser.name}
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Visualización de primera mano de los proveedores y materiales asignados a su bolsón de planificación.
          </p>
        </div>

        <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-xs flex items-center space-x-3">
          <Shield className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="font-bold text-slate-900">{currentUser.role}</div>
            <div className="text-slate-500 text-[11px]">Bolsón: {currentUser.bolsonId || 'Acceso Total'}</div>
          </div>
        </div>
      </div>

      {/* Supplier Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Filtrar por Proveedor Asignado:
        </span>
        <select
          value={filterSupplierId}
          onChange={(e) => setFilterSupplierId(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">Todos los Proveedores Asignados</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} - {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Materials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedMaterials.map((mat) => {
          const mainSupplier = suppliers.find((s) => s.id === mat.primarySupplierId);
          const secSuppliers = suppliers.filter((s) => mat.secondarySupplierIds.includes(s.id));

          return (
            <div
              key={mat.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 transition shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                    {mat.code}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                    {mat.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 line-clamp-2">{mat.name}</h3>

                <div className="mt-3 space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-700 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Proveedor Principal:</span>
                    <span className="font-bold text-blue-700">{mainSupplier?.code} - {mainSupplier?.name}</span>
                  </div>

                  {secSuppliers.length > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-sans">Proveedor Secundario:</span>
                      <span className="text-amber-700 font-medium">{secSuppliers[0]?.code} - {secSuppliers[0]?.name}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Precio Compra:</span>
                    <span className="text-emerald-700 font-bold">${mat.purchasePrice.toFixed(4)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Lead Time / MOQ:</span>
                    <span className="text-slate-800">{mat.leadTimeWeeks} sem. / {mat.moq} {mat.purchaseUnit}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectMaterialAndNavigate(mat.id, mat.primarySupplierId)}
                className="w-full bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <span>Planificar en GRID 24 Semanas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
