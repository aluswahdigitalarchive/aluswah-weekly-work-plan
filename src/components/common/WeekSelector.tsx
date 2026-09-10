import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Check, Plus } from 'lucide-react';
import { WeekInfo } from '../../types';
import { useAgenda } from '../../context/AgendaContext';

interface WeekSelectorProps {
  currentWeek: WeekInfo;
  onSelectWeek: (week: WeekInfo) => void;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentWeek,
  onSelectWeek,
}) => {
  const { availableWeeks, isSuperAdmin, allPlans, activateWeeklyPlan, openWeeklyPlanModal } = useAgenda();
  const [isOpen, setIsOpen] = useState(false);

  const activeCurrentWeek =
    availableWeeks.find((w) => w.label.includes('Saat Ini')) || availableWeeks[0] || currentWeek;

  const currentIndex = availableWeeks.findIndex(
    (w) => w.weekNumber === currentWeek.weekNumber
  );

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectWeek(availableWeeks[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < availableWeeks.length - 1) {
      onSelectWeek(availableWeeks[currentIndex + 1]);
    }
  };

  const handleCurrent = () => {
    onSelectWeek(activeCurrentWeek);
  };

  return (
    <div className="relative flex items-center gap-1.5 bg-[#131b2e] border border-slate-700/80 rounded-2xl p-1 shadow-soft text-slate-100">
      {/* Prev Button */}
      <button
        onClick={handlePrev}
        disabled={currentIndex <= 0}
        title="Pekan Sebelumnya"
        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Week Dropdown Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors text-left cursor-pointer group"
        >
          <CalendarDays size={16} className="text-brand-400 group-hover:text-brand-300" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                {currentWeek.label}
              </span>
              {currentWeek.weekNumber === activeCurrentWeek.weekNumber && (
                <span className="text-[10px] bg-brand-500/20 text-brand-300 font-bold px-1.5 py-0.2 rounded border border-brand-500/30">
                  Saat Ini
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {currentWeek.dateRange}
            </span>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#131b2e] rounded-2xl shadow-elevated border border-slate-700 p-2 z-50 animate-fade-in text-slate-100">
              <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pilih Periode Pekan
              </div>
              <div className="space-y-1 mt-1">
                {availableWeeks.map((week) => {
                  const isSelected = week.weekNumber === currentWeek.weekNumber;
                  const isNow = week.weekNumber === activeCurrentWeek.weekNumber;
                  const planRow = allPlans.find((p) => p.week_number === week.weekNumber);

                  return (
                    <div
                      key={week.weekNumber}
                      onClick={() => {
                        onSelectWeek(week);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/40'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{week.label}</span>
                          {isNow ? (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                              Active
                            </span>
                          ) : isSuperAdmin && planRow ? (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm(`Jadikan ${week.label} sebagai pekan aktif utama?`)) {
                                  await activateWeeklyPlan(planRow.id);
                                  setIsOpen(false);
                                }
                              }}
                              title="Jadikan Pekan Aktif Utama"
                              className="text-[9px] text-slate-400 hover:text-emerald-300 bg-slate-800/80 hover:bg-emerald-500/20 px-1.5 py-0.5 rounded border border-slate-700 hover:border-emerald-500/30 transition-all font-semibold"
                            >
                              Jadikan Aktif
                            </button>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{week.dateRange}</p>
                      </div>
                      {isSelected && <Check size={16} className="text-brand-400 shrink-0 ml-2" />}
                    </div>
                  );
                })}
              </div>

              {/* Superadmin: Create New Week Button */}
              {isSuperAdmin && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      openWeeklyPlanModal();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 transition-colors cursor-pointer"
                  >
                    <Plus size={14} className="text-brand-400" />
                    <span>+ Buat Periode Pekan Baru</span>
                  </button>
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    handleCurrent();
                    setIsOpen(false);
                  }}
                  className="text-xs text-brand-400 hover:text-brand-300 font-bold px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Kembali ke Pekan Ini
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentIndex >= availableWeeks.length - 1}
        title="Pekan Berikutnya"
        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
