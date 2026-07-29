export type MaterialCategory = 'Nacional' | 'Regional' | 'Extranjero';
export type MaterialStatus = 'Planificable' | 'No planificable';
export type LaunchType = 'Incorporación Permanente' | 'Lanzamiento Temporal';
export type WOHStatus = 'Quiebre' | 'Bajo' | 'Óptimo' | 'Sobre';

export interface Supplier {
  id: string;
  code: string; // e.g. P1100
  name: string; // e.g. EMPAQUES DE CALIDAD, S.A.
  contactEmail: string;
  phone: string;
  country: string;
}

export interface SupplierMaterialParam {
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  materialId: string;
  leadTimeWeeks: number; // e.g. 1, 2, 3
  deliveryFrequencyDays: number;
  dispatchMultiple: number; // e.g. 1, 10, 100
  moq: number; // Minimum Order Quantity
  unitCost: number; // e.g. 119.758
  origin: MaterialCategory;
  isPrimary: boolean;
}

export interface MaterialSubstitute {
  substituteMaterialId: string;
  substituteCode: string;
  substituteName: string;
  conversionFactor: number; // e.g. 1 box = 12 units
  startDate: string;
  allowCoexistence: boolean;
}

export interface Material {
  id: string;
  code: string; // e.g. 220062
  name: string; // e.g. Bandeja 8X8 Negra C/Tapa División (F200 Und)
  purchaseUnit: string; // e.g. F200 Und, Caja, Bulto
  rfsUnit: string; // e.g. Botella, Pieza
  rfsToPurchaseFactor: number; // e.g. 20 bottles = 1 box
  purchasePrice: number; // e.g. 119.758
  category: MaterialCategory;
  status: MaterialStatus;
  launchType: LaunchType;
  primarySupplierId: string;
  secondarySupplierIds: string[];
  leadTimeWeeks: number;
  dispatchMultiple: number;
  moq: number;
  targetCoverageWeeks: number; // e.g. 2.2
  image?: string;
  datasheetUrl?: string;
  substitutes?: MaterialSubstitute[];
}

export interface WeekColumn {
  weekIndex: number; // 0..23
  weekNumber: number; // e.g. 40, 41, 42...
  dateLabel: string; // e.g. "27-09", "04-10"
  year: number; // 2026
  startDate: string; // "YYYY-MM-DD"
}

export interface PlanningWeekData {
  weekIndex: number;
  weekNumber: number;
  dateLabel: string;
  estimado: number; // Forecast from ERP
  inferido: number; // Manual promotion/event demand
  inferidoNote?: string;
  inferidoModifiedBy?: string;
  inferidoModifiedAt?: string;
  invInicial: number;
  transito: number;
  ingresaCD: number;
  invFinal: number;
  woh: number;
  porCubrir: number;
  ocSugerida: number;
  preOrden: number; // Simulated PO
  nuevaOC: number; // Confirmed PO
  valorCompra: number;
  consumoPromedio: number; // Average total demand of next 4 weeks (t+1 to t+4)
}

export interface LotInventory {
  id: string;
  materialId: string;
  lotNumber: string; // e.g. 1231231
  rfsQuantity: number; // Quantity in original RFS units
  convertedPurchaseQuantity: number; // Converted to purchase units
  purchaseUnit: string;
  expirationDate: string; // "2026-06-14"
  warehouse: string; // "CD Central", "CD Norte"
}

export interface TransitPO {
  id: string;
  poNumber: string; // e.g. OCD 10
  materialId: string;
  supplierId: string;
  orderedQty: number;
  receivedQty: number;
  requiredDate: string; // "01-Feb-2026"
  price: number;
  status: 'TRÁNSITO' | 'BACKORDER' | 'RECIBIDO';
  weekIndexNeeded: number;
}

export interface AccuracyHistoryWeek {
  weekNumber: number;
  inferidos: number;
  consumoReal: number;
  accuracyPercent: number; // (inferidos / consumoReal) * 100
}

export interface InventoryPolicy {
  id: string;
  materialId?: string;
  category?: MaterialCategory;
  targetCoverageWeeks: number; // e.g. 2.2
  quiebreThreshold: number; // e.g. < 1.0
  bajoThreshold: number; // e.g. 1.0 - 1.5
  optimoThresholdMin: number; // e.g. 1.5
  optimoThresholdMax: number; // e.g. 3.0
  sobreThreshold: number; // e.g. > 3.0
  priority: number;
  updatedBy?: string;
  updatedAt?: string;
  changeReason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Jefe de Planificación' | 'Planificador' | 'Comprador' | 'Administrador';
  bolsonId?: string;
  avatar?: string;
}

export interface Bolson {
  id: string;
  name: string; // e.g. "Planificador 1 - EMPAQUES", "Planificador 2 - ALIMENTOS"
  description: string;
  assignedUserId?: string;
  assignedSupplierIds: string[];
  assignedMaterialIds: string[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // OCD-2026-001
  supplierId: string;
  supplierName: string;
  plannerId: string;
  plannerName: string;
  orderDate: string;
  deliveryDate: string;
  destinationWarehouse: string;
  isEmergency: boolean;
  emergencyReason?: string;
  status: 'Borrador' | 'Pendiente Aprobación' | 'Aprobada' | 'Enviada ERP' | 'Rechazada';
  totalAmount: number;
  budgetLimit: number;
  exceedsBudget: boolean;
  items: {
    materialId: string;
    materialCode: string;
    materialName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    weekIndex: number;
  }[];
  attachments?: {
    name: string;
    url: string;
    uploadedAt: string;
    size: string;
  }[];
}

export interface CenterDistribution {
  centerId: string;
  centerName: string; // CD Central, CD Norte, CD Sur
  materialId: string;
  percentage: number; // e.g. 55%
  historical5WeekAvg: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  materialCode?: string;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'excel' | 'doc';
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  category: 'Material Image' | 'Datasheet' | 'PO Attachment' | 'Supplier Cert';
  relatedEntityId?: string;
}
