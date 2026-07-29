import React, { useState } from 'react';
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
} from './types/mrp';
import {
  INITIAL_ACCURACY_HISTORY,
  INITIAL_ATTACHMENTS,
  INITIAL_BOLSONES,
  INITIAL_GRID_INPUTS,
  INITIAL_LOTS,
  INITIAL_MATERIALS,
  INITIAL_POLICIES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SUPPLIERS,
  INITIAL_SUPPLIER_PARAMS,
  INITIAL_TRANSIT_POS,
  INITIAL_USERS,
  INITIAL_24_WEEKS,
} from './data/mockData';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { SprintRoadmapView } from './components/SprintRoadmapView';
import { HomeModule } from './components/HomeModule';
import { PlanningGrid } from './components/GridPlanificacion/PlanningGrid';
import { MaterialesModule } from './components/Materiales/MaterialesModule';
import { PoliticasModule } from './components/Politicas/PoliticasModule';
import { ProveedoresModule } from './components/Proveedores/ProveedoresModule';
import { OrdenesCompraModule } from './components/OrdenesCompra/OrdenesCompraModule';
import { DistribucionModule } from './components/Distribucion/DistribucionModule';
import { EntregasModule } from './components/Entregas/EntregasModule';
import { ReporteriaModule } from './components/Reporteria/ReporteriaModule';
import { ConfiguracionModule } from './components/Configuracion/ConfiguracionModule';

export default function App() {
  // Global Application State
  const [activeTab, setActiveTab] = useState<string>('grid'); // Default to main 24-week GRID
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to Carlos Mendoza (Jefe)

  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [supplierParams, setSupplierParams] = useState<SupplierMaterialParam[]>(INITIAL_SUPPLIER_PARAMS);

  const [weeks, setWeeks] = useState<WeekColumn[]>(INITIAL_24_WEEKS);
  const [gridInputs, setGridInputs] = useState<
    Record<string, { estimado: number; inferido: number; preOrden: number; nuevaOC: number }[]>
  >(INITIAL_GRID_INPUTS);

  const [lots, setLots] = useState<LotInventory[]>(INITIAL_LOTS);
  const [transits, setTransits] = useState<TransitPO[]>(INITIAL_TRANSIT_POS);
  const [accuracyHistory, setAccuracyHistory] = useState<AccuracyHistoryWeek[]>(INITIAL_ACCURACY_HISTORY);
  const [policies, setPolicies] = useState<InventoryPolicy[]>(INITIAL_POLICIES);
  const [bolsones, setBolsones] = useState<Bolson[]>(INITIAL_BOLSONES);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [attachments, setAttachments] = useState<FileAttachment[]>(INITIAL_ATTACHMENTS);

  // Handle cell edit in 24-week grid
  const handleUpdateGridInputs = (
    materialId: string,
    weekIndex: number,
    field: 'inferido' | 'preOrden' | 'nuevaOC',
    val: number,
    note?: string
  ) => {
    setGridInputs((prev) => {
      const currentMatInputs = [...(prev[materialId] || [])];

      // Ensure array length 24
      while (currentMatInputs.length < 24) {
        currentMatInputs.push({ estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 });
      }

      const weekItem = { ...currentMatInputs[weekIndex] };
      weekItem[field] = val;

      if (field === 'inferido' && note) {
        (weekItem as any).inferidoNote = note;
        (weekItem as any).inferidoModifiedBy = currentUser.name;
        (weekItem as any).inferidoModifiedAt = new Date().toISOString().substring(0, 16);
      }

      currentMatInputs[weekIndex] = weekItem;

      return {
        ...prev,
        [materialId]: currentMatInputs,
      };
    });
  };

  // Add material
  const handleAddMaterial = (newMat: Material) => {
    setMaterials((prev) => [newMat, ...prev]);
  };

  // Toggle Planificable / No Planificable
  const handleToggleMaterialStatus = (materialId: string) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId
          ? {
              ...m,
              status: m.status === 'Planificable' ? 'No planificable' : 'Planificable',
            }
          : m
      )
    );
  };

  // Update Material (e.g. lead time, target coverage)
  const handleUpdateMaterial = (updatedMat: Material) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === updatedMat.id ? updatedMat : m))
    );
    // Sync supplier params if leadtime changed
    setSupplierParams((prev) =>
      prev.map((sp) =>
        sp.materialId === updatedMat.id && sp.isPrimary
          ? { ...sp, leadTimeWeeks: updatedMat.leadTimeWeeks }
          : sp
      )
    );
  };

  // Update Supplier Parameter (e.g., lead time)
  const handleUpdateSupplierParam = (updatedParam: SupplierMaterialParam) => {
    setSupplierParams((prev) =>
      prev.map((sp) =>
        sp.materialId === updatedParam.materialId && sp.supplierId === updatedParam.supplierId
          ? updatedParam
          : sp
      )
    );
    // If this parameter is for the primary supplier, update material leadTimeWeeks too
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === updatedParam.materialId && m.primarySupplierId === updatedParam.supplierId) {
          return { ...m, leadTimeWeeks: updatedParam.leadTimeWeeks };
        }
        return m;
      })
    );
  };

  // Update Inventory Policy
  const handleUpdatePolicy = (updatedPol: InventoryPolicy) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === updatedPol.id ? updatedPol : p))
    );
    // Sync material targetCoverageWeeks
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === updatedPol.materialId
          ? { ...m, targetCoverageWeeks: updatedPol.targetCoverageWeeks }
          : m
      )
    );
  };

  // Set Primary Supplier for Material
  const handleSetPrimarySupplier = (materialId: string, supplierId: string) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId
          ? {
              ...m,
              primarySupplierId: supplierId,
              secondarySupplierIds: m.secondarySupplierIds.filter((id) => id !== supplierId),
            }
          : m
      )
    );
  };

  // Create Emergency Purchase Order
  const handleCreateEmergencyPO = (newPO: PurchaseOrder) => {
    setPurchaseOrders((prev) => [newPO, ...prev]);
  };

  // Approve Purchase Order
  const handleApprovePO = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: 'Aprobada' } : po))
    );
  };

  // Upload File to File Repository
  const handleUploadFile = (file: FileAttachment) => {
    setAttachments((prev) => [file, ...prev]);
  };

  // Assign Bolson to User
  const handleAssignBolsonToUser = (userId: string, bolsonId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, bolsonId } : u))
    );
  };

  // Advance Rolling 24-Week Grid (HU-37)
  const handleAdvanceRollingGridWeek = () => {
    setWeeks((prev) => {
      const nextWeekNum = prev[prev.length - 1].weekNumber + 1;
      const nextYear = nextWeekNum > 52 ? prev[prev.length - 1].year + 1 : prev[prev.length - 1].year;
      const newWeekCol: WeekColumn = {
        weekIndex: 23,
        weekNumber: nextWeekNum > 52 ? nextWeekNum - 52 : nextWeekNum,
        dateLabel: `W${nextWeekNum}`,
        year: nextYear,
        startDate: `2027-03-01`,
      };

      const shifted = prev.slice(1).map((w, idx) => ({ ...w, weekIndex: idx }));
      return [...shifted, newWeekCol];
    });

    // Shift grid inputs for materials
    setGridInputs((prev) => {
      const next: typeof prev = {};
      Object.keys(prev).forEach((matId) => {
        const arr = prev[matId] || [];
        const shiftedArr = arr.slice(1);
        shiftedArr.push({ estimado: 0, inferido: 0, preOrden: 0, nuevaOC: 0 });
        next[matId] = shiftedArr;
      });
      return next;
    });
  };

  // Count pending emergency POs for badge
  const pendingEmergencyCount = purchaseOrders.filter(
    (po) => po.isEmergency && po.status === 'Pendiente Aprobación'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header & Navigation */}
      <Header
        users={users}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingEmergencyPOsCount={pendingEmergencyCount}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 py-6">
        {activeTab === 'roadmap' && (
          <SprintRoadmapView
            attachments={attachments}
            onUploadFile={handleUploadFile}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'home' && (
          <HomeModule
            currentUser={currentUser}
            suppliers={suppliers}
            materials={materials}
            onSelectMaterialAndNavigate={(matId, supId) => {
              setActiveTab('grid');
            }}
          />
        )}

        {activeTab === 'grid' && (
          <PlanningGrid
            suppliers={suppliers}
            materials={materials}
            weeks={weeks}
            gridInputs={gridInputs}
            lots={lots}
            transits={transits}
            accuracyHistory={accuracyHistory}
            currentUser={currentUser}
            onUpdateGridInputs={handleUpdateGridInputs}
            onGenerateMassPO={() => setActiveTab('compras')}
          />
        )}

        {activeTab === 'materiales' && (
          <MaterialesModule
            materials={materials}
            attachments={attachments}
            onToggleStatus={handleToggleMaterialStatus}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onUploadFile={handleUploadFile}
          />
        )}

        {activeTab === 'politicas' && (
          <PoliticasModule
            policies={policies}
            materials={materials}
            currentUser={currentUser}
            onUpdatePolicy={handleUpdatePolicy}
          />
        )}

        {activeTab === 'proveedores' && (
          <ProveedoresModule
            suppliers={suppliers}
            materials={materials}
            supplierParams={supplierParams}
            onSetPrimarySupplier={handleSetPrimarySupplier}
            onUpdateSupplierParam={handleUpdateSupplierParam}
          />
        )}

        {activeTab === 'compras' && (
          <OrdenesCompraModule
            purchaseOrders={purchaseOrders}
            suppliers={suppliers}
            materials={materials}
            currentUser={currentUser}
            onCreateEmergencyPO={handleCreateEmergencyPO}
            onApprovePO={handleApprovePO}
          />
        )}

        {activeTab === 'distribucion' && (
          <DistribucionModule materials={materials} />
        )}

        {activeTab === 'entregas' && (
          <EntregasModule transits={transits} materials={materials} />
        )}

        {activeTab === 'reporteria' && (
          <ReporteriaModule materials={materials} suppliers={suppliers} users={users} />
        )}

        {activeTab === 'configuracion' && (
          <ConfiguracionModule
            users={users}
            bolsones={bolsones}
            suppliers={suppliers}
            materials={materials}
            weeks={weeks}
            onAssignBolsonToUser={handleAssignBolsonToUser}
            onAdvanceRollingGridWeek={handleAdvanceRollingGridWeek}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-mono">
        Grid de Planificación MRP • Arquitectura de Microservicios Desplegada en la Nube • PostgreSQL & Object Storage
      </footer>
    </div>
  );
}
