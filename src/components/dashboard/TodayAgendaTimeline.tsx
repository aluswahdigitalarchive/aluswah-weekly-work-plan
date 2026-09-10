import React from 'react';
import { AgendaItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ChecklistButton } from '../common/ChecklistButton';
import { Clock, MapPin, UserCheck, Edit3 } from 'lucide-react';
import { useAgenda } from '../../context/AgendaContext';

interface TodayAgendaTimelineProps {
  agendas: AgendaItem[];
  onSelectDivision?: (divisionId: string) => void;
}

export const TodayAgendaTimeline: React.FC<TodayAgendaTimelineProps> = ({
  agendas,
  onSelectDivision,
}) => {
  const { toggleCompleteAgenda, canManageAgenda, openEditModal, activeWeek, divisions } = useAgenda();
  const maxItems = 4;
  const displayedAgendas = agendas.slice(0, maxItems);
  const remainingCount = Math.max(0, agendas.length - maxItems);

  return (
    <div className="bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-soft h-full flex flex-col text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-black text-white">
              Agenda Hari Ini
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30">
              {activeWeek.label}
            </span>
            {agendas.length > maxItems && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800/90 text-slate-300 rounded-full border border-slate-700/60">
                Menampilkan 4 dari {agendas.length}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Klik ceklis jika kegiatan sudah berlangsung / selesai
          </p>
        </div>
      </div>

      {/* Visual Timeline */}
      {displayedAgendas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <p className="text-sm font-semibold text-slate-400">
            Belum ada agenda tercatat untuk hari ini pada {activeWeek.label}.
          </p>
        </div>
      ) : (
        <div className="relative pl-7 space-y-6 flex-1 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {displayedAgendas.map((item) => {
            const isCompleted = item.status === 'completed';
            const division = divisions.find((d) => d.id === item.divisionId);

            return (
              <div key={item.id} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-7 top-1.5 w-6 h-6 rounded-full border-4 border-[#131b2e] shadow-sm flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 ring-2 ring-emerald-500/40'
                      : item.status === 'in-progress'
                      ? 'bg-blue-500 ring-2 ring-blue-500/40 animate-pulse'
                      : 'bg-amber-400 ring-2 ring-amber-400/40'
                  }`}
                />

                {/* Card content */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-emerald-950/20 border-emerald-800/40 shadow-xs'
                      : 'bg-[#0e1626]/90 border-slate-800/90 hover:bg-[#111c33] hover:border-slate-700 hover:shadow-soft'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-black text-brand-300 bg-brand-500/15 px-2.5 py-0.5 rounded-lg border border-brand-500/30">
                        <Clock size={12} />
                        {item.time || '08:00'}
                      </span>

                      {division && (
                        <button
                          onClick={() => onSelectDivision && onSelectDivision(division.slug)}
                          className="text-xs font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                          style={{
                            backgroundColor: division.colorScheme.bgLight,
                            color: division.colorScheme.text,
                            border: `1px solid ${division.colorScheme.border}`,
                          }}
                        >
                          {division.shortName}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} size="sm" />
                      {/* Edit Button (Superadmin or assigned Division) */}
                      {canManageAgenda(item) && (
                        <button
                          onClick={() => openEditModal(item)}
                          title="Sunting Agenda Ini"
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Interactive Checklist */}
                  <div className="flex items-start gap-3 mt-1.5">
                    <div className="pt-0.5 shrink-0">
                      <ChecklistButton
                        isCompleted={isCompleted}
                        onToggle={() => canManageAgenda(item) && toggleCompleteAgenda(item.id)}
                        disabled={!canManageAgenda(item)}
                        size="md"
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-sm sm:text-base font-extrabold text-white leading-snug transition-all ${
                          isCompleted ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.title}
                      </h3>

                      {item.notes && (
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-[#162035]/90 p-2.5 rounded-xl border border-slate-700/50">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={13} className="text-slate-400" />
                      <span className="font-semibold text-slate-200">{item.pic}</span>
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin size={12} />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {remainingCount > 0 && (
            <div className="pt-2 text-center">
              <span className="text-xs font-semibold text-slate-400 bg-slate-900/60 py-1.5 px-3.5 rounded-full border border-slate-800 inline-block">
                +{remainingCount} agenda lainnya hari ini dapat dipantau di menu divisi
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
