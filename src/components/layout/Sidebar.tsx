import React from 'react';
import {
  LayoutDashboard,
  Presentation,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { DivisionIcon } from '../common/DivisionIcon';
import { useAgenda } from '../../context/AgendaContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  onCloseMobile,
}) => {
  const { getDivisionsForActiveWeek, activeWeek, isSuperAdmin, openAddModal } = useAgenda();
  const divisions = getDivisionsForActiveWeek();

  const handleItemClick = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const isDashboardActive = currentPath === '/';
  const isPresentationActive = currentPath === '/presentation';

  return (
    <aside className="w-64 bg-[#0e1626] border-r border-slate-800/90 h-full flex flex-col justify-between select-none text-slate-200">
      <div className="p-4 overflow-y-auto flex-1 space-y-6">
        {/* Main Navigation Group */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Menu Utama
          </div>
          <nav className="space-y-1">
            {/* Dashboard Item */}
            <button
              onClick={() => handleItemClick('/')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isDashboardActive
                  ? 'bg-brand-500/20 text-brand-300 shadow-soft border border-brand-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard
                  size={18}
                  className={isDashboardActive ? 'text-brand-400' : 'text-slate-400'}
                />
                <span>Dashboard Utama</span>
              </div>
              {isDashboardActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              )}
            </button>

            {/* Presentation Mode Item */}
            <button
              onClick={() => handleItemClick('/presentation')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                isPresentationActive
                  ? 'bg-gradient-to-r from-tealbrand-950/60 to-brand-950/60 text-tealbrand-300 border border-tealbrand-700/60'
                  : 'text-slate-300 hover:text-tealbrand-300 hover:bg-tealbrand-950/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Presentation
                  size={18}
                  className="text-tealbrand-400 group-hover:scale-110 transition-transform"
                />
                <div className="flex items-center gap-1.5">
                  <span>Presentation Mode</span>
                  <span className="text-[9px] font-bold bg-tealbrand-500/20 text-tealbrand-300 px-1.5 py-0.5 rounded tracking-wide border border-tealbrand-500/30">
                    TV
                  </span>
                </div>
              </div>
              <ChevronRight
                size={14}
                className="text-slate-500 group-hover:text-tealbrand-400 group-hover:translate-x-0.5 transition-all"
              />
            </button>
          </nav>
        </div>

        {/* Divisions Navigation Group with Colorful Indicators */}
        <div>
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Divisi Kerja ({divisions.length})
            </span>
            {isSuperAdmin && (
              <button
                onClick={() => openAddModal()}
                title="Tambah Agenda untuk Pekan Ini / Mendatang"
                className="p-1 rounded text-brand-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          <nav className="space-y-1">
            {divisions.map((div) => {
              const path = `/division/${div.slug}`;
              const isActive = currentPath === path;

              return (
                <button
                  key={div.id}
                  onClick={() => handleItemClick(path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer group ${
                    isActive
                      ? 'shadow-soft font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                  style={{
                    backgroundColor: isActive ? div.colorScheme.bgLight : undefined,
                    color: isActive ? div.colorScheme.text : undefined,
                    borderWidth: '1px',
                    borderColor: isActive ? div.colorScheme.border : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className="p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-110 shadow-xs"
                      style={{
                        backgroundColor: isActive ? div.colorScheme.primary : div.colorScheme.bgLight,
                        color: isActive ? '#ffffff' : div.colorScheme.text,
                      }}
                    >
                      <DivisionIcon name={div.iconName} size={15} />
                    </div>
                    <span className="truncate">{div.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <span
                      className="text-[10px] font-black px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: div.colorScheme.badgeBg,
                        color: div.colorScheme.text,
                      }}
                    >
                      {div.progress}%
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 border-t border-slate-800/80 bg-[#0a101d]">
        <div className="bg-[#131b2e] border border-slate-700/70 rounded-2xl p-3.5 shadow-soft">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-white">Status Pekan</span>
            <span className="font-extrabold text-brand-400">{activeWeek.label}</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2 leading-relaxed font-medium">
            Data rencana kerja tersinkronisasi otomatis secara real-time.
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-brand-500 to-tealbrand-400 h-full w-[80%] rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
};
