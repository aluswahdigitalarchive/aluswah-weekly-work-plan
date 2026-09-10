import React from 'react';
import { useAgenda } from '../../context/AgendaContext';

export const WeeklyTimeline: React.FC = () => {
  const { dayAgendaCounts, activeWeek } = useAgenda();
  const currentDayName = 'TUE'; // Active day

  return (
    <div className="bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-soft text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-black text-white">
              Distribusi Agenda Pekanan
            </h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
              {activeWeek.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Sebaran beban kerja dan agenda kegiatan harian (Senin — Sabtu)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span>Hari Ini</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span>Hari Lainnya</span>
          </div>
        </div>
      </div>

      {/* Grid of days: MON, TUE, WED, THU, FRI, SAT */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {dayAgendaCounts.map((d) => {
          const isToday = d.day === currentDayName && activeWeek.weekNumber === 37;

          return (
            <div
              key={d.day}
              className={`p-4 sm:p-5 rounded-2xl border text-center transition-all duration-200 ${
                isToday
                  ? 'bg-gradient-to-b from-brand-950/60 to-[#0e1626] border-brand-500/50 shadow-soft ring-2 ring-brand-500/20'
                  : 'bg-[#0e1626]/80 border-slate-800 hover:bg-[#111c33] hover:border-slate-700 hover:shadow-soft'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span
                  className={`text-xs font-black tracking-wider ${
                    isToday ? 'text-brand-400' : 'text-slate-400'
                  }`}
                >
                  {d.day}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-medium mb-2">
                {d.fullDay}
              </div>

              <div className="my-2">
                <span
                  className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    isToday ? 'text-brand-400' : 'text-white'
                  }`}
                >
                  {d.count}
                </span>
              </div>

              <span
                className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md ${
                  isToday
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                AGENDA
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
