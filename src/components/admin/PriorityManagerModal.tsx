import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { PriorityLevel } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  X,
  Award,
  Plus,
  Trash2,
  ListChecks,
  PenTool,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const PriorityManagerModal: React.FC = () => {
  const {
    isPriorityModalOpen,
    closePriorityModal,
    priorityModalTab,
    setPriorityModalTab,
    activeWeek,
    agendas,
    divisions,
    activePriorities,
    addPriorityFromAgenda,
    addCustomPriority,
    removePriority,
    clearWeekPriorities,
  } = useAgenda();

  // Search filter for Tab 1 (Pick from agenda)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('all');

  // Form state for Tab 2 (Custom priority)
  const [customTitle, setCustomTitle] = useState('');
  const [customDivisionId, setCustomDivisionId] = useState('sdm-mutu');
  const [customLevel, setCustomLevel] = useState<PriorityLevel>('high');
  const [customTarget, setCustomTarget] = useState('Kamis, 10 Sep 2026');

  // Confirmation state for clearing
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isPriorityModalOpen) return null;

  // Filter agendas for active week
  const weekAgendas = agendas.filter((a) => a.weekNumber === activeWeek.weekNumber);

  const filteredAgendas = weekAgendas.filter((agenda) => {
    const matchSearch =
      agenda.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agenda.pic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDiv =
      selectedDivisionFilter === 'all' || agenda.divisionId === selectedDivisionFilter;
    return matchSearch && matchDiv;
  });

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const div = divisions.find((d) => d.id === customDivisionId);

    addCustomPriority({
      weekNumber: activeWeek.weekNumber,
      level: customLevel,
      title: customTitle.trim(),
      division: div ? div.name : 'Umum',
      divisionId: customDivisionId,
      target: customTarget,
      progress: 0,
    });

    setCustomTitle('');
  };

  const handleClearAll = () => {
    clearWeekPriorities();
    setShowClearConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closePriorityModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#131b2e] rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden z-10 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#0e1626]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                Kelola Prioritas Pekan Ini
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {activeWeek.label} • {activeWeek.dateRange}
              </p>
            </div>
          </div>

          <button
            onClick={closePriorityModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-800 bg-[#0e1626]/40 px-6 pt-3 gap-3">
          <button
            onClick={() => setPriorityModalTab('agenda')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              priorityModalTab === 'agenda'
                ? 'border-brand-400 text-brand-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListChecks size={16} />
            <span>Pilih dari Agenda Pekan Ini</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300">
              {weekAgendas.length}
            </span>
          </button>

          <button
            onClick={() => setPriorityModalTab('custom')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              priorityModalTab === 'custom'
                ? 'border-brand-400 text-brand-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool size={15} />
            <span>Tulis Prioritas Sendiri</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {priorityModalTab === 'agenda' ? (
            /* TAB 1: PICK FROM AGENDAS */
            <div className="space-y-4">
              {/* Search and Division Filter */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari judul agenda atau PIC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#0e1626] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <select
                  value={selectedDivisionFilter}
                  onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0e1626] border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="all">Semua Divisi</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.shortName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agenda List */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredAgendas.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-[#0e1626]/50 rounded-2xl border border-slate-800">
                    Tidak ditemukan agenda yang sesuai pencarian.
                  </div>
                ) : (
                  filteredAgendas.map((agenda) => {
                    const isAlreadyPriority = activePriorities.some(
                      (p) => p.sourceAgendaId === agenda.id || p.title === agenda.title
                    );
                    const div = divisions.find((d) => d.id === agenda.divisionId);

                    return (
                      <div
                        key={agenda.id}
                        className="p-3.5 rounded-2xl bg-[#0e1626]/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {div && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: div.colorScheme.bgLight,
                                  color: div.colorScheme.text,
                                  border: `1px solid ${div.colorScheme.border}`,
                                }}
                              >
                                {div.shortName}
                              </span>
                            )}
                            <span className="text-[11px] font-bold text-slate-400">
                              {agenda.day}, {agenda.time || '08:00'}
                            </span>
                            <PriorityBadge priority={agenda.priority} size="sm" />
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {agenda.title}
                          </h4>
                        </div>

                        <div className="shrink-0">
                          {isAlreadyPriority ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                              <CheckCircle2 size={13} /> Terpilih
                            </span>
                          ) : (
                            <button
                              onClick={() => addPriorityFromAgenda(agenda)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-300 bg-brand-500/15 hover:bg-brand-500/25 px-3 py-1.5 rounded-xl border border-brand-500/30 transition-all cursor-pointer"
                            >
                              <Plus size={14} /> Pilih
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: WRITE CUSTOM PRIORITY */
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Judul Prioritas Strategis *
                </label>
                <textarea
                  rows={2}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Contoh: Audit Mutu Internal ISO & Administrasi Lembaga..."
                  required
                  className="w-full px-4 py-2.5 bg-[#0e1626] border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Divisi Terkait
                  </label>
                  <select
                    value={customDivisionId}
                    onChange={(e) => setCustomDivisionId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0e1626] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-[#0e1626] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="high">Tinggi (High)</option>
                    <option value="medium">Sedang (Medium)</option>
                    <option value="low">Rendah (Low)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Target Tanggal
                  </label>
                  <input
                    type="text"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    placeholder="Contoh: Jumat, 11 Sep"
                    className="w-full px-3 py-2 bg-[#0e1626] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-extrabold shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                <span>Tambahkan ke Daftar Prioritas</span>
              </button>
            </form>
          )}

          {/* ACTIVE PRIORITIES PREVIEW IN MODAL */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award size={14} className="text-amber-400" />
                Daftar Prioritas Saat Ini ({activePriorities.length})
              </span>

              {activePriorities.length > 0 && !showClearConfirm && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Kosongkan Semua</span>
                </button>
              )}
            </div>

            {/* Clear confirmation warning */}
            {showClearConfirm && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2 text-xs text-rose-300 font-semibold">
                  <AlertTriangle size={15} className="text-rose-400 shrink-0" />
                  <span>Kosongkan seluruh prioritas untuk {activeWeek.label}?</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleClearAll}
                    className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Ya, Kosongkan
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* List of active priorities */}
            {activePriorities.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                Belum ada prioritas yang disematkan untuk pekan ini.
              </div>
            ) : (
              <div className="space-y-2">
                {activePriorities.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#0e1626]/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <PriorityBadge priority={item.level} size="sm" />
                        <span className="font-bold text-slate-300 truncate">
                          {item.division}
                        </span>
                      </div>
                      <p className="font-semibold text-white truncate">{item.title}</p>
                    </div>

                    <button
                      onClick={() => removePriority(item.id)}
                      title="Hapus dari Prioritas"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0e1626]/80 flex items-center justify-end">
          <button
            onClick={closePriorityModal}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-soft"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
