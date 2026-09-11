import React from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { DivisionProgress } from '../components/dashboard/DivisionProgress';
import { TodayAgendaTimeline } from '../components/dashboard/TodayAgendaTimeline';
import { PriorityList } from '../components/dashboard/PriorityList';
import {
  Layers,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  Presentation,
  Plus,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';

interface DashboardPageProps {
  onNavigateDivision: (slug: string) => void;
  onEnterPresentation: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateDivision,
  onEnterPresentation,
}) => {
  const {
    activeWeek,
    weeklyStats,
    todayAgendas,
    getDivisionsForActiveWeek,
    isSuperAdmin,
    openAddModal,
  } = useAgenda();

  const divisions = getDivisionsForActiveWeek();

  return (
    <div className="space-y-8">
      {/* Executive Welcome & Header Banner */}
      <div className="bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden text-slate-100">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-600/20 via-tealbrand-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xs font-black uppercase tracking-widest text-brand-300 bg-brand-500/20 px-3 py-1 rounded-full border border-brand-500/30">
              Weekly Overview
            </span>
            <span className="text-xs font-extrabold text-slate-400">
              {activeWeek.label}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Rencana Kerja Pekan Ini
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Periode: <strong className="text-white">{activeWeek.dateRange}</strong> • Papan Rencana Kerja Digital Seluruh Divisi Yayasan Al Uswah
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          {isSuperAdmin && (
            <button
              onClick={() => openAddModal()}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-xs sm:text-sm font-bold border border-brand-500/40 shadow-soft transition-all cursor-pointer"
            >
              <Plus size={16} className="text-brand-400" />
              <span>Tambah Agenda</span>
            </button>
          )}

          <button
            onClick={onEnterPresentation}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:from-brand-500 hover:to-tealbrand-500 text-white text-xs sm:text-sm font-extrabold shadow-soft hover:shadow-medium transition-all cursor-pointer group"
          >
            <Presentation size={18} className="group-hover:scale-110 transition-transform" />
            <span>Mode Presentasi TV</span>
          </button>
        </div>
      </div>

      {/* 4 Large Statistic Cards with Live Calculations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="TOTAL AGENDA"
          value={weeklyStats.totalAgenda}
          subtitle="Agenda terdaftar seluruh divisi"
          icon={Layers}
          variant="total"
        />
        <StatCard
          label="SELESAI"
          value={weeklyStats.completed}
          subtitle="Capaian target tuntas"
          icon={CheckCircle2}
          variant="completed"
          trend={
            weeklyStats.totalAgenda > 0
              ? `${Math.round((weeklyStats.completed / weeklyStats.totalAgenda) * 100)}%`
              : '0%'
          }
        />
        <StatCard
          label="BERJALAN"
          value={weeklyStats.inProgress}
          subtitle="Sedang dalam pelaksanaan"
          icon={PlayCircle}
          variant="progress"
        />
        <StatCard
          label="TERTUNDA"
          value={weeklyStats.delayed}
          subtitle="Perlu tindak lanjut / reschedule"
          icon={AlertCircle}
          variant="delayed"
        />
      </div>

      {/* Division Progress Grid (8 Divisions with colorful aesthetic badges) */}
      <DivisionProgress
        divisions={divisions}
        onSelectDivision={onNavigateDivision}
      />

      {/* 2-Column Section: Today's Agenda Timeline & Priority this week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TodayAgendaTimeline
          agendas={todayAgendas}
          onSelectDivision={onNavigateDivision}
        />
        <PriorityList />
      </div>
    </div>
  );
};
