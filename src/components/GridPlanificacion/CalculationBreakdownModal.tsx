import React from 'react';
import { Material, PlanningWeekData, TransitPO, WeekColumn } from '../../types/mrp';
import { getWOHStatus } from '../../utils/mrpCalculations';
import {
  Calculator,
  X,
  Info,
  Clock,
  ArrowRight,
  Sliders,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  Truck,
  Box,
} from 'lucide-react';

export type CalculatedRowType =
  | 'estimado'
  | 'inferido'
  | 'consumoPromedio'
  | 'invInicial'
  | 'transito'
  | 'ingresaCD'
  | 'invFinal'
  | 'woh'
  | 'porCubrir'
  | 'ocSugerida'
  | 'preOrden'
  | 'nuevaOC'
  | 'valorCompra';

interface CalculationBreakdownModalProps {
  material: Material;
  weekIndex: number;
  weekColumn: WeekColumn;
  rowType: CalculatedRowType;
  gridCalculated: PlanningWeekData[];
  transits: TransitPO[];
  onClose: () => void;
}

export const CalculationBreakdownModal: React.FC<CalculationBreakdownModalProps> = ({
  material,
  weekIndex,
  weekColumn,
  rowType,
  gridCalculated,
  transits,
  onClose,
}) => {
  const cell = gridCalculated[weekIndex] || gridCalculated[0];
  const leadTime = material.leadTimeWeeks || 1;
  const coveragePolicy = material.targetCoverageWeeks || 2.2;

  // Calculate future demand context (next 4 weeks)
  let sumFutureDemand = 0;
  let countFutureWeeks = 0;
  const futureDetails: { weekLabel: string; demand: number }[] = [];
  for (let k = 1; k <= 4; k++) {
    const futureIdx = weekIndex + k;
    if (futureIdx < gridCalculated.length) {
      const dem = gridCalculated[futureIdx].estimado + gridCalculated[futureIdx].inferido;
      sumFutureDemand += dem;
      countFutureWeeks++;
      futureDetails.push({
        weekLabel: gridCalculated[futureIdx].dateLabel,
        demand: dem,
      });
    } else {
      const dem = cell.estimado + cell.inferido;
      sumFutureDemand += dem;
      countFutureWeeks++;
      futureDetails.push({
        weekLabel: `Proyectado W${weekIndex + k + 1}`,
        demand: dem,
      });
    }
  }
  const avg4WeekDemand = countFutureWeeks > 0 ? sumFutureDemand / countFutureWeeks : 1;
  const targetOptimoInv = avg4WeekDemand * coveragePolicy;

  // Filter transit POs for this week
  const thisWeekTransits = transits.filter(
    (t) => t.materialId === material.id && t.weekIndexNeeded === weekIndex && t.status !== 'RECIBIDO'
  );

  // Previous week reference
  const prevCell = weekIndex > 0 ? gridCalculated[weekIndex - 1] : null;

  // Dispatch / Order origin week for arrival in this week
  const orderOriginIndex = weekIndex - leadTime;
  const orderOriginCell = orderOriginIndex >= 0 ? gridCalculated[orderOriginIndex] : null;

  // Arrival week for orders placed in this week
  const arrivalIndex = weekIndex + leadTime;
  const arrivalCell = arrivalIndex < gridCalculated.length ? gridCalculated[arrivalIndex] : null;

  const getRowMeta = () => {
    switch (rowType) {
      case 'estimado':
        return {
          title: 'Estimados de Ventas (ERP)',
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
          formula: 'Promedio Trimado (Trimmed Mean 7 Semanas) transmitido desde el ERP',
        };
      case 'inferido':
        return {
          title: 'Inferidos (Ajustes / Promociones)',
          badgeColor: 'bg-cyan-100 text-cyan-950 border-cyan-300',
          formula: 'Ajuste Manual + Eventos Promocionales + Lanzamiento',
        };
      case 'consumoPromedio':
        return {
          title: 'Consumo Promedio (Demanda Total Base)',
          badgeColor: 'bg-indigo-600 text-white border-indigo-700',
          formula: 'Consumo Promedio = Estimados (ERP) + Inferidos (Ajustes/Promociones)',
        };
      case 'invInicial':
        return {
          title: 'Inventario Inicial',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
          formula: weekIndex === 0 ? 'Inventario Físico Base en Almacén' : `Inv. Final de la Semana Anterior (W${weekIndex})`,
        };
      case 'transito':
        return {
          title: 'Tránsitos Confirmados',
          badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          formula: 'Suma de Órdenes de Compra (OCs) en tránsito programadas para esta semana',
        };
      case 'ingresaCD':
        return {
          title: 'Ingresa a CD (Recepciones Proyectadas)',
          badgeColor: 'bg-sky-600 text-white border-sky-700',
          formula: `(Pre-Orden + Nueva OC de hace ${leadTime} semana/s) = Arribo a Bodega`,
        };
      case 'invFinal':
        return {
          title: 'Inventario Final',
          badgeColor: 'bg-slate-900 text-white border-slate-800',
          formula: '(Inv. Inicial + Tránsitos + Ingresa a CD) - (Estimados + Inferidos)',
        };
      case 'woh':
        return {
          title: 'WOH (Weeks on Hand - Cobertura en Semanas)',
          badgeColor: getWOHStatus(cell.woh, coveragePolicy).bgColor,
          formula: 'Inventario Final / Demanda Promedio Semanal Futura (4 semanas)',
        };
      case 'porCubrir':
        return {
          title: 'Falta de Cobertura (Por Cubrir)',
          badgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
          formula: 'MAX(0, (Demanda Prom. Futura × Política Cobertura) - Inv. Final)',
        };
      case 'ocSugerida':
        return {
          title: 'Órden de Compra Sugerida (OC Sugerida)',
          badgeColor: 'bg-amber-500 text-white border-amber-600',
          formula: `Sugerida en W${weekIndex + 1} para cubrir el faltante de la semana W${arrivalIndex + 1} considerando Lead Time (${leadTime} sem)`,
        };
      case 'preOrden':
        return {
          title: 'Pre Orden (Simulación de Compras)',
          badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          formula: 'Cantidad simulada por el usuario. Llegará a bodega en Lead Time semanas.',
        };
      case 'nuevaOC':
        return {
          title: 'Nueva OC (Orden de Compra Firme)',
          badgeColor: 'bg-emerald-600 text-white border-emerald-700',
          formula: 'Generación directa de compra. Sujeta a validación MOQ y Múltiplo.',
        };
      case 'valorCompra':
        return {
          title: 'Valor de Compra Total ($)',
          badgeColor: 'bg-blue-600 text-white border-blue-700',
          formula: '(Pre Orden + Nueva OC) × Precio Unitario de Compra',
        };
    }
  };

  const meta = getRowMeta();

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 p-6 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cálculo Base en Matriz MRP
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${meta.badgeColor}`}>
                  {cell.dateLabel} (Sem. {cell.weekNumber})
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">{meta.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Material Context Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-mono font-bold text-blue-700">{material.code}</div>
            <div className="font-bold text-slate-900">{material.name}</div>
          </div>
          <div className="flex items-center space-x-3 text-slate-700 font-mono text-[11px]">
            <span className="bg-white px-2 py-1 rounded border border-slate-200">
              Costo: <strong className="text-emerald-700">${material.purchasePrice.toFixed(4)}</strong>
            </span>
            <span className="bg-white px-2 py-1 rounded border border-slate-200">
              Lead Time: <strong className="text-amber-700">{leadTime} sem.</strong>
            </span>
            <span className="bg-white px-2 py-1 rounded border border-slate-200">
              Política: <strong className="text-emerald-700">{coveragePolicy} sem.</strong>
            </span>
            <span className="bg-white px-2 py-1 rounded border border-slate-200">
              MOQ: <strong className="text-sky-700">{material.moq} {material.purchaseUnit}</strong>
            </span>
          </div>
        </div>

        {/* Formula Overview */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950">
          <div className="flex items-center space-x-2 font-bold mb-1 text-blue-900">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Fórmula & Lógica del Algoritmo MRP:</span>
          </div>
          <div className="font-mono bg-white p-2.5 rounded-lg border border-blue-200 text-slate-900 font-semibold">
            {meta.formula}
          </div>
        </div>

        {/* Detailed Breakdown according to cell rowType */}
        <div className="space-y-3 text-xs">
          <div className="font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Desglose Detallado de los Componentes (Semana {cell.dateLabel}):</span>
          </div>

          {rowType === 'estimado' && (
            <div className="space-y-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>Pronóstico de Demanda ERP:</span>
                  <span className="font-mono text-sm text-blue-700">{cell.estimado.toFixed(2)} {material.purchaseUnit}</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Cálculo generado automáticamente por el motor de demanda sobre el promedio de consumo histórico de 7 semanas, descartando el pico más alto y la caída más baja.
                </p>
              </div>
            </div>
          )}

          {rowType === 'inferido' && (
            <div className="space-y-2">
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center font-bold text-cyan-950">
                  <span>Ajuste de Eventos / Promociones (Inferido):</span>
                  <span className="font-mono text-base text-cyan-900">{cell.inferido.toFixed(2)} {material.purchaseUnit}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-cyan-200">
                  <div>
                    <span className="text-slate-500">Estimado Base:</span>{' '}
                    <strong className="font-mono">{cell.estimado.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Demanda Total resultante:</span>{' '}
                    <strong className="font-mono text-blue-800">{(cell.estimado + cell.inferido).toFixed(2)}</strong>
                  </div>
                </div>
                {cell.inferidoNote && (
                  <div className="bg-white p-2 rounded border border-cyan-200 text-slate-800 font-sans italic text-[11px]">
                    <strong>Nota/Justificación:</strong> "{cell.inferidoNote}"
                  </div>
                )}
                {cell.inferidoModifiedBy && (
                  <div className="text-[10px] text-slate-500">
                    Modificado por: <strong>{cell.inferidoModifiedBy}</strong> el {cell.inferidoModifiedAt}
                  </div>
                )}
              </div>
            </div>
          )}

          {rowType === 'consumoPromedio' && (
            <div className="space-y-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center font-bold text-indigo-950">
                  <span>Consumo Promedio (Promedio 4 Semanas Futuras):</span>
                  <span className="font-mono text-lg text-indigo-900 font-extrabold">
                    {cell.consumoPromedio.toFixed(2)} {material.purchaseUnit} / sem
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-sans">
                  Resultado del promedio de la demanda total (Estimado + Inferido) de las <strong>4 semanas futuras</strong> (semanas t+1 a t+4):
                </p>

                <div className="bg-white p-3 rounded-lg border border-indigo-200 font-mono text-xs space-y-2 text-slate-800">
                  {futureDetails.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="font-sans text-slate-700">
                        • Semana {idx + 1} ({f.weekLabel}):
                      </span>
                      <strong className="text-indigo-900">
                        {f.demand.toFixed(2)} {material.purchaseUnit}
                      </strong>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold font-sans text-indigo-950 text-xs">
                    <span>Suma demanda 4 semanas futuras:</span>
                    <span className="font-mono text-indigo-900">{sumFutureDemand.toFixed(2)} {material.purchaseUnit}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5 font-bold font-sans text-indigo-950 text-xs">
                    <span>Promedio (Suma / 4 semanas):</span>
                    <span className="font-mono text-indigo-900">
                      {sumFutureDemand.toFixed(2)} ÷ {countFutureWeeks} = {cell.consumoPromedio.toFixed(2)} {material.purchaseUnit}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-indigo-200 p-3 rounded-lg text-xs text-slate-700 space-y-1 font-sans">
                  <p className="font-bold text-indigo-950">📌 Uso de esta base en el motor MRP:</p>
                  <p className="text-slate-600">
                    • <strong>Proyección de Cobertura (WOH):</strong> Sirve de divisor para calcular las semanas de inventario disponible en base a la demanda proyectada.
                  </p>
                  <p className="text-slate-600">
                    • <strong>Cálculo de Insumos Por Cubrir:</strong> Determina el nivel de inventario óptimo requerido ({coveragePolicy} sem × Consumo Promedio) para generar sugerencias de Órdenes de Compra.
                  </p>
                </div>
              </div>
            </div>
          )}

          {rowType === 'invInicial' && (
            <div className="space-y-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>Inventario Inicial (W{weekIndex + 1}):</span>
                  <span className="font-mono text-base text-slate-900">{cell.invInicial.toFixed(2)} {material.purchaseUnit}</span>
                </div>
                {weekIndex === 0 ? (
                  <p className="text-slate-600 text-[11px]">
                    Corresponde al inventario físico disponible en el Almacén / CD al inicio del horizonte de planificación de 24 semanas.
                  </p>
                ) : (
                  <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 font-mono">
                    <div>Proviene del Inventario Final de la semana anterior (W{weekIndex}):</div>
                    <div className="mt-1 font-bold text-blue-700">
                      Inv. Final (W{weekIndex}) = {prevCell?.invFinal.toFixed(2)} {material.purchaseUnit} → Inv. Inicial (W{weekIndex + 1}) = {cell.invInicial.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {rowType === 'transito' && (
            <div className="space-y-2">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center font-bold text-indigo-950">
                  <span>Tránsitos Programados en esta semana:</span>
                  <span className="font-mono text-base text-indigo-900">{cell.transito.toFixed(2)} {material.purchaseUnit}</span>
                </div>
                {thisWeekTransits.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-indigo-900">Órdenes de Compra vinculadas:</div>
                    {thisWeekTransits.map((t) => (
                      <div key={t.id} className="bg-white p-2 rounded border border-indigo-200 flex justify-between items-center font-mono text-[11px]">
                        <div>
                          <strong className="text-blue-700">{t.poNumber}</strong> ({t.status})
                          <span className="block text-slate-500 font-sans text-[10px]">Llegada estimada: {t.etaDate}</span>
                        </div>
                        <div className="font-bold text-indigo-950">
                          {(t.orderedQty - t.receivedQty).toLocaleString()} {material.purchaseUnit}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px]">
                    No existen Órdenes de Compra previamente emitidas con llegada programada para la semana {cell.dateLabel}.
                  </p>
                )}
              </div>
            </div>
          )}

          {rowType === 'ingresaCD' && (
            <div className="space-y-2">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center font-bold text-sky-950">
                  <span>Recepción Proyectada en CD:</span>
                  <span className="font-mono text-base text-sky-900">{cell.ingresaCD.toFixed(2)} {material.purchaseUnit}</span>
                </div>
                {orderOriginCell ? (
                  <div className="bg-white p-2.5 rounded-lg border border-sky-200 font-mono text-[11px] space-y-1 text-slate-800">
                    <div className="text-slate-500 font-sans">
                      Resultado de compras simuladas/reales emitidas en <strong>W{orderOriginIndex + 1} ({orderOriginCell.dateLabel})</strong> con Lead Time de <strong>{leadTime} semanas</strong>:
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1">
                      <span>Pre-Orden simulada en W{orderOriginIndex + 1}:</span>
                      <strong className="text-emerald-700">+{orderOriginCell.preOrden}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Nueva OC firme en W{orderOriginIndex + 1}:</span>
                      <strong className="text-emerald-800">+{orderOriginCell.nuevaOC}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-sky-900">
                      <span>Total Ingresa a CD en W{weekIndex + 1}:</span>
                      <span>{cell.ingresaCD.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px]">
                    Sin compras previas asociadas dentro del horizonte de cálculo.
                  </p>
                )}
              </div>
            </div>
          )}

          {rowType === 'invFinal' && (
            <div className="space-y-2">
              <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-3.5 space-y-2.5 font-mono">
                <div className="text-xs uppercase text-slate-400 font-sans font-bold">Fórmula de Flujo de Inventario:</div>
                <div className="text-sm bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 font-bold space-y-1">
                  <div>Inv. Final = (Inv. Inicial + Tránsitos + Ingresa CD) - (Estimados + Inferidos)</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                  <div className="space-y-1">
                    <div className="text-emerald-400 font-bold font-sans">ENTRADAS / DISPONIBLE:</div>
                    <div className="flex justify-between"><span>Inv. Inicial:</span> <strong>+{cell.invInicial.toFixed(2)}</strong></div>
                    <div className="flex justify-between"><span>Tránsitos:</span> <strong>+{cell.transito.toFixed(2)}</strong></div>
                    <div className="flex justify-between"><span>Ingresa a CD:</span> <strong>+{cell.ingresaCD.toFixed(2)}</strong></div>
                    <div className="flex justify-between border-t border-slate-800 pt-1 text-emerald-300 font-bold">
                      <span>Total Disponible:</span>
                      <span>{(cell.invInicial + cell.transito + cell.ingresaCD).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-1 border-l border-slate-800 pl-2">
                    <div className="text-red-400 font-bold font-sans">SALIDAS / DEMANDA:</div>
                    <div className="flex justify-between"><span>Estimado ERP:</span> <strong>-{cell.estimado.toFixed(2)}</strong></div>
                    <div className="flex justify-between"><span>Inferido:</span> <strong>-{cell.inferido.toFixed(2)}</strong></div>
                    <div className="flex justify-between border-t border-slate-800 pt-1 text-red-300 font-bold">
                      <span>Total Demanda:</span>
                      <span>-{(cell.estimado + cell.inferido).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm font-bold bg-slate-950 p-2 rounded border border-slate-800 pt-2">
                  <span className="font-sans text-slate-300">Resultado Inventario Final:</span>
                  <span className={cell.invFinal < 0 ? 'text-red-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
                    {cell.invFinal.toFixed(2)} {material.purchaseUnit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {rowType === 'woh' && (
            <div className="space-y-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Semanas de Cobertura (WOH):</span>
                  <span className={`text-base font-extrabold px-3 py-1 rounded ${getWOHStatus(cell.woh, coveragePolicy).bgColor}`}>
                    {cell.woh.toFixed(1)} sem. ({getWOHStatus(cell.woh, coveragePolicy).label})
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sans">Inventario Final disponible:</span>
                    <strong className="text-slate-900">{cell.invFinal.toFixed(2)} {material.purchaseUnit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sans">Demanda Promedio Semanal Futura (4 semanas):</span>
                    <strong className="text-blue-700">{avg4WeekDemand.toFixed(2)} {material.purchaseUnit}/sem</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1 font-sans">
                    Semanas consideradas: {futureDetails.map((f) => `${f.weekLabel}: ${f.demand.toFixed(1)}`).join(' | ')}
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 text-xs font-bold font-sans">
                    <span>Cálculo WOH:</span>
                    <span className="font-mono text-blue-900">{cell.invFinal.toFixed(2)} ÷ {avg4WeekDemand.toFixed(2)} = {cell.woh.toFixed(1)} semanas</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[11px] text-amber-900">
                  <strong>Política Objetivo del Material:</strong> Cobertura ideal de <strong>{coveragePolicy} semanas</strong>.
                </div>
              </div>
            </div>
          )}

          {rowType === 'porCubrir' && (
            <div className="space-y-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center font-bold text-amber-950">
                  <span>Necesidad de Compra (Por Cubrir):</span>
                  <span className="font-mono text-lg text-amber-900">{cell.porCubrir} {material.purchaseUnit}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-200 font-mono text-[11px] space-y-1.5 text-slate-800">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Promedio Demanda Futura:</span>
                    <strong>{avg4WeekDemand.toFixed(2)} /sem</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Política Cobertura Deseada:</span>
                    <strong className="text-emerald-700">{coveragePolicy} semanas</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1">
                    <span className="font-sans text-slate-600">Inventario Meta Mínimo Deseado:</span>
                    <strong className="text-blue-700">{targetOptimoInv.toFixed(2)} {material.purchaseUnit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Inventario Final Actual:</span>
                    <strong className={cell.invFinal < 0 ? 'text-red-700' : 'text-slate-900'}>{cell.invFinal.toFixed(2)} {material.purchaseUnit}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold font-sans text-amber-950 text-xs">
                    <span>Deficit para alcanzar política:</span>
                    <span className="font-mono text-amber-900">
                      {targetOptimoInv.toFixed(2)} - {cell.invFinal.toFixed(2)} = {cell.porCubrir} {material.purchaseUnit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {rowType === 'ocSugerida' && (
            <div className="space-y-2">
              <div className="bg-amber-100/80 border border-amber-300 rounded-xl p-3.5 space-y-2 text-amber-950">
                <div className="flex justify-between items-center font-bold">
                  <span>Sugerencia Automática de Compra (OC Sugerida):</span>
                  <span className="font-mono text-lg text-amber-900">{cell.ocSugerida} {material.purchaseUnit}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-200 font-mono text-[11px] space-y-1.5 text-slate-800">
                  <p className="font-sans text-slate-600">
                    Anticipación del pedido según Lead Time del proveedor (<strong>{leadTime} semana/s</strong>):
                  </p>
                  <div className="flex justify-between bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="font-sans">Semana con falta de stock:</span>
                    <strong className="text-amber-800">
                      {arrivalCell ? `${arrivalCell.dateLabel} (Por Cubrir: ${arrivalCell.porCubrir})` : `W${arrivalIndex + 1}`}
                    </strong>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="font-sans">Semana actual de emisión recomendada:</span>
                    <strong className="text-blue-800">{cell.dateLabel} (W{weekIndex + 1})</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans mt-1">
                    Emitiendo esta orden en {cell.dateLabel}, el material ingresará a CD en la semana {arrivalCell?.dateLabel || `W${arrivalIndex + 1}`} cubriendo el riesgo de quiebre.
                  </div>
                </div>
              </div>
            </div>
          )}

          {(rowType === 'preOrden' || rowType === 'nuevaOC') && (
            <div className="space-y-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2 text-emerald-950">
                <div className="flex justify-between items-center font-bold">
                  <span>{rowType === 'preOrden' ? 'Pre Orden Simulada:' : 'Nueva OC Confirmada:'}</span>
                  <span className="font-mono text-lg text-emerald-900">
                    {(rowType === 'preOrden' ? cell.preOrden : cell.nuevaOC)} {material.purchaseUnit}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-emerald-200 font-mono text-[11px] space-y-1.5 text-slate-800">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Costo Estimado de esta Orden:</span>
                    <strong className="text-emerald-700">
                      ${(((rowType === 'preOrden' ? cell.preOrden : cell.nuevaOC)) * material.purchasePrice).toFixed(2)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Mínimo de Compra (MOQ):</span>
                    <strong className="text-sky-700">{material.moq} {material.purchaseUnit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Semana de Emisión:</span>
                    <strong>{cell.dateLabel}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1">
                    <span className="font-sans text-slate-600">Semana de Llegada Estimada a CD:</span>
                    <strong className="text-blue-700">{arrivalCell ? arrivalCell.dateLabel : `W${arrivalIndex + 1}`}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {rowType === 'valorCompra' && (
            <div className="space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2 text-blue-950">
                <div className="flex justify-between items-center font-bold">
                  <span>Valor Total de Compras ($):</span>
                  <span className="font-mono text-xl text-blue-900">${cell.valorCompra.toFixed(2)}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-blue-200 font-mono text-[11px] space-y-1.5 text-slate-800">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Pre Orden (Simulada):</span>
                    <strong>{cell.preOrden} unidades</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Nueva OC (Firme):</span>
                    <strong>{cell.nuevaOC} unidades</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Total Unidades Compradas:</span>
                    <strong className="text-blue-800">{(cell.preOrden + cell.nuevaOC)} {material.purchaseUnit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Precio Unitario de Compra:</span>
                    <strong className="text-emerald-700">${material.purchasePrice.toFixed(4)} / {material.purchaseUnit}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold font-sans text-blue-950 text-xs">
                    <span>Fórmula Financiera:</span>
                    <span className="font-mono text-blue-900">
                      {(cell.preOrden + cell.nuevaOC)} × ${material.purchasePrice.toFixed(4)} = ${cell.valorCompra.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info & close button */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
          <span className="text-[11px] text-slate-400 font-sans">
            💡 Consejo: Haz doble clic en cualquier celda calculada de la matriz para inspeccionar sus fórmulas.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs"
          >
            Cerrar Window
          </button>
        </div>
      </div>
    </div>
  );
};
