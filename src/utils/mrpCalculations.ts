import { Material, PlanningWeekData, TransitPO, WOHStatus } from '../types/mrp';

/**
 * Calculates 7-week trimmed mean (dropping highest & lowest value)
 */
export function calculateTrimmedMeanEstimate(past7WeeksHistory: number[]): number {
  if (past7WeeksHistory.length < 7) {
    if (past7WeeksHistory.length === 0) return 0;
    const sum = past7WeeksHistory.reduce((a, b) => a + b, 0);
    return Math.round((sum / past7WeeksHistory.length) * 100) / 100;
  }
  const sorted = [...past7WeeksHistory].sort((a, b) => a - b);
  // Remove lowest (index 0) and highest (index 6)
  const middle5 = sorted.slice(1, 6);
  const sum = middle5.reduce((a, b) => a + b, 0);
  return Math.round((sum / 5) * 100) / 100;
}

/**
 * Computes full 24-week grid data for a material reactively
 */
export function compute24WeekGrid(
  material: Material,
  baseInitialInv: number,
  baseWeekData: Partial<PlanningWeekData>[],
  transits: TransitPO[]
): PlanningWeekData[] {
  const leadTime = material.leadTimeWeeks || 1;
  const coveragePolicy = material.targetCoverageWeeks || 2.2;
  const numWeeks = 24;

  // 1. Initialize arrays
  const grid: PlanningWeekData[] = [];

  // Populate base inputs
  for (let i = 0; i < numWeeks; i++) {
    const raw = baseWeekData[i] || {};
    grid.push({
      weekIndex: i,
      weekNumber: raw.weekNumber || 40 + i,
      dateLabel: raw.dateLabel || `W${i + 1}`,
      estimado: raw.estimado ?? 0,
      inferido: raw.inferido ?? 0,
      inferidoNote: raw.inferidoNote,
      inferidoModifiedBy: raw.inferidoModifiedBy,
      inferidoModifiedAt: raw.inferidoModifiedAt,
      invInicial: 0,
      transito: 0,
      ingresaCD: 0,
      invFinal: 0,
      woh: 0,
      porCubrir: 0,
      ocSugerida: 0,
      preOrden: raw.preOrden ?? 0,
      nuevaOC: raw.nuevaOC ?? 0,
      valorCompra: 0,
      consumoPromedio: 0,
    });
  }

  // 2. Map Transit POs into week transit amounts
  transits.forEach((t) => {
    if (t.materialId === material.id && t.status !== 'RECIBIDO') {
      const idx = t.weekIndexNeeded;
      if (idx >= 0 && idx < numWeeks) {
        // In week 0, include backorders
        grid[idx].transito += Math.max(0, t.orderedQty - t.receivedQty);
      }
    }
  });

  // 3. First pass: Ingresa CD (calculated from Pre-Orden & Nueva OC shifted by Lead Time)
  for (let i = 0; i < numWeeks; i++) {
    const totalOrderedInSim = grid[i].preOrden + grid[i].nuevaOC;
    if (totalOrderedInSim > 0) {
      const arrivalIndex = i + leadTime;
      if (arrivalIndex < numWeeks) {
        grid[arrivalIndex].ingresaCD += totalOrderedInSim;
      }
    }
  }

  // 4. Sequential pass for Inventory Flow
  for (let i = 0; i < numWeeks; i++) {
    // Inv Inicial
    if (i === 0) {
      grid[i].invInicial = baseInitialInv;
    } else {
      grid[i].invInicial = grid[i - 1].invFinal;
    }

    // Inv Final = (Inv Inicial + Transito + Ingresa CD) - (Estimado + Inferido)
    const demand = grid[i].estimado + grid[i].inferido;
    const supply = grid[i].invInicial + grid[i].transito + grid[i].ingresaCD;
    grid[i].invFinal = Math.round((supply - demand) * 100) / 100;
  }

  // 5. Second pass: Calculate WOH & Por Cubrir (based on next 4 weeks demand)
  for (let i = 0; i < numWeeks; i++) {
    // Average 4-week future demand
    let sumFutureDemand = 0;
    let count = 0;
    for (let k = 1; k <= 4; k++) {
      const futureIdx = i + k;
      if (futureIdx < numWeeks) {
        sumFutureDemand += grid[futureIdx].estimado + grid[futureIdx].inferido;
        count++;
      } else {
        // Fallback to current or last known demand
        sumFutureDemand += grid[i].estimado + grid[i].inferido;
        count++;
      }
    }
    const avg4WeekDemand = count > 0 ? sumFutureDemand / count : 1;
    grid[i].consumoPromedio = Math.round(avg4WeekDemand * 100) / 100;

    // WOH
    if (avg4WeekDemand > 0) {
      grid[i].woh = Math.round((grid[i].invFinal / avg4WeekDemand) * 10) / 10;
    } else {
      grid[i].woh = grid[i].invFinal > 0 ? 99 : 0;
    }

    // Optimo & Por Cubrir
    const targetOptimoInv = avg4WeekDemand * coveragePolicy;
    const needed = targetOptimoInv - grid[i].invFinal;
    grid[i].porCubrir = needed > 0 ? Math.ceil(needed) : 0;

    // Valor Compra = Purchase Price * (Pre Orden + Nueva OC)
    grid[i].valorCompra =
      Math.round(material.purchasePrice * (grid[i].preOrden + grid[i].nuevaOC) * 100) / 100;
  }

  // 6. Third pass: OC Sugerida (shifted backwards by Lead Time)
  for (let i = 0; i < numWeeks; i++) {
    if (grid[i].porCubrir > 0) {
      const orderWeekIndex = i - leadTime;
      if (orderWeekIndex >= 0 && orderWeekIndex < numWeeks) {
        grid[orderWeekIndex].ocSugerida = grid[i].porCubrir;
      }
    }
  }

  return grid;
}

/**
 * Returns color category status for WOH according to inventory policies:
 * - Rojo: Abajo de política (< 1.0 sem)
 * - Amarillo: En riesgo de política (1.0 - 1.5 sem)
 * - Verde: Dentro de política (1.5 - 3.0 sem)
 * - Negro: Fuera de política (> 3.0 sem)
 */
export function getWOHStatus(woh: number, targetCoverageWeeks: number = 2.2): {
  status: WOHStatus;
  label: string;
  bgColor: string;
  textColor: string;
} {
  if (woh < 1.0) {
    return {
      status: 'Quiebre',
      label: 'Abajo de política',
      bgColor: 'bg-red-600 text-white font-extrabold',
      textColor: 'text-red-700',
    };
  }
  if (woh < 1.5) {
    return {
      status: 'Bajo',
      label: 'En riesgo de política',
      bgColor: 'bg-yellow-400 text-slate-950 font-extrabold',
      textColor: 'text-amber-800',
    };
  }
  if (woh <= 3.0) {
    return {
      status: 'Óptimo',
      label: 'Dentro de política',
      bgColor: 'bg-emerald-600 text-white font-extrabold',
      textColor: 'text-emerald-700',
    };
  }
  return {
    status: 'Sobre',
    label: 'Fuera de política',
    bgColor: 'bg-slate-950 text-white font-extrabold border border-slate-800',
    textColor: 'text-slate-950',
  };
}
