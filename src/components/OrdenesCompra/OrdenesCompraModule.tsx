import React, { useState } from 'react';
import { Material, PurchaseOrder, Supplier, User } from '../../types/mrp';
import { ShoppingCart, AlertCircle, FileText, CheckCircle2, ShieldAlert, Plus, Printer, X, Download } from 'lucide-react';

interface OrdenesCompraModuleProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  materials: Material[];
  currentUser: User;
  onCreateEmergencyPO: (po: PurchaseOrder) => void;
  onApprovePO: (poId: string) => void;
}

export const OrdenesCompraModule: React.FC<OrdenesCompraModuleProps> = ({
  purchaseOrders,
  suppliers,
  materials,
  currentUser,
  onCreateEmergencyPO,
  onApprovePO,
}) => {
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  // Emergency Form State
  const [supplierId, setSupplierId] = useState<string>('sup-1100');
  const [materialId, setMaterialId] = useState<string>('mat-220062');
  const [quantity, setQuantity] = useState<number>(50);
  const [emergencyReason, setEmergencyReason] = useState<string>('');

  const handleCreateEmergency = () => {
    if (!emergencyReason) return;
    const mat = materials.find((m) => m.id === materialId);
    const sup = suppliers.find((s) => s.id === supplierId);
    if (!mat || !sup) return;

    const total = mat.purchasePrice * quantity;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `OCD-EMERG-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      plannerId: currentUser.id,
      plannerName: currentUser.name,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
      destinationWarehouse: 'CD Central (C20)',
      isEmergency: true,
      emergencyReason,
      status: 'Pendiente Aprobación',
      totalAmount: total,
      budgetLimit: 10000.0,
      exceedsBudget: total > 10000.0,
      items: [
        {
          materialId: mat.id,
          materialCode: mat.code,
          materialName: mat.name,
          quantity,
          unitPrice: mat.purchasePrice,
          subtotal: total,
          weekIndex: 0,
        },
      ],
    };

    onCreateEmergencyPO(newPO);
    setShowEmergencyModal(false);
    setEmergencyReason('');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6 text-slate-800 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <span>Módulo de Órdenes de Compra (HU-25, HU-26, HU-27)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generación masiva planificada, compras de emergencia extraordinarias, presupuesto por planificador y vista detallada de OCD.
          </p>
        </div>

        <button
          onClick={() => setShowEmergencyModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Compra de Emergencia (HU-26)</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4"># OCD</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4">Planificador</th>
                <th className="py-3 px-4">Tipo Pedido</th>
                <th className="py-3 px-4 text-right">Monto Total ($)</th>
                <th className="py-3 px-4 text-center">Estatus OCD</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    {po.poNumber}
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {po.supplierName}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {po.plannerName}
                  </td>

                  <td className="py-3 px-4">
                    {po.isEmergency ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded font-bold text-[10px]">
                        ⚠️ EMERGENCIA
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded font-semibold text-[10px]">
                        NORMAL PLANIFICADA
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    ${po.totalAmount.toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                        po.status === 'Aprobada'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : po.status === 'Pendiente Aprobación'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center space-x-2">
                    <button
                      onClick={() => setSelectedPO(po)}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-blue-700 px-3 py-1 rounded-lg font-semibold text-xs transition"
                    >
                      Ver Detalle (HU-27)
                    </button>

                    {po.status === 'Pendiente Aprobación' &&
                      currentUser.role === 'Jefe de Planificación' && (
                        <button
                          onClick={() => onApprovePO(po.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-bold text-xs transition shadow-xs"
                        >
                          Aprobar OCD
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE OCD DETAIL MODAL (HU-27 - Matches page 17 PDF format) */}
      {selectedPO && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl p-8 shadow-xl space-y-6 font-mono text-xs border border-slate-200">
            {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900">
                  ORDEN DE COMPRA
                </h2>
                <div className="text-xs text-slate-600 mt-1">
                  Numero de Orden: <span className="font-bold text-black">{selectedPO.poNumber}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Estado: <span className="font-bold uppercase text-blue-700">{selectedPO.status}</span>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-600">
                <div>Fecha Emisión: {selectedPO.orderDate}</div>
                <div>Fecha Requerida: {selectedPO.deliveryDate}</div>
                <div>Destino: {selectedPO.destinationWarehouse}</div>
              </div>
            </div>

            {/* Supplier & Header Info */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-1 text-slate-800 border border-slate-200 font-sans">
              <div className="font-bold text-sm text-black">Proveedor: {selectedPO.supplierName}</div>
              <div>Planificador Solicitante: {selectedPO.plannerName}</div>
              {selectedPO.isEmergency && (
                <div className="text-amber-800 font-bold bg-amber-50 p-2 rounded mt-2 border border-amber-200">
                  ⚠️ Pedido de Emergencia. Razón: {selectedPO.emergencyReason}
                </div>
              )}
            </div>

            {/* Items Table */}
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-2 border border-slate-200">Código Art.</th>
                  <th className="p-2 border border-slate-200">Descripción Articulo</th>
                  <th className="p-2 border border-slate-200 text-right">Cantidad</th>
                  <th className="p-2 border border-slate-200 text-right">Precio Unitario</th>
                  <th className="p-2 border border-slate-200 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedPO.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="p-2 border border-slate-200 font-bold text-blue-700">{item.materialCode}</td>
                    <td className="p-2 border border-slate-200 font-sans">{item.materialName}</td>
                    <td className="p-2 border border-slate-200 text-right font-bold">{item.quantity}</td>
                    <td className="p-2 border border-slate-200 text-right">${item.unitPrice.toFixed(4)}</td>
                    <td className="p-2 border border-slate-200 text-right font-bold text-emerald-700">${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Block */}
            <div className="flex justify-end text-sm font-bold">
              <div className="bg-slate-900 text-white p-3 rounded-lg text-right">
                TOTAL MERCADERÍA: ${selectedPO.totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Printable Signatures */}
            <div className="grid grid-cols-2 gap-8 border-t border-slate-200 pt-8 text-center text-xs text-slate-600 font-sans">
              <div>
                <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
                <div>Firma Planificador</div>
              </div>
              <div>
                <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
                <div>Autorización Jefatura</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 font-sans">
              <button
                onClick={() => setSelectedPO(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1 transition shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir OCD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY PO MODAL (HU-26) */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 text-slate-800">
            <h3 className="text-base font-bold text-amber-800 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>Solicitud de Compra de Emergencia (HU-26)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Proveedor:</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-amber-600"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Material Requerido:</label>
                <select
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-amber-600"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cantidad Extraordinaria:</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Motivo / Justificación Mandatoria (HU-26):
                </label>
                <textarea
                  rows={3}
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  placeholder="Explique el desvío de consumo o faltante crítico que justifica el pedido extraordinario..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateEmergency}
                disabled={!emergencyReason}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs disabled:opacity-50 transition shadow-xs"
              >
                Generar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
