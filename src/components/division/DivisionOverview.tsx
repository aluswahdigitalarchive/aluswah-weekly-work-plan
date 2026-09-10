import React, { useState } from 'react';
import { Division, DayOfWeek } from '../../types';
import { DivisionIcon } from '../common/DivisionIcon';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { ChecklistButton } from '../common/ChecklistButton';
import {
  Clock,
  MapPin,
  UserCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  Presentation,
  Plus,
  Edit3,
} from 'lucide-react';
import { useAgenda } from '../../context/AgendaContext';
import { EditDivisionModal } from '../admin/EditDivisionModal';

interface DivisionOverviewProps {
  division: Division;
  onNavigateDivision: (slug: string) => void;
  onEnterPresentation: () => void;
}

export const DivisionOverview: React.FC<DivisionOverviewProps> = ({
  division,
  onNavigateDivision,
  onEnterPresentation,
}) => {
  const {
    activeWeek,
    getDivisionsForActiveWeek,
    toggleCompleteAgenda,
    isSuperAdmin,
    canManageDivision,
    canManageAgenda,
    openAddModal,
    openEditModal,
    activePriorities,
    openPriorityModal,
  } = useAgenda();

  const allDivisions = getDivisionsForActiveWeek();
  const currentDiv = allDivisions.find((d) => d.id === division.id) || division;
  const divisionPriorities = activePriorities.filter((p) => p.divisionId === division.id);
  const hasPriority = divisionPriorities.length > 0;

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [isEditDivisionModalOpen, setIsEditDivisionModalOpen] = useState<boolean>(false);

  const currentIndex = allDivisions.findIndex((d) => d.id === division.id);
  const prevDivision = currentIndex > 0 ? allDivisions[currentIndex - 1] : null;
  const nextDivision =
    currentIndex < allDivisions.length - 1 ? allDivisions[currentIndex + 1] : null;

  const days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const filteredAgendas =
    selectedDayFilter === 'all'
      ? currentDiv.agendas
      : currentDiv.agendas.filter((item) => item.day === selectedDayFilter);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <button
            onClick={() => onNavigateDivision('/')}
            className="hover:text-brand-600 transition-colors"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="text-slate-400">Divisi</span>
          <span>/</span>
          <span
            className="font-extrabold"
            style={{ color: currentDiv.colorScheme.primary }}
          >
            {currentDiv.name}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {prevDivision && (
            <button
              onClick={() => onNavigateDivision(prevDivision.slug)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-[#131b2e] hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors cursor-pointer shadow-soft"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">{prevDivision.shortName}</span>
            </button>
          )}

          {nextDivision && (
            <button
              onClick={() => onNavigateDivision(nextDivision.slug)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-[#131b2e] hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors cursor-pointer shadow-soft"
            >
              <span className="hidden sm:inline">{nextDivision.shortName}</span>
              <ChevronRight size={14} />
            </button>
          )}

          {/* Superadmin Add Agenda specifically for this division */}
          {isSuperAdmin && (
            <button
              onClick={() => openAddModal(currentDiv.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-soft cursor-pointer hover:opacity-95"
              style={{ backgroundColor: currentDiv.colorScheme.primary }}
            >
              <Plus size={15} />
              <span>Tambah Agenda</span>
            </button>
          )}

          <button
            onClick={onEnterPresentation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tealbrand-500/20 border border-tealbrand-500/40 text-tealbrand-300 hover:bg-tealbrand-500/30 text-xs font-bold transition-colors cursor-pointer"
          >
            <Presentation size={14} />
            <span className="hidden sm:inline">Slide Mode</span>
          </button>
        </div>
      </div>

      {/* Main Header Card with Colorful Ambient Accent */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-soft relative overflow-hidden text-slate-100"
        style={{
          backgroundColor: currentDiv.colorScheme.bgLight,
          borderColor: currentDiv.colorScheme.border,
        }}
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Division Title & PIC */}
            <div className="flex items-start gap-4">
              <div
                className="p-4 sm:p-5 rounded-2xl text-white shadow-soft shrink-0"
                style={{ backgroundColor: currentDiv.colorScheme.primary }}
              >
                <DivisionIcon name={currentDiv.iconName} size={30} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                    {currentDiv.name}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-[#131b2e]/90 text-slate-200 border border-white/10 shadow-xs">
                    {activeWeek.label}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  {currentDiv.roleTitle}
                </p>
                <div className="mt-2.5 flex items-center gap-3 flex-wrap text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <UserCheck size={15} className="text-slate-400" />
                    <span>Penanggung Jawab:</span>
                    <span className="font-bold text-white">{currentDiv.leadName}</span>
                  </div>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setIsEditDivisionModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand-300 bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 rounded-lg transition-all cursor-pointer shadow-xs"
                      title="Edit Subtitle & Penanggung Jawab Divisi (Superadmin)"
                    >
                      <Edit3 size={13} className="text-brand-400" />
                      <span>Edit Profil Divisi</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Gauge */}
            <div className="lg:w-80 bg-[#131b2e]/90 p-5 rounded-2xl border border-white/10 shadow-soft shrink-0">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Capaian Progres
                </span>
                <span
                  className="text-2xl font-black"
                  style={{ color: currentDiv.colorScheme.primary }}
                >
                  {currentDiv.progress}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden border border-slate-700/50">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${currentDiv.progress}%`,
                    backgroundColor: currentDiv.colorScheme.primary,
                  }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>
                  {currentDiv.completedAgenda} dari {currentDiv.totalAgenda} agenda tuntas
                </span>
                <span className="text-emerald-400 font-bold">
                  {currentDiv.progress >= 80 ? 'Optimal' : 'Dalam Proses'}
                </span>
              </div>
            </div>
          </div>

          {/* Description & Priority Highlight Alert */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-[#131b2e]/80 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Fokus & Tanggung Jawab Divisi
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {currentDiv.description}
              </p>
            </div>

            {hasPriority ? (
              <div className="bg-amber-950/40 p-4 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Award size={15} className="text-amber-400" />
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
                        Prioritas Pekan Ini
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {divisionPriorities[0].level}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100 font-bold leading-snug">
                    {divisionPriorities.map((p) => p.title).join(' • ')}
                  </p>
                </div>
                {divisionPriorities[0].target && (
                  <span className="text-[10px] font-semibold text-amber-300/80 mt-2 block">
                    Target: {divisionPriorities[0].target}
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-dashed border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                    <Award size={15} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Prioritas Pekan Ini
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-snug">
                    Belum ada fokus prioritas khusus yang disematkan untuk pekan ini.
                  </p>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => openPriorityModal('agenda')}
                    className="mt-2 text-[11px] font-bold text-brand-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Tetapkan Prioritas</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Mini Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131b2e] p-4 rounded-2xl border border-slate-700/80 shadow-soft">
          <span className="text-xs font-bold text-slate-400 block uppercase">
            Total Agenda
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
            {currentDiv.totalAgenda}
          </span>
        </div>
        <div className="bg-[#131b2e] p-4 rounded-2xl border border-emerald-500/30 shadow-soft">
          <span className="text-xs font-bold text-emerald-400 block uppercase">
            Selesai
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
            {currentDiv.completedAgenda}
          </span>
        </div>
        <div className="bg-[#131b2e] p-4 rounded-2xl border border-blue-500/30 shadow-soft">
          <span className="text-xs font-bold text-blue-400 block uppercase">
            Sedang Berjalan
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 block">
            {currentDiv.inProgressAgenda}
          </span>
        </div>
        <div className="bg-[#131b2e] p-4 rounded-2xl border border-rose-500/30 shadow-soft">
          <span className="text-xs font-bold text-rose-400 block uppercase">
            Tertunda
          </span>
          <span className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 block">
            {currentDiv.delayedAgenda}
          </span>
        </div>
      </div>

      {/* Agenda Section with Day Filter */}
      <div className="bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-soft text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base sm:text-xl font-black text-white">
              Rencana Kerja Harian (Senin – Sabtu)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Centang ceklis jika kegiatan sudah berlangsung untuk menaikkan progres divisi
            </p>
          </div>

          {/* Filter Day Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedDayFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedDayFilter === 'all'
                  ? 'bg-white text-navy-950 font-black shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Semua ({currentDiv.agendas.length})
            </button>
            {days.map((day) => {
              const count = currentDiv.agendas.filter((a) => a.day === day).length;
              if (count === 0) return null;
              const isSelected = selectedDayFilter === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDayFilter(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'text-white shadow-sm font-black'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: isSelected ? currentDiv.colorScheme.primary : undefined,
                  }}
                >
                  {day} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Agenda Cards Grid */}
        {filteredAgendas.length === 0 ? (
          <div className="p-12 text-center bg-[#0e1626]/80 rounded-2xl border border-dashed border-slate-800 space-y-3">
            <p className="text-sm font-semibold text-slate-400">
              Tidak ada agenda terdaftar untuk filter ini pada {activeWeek.label}.
            </p>
            {(isSuperAdmin || canManageDivision(currentDiv.id)) && (
              <button
                onClick={() => openAddModal(currentDiv.id)}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-soft"
                style={{ backgroundColor: currentDiv.colorScheme.primary }}
              >
                + Tambahkan Agenda Baru
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredAgendas.map((agenda) => {
              const isCompleted = agenda.status === 'completed';

              return (
                <div
                  key={agenda.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-emerald-950/20 border-emerald-800/40 shadow-xs'
                      : 'bg-[#0e1626]/90 border-slate-800 hover:bg-[#111c33] hover:border-slate-700 hover:shadow-soft'
                  }`}
                >
                  <div>
                    {/* Top Badges & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/30">
                          {agenda.day}
                        </span>
                        {agenda.time && (
                          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Clock size={12} className="text-slate-400" />
                            {agenda.time}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={agenda.priority} size="sm" />
                        <StatusBadge status={agenda.status} size="sm" />

                        {/* Edit Button (Superadmin or assigned Division) */}
                        {canManageAgenda(agenda) && (
                          <button
                            onClick={() => openEditModal(agenda)}
                            title="Sunting Agenda Ini"
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title with Interactive Checklist */}
                    <div className="flex items-start gap-3 mt-1.5">
                      <div className="pt-0.5 shrink-0">
                        <ChecklistButton
                          isCompleted={isCompleted}
                          onToggle={() => canManageAgenda(agenda) && toggleCompleteAgenda(agenda.id)}
                          disabled={!canManageAgenda(agenda)}
                          size="md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`text-sm sm:text-base font-extrabold text-white leading-snug transition-all ${
                            isCompleted ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {agenda.title}
                        </h3>

                        {agenda.notes && (
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-[#162035]/90 p-2.5 rounded-xl border border-slate-700/50">
                            {agenda.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer PIC & Location */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={13} className="text-slate-400" />
                      <span className="font-bold text-slate-200">{agenda.pic}</span>
                    </div>
                    {agenda.location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin size={12} />
                        <span>{agenda.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isSuperAdmin && isEditDivisionModalOpen && (
        <EditDivisionModal
          isOpen={isEditDivisionModalOpen}
          onClose={() => setIsEditDivisionModalOpen(false)}
          division={currentDiv}
        />
      )}
    </div>
  );
};
