import React from 'react';
import {
  Grid,
  Home,
  Package,
  Sliders,
  Users,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  GitPullRequest,
  PieChart,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingEmergencyPOsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  pendingEmergencyPOsCount = 0,
}) => {
  const tabs = [
    { id: 'roadmap', label: 'Roadmap & Arq', icon: GitPullRequest, badge: 'Sprints' },
    { id: 'home', label: 'Home / Bolsón', icon: Home },
    { id: 'grid', label: 'GRID de Planificación', icon: Grid, highlight: true },
    { id: 'materiales', label: 'Materiales', icon: Package },
    { id: 'politicas', label: 'Políticas Stock', icon: Sliders },
    { id: 'proveedores', label: 'Proveedores', icon: Users },
    {
      id: 'compras',
      label: 'Órdenes Compra',
      icon: ShoppingCart,
      badgeNumber: pendingEmergencyPOsCount > 0 ? pendingEmergencyPOsCount : undefined,
    },
    { id: 'distribucion', label: 'Distribución CD', icon: PieChart },
    { id: 'entregas', label: 'Entregas', icon: Truck },
    { id: 'reporteria', label: 'Reportería & Excel', icon: BarChart3 },
    { id: 'configuracion', label: 'Config. & Bolsones', icon: Settings },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs overflow-x-auto no-scrollbar">
      <div className="max-w-[1600px] mx-auto px-4 flex items-center space-x-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                tab.highlight && !isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold'
                  : ''
              } ${
                isActive
                  ? tab.highlight
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-white font-semibold shadow-xs'
                  : !tab.highlight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : ''
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.badge}
                </span>
              )}
              {tab.badgeNumber !== undefined && (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {tab.badgeNumber}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
