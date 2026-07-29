import {
  AccuracyHistoryWeek,
  Bolson,
  FileAttachment,
  InventoryPolicy,
  LotInventory,
  Material,
  PurchaseOrder,
  Supplier,
  SupplierMaterialParam,
  TransitPO,
  User,
  WeekColumn,
} from '../types/mrp';

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1100',
    code: 'P1100',
    name: 'EMPAQUES DE CALIDAD, S.A.',
    contactEmail: 'ventas@empaquesdecalidad.com',
    phone: '+503 2222-1100',
    country: 'El Salvador',
  },
  {
    id: 'sup-2200',
    code: 'P2200',
    name: 'PLÁSTICOS DIVERSOS S.A. DE C.V.',
    contactEmail: 'pedidos@plasticosdiversos.com',
    phone: '+503 2300-3800',
    country: 'Guatemala',
  },
  {
    id: 'sup-3300',
    code: 'P3300',
    name: 'ALIMENTOS REFRIGERADOS S.A. DE C.V.',
    contactEmail: 'logistica@alimentosrefrigerados.com',
    phone: '+503 2555-9000',
    country: 'Honduras',
  },
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-220062',
    code: '220062',
    name: 'Bandeja 8X8 Negra C/Tapa División (F200 Und)',
    purchaseUnit: 'F200 Und',
    rfsUnit: 'Und',
    rfsToPurchaseFactor: 200,
    purchasePrice: 119.7589,
    category: 'Nacional',
    status: 'Planificable',
    launchType: 'Incorporación Permanente',
    primarySupplierId: 'sup-1100',
    secondarySupplierIds: ['sup-2200'],
    leadTimeWeeks: 1,
    dispatchMultiple: 1,
    moq: 10,
    targetCoverageWeeks: 2.2,
    image: 'https://images.unsplash.com/photo-1615865417236-d67f57ec18b8?w=400&q=80',
    substitutes: [
      {
        substituteMaterialId: 'mat-390007',
        substituteCode: '390007',
        substituteName: 'Bandeja Negra C/Tapa (P200) 9.25*6.5',
        conversionFactor: 1.0,
        startDate: '2026-08-01',
        allowCoexistence: true,
      },
    ],
  },
  {
    id: 'mat-390007',
    code: '390007',
    name: 'Bandeja Negra C/Tapa (P200) 9.25*6.5',
    purchaseUnit: 'P200 Und',
    rfsUnit: 'Und',
    rfsToPurchaseFactor: 200,
    purchasePrice: 105.5,
    category: 'Nacional',
    status: 'Planificable',
    launchType: 'Incorporación Permanente',
    primarySupplierId: 'sup-1100',
    secondarySupplierIds: [],
    leadTimeWeeks: 3,
    dispatchMultiple: 1,
    moq: 15,
    targetCoverageWeeks: 2.0,
  },
  {
    id: 'mat-220060',
    code: '220060',
    name: 'Depósito Encerado 32 oz (C6 PAQ 50 UNI)',
    purchaseUnit: 'Caja',
    rfsUnit: 'Botella',
    rfsToPurchaseFactor: 20,
    purchasePrice: 85.3,
    category: 'Regional',
    status: 'Planificable',
    launchType: 'Incorporación Permanente',
    primarySupplierId: 'sup-2200',
    secondarySupplierIds: ['sup-1100'],
    leadTimeWeeks: 2,
    dispatchMultiple: 5,
    moq: 20,
    targetCoverageWeeks: 2.5,
  },
  {
    id: 'mat-220054',
    code: '220054',
    name: 'Depósito Oriental 16 oz (Fardo 200 Unds)',
    purchaseUnit: 'Fardo',
    rfsUnit: 'Pieza',
    rfsToPurchaseFactor: 200,
    purchasePrice: 62.4,
    category: 'Nacional',
    status: 'Planificable',
    launchType: 'Lanzamiento Temporal',
    primarySupplierId: 'sup-2200',
    secondarySupplierIds: [],
    leadTimeWeeks: 1,
    dispatchMultiple: 1,
    moq: 10,
    targetCoverageWeeks: 1.8,
  },
  {
    id: 'mat-14034567',
    code: '14034567',
    name: 'Pastel de Manzana C20 UND',
    purchaseUnit: 'C20 UND',
    rfsUnit: 'Unidad',
    rfsToPurchaseFactor: 20,
    purchasePrice: 210.0,
    category: 'Extranjero',
    status: 'Planificable',
    launchType: 'Incorporación Permanente',
    primarySupplierId: 'sup-3300',
    secondarySupplierIds: [],
    leadTimeWeeks: 3,
    dispatchMultiple: 10,
    moq: 30,
    targetCoverageWeeks: 3.0,
  },
];

export const INITIAL_SUPPLIER_PARAMS: SupplierMaterialParam[] = [
  {
    supplierId: 'sup-1100',
    supplierCode: 'P1100',
    supplierName: 'EMPAQUES DE CALIDAD, S.A.',
    materialId: 'mat-220062',
    leadTimeWeeks: 1,
    deliveryFrequencyDays: 7,
    dispatchMultiple: 1,
    moq: 10,
    unitCost: 119.7589,
    origin: 'Nacional',
    isPrimary: true,
  },
  {
    supplierId: 'sup-2200',
    supplierCode: 'P2200',
    materialId: 'mat-220062',
    supplierName: 'PLÁSTICOS DIVERSOS S.A. DE C.V.',
    leadTimeWeeks: 2,
    deliveryFrequencyDays: 14,
    dispatchMultiple: 5,
    moq: 25,
    unitCost: 122.5,
    origin: 'Regional',
    isPrimary: false,
  },
  {
    supplierId: 'sup-1100',
    supplierCode: 'P1100',
    supplierName: 'EMPAQUES DE CALIDAD, S.A.',
    materialId: 'mat-390007',
    leadTimeWeeks: 3,
    deliveryFrequencyDays: 7,
    dispatchMultiple: 1,
    moq: 15,
    unitCost: 105.5,
    origin: 'Nacional',
    isPrimary: true,
  },
  {
    supplierId: 'sup-2200',
    supplierCode: 'P2200',
    supplierName: 'PLÁSTICOS DIVERSOS S.A. DE C.V.',
    materialId: 'mat-220060',
    leadTimeWeeks: 2,
    deliveryFrequencyDays: 14,
    dispatchMultiple: 5,
    moq: 20,
    unitCost: 85.3,
    origin: 'Regional',
    isPrimary: true,
  },
  {
    supplierId: 'sup-2200',
    supplierCode: 'P2200',
    supplierName: 'PLÁSTICOS DIVERSOS S.A. DE C.V.',
    materialId: 'mat-220054',
    leadTimeWeeks: 1,
    deliveryFrequencyDays: 7,
    dispatchMultiple: 1,
    moq: 10,
    unitCost: 62.4,
    origin: 'Nacional',
    isPrimary: true,
  },
  {
    supplierId: 'sup-3300',
    supplierCode: 'P3300',
    supplierName: 'ALIMENTOS REFRIGERADOS S.A. DE C.V.',
    materialId: 'mat-14034567',
    leadTimeWeeks: 3,
    deliveryFrequencyDays: 21,
    dispatchMultiple: 10,
    moq: 30,
    unitCost: 210.0,
    origin: 'Extranjero',
    isPrimary: true,
  },
];

export const INITIAL_24_WEEKS: WeekColumn[] = [
  { weekIndex: 0, weekNumber: 40, dateLabel: '27-09', year: 2026, startDate: '2026-09-27' },
  { weekIndex: 1, weekNumber: 41, dateLabel: '04-10', year: 2026, startDate: '2026-10-04' },
  { weekIndex: 2, weekNumber: 42, dateLabel: '11-10', year: 2026, startDate: '2026-10-11' },
  { weekIndex: 3, weekNumber: 43, dateLabel: '18-10', year: 2026, startDate: '2026-10-18' },
  { weekIndex: 4, weekNumber: 44, dateLabel: '25-10', year: 2026, startDate: '2026-10-25' },
  { weekIndex: 5, weekNumber: 45, dateLabel: '01-11', year: 2026, startDate: '2026-11-01' },
  { weekIndex: 6, weekNumber: 46, dateLabel: '08-11', year: 2026, startDate: '2026-11-08' },
  { weekIndex: 7, weekNumber: 47, dateLabel: '15-11', year: 2026, startDate: '2026-11-15' },
  { weekIndex: 8, weekNumber: 48, dateLabel: '22-11', year: 2026, startDate: '2026-11-22' },
  { weekIndex: 9, weekNumber: 49, dateLabel: '29-11', year: 2026, startDate: '2026-11-29' },
  { weekIndex: 10, weekNumber: 50, dateLabel: '06-12', year: 2026, startDate: '2026-12-06' },
  { weekIndex: 11, weekNumber: 51, dateLabel: '13-12', year: 2026, startDate: '2026-12-13' },
  { weekIndex: 12, weekNumber: 52, dateLabel: '20-12', year: 2026, startDate: '2026-12-20' },
  { weekIndex: 13, weekNumber: 53, dateLabel: '27-12', year: 2026, startDate: '2026-12-27' },
  { weekIndex: 14, weekNumber: 1, dateLabel: '27-12', year: 2027, startDate: '2026-12-27' },
  { weekIndex: 15, weekNumber: 2, dateLabel: '03-01', year: 2027, startDate: '2027-01-03' },
  { weekIndex: 16, weekNumber: 3, dateLabel: '10-01', year: 2027, startDate: '2027-01-10' },
  { weekIndex: 17, weekNumber: 4, dateLabel: '17-01', year: 2027, startDate: '2027-01-17' },
  { weekIndex: 18, weekNumber: 5, dateLabel: '24-01', year: 2027, startDate: '2027-01-24' },
  { weekIndex: 19, weekNumber: 6, dateLabel: '31-01', year: 2027, startDate: '2027-01-31' },
  { weekIndex: 20, weekNumber: 7, dateLabel: '07-02', year: 2027, startDate: '2027-02-07' },
  { weekIndex: 21, weekNumber: 8, dateLabel: '14-02', year: 2027, startDate: '2027-02-14' },
  { weekIndex: 22, weekNumber: 9, dateLabel: '21-02', year: 2027, startDate: '2027-02-21' },
  { weekIndex: 23, weekNumber: 10, dateLabel: '28-02', year: 2027, startDate: '2027-02-28' },
];

export const INITIAL_GRID_INPUTS: Record<string, { estimado: number; inferido: number; preOrden: number; nuevaOC: number }[]> = {
  'mat-220062': [
    { estimado: 0, inferido: 100, preOrden: 80, nuevaOC: 0 }, // W40
    { estimado: 0, inferido: 40, preOrden: 0, nuevaOC: 0 },  // W41
    { estimado: 0, inferido: 20, preOrden: 40, nuevaOC: 0 }, // W42
    { estimado: 0, inferido: 25, preOrden: 0, nuevaOC: 0 },  // W43
    { estimado: 0, inferido: 35, preOrden: 40, nuevaOC: 0 }, // W44
    { estimado: 0, inferido: 24, preOrden: 0, nuevaOC: 0 },  // W45
    { estimado: 0, inferido: 18, preOrden: 200, nuevaOC: 0 },// W46
    { estimado: 0, inferido: 45, preOrden: 0, nuevaOC: 0 },  // W47
    { estimado: 0, inferido: 35, preOrden: 0, nuevaOC: 0 },  // W48
    { estimado: 0, inferido: 45, preOrden: 0, nuevaOC: 0 },  // W49
    { estimado: 0, inferido: 50, preOrden: 0, nuevaOC: 0 },  // W50
    { estimado: 0, inferido: 60, preOrden: 0, nuevaOC: 0 },  // W51
    { estimado: 0, inferido: 75, preOrden: 0, nuevaOC: 0 },  // W52
    { estimado: 0, inferido: 40, preOrden: 0, nuevaOC: 0 },  // W53
    { estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 },   // W1
    { estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 },   // W2
    { estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 },   // W3
    { estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 },   // W4
    { estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 },   // W5
    { estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 },   // W6
    { estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 },   // W7
    { estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 },   // W8
    { estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 },   // W9
    { estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 },   // W10
  ],
};

export const INITIAL_LOTS: LotInventory[] = [
  {
    id: 'lot-101',
    materialId: 'mat-220062',
    lotNumber: '1231231',
    rfsQuantity: 300,
    convertedPurchaseQuantity: 1.5,
    purchaseUnit: 'F200 Und',
    expirationDate: '2026-06-14',
    warehouse: 'CD Central',
  },
  {
    id: 'lot-102',
    materialId: 'mat-220062',
    lotNumber: '1233422',
    rfsQuantity: 500,
    convertedPurchaseQuantity: 2.5,
    purchaseUnit: 'F200 Und',
    expirationDate: '2026-06-20',
    warehouse: 'CD Norte',
  },
  {
    id: 'lot-103',
    materialId: 'mat-220060',
    lotNumber: '9984102',
    rfsQuantity: 30,
    convertedPurchaseQuantity: 1.5,
    purchaseUnit: 'Caja',
    expirationDate: '2026-09-10',
    warehouse: 'CD Sur',
  },
];

export const INITIAL_TRANSIT_POS: TransitPO[] = [
  {
    id: 'trans-1',
    poNumber: 'OCD 10',
    materialId: 'mat-220062',
    supplierId: 'sup-1100',
    orderedQty: 30,
    receivedQty: 0,
    requiredDate: '01-Feb-2026',
    price: 119.7589,
    status: 'TRÁNSITO',
    weekIndexNeeded: 1,
  },
  {
    id: 'trans-2',
    poNumber: 'OCD 11',
    materialId: 'mat-220062',
    supplierId: 'sup-1100',
    orderedQty: 40,
    receivedQty: 0,
    requiredDate: '08-Feb-2026',
    price: 119.7589,
    status: 'TRÁNSITO',
    weekIndexNeeded: 3,
  },
  {
    id: 'trans-3',
    poNumber: 'OCD 12',
    materialId: 'mat-220062',
    supplierId: 'sup-1100',
    orderedQty: 50,
    receivedQty: 0,
    requiredDate: '15-Feb-2026',
    price: 119.7589,
    status: 'TRÁNSITO',
    weekIndexNeeded: 6,
  },
];

export const INITIAL_ACCURACY_HISTORY: AccuracyHistoryWeek[] = [
  { weekNumber: 44, inferidos: 12, consumoReal: 13, accuracyPercent: 92.3 },
  { weekNumber: 43, inferidos: 11, consumoReal: 11, accuracyPercent: 100.0 },
  { weekNumber: 42, inferidos: 10, consumoReal: 10, accuracyPercent: 100.0 },
  { weekNumber: 41, inferidos: 11, consumoReal: 10, accuracyPercent: 110.0 },
  { weekNumber: 40, inferidos: 12, consumoReal: 12, accuracyPercent: 100.0 },
  { weekNumber: 39, inferidos: 15, consumoReal: 14, accuracyPercent: 107.1 },
  { weekNumber: 38, inferidos: 20, consumoReal: 18, accuracyPercent: 111.1 },
  { weekNumber: 37, inferidos: 10, consumoReal: 10, accuracyPercent: 100.0 },
  { weekNumber: 36, inferidos: 8, consumoReal: 9, accuracyPercent: 88.8 },
  { weekNumber: 35, inferidos: 14, consumoReal: 14, accuracyPercent: 100.0 },
  { weekNumber: 34, inferidos: 16, consumoReal: 15, accuracyPercent: 106.6 },
  { weekNumber: 33, inferidos: 12, consumoReal: 12, accuracyPercent: 100.0 },
];

export const INITIAL_POLICIES: InventoryPolicy[] = [
  {
    id: 'pol-1',
    materialId: 'mat-220062',
    targetCoverageWeeks: 2.2,
    quiebreThreshold: 1.0,
    bajoThreshold: 1.5,
    optimoThresholdMin: 1.5,
    optimoThresholdMax: 3.0,
    sobreThreshold: 3.0,
    priority: 1,
    updatedBy: 'Carlos Mendoza (Jefe)',
    updatedAt: '2026-07-20 10:15',
    changeReason: 'Ajuste inicial por alta demanda estacional',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@empresa.com',
    role: 'Jefe de Planificación',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  },
  {
    id: 'usr-2',
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    role: 'Planificador',
    bolsonId: 'bolson-1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  },
  {
    id: 'usr-3',
    name: 'María Rodríguez',
    email: 'maria.rodriguez@empresa.com',
    role: 'Planificador',
    bolsonId: 'bolson-2',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  },
];

export const INITIAL_BOLSONES: Bolson[] = [
  {
    id: 'bolson-1',
    name: 'Bolsón 1 - EMPAQUES Y PLÁSTICOS',
    description: 'Asignado a Juan Pérez. Incluye proveedores de empaques rígidos y flexibles.',
    assignedUserId: 'usr-2',
    assignedSupplierIds: ['sup-1100', 'sup-2200'],
    assignedMaterialIds: ['mat-220062', 'mat-390007', 'mat-220060', 'mat-220054'],
  },
  {
    id: 'bolson-2',
    name: 'Bolsón 2 - ALIMENTOS Y CONGELADOS',
    description: 'Asignado a María Rodríguez. Incluye alimentos perecederos y cadena de frío.',
    assignedUserId: 'usr-3',
    assignedSupplierIds: ['sup-3300'],
    assignedMaterialIds: ['mat-14034567'],
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-2026-001',
    poNumber: 'OCD-45792',
    supplierId: 'sup-1100',
    supplierName: 'EMPAQUES DE CALIDAD, S.A.',
    plannerId: 'usr-2',
    plannerName: 'Juan Pérez',
    orderDate: '2026-07-20',
    deliveryDate: '2026-08-01',
    destinationWarehouse: 'CD Central (C20)',
    isEmergency: false,
    status: 'Aprobada',
    totalAmount: 14371.068,
    budgetLimit: 50000.0,
    exceedsBudget: false,
    items: [
      {
        materialId: 'mat-220062',
        materialCode: '220062',
        materialName: 'Bandeja 8X8 Negra C/Tapa División (F200 Und)',
        quantity: 120,
        unitPrice: 119.7589,
        subtotal: 14371.068,
        weekIndex: 0,
      },
    ],
    attachments: [
      {
        name: 'Cotización_Firmada_P1100.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        uploadedAt: '2026-07-20 11:30',
        size: '1.2 MB',
      },
    ],
  },
  {
    id: 'po-2026-002',
    poNumber: 'OCD-EMERG-881',
    supplierId: 'sup-2200',
    supplierName: 'PLÁSTICOS DIVERSOS S.A. DE C.V.',
    plannerId: 'usr-2',
    plannerName: 'Juan Pérez',
    orderDate: '2026-07-22',
    deliveryDate: '2026-07-29',
    destinationWarehouse: 'CD Norte',
    isEmergency: true,
    emergencyReason: 'Incril de demanda por promoción relámpago de fin de mes',
    status: 'Pendiente Aprobación',
    totalAmount: 9580.712,
    budgetLimit: 8000.0,
    exceedsBudget: true,
    items: [
      {
        materialId: 'mat-220060',
        materialCode: '220060',
        materialName: 'Depósito Encerado 32 oz (C6 PAQ 50 UNI)',
        quantity: 80,
        unitPrice: 85.3,
        subtotal: 6824.0,
        weekIndex: 1,
      },
    ],
  },
];

export const INITIAL_ATTACHMENTS: FileAttachment[] = [
  {
    id: 'att-1',
    fileName: 'Ficha_Técnica_Bandeja_220062.pdf',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    uploadedBy: 'Carlos Mendoza',
    uploadedAt: '2026-07-15 09:30',
    url: '#',
    category: 'Datasheet',
    relatedEntityId: 'mat-220062',
  },
  {
    id: 'att-2',
    fileName: 'Certificado_Calidad_P1100.pdf',
    fileType: 'pdf',
    fileSize: '850 KB',
    uploadedBy: 'Juan Pérez',
    uploadedAt: '2026-07-18 14:20',
    url: '#',
    category: 'Supplier Cert',
    relatedEntityId: 'sup-1100',
  },
];
