import React, { useState } from 'react';
import { FileAttachment, LaunchType, Material, MaterialCategory, MaterialStatus } from '../../types/mrp';
import { Package, Plus, ToggleLeft, ToggleRight, FileText, Upload, RefreshCw, Check, Image as ImageIcon, Clock, Sliders, Save, Edit2 } from 'lucide-react';

interface MaterialesModuleProps {
  materials: Material[];
  attachments: FileAttachment[];
  onToggleStatus: (materialId: string) => void;
  onAddMaterial: (newMat: Material) => void;
  onUpdateMaterial?: (updatedMat: Material) => void;
  onUploadFile: (file: FileAttachment) => void;
}

export const MaterialesModule: React.FC<MaterialesModuleProps> = ({
  materials,
  attachments,
  onToggleStatus,
  onAddMaterial,
  onUpdateMaterial,
  onUploadFile,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // New Material Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [purchaseUnit, setPurchaseUnit] = useState('F200 Und');
  const [price, setPrice] = useState(100.0);
  const [category, setCategory] = useState<MaterialCategory>('Nacional');
  const [launchType, setLaunchType] = useState<LaunchType>('Incorporación Permanente');
  const [leadTimeWeeks, setLeadTimeWeeks] = useState<number>(3);
  const [targetCoverageWeeks, setTargetCoverageWeeks] = useState<number>(2.2);

  // Edit Material Form State
  const [editLeadTime, setEditLeadTime] = useState<number>(1);
  const [editCoverage, setEditCoverage] = useState<number>(2.2);
  const [editPrice, setEditPrice] = useState<number>(100.0);
  const [editMoq, setEditMoq] = useState<number>(10);

  const handleCreate = () => {
    if (!code || !name) return;
    const newMat: Material = {
      id: `mat-${Date.now()}`,
      code,
      name,
      purchaseUnit,
      rfsUnit: 'Und',
      rfsToPurchaseFactor: 100,
      purchasePrice: price,
      category,
      status: 'Planificable',
      launchType,
      primarySupplierId: 'sup-1100',
      secondarySupplierIds: [],
      leadTimeWeeks,
      dispatchMultiple: 1,
      moq: 10,
      targetCoverageWeeks,
    };
    onAddMaterial(newMat);
    setShowCreateModal(false);
    setCode('');
    setName('');
  };

  const handleOpenEdit = (mat: Material) => {
    setEditingMaterial(mat);
    setEditLeadTime(mat.leadTimeWeeks);
    setEditCoverage(mat.targetCoverageWeeks);
    setEditPrice(mat.purchasePrice);
    setEditMoq(mat.moq);
  };

  const handleSaveEdit = () => {
    if (!editingMaterial || !onUpdateMaterial) return;
    const updated: Material = {
      ...editingMaterial,
      leadTimeWeeks: editLeadTime,
      targetCoverageWeeks: editCoverage,
      purchasePrice: editPrice,
      moq: editMoq,
    };
    onUpdateMaterial(updated);
    setEditingMaterial(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6 text-slate-800 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Módulo de Administración de Materiales (HU-15 - HU-18)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de materiales nuevos, lanzamientos temporales, lead times, políticas de inventario, planificabilidad y parámetros logísticos.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Material / Lanzamiento (HU-15)</span>
        </button>
      </div>

      {/* Materials Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Código / Material</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-center">Lead Time</th>
                <th className="py-3 px-4 text-center">Política Cobertura</th>
                <th className="py-3 px-4 text-right">Precio Compra</th>
                <th className="py-3 px-4 text-center">Estado Planificable (HU-16)</th>
                <th className="py-3 px-4 text-center">Acción / Edición</th>
                <th className="py-3 px-4 text-center">Ficha / Imagen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {materials.map((mat) => {
                const matFiles = attachments.filter((a) => a.relatedEntityId === mat.id);

                return (
                  <tr key={mat.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-700">{mat.code}</div>
                      <div className="font-semibold text-slate-900">{mat.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        UOM: {mat.purchaseUnit} | Tipo: {mat.launchType}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700 font-semibold">
                        {mat.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="bg-amber-50 text-amber-900 border border-amber-200 font-mono font-extrabold px-2.5 py-1 rounded shadow-2xs">
                        <Clock className="w-3 h-3 inline mr-1 text-amber-600" />
                        {mat.leadTimeWeeks} sem.
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono font-extrabold px-2.5 py-1 rounded shadow-2xs">
                        <Sliders className="w-3 h-3 inline mr-1 text-emerald-600" />
                        {mat.targetCoverageWeeks} sem.
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      ${mat.purchasePrice.toFixed(4)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleStatus(mat.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition inline-flex items-center space-x-1.5 ${
                          mat.status === 'Planificable'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {mat.status === 'Planificable' ? (
                          <ToggleRight className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                        )}
                        <span>{mat.status}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(mat)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold text-xs transition inline-flex items-center space-x-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg cursor-pointer inline-flex items-center space-x-1 transition border border-slate-200">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Subir</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              onUploadFile({
                                id: `att-${Date.now()}`,
                                fileName: f.name,
                                fileType: 'pdf',
                                fileSize: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
                                uploadedBy: 'Planificador',
                                uploadedAt: new Date().toISOString().substring(0, 10),
                                url: '#',
                                category: 'Datasheet',
                                relatedEntityId: mat.id,
                              });
                            }
                          }}
                        />
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating New Material */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 text-slate-800">
            <h3 className="text-lg font-bold text-slate-900">Registrar Nuevo Material / Lanzamiento</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Código de Material:</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ej. 14034580"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre del Material:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Salsa Dulce de Tomate C24 UND"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unidad de Compra:</label>
                  <input
                    type="text"
                    value={purchaseUnit}
                    onChange={(e) => setPurchaseUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Precio Compra ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Categoría:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Nacional">Nacional</option>
                    <option value="Regional">Regional</option>
                    <option value="Extranjero">Extranjero</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipo Incorporación:</label>
                  <select
                    value={launchType}
                    onChange={(e) => setLaunchType(e.target.value as LaunchType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Incorporación Permanente">Permanente</option>
                    <option value="Lanzamiento Temporal">Temporal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lead Time (Semanas):</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={leadTimeWeeks}
                    onChange={(e) => setLeadTimeWeeks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pol. Cobertura (Semanas):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={targetCoverageWeeks}
                    onChange={(e) => setTargetCoverageWeeks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                Guardar Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Existing Material Leadtime & Policy */}
      {editingMaterial && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 text-slate-800">
            <div className="flex items-center space-x-2 text-slate-900 border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-base font-bold">Modificar Lead Time y Política de Cobertura</h3>
                <p className="text-xs text-slate-500 font-mono">{editingMaterial.code} - {editingMaterial.name}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900">
                <p className="font-semibold">Parámetros Logísticos Principales:</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Los cambios en el Lead Time impactarán el cálculo de reposición en la matriz de 24 semanas y las sugerencias de Órdenes de Compra.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Lead Time (Semanas de Entregas):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={editLeadTime}
                      onChange={(e) => setEditLeadTime(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-base focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <span className="absolute right-3 top-3 text-slate-400 font-medium">sem.</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Tiempo entre emisión de OC y llegada al almacén.</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Cobertura Objetivo (Política Semanas):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="10"
                      value={editCoverage}
                      onChange={(e) => setEditCoverage(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-base focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <span className="absolute right-3 top-3 text-slate-400 font-medium">sem.</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Inventario meta expresado en WOH.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Precio de Compra ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mínimo de Compra (MOQ):</label>
                  <input
                    type="number"
                    min="1"
                    value={editMoq}
                    onChange={(e) => setEditMoq(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingMaterial(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
