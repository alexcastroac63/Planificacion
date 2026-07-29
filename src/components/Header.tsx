import React from 'react';
import { User } from '../types/mrp';
import { Database, HardDrive, Layers, Shield, UserCheck, ChevronDown, Bell } from 'lucide-react';

interface HeaderProps {
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  users,
  currentUser,
  onSelectUser,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Grid de Planificación MRP
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                v2.4 Cloud
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sistema de Cadena de Suministro & Planificación Semanal
            </p>
          </div>
        </div>

        {/* Center Architecture Badges */}
        <div className="hidden lg:flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL: Conectado</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1.5 text-sky-700 font-medium">
            <HardDrive className="w-3.5 h-3.5" />
            <span>File Repository: S3 Bucket</span>
          </div>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`text-xs font-semibold px-2.5 py-1 rounded transition ${
              activeTab === 'roadmap'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Sprint Roadmap & Arq
          </button>
        </div>

        {/* Right User & System Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('roadmap')}
            className="text-slate-500 hover:text-slate-900 relative p-1.5 rounded-lg hover:bg-slate-100 transition"
            title="Notificaciones de Auditoría"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          {/* User Selector Dropdown */}
          <div className="relative group">
            <div className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer transition">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
                  <span>{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
                <div className="text-[10px] text-blue-600 font-medium">
                  {currentUser.role}
                </div>
              </div>
            </div>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 hidden group-hover:block z-50 p-2">
              <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                Cambiar Usuario (Simulación de Roles)
              </div>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                    u.id === currentUser.id
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-[10px] text-slate-500">{u.role}</div>
                  </div>
                  {u.id === currentUser.id && <UserCheck className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
