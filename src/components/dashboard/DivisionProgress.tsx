import React from 'react';
import { Division } from '../../types';
import { DivisionIcon } from '../common/DivisionIcon';
import { ArrowUpRight, Plus } from 'lucide-react';
import { useAgenda } from '../../context/AgendaContext';

interface DivisionProgressProps {
  divisions: Division[];
  onSelectDivision: (slug: string) => void;
}

export const DivisionProgress: React.FC<DivisionProgressProps> = ({
  divisions,
  onSelectDivision,
}) => {
  const { isSuperAdmin, openAddModal, activeWeek } = useAgenda();

  return (
    <div className="bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-soft text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-black text-white">
              Progress Seluruh Divisi
            </h2>
            <span className="text-xs font-extrabold px-2.5 py-0.5 bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30">
              {activeWeek.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Capaian eksekusi program kerja seluruh unit yayasan & pendidikan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              onClick={() => openAddModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-xs font-bold border border-brand-500/40 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Agenda</span>
            </button>
          )}
          <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-slate-300 rounded-xl border border-slate-700">
            {divisions.length} Divisi Aktif
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {divisions.map((div) => {
          return (
            <div
              key={div.id}
              onClick={() => onSelectDivision(div.slug)}
              className="p-5 rounded-2xl border transition-all duration-300 cursor-pointer group hover:shadow-medium hover:-translate-y-0.5 relative overflow-hidden"
              style={{
                backgroundColor: div.colorScheme.bgLight,
                borderColor: div.colorScheme.border,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 truncate">
                  <div
                    className="p-2.5 rounded-xl text-white shadow-soft transition-transform group-hover:scale-110 shrink-0"
                    style={{ backgroundColor: div.colorScheme.primary }}
                  >
                    <DivisionIcon name={div.iconName} size={18} />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:underline transition-colors truncate">
                      {div.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {div.totalAgenda} Agenda Pekanan
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-base sm:text-lg font-black"
                    style={{ color: div.colorScheme.text }}
                  >
                    {div.progress}%
                  </span>
                  <div className="p-1 rounded-lg bg-slate-800/80 text-slate-400 group-hover:text-white transition-colors border border-slate-700/50">
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="my-2">
                <div className="w-full bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/50 p-0.5 h-3">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                    style={{
                      width: `${div.progress}%`,
                      backgroundColor: div.colorScheme.primary,
                    }}
                  />
                </div>
              </div>

              {/* Sub status summary */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="truncate max-w-[180px]">
                  PIC: {div.leadName.split(',')[0]}
                </span>
                <span className="font-bold text-slate-200">
                  {div.completedAgenda} selesai <span className="text-slate-500">•</span> {div.inProgressAgenda} berjalan
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
