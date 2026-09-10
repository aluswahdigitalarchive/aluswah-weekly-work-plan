import React from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { CheckCircle2, PlayCircle, AlertCircle } from 'lucide-react';

export const PresentationSlideSummary: React.FC = () => {
  const { activeWeek, weeklyStats, getDivisionsForActiveWeek } = useAgenda();
  const divisions = getDivisionsForActiveWeek();

  return (
    <div className="w-full h-full flex flex-col justify-between p-8 sm:p-12 lg:p-16 max-w-7xl mx-auto animate-fade-in select-none">
      {/* Top Header Banner */}
      <div className="text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs sm:text-sm font-black tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse shadow-glow-sm" />
          Rencana Kerja Pekan Ini
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          WEEKLY WORK PLAN
        </h1>

        <div className="flex items-center justify-center gap-3 text-lg sm:text-xl font-bold text-slate-400">
          <span className="text-brand-400 font-black">{activeWeek.label}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">{activeWeek.dateRange}</span>
        </div>
      </div>

      {/* 4 Large Summary Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-6 sm:my-8">
        {/* Total Agenda */}
        <div className="bg-[#131b2e]/90 rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-tv flex flex-col items-center text-center justify-center">
          <span className="text-xs sm:text-sm font-black tracking-widest text-slate-400 uppercase mb-2">
            Total Agenda
          </span>
          <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">
            {weeklyStats.totalAgenda}
          </span>
          <span className="mt-3 text-xs font-bold text-slate-400 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full">
            {divisions.length} Divisi Kerja
          </span>
        </div>

        {/* Selesai */}
        <div className="bg-[#131b2e]/90 rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-tv flex flex-col items-center text-center justify-center">
          <span className="text-xs sm:text-sm font-black tracking-widest text-emerald-400 uppercase mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Selesai
          </span>
          <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-emerald-400 tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            {weeklyStats.completed}
          </span>
          <span className="mt-3 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
            {weeklyStats.totalAgenda > 0
              ? `${Math.round((weeklyStats.completed / weeklyStats.totalAgenda) * 100)}% Capaian`
              : '0% Capaian'}
          </span>
        </div>

        {/* Berjalan */}
        <div className="bg-[#131b2e]/90 rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-tv flex flex-col items-center text-center justify-center">
          <span className="text-xs sm:text-sm font-black tracking-widest text-blue-400 uppercase mb-2 flex items-center gap-1.5">
            <PlayCircle size={16} /> Berjalan
          </span>
          <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-blue-400 tracking-tight drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
            {weeklyStats.inProgress}
          </span>
          <span className="mt-3 text-xs font-bold text-blue-300 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full">
            On Schedule
          </span>
        </div>

        {/* Tertunda */}
        <div className="bg-[#131b2e]/90 rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-tv flex flex-col items-center text-center justify-center">
          <span className="text-xs sm:text-sm font-black tracking-widest text-rose-400 uppercase mb-2 flex items-center gap-1.5">
            <AlertCircle size={16} /> Tertunda
          </span>
          <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-rose-400 tracking-tight drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]">
            {weeklyStats.delayed}
          </span>
          <span className="mt-3 text-xs font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-3 py-1 rounded-full">
            Tindak Lanjut Segera
          </span>
        </div>
      </div>

      {/* Colorful Grid of 8 Divisions (TV glanceable) */}
      <div className="bg-[#131b2e]/90 rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400">
            Ringkasan Eksekutif Capaian Divisi
          </span>
          <span className="text-xs font-bold text-brand-400">
            Target Rata-Rata: 85%
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {divisions.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-2xl border transition-all flex flex-col justify-between"
              style={{
                backgroundColor: d.colorScheme.bgLight,
                borderColor: d.colorScheme.border,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-extrabold text-slate-100 truncate">
                  {d.shortName}
                </span>
                <span
                  className="text-xs font-black"
                  style={{ color: d.colorScheme.text }}
                >
                  {d.progress}%
                </span>
              </div>
              <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden border border-slate-700/40">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${d.progress}%`,
                    backgroundColor: d.colorScheme.primary,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
