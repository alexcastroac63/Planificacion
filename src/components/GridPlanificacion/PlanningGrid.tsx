import React, { useState, useMemo } from 'react';
import {
  AccuracyHistoryWeek,
  LotInventory,
  Material,
  PlanningWeekData,
  Supplier,
  TransitPO,
  User,
  WeekColumn,
} from '../../types/mrp';
import { compute24WeekGrid, getWOHStatus } from '../../utils/mrpCalculations';
import { LotExistenciaPanel } from './LotExistenciaPanel';
import { TransitosPanel } from './TransitosPanel';
import { HistoricoExactitudPanel } from './HistoricoExactitudPanel';
import { InferidosModal } from './InferidosModal';
import { CalculationBreakdownModal, CalculatedRowType } from './CalculationBreakdownModal';
import {
  Grid,
  Filter,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Search,
  ChevronRight,
  ShieldAlert,
  Info,
  Check,
  Calculator,
  Eye,
  Sparkles,
  X,
  HelpCircle,
  MousePointerClick,
} from 'lucide-react';

interface PlanningGridProps {
  suppliers: Supplier[];
  materials: Material[];
  weeks: WeekColumn[];
  gridInputs: Record<string, { estimado: number; inferido: number; preOrden: number; nuevaOC: number }[]>;
  lots: LotInventory[];
  transits: TransitPO[];
  accuracyHistory: AccuracyHistoryWeek[];
  currentUser: User;
  onUpdateGridInputs: (
    materialId: string,
    weekIndex: number,
    field: 'inferido' | 'preOrden' | 'nuevaOC',
    val: number,
    note?: string
  ) => void;
  onGenerateMassPO?: () => void;
}

export const PlanningGrid: React.FC<PlanningGridProps> = ({
  suppliers,
  materials,
  weeks,
  gridInputs,
  lots,
  transits,
  accuracyHistory,
  currentUser,
  onUpdateGridInputs,
  onGenerateMassPO,
}) => {
  // Selected Supplier & Material state
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('sup-1100');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('mat-220062');
  const [moqWarning, setMoqWarning] = useState<string | null>(null);

  // Inferidos Modal State
  const [editingInferidoWeekIndex, setEditingInferidoWeekIndex] = useState<number | null>(null);

  // Calculation Breakdown Modal State
  const [selectedCalcCell, setSelectedCalcCell] = useState<{
    weekIndex: number;
    rowType: CalculatedRowType;
  } | null>(null);

  // Context Menu State (Right-click "Ver Referencia")
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    weekIndex: number;
    rowType: CalculatedRowType;
    rowLabel: string;
  } | null>(null);

  // Active Reference Highlight State
  const [activeReferenceHighlight, setActiveReferenceHighlight] = useState<{
    targetCell: { rowType: CalculatedRowType; weekIndex: number; weekLabel: string; rowLabel: string };
    description: string;
    sourceKeys: Set<string>;
  } | null>(null);

  // Compute reference source keys for cell right-click
  const computeReferenceKeys = (
    rowType: CalculatedRowType,
    weekIndex: number,
    material: Material,
    weeksList: WeekColumn[]
  ): { description: string; sourceKeys: Set<string> } => {
    const sourceKeys = new Set<string>();
    let description = '';
    const targetWeekLabel = weeksList[weekIndex]
      ? `Sem. ${weeksList[weekIndex].dateLabel}`
      : `Semana ${weekIndex + 1}`;

    switch (rowType) {
      case 'consumoPromedio': {
        const futureWeeksLabels: string[] = [];
        for (let k = weekIndex + 1; k <= weekIndex + 4; k++) {
          if (k < 24) {
            sourceKeys.add(`estimado-${k}`);
            sourceKeys.add(`inferido-${k}`);
            if (weeksList[k]) futureWeeksLabels.push(`Sem. ${weeksList[k].dateLabel}`);
          }
        }
        description = `El Consumo Promedio proviene de la suma de Estimados e Inferidos de las 4 semanas futuras (${futureWeeksLabels.join(', ')}).`;
        break;
      }
      case 'estimado': {
        sourceKeys.add(`estimado-${weekIndex}`);
        description = `Dato base ERP para ${targetWeekLabel}. Alimenta el Consumo Promedio de semanas anteriores e Inventario Final.`;
        break;
      }
      case 'inferido': {
        sourceKeys.add(`inferido-${weekIndex}`);
        description = `Ajuste manual de promociones/eventos en ${targetWeekLabel}. Alimenta Consumo Promedio e Inventario Final.`;
        break;
      }
      case 'invInicial': {
        if (weekIndex === 0) {
          sourceKeys.add(`invInicial-0`);
          description = `Stock inicial físico en bodega para la primera semana (${targetWeekLabel}).`;
        } else {
          sourceKeys.add(`invFinal-${weekIndex - 1}`);
          description = `Proviene del Inventario Final de la semana anterior (Sem. ${weeksList[weekIndex - 1]?.dateLabel}).`;
        }
        break;
      }
      case 'transito': {
        sourceKeys.add(`transito-${weekIndex}`);
        description = `Órdenes de compra ya confirmadas en tránsito programadas para arribar en ${targetWeekLabel}.`;
        break;
      }
      case 'ingresaCD': {
        const lt = material.leadTimeWeeks;
        const originWeek = weekIndex - lt;
        if (originWeek >= 0) {
          sourceKeys.add(`preOrden-${originWeek}`);
          sourceKeys.add(`nuevaOC-${originWeek}`);
          description = `Ingreso al CD derivado de Pre Ordenes y Nuevas OC emitidas hace ${lt} semanas (Sem. ${weeksList[originWeek]?.dateLabel}).`;
        } else {
          sourceKeys.add(`transito-${weekIndex}`);
          description = `Proviene de los tránsitos confirmados que arriban en ${targetWeekLabel}.`;
        }
        break;
      }
      case 'invFinal': {
        sourceKeys.add(`invInicial-${weekIndex}`);
        sourceKeys.add(`transito-${weekIndex}`);
        sourceKeys.add(`ingresaCD-${weekIndex}`);
        sourceKeys.add(`estimado-${weekIndex}`);
        sourceKeys.add(`inferido-${weekIndex}`);
        description = `Fórmula: Inv. Inicial + Tránsitos + Ingresa CD - (Estimado + Inferido).`;
        break;
      }
      case 'woh': {
        sourceKeys.add(`invFinal-${weekIndex}`);
        sourceKeys.add(`consumoPromedio-${weekIndex}`);
        for (let k = weekIndex + 1; k <= weekIndex + 4; k++) {
          if (k < 24) {
            sourceKeys.add(`estimado-${k}`);
            sourceKeys.add(`inferido-${k}`);
          }
        }
        description = `Semanas de cobertura (WOH): Inv. Final (${targetWeekLabel}) ÷ Consumo Promedio proyectado.`;
        break;
      }
      case 'porCubrir': {
        sourceKeys.add(`invFinal-${weekIndex}`);
        sourceKeys.add(`consumoPromedio-${weekIndex}`);
        description = `Insumos requeridos para cumplir la política de seguridad (${material.leadTimeWeeks} sem. Lead Time).`;
        break;
      }
      case 'ocSugerida': {
        sourceKeys.add(`porCubrir-${weekIndex}`);
        description = `Ajuste del 'Por Cubrir' según el Mínimo de Compra (MOQ: ${material.moq} ${material.purchaseUnit}).`;
        break;
      }
      case 'preOrden':
      case 'nuevaOC': {
        const lt = material.leadTimeWeeks;
        const arrivalWeek = weekIndex + lt;
        if (arrivalWeek < 24) {
          sourceKeys.add(`ingresaCD-${arrivalWeek}`);
          sourceKeys.add(`invFinal-${arrivalWeek}`);
          description = `Esta orden emitida en ${targetWeekLabel} arribará al CD en la semana (Sem. ${weeksList[arrivalWeek]?.dateLabel}) (${lt} sem. lead time).`;
        } else {
          sourceKeys.add(`${rowType}-${weekIndex}`);
          description = `Orden emitida en ${targetWeekLabel} que arribará después de la semana 24.`;
        }
        break;
      }
      case 'valorCompra': {
        sourceKeys.add(`preOrden-${weekIndex}`);
        sourceKeys.add(`nuevaOC-${weekIndex}`);
        description = `Valor monetario: (Pre Orden + Nueva OC) × Precio Unitario ($${material.purchasePrice.toFixed(4)} USD).`;
        break;
      }
    }

    return { description, sourceKeys };
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    rowType: CalculatedRowType,
    weekIndex: number,
    rowLabel: string
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      weekIndex,
      rowType,
      rowLabel,
    });
  };

  const getCellHighlightProps = (rowType: CalculatedRowType, weekIdx: number) => {
    if (!activeReferenceHighlight) return { className: '', style: {} };

    const cellKey = `${rowType}-${weekIdx}`;
    const isTarget =
      activeReferenceHighlight.targetCell.rowType === rowType &&
      activeReferenceHighlight.targetCell.weekIndex === weekIdx;
    const isSource = activeReferenceHighlight.sourceKeys.has(cellKey);

    if (isTarget) {
      return {
        className: 'ring-4 ring-indigo-600 ring-offset-2 z-20 font-extrabold relative shadow-lg bg-indigo-100 text-indigo-950',
        style: { backgroundColor: '#e0e7ff', color: '#1e1b4b' },
      };
    }
    if (isSource) {
      return {
        className: 'ring-2 ring-amber-500 z-10 font-black relative shadow-md animate-pulse',
        style: { backgroundColor: '#fde047', color: '#451a03', fontWeight: 900 },
      };
    }
    return { className: '', style: {} };
  };

  // Get current active supplier
  const currentSupplier = useMemo(
    () => suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0],
    [suppliers, selectedSupplierId]
  );

  // Materials belonging to selected supplier (primary or secondary)
  const availableMaterials = useMemo(() => {
    return materials.filter(
      (m) =>
        m.primarySupplierId === selectedSupplierId ||
        m.secondarySupplierIds.includes(selectedSupplierId)
    );
  }, [materials, selectedSupplierId]);

  // Current active material
  const currentMaterial = useMemo(() => {
    return (
      availableMaterials.find((m) => m.id === selectedMaterialId) ||
      availableMaterials[0] ||
      materials[0]
    );
  }, [availableMaterials, selectedMaterialId, materials]);

  // Computed 24-week grid data
  const gridCalculated = useMemo(() => {
    const rawInputs = gridInputs[currentMaterial.id] || [];
    return compute24WeekGrid(currentMaterial, 120, rawInputs, transits);
  }, [currentMaterial, gridInputs, transits]);

  // Handle cell edit for Pre Orden / Nueva OC
  const handleCellEdit = (
    weekIdx: number,
    field: 'preOrden' | 'nuevaOC',
    valueStr: string
  ) => {
    const val = Math.max(0, Number(valueStr) || 0);

    // Validate MOQ for Nueva OC
    if (field === 'nuevaOC' && val > 0 && val < currentMaterial.moq) {
      setMoqWarning(
        `Alerta HU-13: La cantidad ingresada (${val}) no cumple con el mínimo de compra para este material (MOQ: ${currentMaterial.moq} ${currentMaterial.purchaseUnit}).`
      );
    } else if (field === 'nuevaOC') {
      setMoqWarning(null);
    }

    onUpdateGridInputs(currentMaterial.id, weekIdx, field, val);
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto p-4 text-slate-800 font-sans">
      {/* TOP CONTROLS & SUPPLIER HEADER (HU-01, HU-02) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Row 1: Supplier Selector & Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Proveedor:
            </span>
            <select
              value={selectedSupplierId}
              onChange={(e) => {
                setSelectedSupplierId(e.target.value);
                const firstMat = materials.find(
                  (m) =>
                    m.primarySupplierId === e.target.value ||
                    m.secondarySupplierIds.includes(e.target.value)
                );
                if (firstMat) setSelectedMaterialId(firstMat.id);
              }}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>

            <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              Código: {currentSupplier.code}
            </span>
          </div>

          {/* Action Toolbar buttons */}
          <div className="flex items-center space-x-2">
            <button className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 transition">
              Análisis
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 transition">
              Contenedor
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 transition">
              Cálculos
            </button>
            <button
              onClick={onGenerateMassPO}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Generar OCD Masiva (HU-25)</span>
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Material Header Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded shadow-xs">
              {currentMaterial.code}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm font-sans">{currentMaterial.name}</div>
              <div className="text-[11px] text-slate-500 font-sans">
                Unidad Compra: <span className="text-blue-700 font-bold">{currentMaterial.purchaseUnit}</span> | Categoría: <span className="text-slate-800">{currentMaterial.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 border-l border-slate-200 pl-4 text-slate-700">
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Precio Compra</span>
              <span className="font-bold text-emerald-700 text-sm">
                ${currentMaterial.purchasePrice.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Lead Time</span>
              <span className="font-bold text-amber-700">
                {currentMaterial.leadTimeWeeks} sem.
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Múltiplo</span>
              <span className="font-bold text-slate-800">
                {currentMaterial.dispatchMultiple}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Mín. Compra (MOQ)</span>
              <span className="font-bold text-sky-700">
                {currentMaterial.moq} {currentMaterial.purchaseUnit}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MOQ Warning Alert Banner */}
      {moqWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{moqWarning}</span>
          </div>
          <button
            onClick={() => setMoqWarning(null)}
            className="text-amber-700 hover:text-amber-900 font-bold text-xs"
          >
            Entendido
          </button>
        </div>
      )}

      {/* WOH Policy Legend Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center space-x-2 font-bold text-slate-800">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Semaforización WOH según Políticas de Inventario:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <span className="bg-red-600 text-white px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>Rojo: Abajo de política (&lt; 1.0 sem)</span>
          </span>
          <span className="bg-yellow-400 text-slate-950 px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-slate-950"></span>
            <span>Amarillo: En riesgo de política (1.0 - 1.5 sem)</span>
          </span>
          <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>Verde: Dentro de política (1.5 - 3.0 sem)</span>
          </span>
          <span className="bg-slate-950 text-white px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>Negro: Fuera de política (&gt; 3.0 sem)</span>
          </span>
        </div>
      </div>

      {/* ACTIVE REFERENCE HIGHLIGHT OBSERVATION BANNER */}
      {activeReferenceHighlight && (
        <div className="bg-amber-100 border-2 border-amber-400 text-amber-950 p-3.5 rounded-2xl text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-start md:items-center space-x-3">
            <div className="p-2 bg-amber-200 rounded-xl text-amber-950 font-bold shrink-0">
              <Sparkles className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-amber-950 flex flex-wrap items-center gap-2">
                <span>Observación de origen / Referencia de cálculo para:</span>
                <span className="bg-amber-300 px-2.5 py-0.5 rounded-md text-amber-950 border border-amber-500 font-mono text-xs font-black shadow-xs">
                  {activeReferenceHighlight.targetCell.rowLabel} ({activeReferenceHighlight.targetCell.weekLabel})
                </span>
              </div>
              <p className="text-amber-900 font-medium text-xs mt-1 leading-relaxed">
                {activeReferenceHighlight.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2.5 py-1 rounded-lg border border-amber-300">
              🟨 {activeReferenceHighlight.sourceKeys.size} celdas origen marcadas en amarillo
            </span>
            <button
              onClick={() => setActiveReferenceHighlight(null)}
              className="bg-amber-900 hover:bg-amber-950 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar resaltado</span>
            </button>
          </div>
        </div>
      )}

      {/* CENTRAL 24-WEEK GRID TABLE (HU-02 - HU-14) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Header Row 1: Dates (DD-MM) */}
              <tr className="bg-slate-100 text-slate-700 font-mono text-center border-b border-slate-200">
                <th className="sticky left-0 bg-slate-100 z-20 py-2 px-3 text-left font-sans font-bold text-slate-700 min-w-[150px] border-r border-slate-200 shadow-xs">
                  Fecha (Inicio Lunes)
                </th>
                {weeks.map((w) => (
                  <th
                    key={w.weekIndex}
                    className="py-1.5 px-2 min-w-[70px] max-w-[80px] border-r border-slate-200 font-bold text-[11px] bg-slate-100 text-slate-700"
                  >
                    {w.dateLabel}
                  </th>
                ))}
              </tr>

              {/* Header Row 2: Week Numbers (#) */}
              <tr className="bg-slate-200 text-slate-900 text-center border-b border-slate-300">
                <th className="sticky left-0 bg-slate-200 z-20 py-1.5 px-3 text-left font-sans font-extrabold uppercase tracking-wider text-blue-700 min-w-[150px] border-r border-slate-300 shadow-xs">
                  Semana #
                </th>
                {weeks.map((w) => (
                  <th
                    key={w.weekIndex}
                    className="py-1 px-2 min-w-[70px] max-w-[80px] border-r border-slate-300 font-extrabold text-xs bg-slate-200 text-slate-900"
                  >
                    {w.weekNumber}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-mono">
              {/* Row 1: Estimado */}
              <tr className="hover:bg-slate-50 transition">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-semibold text-slate-700 border-r border-slate-200 shadow-xs">
                  Estimados (ERP)
                </td>
                {gridCalculated.map((cell) => {
                  const hl = getCellHighlightProps('estimado', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'estimado', cell.weekIndex, 'Estimados (ERP)')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'estimado' })}
                      title="Clic derecho: Ver referencia | Doble clic: Desglose matemático"
                      style={hl.style}
                      className={`py-1 px-2 text-center border-r border-slate-200 text-slate-700 bg-slate-50/50 cursor-pointer hover:bg-blue-50/80 transition ${hl.className}`}
                    >
                      {cell.estimado.toFixed(2)}
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Inferidos (HU-04 - Cyan blue when populated) */}
              <tr className="hover:bg-slate-50 transition">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-bold text-sky-800 border-r border-slate-200 shadow-xs flex items-center justify-between">
                  <span>Inferidos</span>
                  <span className="text-[10px] text-slate-400 font-sans font-normal">(Doble clic ver)</span>
                </td>
                {gridCalculated.map((cell) => {
                  const hasInferido = cell.inferido > 0;
                  const hl = getCellHighlightProps('inferido', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onClick={() => setEditingInferidoWeekIndex(cell.weekIndex)}
                      onContextMenu={(e) => handleContextMenu(e, 'inferido', cell.weekIndex, 'Inferidos')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'inferido' })}
                      style={hl.style}
                      className={`py-1 px-2 text-center border-r border-slate-200 cursor-pointer font-bold transition hover:opacity-80 ${
                        hasInferido
                          ? 'bg-cyan-100 text-cyan-950 font-extrabold border border-cyan-300 shadow-xs'
                          : 'text-slate-500 bg-white'
                      } ${hl.className}`}
                      title={cell.inferidoNote || 'Clic derecho: Ver referencia | Doble clic: Desglose | Clic: Editar'}
                    >
                      {cell.inferido.toFixed(2)}
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Consumo Promedio (Promedio de consumo de las 4 semanas futuras) */}
              <tr className="hover:bg-indigo-50/50 transition border-b-2 border-indigo-200">
                <td className="sticky left-0 bg-indigo-50/90 z-10 py-2 px-3 font-bold text-indigo-950 border-r border-slate-200 shadow-xs flex items-center justify-between">
                  <span>Consumo promedio</span>
                  <span className="text-[10px] text-indigo-700/80 font-sans font-normal">(Prom. 4 sem fut)</span>
                </td>
                {gridCalculated.map((cell) => {
                  const hl = getCellHighlightProps('consumoPromedio', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'consumoPromedio', cell.weekIndex, 'Consumo promedio')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'consumoPromedio' })}
                      title="Consumo Promedio = Promedio de las 4 semanas futuras. Clic derecho para ver referencias en amarillo"
                      style={hl.style}
                      className={`py-1 px-2 text-center border-r border-slate-200 font-bold text-indigo-950 bg-indigo-50/40 cursor-pointer hover:bg-indigo-100 transition ${hl.className}`}
                    >
                      {cell.consumoPromedio.toFixed(2)}
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: Inv. Inicial (HU-05) */}
              <tr className="hover:bg-slate-50 transition">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-semibold text-slate-700 border-r border-slate-200 shadow-xs">
                  Inv. Inicial
                </td>
                {gridCalculated.map((cell) => {
                  const hl = getCellHighlightProps('invInicial', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'invInicial', cell.weekIndex, 'Inv. Inicial')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'invInicial' })}
                      title="Clic derecho: Ver referencia | Doble clic: Desglose matemático"
                      style={hl.style}
                      className={`py-1 px-2 text-center border-r border-slate-200 text-slate-800 font-semibold cursor-pointer hover:bg-blue-50/80 transition ${hl.className}`}
                    >
                      {cell.invInicial.toFixed(2)}
                    </td>
                  );
                })}
              </tr>

              {/* Row 5: Transitos (HU-06) */}
              <tr className="hover:bg-slate-50 transition">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-semibold text-slate-700 border-r border-slate-200 shadow-xs">
                  Tránsitos
                </td>
                {gridCalculated.map((cell) => {
                  const hl = getCellHighlightProps('transito', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'transito', cell.weekIndex, 'Tránsitos')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'transito' })}
                      title="Clic derecho: Ver referencia | Doble clic: Desglose matemático"
                      style={hl.style}
                      className={`py-1 px-2 text-center border-r border-slate-200 text-slate-700 cursor-pointer hover:bg-blue-50/80 transition ${hl.className}`}
                    >
                      {cell.transito.toFixed(2)}
                    </td>
                  );
                })}
              </tr>

              {/* Row 6: Ingresa a CD (HU-07 - Cell background Sky Blue) */}
              <tr className="hover:bg-slate-50 transition">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-bold text-sky-800 border-r border-slate-200 shadow-xs">
                  Ingresa a CD
                </td>
                {gridCalculated.map((cell) => {
                  const hasIngresa = cell.ingresaCD > 0;
                  const hl = getCellHighlightProps('ingresaCD', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'ingresaCD', cell.weekIndex, 'Ingresa a CD')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'ingresaCD' })}
                      title="Clic derecho: Ver referencia | Doble clic: Desglose matemático"
                      style={hl.style}
                      className={`py-1 px-2 text-center border-r border-slate-200 font-bold cursor-pointer hover:ring-2 hover:ring-sky-400 transition ${
                        hasIngresa
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-400 bg-sky-50/20'
                      } ${hl.className}`}
                    >
                      {cell.ingresaCD.toFixed(2)}
                    </td>
                  );
                })}
              </tr>

              {/* Row 7: Inv. Final (HU-08) */}
              <tr className="hover:bg-slate-50 transition">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-bold text-slate-900 border-r border-slate-200 shadow-xs">
                  Inv. Final
                </td>
                {gridCalculated.map((cell) => {
                  const isNegative = cell.invFinal < 0;
                  const hl = getCellHighlightProps('invFinal', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'invFinal', cell.weekIndex, 'Inv. Final')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'invFinal' })}
                      title="Clic derecho: Ver referencia | Doble clic: Desglose matemático"
                      style={hl.style}
                      className={`py-1 px-2 text-center border-r border-slate-200 font-bold cursor-pointer hover:ring-2 hover:ring-slate-400 transition ${
                        isNegative
                          ? 'bg-red-100 text-red-900 font-extrabold border border-red-300'
                          : 'text-slate-900'
                      } ${hl.className}`}
                    >
                      {cell.invFinal.toFixed(2)}
                    </td>
                  );
                })}
              </tr>

              {/* Row 8: WOH (HU-09 - Color Coded by Stock Policy) */}
              <tr className="hover:bg-slate-50 transition border-t-2 border-slate-300">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-extrabold text-slate-900 border-r border-slate-200 shadow-xs">
                  WOH (Semanas)
                </td>
                {gridCalculated.map((cell) => {
                  const wohStyle = getWOHStatus(cell.woh, currentMaterial.targetCoverageWeeks);
                  const hl = getCellHighlightProps('woh', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'woh', cell.weekIndex, 'WOH (Semanas)')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'woh' })}
                      style={hl.style}
                      className={`py-1.5 px-2 text-center border-r border-slate-200 font-extrabold cursor-pointer hover:ring-2 hover:ring-slate-500 transition ${wohStyle.bgColor} ${hl.className}`}
                      title={`Clic derecho: Ver referencia. ${wohStyle.label}: ${cell.woh.toFixed(1)} sem (${wohStyle.status})`}
                    >
                      {cell.woh.toFixed(1)}
                    </td>
                  );
                })}
              </tr>

              {/* Row 9: Por Cubrir (HU-10 - Orange when > 0) */}
              <tr className="hover:bg-slate-50 transition">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-bold text-amber-700 border-r border-slate-200 shadow-xs">
                  Por Cubrir
                </td>
                {gridCalculated.map((cell) => {
                  const hasNeeded = cell.porCubrir > 0;
                  const hl = getCellHighlightProps('porCubrir', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'porCubrir', cell.weekIndex, 'Por Cubrir')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'porCubrir' })}
                      title="Clic derecho: Ver referencia | Doble clic: Desglose matemático"
                      style={hl.style}
                      className={`py-1 px-2 text-center border-r border-slate-200 font-bold cursor-pointer hover:ring-2 hover:ring-amber-400 transition ${
                        hasNeeded
                          ? 'bg-amber-100 text-amber-950 font-extrabold border border-amber-300'
                          : 'text-slate-400'
                      } ${hl.className}`}
                    >
                      {cell.porCubrir > 0 ? cell.porCubrir : ''}
                    </td>
                  );
                })}
              </tr>

              {/* Row 10: OC Sugerida (HU-11 - Orange when > 0 shifted by Lead Time) */}
              <tr className="hover:bg-slate-50 transition">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-bold text-amber-800 border-r border-slate-200 shadow-xs">
                  OC Sugerida
                </td>
                {gridCalculated.map((cell) => {
                  const hasSugerida = cell.ocSugerida > 0;
                  const hl = getCellHighlightProps('ocSugerida', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'ocSugerida', cell.weekIndex, 'OC Sugerida')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'ocSugerida' })}
                      title="Clic derecho: Ver referencia | Doble clic: Desglose matemático"
                      style={hl.style}
                      className={`py-1 px-2 text-center border-r border-slate-200 font-bold cursor-pointer hover:ring-2 hover:ring-amber-400 transition ${
                        hasSugerida
                          ? 'bg-amber-100 text-amber-950 font-extrabold border border-amber-300'
                          : 'text-slate-400'
                      } ${hl.className}`}
                    >
                      {cell.ocSugerida > 0 ? cell.ocSugerida : ''}
                    </td>
                  );
                })}
              </tr>

              {/* Row 11: Pre Orden (HU-12 - Editable Green) */}
              <tr className="hover:bg-slate-50 transition">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-bold text-emerald-700 border-r border-slate-200 shadow-xs">
                  Pre Orden (Sim.)
                </td>
                {gridCalculated.map((cell) => {
                  const hasPreOrder = cell.preOrden > 0;
                  const hl = getCellHighlightProps('preOrden', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'preOrden', cell.weekIndex, 'Pre Orden (Sim.)')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'preOrden' })}
                      title="Clic derecho: Ver referencia | Doble clic: Desglose matemático"
                      style={hl.style}
                      className={`p-0 text-center border-r border-slate-200 font-bold cursor-pointer hover:ring-2 hover:ring-emerald-400 ${
                        hasPreOrder ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : ''
                      } ${hl.className}`}
                    >
                      <input
                        type="number"
                        min="0"
                        value={cell.preOrden || ''}
                        onChange={(e) =>
                          handleCellEdit(cell.weekIndex, 'preOrden', e.target.value)
                        }
                        placeholder="0"
                        className={`w-full text-center py-1 bg-transparent border-none font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                          hasPreOrder ? 'text-emerald-950' : 'text-slate-700'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>

              {/* Row 12: Nueva OC (HU-13 - Editable Green) */}
              <tr className="hover:bg-slate-50 transition">
                <td className="sticky left-0 bg-white z-10 py-2 px-3 font-bold text-emerald-800 border-r border-slate-200 shadow-xs">
                  Nueva OC (Real)
                </td>
                {gridCalculated.map((cell) => {
                  const hasOC = cell.nuevaOC > 0;
                  const hl = getCellHighlightProps('nuevaOC', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'nuevaOC', cell.weekIndex, 'Nueva OC (Real)')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'nuevaOC' })}
                      title="Clic derecho: Ver referencia | Doble clic: Desglose matemático"
                      style={hl.style}
                      className={`p-0 text-center border-r border-slate-200 font-bold cursor-pointer hover:ring-2 hover:ring-emerald-400 ${
                        hasOC ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : ''
                      } ${hl.className}`}
                    >
                      <input
                        type="number"
                        min="0"
                        value={cell.nuevaOC || ''}
                        onChange={(e) =>
                          handleCellEdit(cell.weekIndex, 'nuevaOC', e.target.value)
                        }
                        placeholder="0"
                        className={`w-full text-center py-1 bg-transparent border-none font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                          hasOC ? 'text-emerald-950' : 'text-slate-700'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>

              {/* Row 13: Valor Compra (HU-14) */}
              <tr className="hover:bg-slate-50 transition bg-slate-50">
                <td className="sticky left-0 bg-slate-50 z-10 py-2 px-3 font-extrabold text-blue-800 border-r border-slate-200 shadow-xs">
                  Valor Compra ($)
                </td>
                {gridCalculated.map((cell) => {
                  const hl = getCellHighlightProps('valorCompra', cell.weekIndex);
                  return (
                    <td
                      key={cell.weekIndex}
                      onContextMenu={(e) => handleContextMenu(e, 'valorCompra', cell.weekIndex, 'Valor Compra ($)')}
                      onDoubleClick={() => setSelectedCalcCell({ weekIndex: cell.weekIndex, rowType: 'valorCompra' })}
                      title="Clic derecho: Ver referencia | Doble clic: Desglose matemático"
                      style={hl.style}
                      className={`py-2 px-1 text-center border-r border-slate-200 font-bold text-[10px] text-blue-800 cursor-pointer hover:bg-blue-100/70 transition ${hl.className}`}
                    >
                      {cell.valorCompra > 0 ? `$${cell.valorCompra.toFixed(2)}` : '0.00'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* THREE BOTTOM PANELS matching PDF Screenshot & HU-19, HU-20 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Panel 1: Materials list for current supplier (Left - 3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 text-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Materiales del Proveedor</span>
            <span className="text-blue-600 font-mono font-bold">{availableMaterials.length}</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {availableMaterials.map((mat) => {
              const isSelected = mat.id === currentMaterial.id;
              return (
                <button
                  key={mat.id}
                  onClick={() => setSelectedMaterialId(mat.id)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-mono text-blue-700 font-bold">{mat.code}</div>
                  <div className="truncate font-semibold mt-0.5">{mat.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                    <span>${mat.purchasePrice.toFixed(2)}</span>
                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                      LT: {mat.leadTimeWeeks} sem
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Existencia por Lote (Center Left - 3 cols) */}
        <div className="lg:col-span-3">
          <LotExistenciaPanel material={currentMaterial} lots={lots} />
        </div>

        {/* Panel 3: Tránsitos Semanales (Center Right - 3 cols) */}
        <div className="lg:col-span-3">
          <TransitosPanel material={currentMaterial} transits={transits} />
        </div>

        {/* Panel 4: Histórico de Exactitud (Right - 3 cols) */}
        <div className="lg:col-span-3">
          <HistoricoExactitudPanel accuracyHistory={accuracyHistory} />
        </div>
      </div>

      {/* MODAL FOR INFERIDOS AUDIT (HU-04) */}
      {editingInferidoWeekIndex !== null && (
        <InferidosModal
          material={currentMaterial}
          weekColumn={weeks[editingInferidoWeekIndex]}
          currentInferido={
            gridInputs[currentMaterial.id]?.[editingInferidoWeekIndex]?.inferido || 0
          }
          onSave={(val, note) => {
            onUpdateGridInputs(
              currentMaterial.id,
              editingInferidoWeekIndex,
              'inferido',
              val,
              note
            );
            setEditingInferidoWeekIndex(null);
          }}
          onClose={() => setEditingInferidoWeekIndex(null)}
        />
      )}

      {/* FLOATING MODAL FOR CELL CALCULATION BREAKDOWN */}
      {selectedCalcCell !== null && (
        <CalculationBreakdownModal
          material={currentMaterial}
          weekIndex={selectedCalcCell.weekIndex}
          weekColumn={weeks[selectedCalcCell.weekIndex]}
          rowType={selectedCalcCell.rowType}
          gridCalculated={gridCalculated}
          transits={transits}
          onClose={() => setSelectedCalcCell(null)}
        />
      )}

      {/* CONTEXT MENU BACKDROP */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setContextMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu(null);
          }}
        />
      )}

      {/* RIGHT-CLICK CONTEXT MENU (VER REFERENCIA) */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-slate-300 rounded-2xl shadow-2xl p-2.5 w-64 text-xs font-sans space-y-2 animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 180),
            left: Math.min(contextMenu.x, window.innerWidth - 270),
          }}
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 font-bold text-slate-900 flex justify-between items-center bg-slate-50 rounded-xl">
            <span className="text-sm font-extrabold text-blue-900">{contextMenu.rowLabel}</span>
            <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-mono font-bold">
              Sem. {weeks[contextMenu.weekIndex]?.dateLabel}
            </span>
          </div>

          <button
            onClick={() => {
              const { description, sourceKeys } = computeReferenceKeys(
                contextMenu.rowType,
                contextMenu.weekIndex,
                currentMaterial,
                weeks
              );
              setActiveReferenceHighlight({
                targetCell: {
                  rowType: contextMenu.rowType,
                  weekIndex: contextMenu.weekIndex,
                  weekLabel: `Sem. ${weeks[contextMenu.weekIndex]?.dateLabel || contextMenu.weekIndex + 1}`,
                  rowLabel: contextMenu.rowLabel,
                },
                description,
                sourceKeys,
              });
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl font-extrabold flex items-center space-x-2 border border-amber-300 transition shadow-xs cursor-pointer"
          >
            <Eye className="w-4 h-4 text-amber-800 shrink-0" />
            <span>👁️ Ver referencia de cálculo</span>
          </button>

          <button
            onClick={() => {
              setSelectedCalcCell({
                weekIndex: contextMenu.weekIndex,
                rowType: contextMenu.rowType,
              });
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-800 rounded-xl font-semibold flex items-center space-x-2 transition cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-slate-600 shrink-0" />
            <span>🧮 Ver desglose matemático</span>
          </button>
        </div>
      )}
    </div>
  );
};
