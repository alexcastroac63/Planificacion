import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  HardDrive,
  Server,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  FileCode,
  Download,
  Upload,
  Search,
} from 'lucide-react';
import { FileAttachment } from '../types/mrp';

interface SprintRoadmapViewProps {
  attachments: FileAttachment[];
  onUploadFile: (file: FileAttachment) => void;
  onNavigateTab: (tab: string) => void;
}

export const SprintRoadmapView: React.FC<SprintRoadmapViewProps> = ({
  attachments,
  onUploadFile,
  onNavigateTab,
}) => {
  const [selectedSprint, setSelectedSprint] = useState<number>(3); // Current active sprint
  const [activeSubView, setActiveSubView] = useState<'sprints' | 'microservices' | 'database' | 'files'>('sprints');
  const [selectedTable, setSelectedTable] = useState<string>('planificacion_semanal');

  // Sprints Roadmap Data
  const sprints = [
    {
      number: 1,
      title: 'Sprint 1: Infraestructura Base & Autenticación',
      duration: 'Semanas 1 - 2',
      status: 'Completado',
      statusBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Priorización de la arquitectura base, API Gateway y Autenticación con Roles.',
      deliverables: [
        'Configuración de API Gateway e Ingress Nginx',
        'Microservicio de Autenticación (JWT & RBAC para Jefatura, Planificador, Comprador)',
        'Estructura de Base de Datos PostgreSQL inicial (Schemas & Migrations)',
        'Módulo de Almacenamiento de Archivos Object Storage (S3 Bucket)',
        'Módulo de Administración de Usuarios y Asignación de Bolsones (HU-34)',
      ],
    },
    {
      number: 2,
      title: 'Sprint 2: Catálogos, Proveedores & Restricciones',
      duration: 'Semanas 3 - 4',
      status: 'Completado',
      statusBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Gestión de maestros de materiales, parámetros logísticos y proveedores.',
      deliverables: [
        'Microservicio de Catálogo de Materiales y Sustitutos (HU-15, HU-16, HU-17)',
        'Administración de Parámetros Logísticos de Proveedor: Lead Time, MOQ, Múltiplos (HU-23)',
        'Definición de Proveedor Principal y Secundario (HU-24)',
        'Gestión de Existencia por Lotes y Vencimientos en RFS (HU-19)',
        'Configuración de Semanas Calendario N años (HU-35)',
      ],
    },
    {
      number: 3,
      title: 'Sprint 3: Core GRID de Planificación MRP 24 Semanas',
      duration: 'Semanas 5 - 6',
      status: 'En Ejecución Actual',
      statusBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold',
      description: 'Motor de cálculo de la cuadrícula central de planificación a 24 semanas.',
      deliverables: [
        'Cuadrícula Central 24 Semanas interactiva con selección de Proveedores (HU-01, HU-02)',
        'Cálculo de Estimados (Trimmed mean 7 semanas - HU-03)',
        'Entrada de Inferidos promocionales con celda celeste y bitácora de auditoría (HU-04)',
        'Cálculo dinámico: Inv Inicial, Tránsitos, Ingresa CD con Lead Time, Inv Final (HU-05 a HU-08)',
        'Semáforo WOH por política de stock (Quiebre, Bajo, Óptimo, Sobre) (HU-09, HU-21)',
        'Cálculo de Por Cubrir y Generación de OC Sugerida con desplazamiento (HU-10, HU-11)',
        'Simulación en Pre Orden (verde) y Generación de Nueva OC con alerta MOQ (HU-12, HU-13)',
      ],
    },
    {
      number: 4,
      title: 'Sprint 4: Órdenes de Compra, Distribución & Reportería',
      duration: 'Semanas 7 - 8',
      status: 'Planificado Próximo',
      statusBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Módulo de ejecución masiva de compras, centros de distribución y analítica.',
      deliverables: [
        'Generación Masiva de Órdenes de Compra con validación de presupuesto (HU-25)',
        'Módulo de Compras de Emergencia y solicitudes extraordinarias (HU-26)',
        'Módulo de Distribución de demanda por Centros de Distribución en 5 semanas (HU-28)',
        'Seguimiento de Entregas y control de Backorders (HU-29)',
        'Reportería Operativa y exportación nativa a Excel .xlsx (HU-30 a HU-33)',
        'Módulo de Semanas Críticas y simulador Rolling 24 semanas (HU-36, HU-37)',
      ],
    },
  ];

  // Database Schema Info
  const tablesInfo = [
    {
      name: 'planificacion_semanal',
      description: 'Almacena la proyección de 24 semanas por material y proveedor.',
      columns: ['id', 'material_id', 'week_number', 'year', 'estimado', 'inferido', 'inv_inicial', 'transito', 'ingresa_cd', 'inv_final', 'woh', 'por_cubrir', 'oc_sugerida', 'pre_orden', 'nueva_oc', 'valor_compra'],
    },
    {
      name: 'users',
      description: 'Usuarios del sistema con roles RBAC.',
      columns: ['id', 'name', 'email', 'role', 'bolson_id', 'created_at'],
    },
    {
      name: 'bolsones_proveedor',
      description: 'Agrupación de proveedores y materiales asignados a planificadores.',
      columns: ['id', 'name', 'assigned_user_id', 'assigned_suppliers', 'assigned_materials'],
    },
    {
      name: 'materiales',
      description: 'Maestro de materiales de empaque y materia prima.',
      columns: ['id', 'code', 'name', 'purchase_unit', 'rfs_unit', 'rfs_factor', 'price', 'category', 'status', 'lead_time_weeks', 'moq'],
    },
    {
      name: 'ordenes_compra',
      description: 'Cabecera de órdenes de compra normales y de emergencia.',
      columns: ['id', 'po_number', 'supplier_id', 'planner_id', 'order_date', 'delivery_date', 'destination_warehouse', 'is_emergency', 'status', 'total_amount'],
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6 text-slate-800">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Planificación de Proyecto & Arquitectura Cloud Microservicios</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Roadmap de Desarrollo por Sprints (2 Semanas)
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl">
            Implementación incremental priorizando la infraestructura base y la autenticación de usuarios en los primeros sprints, continuando con el motor central de la cuadrícula de planificación (GRID 24 semanas), compras, repositorio de archivos y PostgreSQL.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('grid')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow-xs flex items-center space-x-2 text-sm whitespace-nowrap self-start md:self-auto transition"
        >
          <span>Ir a GRID de Planificación</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-Navigation Controls */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveSubView('sprints')}
          className={`pb-3 px-1 text-sm font-semibold flex items-center space-x-2 border-b-2 transition ${
            activeSubView === 'sprints'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Sprints & Roadmap</span>
        </button>
        <button
          onClick={() => setActiveSubView('microservices')}
          className={`pb-3 px-1 text-sm font-semibold flex items-center space-x-2 border-b-2 transition ${
            activeSubView === 'microservices'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Arquitectura de Microservicios</span>
        </button>
        <button
          onClick={() => setActiveSubView('database')}
          className={`pb-3 px-1 text-sm font-semibold flex items-center space-x-2 border-b-2 transition ${
            activeSubView === 'database'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Esquema PostgreSQL</span>
        </button>
        <button
          onClick={() => setActiveSubView('files')}
          className={`pb-3 px-1 text-sm font-semibold flex items-center space-x-2 border-b-2 transition ${
            activeSubView === 'files'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Repositorio de Archivos Object Storage</span>
        </button>
      </div>

      {/* SUBVIEW 1: Sprints & Roadmap */}
      {activeSubView === 'sprints' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sprints.map((sprint) => (
            <div
              key={sprint.number}
              onClick={() => setSelectedSprint(sprint.number)}
              className={`bg-white rounded-2xl p-6 border transition cursor-pointer shadow-xs relative overflow-hidden ${
                selectedSprint === sprint.number
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xl font-bold text-slate-900">{sprint.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mb-3">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Duración: {sprint.duration}</span>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${
                    sprint.number < 3
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : sprint.number === 3
                      ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {sprint.status}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4">{sprint.description}</p>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Entregables Clave del Sprint:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {sprint.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBVIEW 2: Microservices Topology */}
      {activeSubView === 'microservices' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Server className="w-5 h-5 text-blue-600" />
              <span>Topología de Microservicios Desplegada en la Nube</span>
            </h3>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-medium">
              ● Todos los Microservicios Activos (Healthy)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Gateway */}
            <div className="bg-slate-50 p-4 rounded-xl border border-indigo-200 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-2">
                API
              </div>
              <h4 className="font-bold text-sm text-slate-900">Cloud API Gateway</h4>
              <p className="text-[11px] text-slate-500 mt-1">Nginx Reverse Proxy / Express Routing</p>
              <div className="mt-3 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded font-mono">
                Port 3000 / SSL Encrypted
              </div>
            </div>

            {/* Auth Service */}
            <div className="bg-slate-50 p-4 rounded-xl border border-blue-200 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Auth & Users Microservice</h4>
              <p className="text-[11px] text-slate-500 mt-1">JWT Tokens, Roles & Bolsón Assignment</p>
              <div className="mt-3 text-[10px] text-blue-800 bg-blue-50 border border-blue-200 px-2 py-1 rounded font-mono">
                /api/v1/auth
              </div>
            </div>

            {/* Planning Grid MRP Service */}
            <div className="bg-slate-50 p-4 rounded-xl border border-emerald-200 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Planning Grid MRP Engine</h4>
              <p className="text-[11px] text-slate-500 mt-1">24-Week Dynamic Calculations & WOH</p>
              <div className="mt-3 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded font-mono">
                /api/v1/mrp-grid
              </div>
            </div>

            {/* Procurement Service */}
            <div className="bg-slate-50 p-4 rounded-xl border border-amber-200 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Procurement Microservice</h4>
              <p className="text-[11px] text-slate-500 mt-1">Mass POs, Emergency Orders & ERP Sync</p>
              <div className="mt-3 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded font-mono">
                /api/v1/procurement
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-slate-900">Base de Datos PostgreSQL (Cloud SQL)</h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  Instancia relacional de alta disponibilidad con réplica de lectura. Almacena usuarios, planificaciones semanales, órdenes de compra y bitácoras de auditoría.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
              <div className="p-3 bg-sky-100 text-sky-700 rounded-lg">
                <HardDrive className="w-8 h-8" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-slate-900">Repositorio de Archivos Object Storage</h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  Almacenamiento persistente de fichas técnicas de materiales, certificados de calidad de proveedores, facturas e imágenes de producto.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: Database Schema Inspector */}
      {activeSubView === 'database' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <span>Inspector de Tablas PostgreSQL</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Seleccionar Tabla:
              </span>
              {tablesInfo.map((tbl) => (
                <button
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                    selectedTable === tbl.name
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono">{tbl.name}</span>
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </button>
              ))}
            </div>

            <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
              {tablesInfo
                .filter((t) => t.name === selectedTable)
                .map((tbl) => (
                  <div key={tbl.name} className="space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-indigo-700 font-mono">
                        CREATE TABLE public.{tbl.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{tbl.description}</p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Columnas de la Tabla:
                      </span>
                      <div className="mt-2 space-y-1.5 font-mono text-xs">
                        {tbl.columns.map((col, idx) => (
                          <div
                            key={idx}
                            className="bg-white px-3 py-1.5 rounded border border-slate-200 flex items-center justify-between text-slate-800"
                          >
                            <span className="text-blue-700 font-semibold">{col}</span>
                            <span className="text-slate-400 text-[10px]">
                              {col === 'id'
                                ? 'UUID PRIMARY KEY'
                                : col.includes('_id')
                                ? 'FOREIGN KEY'
                                : 'VARCHAR / NUMERIC'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 4: File Repository */}
      {activeSubView === 'files' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-sky-600" />
                <span>Repositorio de Archivos & Imágenes (Object Storage)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Almacena fichas técnicas de materiales, certificados de proveedores y adjuntos de órdenes de compra.
              </p>
            </div>

            <label className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-2 transition shadow-xs">
              <Upload className="w-4 h-4" />
              <span>Subir Nuevo Archivo</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    onUploadFile({
                      id: `att-${Date.now()}`,
                      fileName: f.name,
                      fileType: f.type.includes('pdf') ? 'pdf' : 'image',
                      fileSize: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
                      uploadedBy: 'Usuario Actual',
                      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                      url: '#',
                      category: 'Datasheet',
                    });
                  }
                }}
              />
            </label>
          </div>

          <div className="space-y-3">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-sky-100 text-sky-700 rounded-lg border border-sky-200">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">{att.fileName}</h5>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                      <span>Categoría: {att.category}</span>
                      <span>•</span>
                      <span>Tamaño: {att.fileSize}</span>
                      <span>•</span>
                      <span>Subido por: {att.uploadedBy}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={att.url}
                  download
                  className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
