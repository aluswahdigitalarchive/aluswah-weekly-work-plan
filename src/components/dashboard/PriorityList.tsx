import React from 'react';
import { PriorityBadge } from '../common/PriorityBadge';
import { Calendar, Award, Settings, Plus, ListChecks, Trash2 } from 'lucide-react';
import { useAgenda } from '../../context/AgendaContext';

export const PriorityList: React.FC = () => {
  const {
    activeWeek,
    getDivisionsForActiveWeek,
    activePriorities,
    openPriorityModal,
    removePriority,
    isSuperAdmin,
  } = useAgenda();
  const divisions = getDivisionsForActiveWeek();

  return (
    <div className="bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-soft h-full flex flex-col text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-black text-white">
              Prioritas Pekan Ini
            </h2>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                activePriorities.length > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {activePriorities.length > 0 ? 'High Focus' : 'Kosong'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Agenda strategis yang wajib dituntaskan pada {activeWeek.label}
          </p>
        </div>

        {/* Action button to manage priorities */}
        <button
          onClick={() => openPriorityModal('agenda')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e1626] hover:bg-[#18233c] text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700/80 transition-all cursor-pointer shadow-xs"
        >
          <Settings size={13} className="text-amber-400" />
          <span>Kelola Prioritas</span>
        </button>
      </div>

      <div className="space-y-3.5 flex-1">
        {activePriorities.length === 0 ? (
          /* Empty state */
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300">
                Belum ada prioritas yang disematkan
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Pekan ini dapat dibiarkan kosong, atau Anda dapat memilih dari agenda yang sudah ada maupun membuat prioritas kustom.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={() => openPriorityModal('agenda')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 text-xs font-bold border border-brand-500/30 transition-all cursor-pointer"
              >
                <ListChecks size={13} />
                <span>Pilih dari Agenda</span>
              </button>
              <button
                onClick={() => openPriorityModal('custom')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>Tambah Mandiri</span>
              </button>
            </div>
          </div>
        ) : (
          activePriorities.map((item) => {
            const div = divisions.find((d) => d.id === item.divisionId);
            const progress =
              item.progress !== undefined
                ? item.progress
                : div
                ? div.progress
                : 0;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#0e1626]/90 hover:bg-[#111c33] hover:border-slate-700 hover:shadow-soft transition-all group relative"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={item.level} size="sm" />
                    {div && (
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-lg"
                        style={{
                          backgroundColor: div.colorScheme.bgLight,
                          color: div.colorScheme.text,
                          border: `1px solid ${div.colorScheme.border}`,
                        }}
                      >
                        {div.name}
                      </span>
                    )}
                  </div>

                  {/* Remove button */}
                  {isSuperAdmin && (
                    <button
                      onClick={() => removePriority(item.id)}
                      title="Hapus dari daftar prioritas"
                      className="opacity-60 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                  {item.title}
                </h3>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-800/80 font-medium">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={13} />
                    <span>Target: {item.target}</span>
                  </div>
                  <span className="font-bold text-slate-200">
                    {progress}% Selesai
                  </span>
                </div>

                <div className="mt-1.5 w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: div ? div.colorScheme.primary : '#0ea5e9',
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
