import React from 'react';
import { Division, WeekInfo, DayOfWeek } from '../../types';
import { DivisionIcon } from '../common/DivisionIcon';
import { StatusBadge } from '../common/StatusBadge';
import { useAgenda } from '../../context/AgendaContext';
import {
  Clock,
  UserCheck,
  Award,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';

interface PresentationSlideDivisionProps {
  division: Division;
  currentWeek: WeekInfo;
}

export const PresentationSlideDivision: React.FC<PresentationSlideDivisionProps> = ({
  division,
  currentWeek,
}) => {
  const { activePriorities, activeWeek } = useAgenda();
  const divisionPriorities = activePriorities.filter((p) => p.divisionId === division.id);
  const hasPriority = divisionPriorities.length > 0;
  const primaryPriority = divisionPriorities[0];

  // If division has > 4 agendas in the week, omit completed agendas to make room for newly scheduled/upcoming ones
  const mainAgendas = (() => {
    if (division.agendas.length <= 4) {
      return division.agendas;
    }

    const pendingAndActive = division.agendas.filter((a) => a.status !== 'completed');
    const completedAgendas = division.agendas.filter((a) => a.status === 'completed');

    let selected: typeof division.agendas = [];

    // If active/upcoming agendas are 4 or more, take the first 4 active ones (omitting completed ones)
    if (pendingAndActive.length >= 4) {
      selected = pendingAndActive.slice(0, 4);
    } else {
      // If active/upcoming are fewer than 4, take all active ones and fill remaining spots with latest completed
      const neededFromCompleted = 4 - pendingAndActive.length;
      const recentCompleted = completedAgendas.slice(-neededFromCompleted);
      selected = [...recentCompleted, ...pendingAndActive];
    }

    // Sort chronologically by day
    const dayOrder: Record<string, number> = {
      Senin: 1,
      Selasa: 2,
      Rabu: 3,
      Kamis: 4,
      Jumat: 5,
      Sabtu: 6,
      Minggu: 7,
    };

    return selected.sort((a, b) => (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0));
  })();

  // Determine current day of week (e.g. 'Selasa')
  const dayNames: DayOfWeek[] = [
    'Minggu', // 0
    'Senin', // 1
    'Selasa', // 2
    'Rabu', // 3
    'Kamis', // 4
    'Jumat', // 5
    'Sabtu', // 6
  ];
  const currentDayOfWeek = dayNames[new Date().getDay()] || 'Selasa';
  const isCurrentWeek = currentWeek.weekNumber === activeWeek.weekNumber;

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto animate-fade-in select-none">
      {/* Top Bar: Division Identity & Progress Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-tv flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors backdrop-blur-md"
        style={{
          backgroundColor: division.colorScheme.bgLight,
          borderColor: division.colorScheme.border,
        }}
      >
        <div className="flex items-center gap-5">
          <div
            className="p-4 sm:p-5 rounded-2xl text-white shadow-medium shrink-0"
            style={{ backgroundColor: division.colorScheme.primary }}
          >
            <DivisionIcon name={division.iconName} size={36} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-black tracking-widest uppercase bg-[#131b2e]/90 px-3 py-1 rounded-full border border-slate-700 text-slate-200 shadow-xs">
                {currentWeek.label}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400">
                {currentWeek.dateRange}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mt-1">
              {division.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-slate-400">
              <UserCheck size={16} className="text-slate-400" />
              <span>Penanggung Jawab:</span>
              <span className="font-extrabold text-white">{division.leadName}</span>
            </div>
          </div>
        </div>

        {/* Large Progress Gauge for TV */}
        <div className="md:w-80 bg-[#131b2e]/90 p-5 rounded-2xl border border-slate-700/60 shadow-soft shrink-0 backdrop-blur-md">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Progres Pekan Ini
            </span>
            <span
              className="text-3xl sm:text-4xl font-black"
              style={{ color: division.colorScheme.text }}
            >
              {division.progress}%
            </span>
          </div>
          <div className="w-full bg-slate-900/80 rounded-full h-4 p-0.5 overflow-hidden border border-slate-700/40">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
              style={{
                width: `${division.progress}%`,
                backgroundColor: division.colorScheme.primary,
              }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={14} /> {division.completedAgenda} Selesai
            </span>
            <span className="text-blue-400 flex items-center gap-1">
              <PlayCircle size={14} /> {division.inProgressAgenda} Berjalan
            </span>
            {division.delayedAgenda > 0 && (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertCircle size={14} /> {division.delayedAgenda} Tertunda
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Content: Main Agendas Grid + Priority Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1">
        {/* Main Agenda Cards (2 Cols) */}
        <div className="lg:col-span-2 space-y-3.5 flex flex-col justify-center">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400">
              Agenda Utama & Rencana Lapangan
            </span>
            <div className="flex items-center gap-2">
              {division.agendas.length > 4 && (
                <span className="text-[11px] font-semibold text-slate-400 bg-[#131b2e] px-2.5 py-0.5 rounded-full border border-slate-700/60">
                  Menampilkan {mainAgendas.length} dari {division.agendas.length}
                </span>
              )}
              <span className="text-xs font-bold text-brand-400">
                {division.agendas.length} Total Agenda
              </span>
            </div>
          </div>

          {mainAgendas.length === 0 ? (
            <div className="bg-[#131b2e] rounded-3xl p-8 text-center border border-slate-800">
              <p className="text-sm font-semibold text-slate-500">
                Belum ada agenda terdaftar untuk pekan ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mainAgendas.map((item) => {
                const isCompleted = item.status === 'completed';
                const isToday = isCurrentWeek && item.day === currentDayOfWeek;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#0a0f1d]/65 border border-slate-800/60 opacity-50 grayscale-[35%] shadow-none hover:opacity-75'
                        : isToday
                        ? 'bg-[#15233e] border-2 shadow-2xl z-10'
                        : 'bg-[#131b2e]/95 border border-slate-800 shadow-soft hover:border-slate-700'
                    }`}
                    style={
                      !isCompleted && isToday
                        ? {
                            borderColor: division.colorScheme.primary,
                            boxShadow: `0 0 28px ${division.colorScheme.primary}80, 0 0 60px ${division.colorScheme.primary}35, inset 0 0 18px ${division.colorScheme.primary}25`,
                          }
                        : undefined
                    }
                  >
                    {/* Top Neon Ambient Glowing Bar (only for active today agendas) */}
                    {!isCompleted && isToday && (
                      <div
                        className="absolute top-0 inset-x-0 h-1.5 rounded-t-2xl animate-pulse"
                        style={{
                          backgroundColor: division.colorScheme.primary,
                          boxShadow: `0 0 16px ${division.colorScheme.primary}`,
                        }}
                      />
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border transition-all ${
                              isCompleted
                                ? 'bg-slate-900/60 text-slate-500 border-slate-800/60'
                                : isToday
                                ? 'text-white border-transparent'
                                : 'bg-brand-500/15 text-brand-300 border-brand-500/30'
                            }`}
                            style={
                              !isCompleted && isToday
                                ? {
                                    backgroundColor: division.colorScheme.primary,
                                    boxShadow: `0 0 12px ${division.colorScheme.primary}90`,
                                  }
                                : undefined
                            }
                          >
                            {item.day}
                          </span>

                          {/* NEON "HARI INI" PULSING BADGE (for today's ongoing/upcoming agenda) */}
                          {!isCompleted && isToday && (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm animate-pulse"
                              style={{
                                backgroundColor: division.colorScheme.primary,
                                boxShadow: `0 0 16px ${division.colorScheme.primary}`,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              HARI INI
                            </span>
                          )}

                          {/* Completed Subdued Badge */}
                          {isCompleted && (
                            <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                              SELESAI
                            </span>
                          )}
                        </div>

                        <div className={isCompleted ? 'opacity-70' : ''}>
                          <StatusBadge status={item.status} size="sm" />
                        </div>
                      </div>

                      <h3
                        className={`text-sm sm:text-base leading-snug line-clamp-2 ${
                          isCompleted
                            ? 'line-through text-slate-500 font-medium'
                            : isToday
                            ? 'text-white font-extrabold drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                            : 'text-slate-100 font-extrabold'
                        }`}
                      >
                        {item.title}
                      </h3>

                      {item.notes && (
                        <p
                          className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                            isCompleted
                              ? 'text-slate-600'
                              : isToday
                              ? 'text-slate-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div
                      className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                        isCompleted
                          ? 'border-slate-800/40 text-slate-600'
                          : isToday
                          ? 'border-slate-700/80 text-slate-300'
                          : 'border-slate-800 text-slate-500'
                      }`}
                    >
                      <span
                        className={`flex items-center gap-1 font-bold truncate max-w-[140px] ${
                          isCompleted ? 'text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        <UserCheck
                          size={13}
                          className={
                            isCompleted
                              ? 'text-slate-600'
                              : isToday
                              ? 'text-cyan-400'
                              : 'text-brand-400'
                          }
                        />
                        {item.pic}
                      </span>
                      {item.time && (
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            isCompleted
                              ? 'text-slate-600'
                              : isToday
                              ? 'text-white font-bold'
                              : 'text-slate-400'
                          }`}
                          style={
                            !isCompleted && isToday
                              ? {
                                  textShadow: `0 0 10px ${division.colorScheme.primary}`,
                                }
                              : undefined
                          }
                        >
                          <Clock size={12} />
                          {item.time}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Priority Spotlight & Weekly Schedule glance */}
        <div className="space-y-4 flex flex-col justify-center">
          {/* Priority Card */}
          {hasPriority ? (
            <div
              className="text-white rounded-3xl p-6 sm:p-7 shadow-tv relative overflow-hidden border border-slate-700/50"
              style={{
                background: `linear-gradient(135deg, ${division.colorScheme.primary} 0%, #0b0f19 100%)`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Award size={20} className="text-white/80" />
                <span className="text-xs font-black uppercase tracking-widest text-white/90">
                  FOKUS PRIORITAS
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black leading-snug text-white">
                {divisionPriorities.map((p) => p.title).join(' • ')}
              </h3>
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/90 font-bold">
                <span>{primaryPriority.target || currentWeek.label}</span>
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-white font-black uppercase">
                  {primaryPriority.level} FOCUS
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#131b2e]/60 rounded-3xl p-6 sm:p-7 border border-dashed border-slate-800 text-slate-400 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Award size={20} />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    FOKUS PRIORITAS
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-400 leading-snug">
                  Tidak ada fokus prioritas khusus untuk pekan ini.
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Divisi ini berfokus pada kelancaran seluruh kegiatan reguler.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>{currentWeek.label}</span>
                <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-full text-slate-400 font-bold">
                  REGULAR FLOW
                </span>
              </div>
            </div>
          )}

          {/* Quick Schedule by Day Pills */}
          <div className="bg-[#131b2e]/90 rounded-3xl p-5 border border-slate-800 shadow-soft">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-3">
              Jadwal Hari Pekan Ini
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => {
                const count = division.agendas.filter((a) => a.day === day).length;
                const isDayToday = isCurrentWeek && day === currentDayOfWeek;

                return (
                  <div
                    key={day}
                    className={`p-2 rounded-xl text-xs transition-all relative overflow-hidden ${
                      isDayToday
                        ? 'ring-2 ring-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.5)] font-black'
                        : count > 0
                        ? 'font-bold'
                        : 'bg-slate-900/60 text-slate-500 border border-slate-800'
                    }`}
                    style={{
                      backgroundColor: isDayToday
                        ? `${division.colorScheme.primary}25`
                        : count > 0
                        ? division.colorScheme.bgLight
                        : undefined,
                      color: isDayToday
                        ? '#ffffff'
                        : count > 0
                        ? division.colorScheme.text
                        : undefined,
                      border: isDayToday
                        ? `2px solid ${division.colorScheme.primary}`
                        : count > 0
                        ? `1px solid ${division.colorScheme.border}`
                        : undefined,
                      boxShadow: isDayToday
                        ? `0 0 16px ${division.colorScheme.primary}90`
                        : undefined,
                    }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className={`block text-[10px] uppercase font-bold ${isDayToday ? 'text-cyan-300' : 'text-slate-500'}`}>
                        {day.slice(0, 3)}
                      </span>
                      {isDayToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <span className="text-sm font-black">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="text-center text-xs text-slate-500 font-semibold tracking-wider">
        WEEKLY WORK PLAN DIGITAL SIGNAGE • {currentWeek.label.toUpperCase()} ({currentWeek.dateRange.toUpperCase()})
      </div>
    </div>
  );
};
