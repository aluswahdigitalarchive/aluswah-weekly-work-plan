import React, { useState } from 'react';
import { Division, AgendaItem } from '../../types';
import { useAgenda } from '../../context/AgendaContext';
import { DivisionIcon } from '../common/DivisionIcon';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import {
  X,
  Award,
  Clock,
  MapPin,
  User,
  Plus,
  Check,
  Trash2,
  Search,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface SelectDivisionPriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  division: Division;
}

export const SelectDivisionPriorityModal: React.FC<SelectDivisionPriorityModalProps> = ({
  isOpen,
  onClose,
  division,
}) => {
  const {
    activeWeek,
    agendas,
    activePriorities,
    setDivisionPriorityFromAgenda,
    removeDivisionPriority,
    openAddModal,
    isSuperAdmin,
    canManageDivision,
  } = useAgenda();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Agendas for this division in the active week
  const divisionAgendas = agendas.filter(
    (a) =>
      a.weekNumber === activeWeek.weekNumber &&
      (a.divisionId === division.id || a.divisionId === division.slug)
  );

  const filteredAgendas = divisionAgendas.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      (a.pic && a.pic.toLowerCase().includes(q)) ||
      (a.notes && a.notes.toLowerCase().includes(q))
    );
  });

  // Check current division priority in active week
  const currentPriority = activePriorities.find(
    (p) => p.divisionId === division.id || p.division === division.name
  );

  const handleSelectPriority = async (agenda: AgendaItem) => {
    setIsSubmitting(true);
    try {
      await setDivisionPriorityFromAgenda(agenda);
      onClose();
    } catch (err) {
      console.error('Gagal menetapkan prioritas:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePriority = async () => {
    setIsSubmitting(true);
    try {
      await removeDivisionPriority(division.id);
      onClose();
    } catch (err) {
      console.error('Gagal menghapus prioritas:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = isSuperAdmin || canManageDivision(division.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative bg-[#131b2e] rounded-3xl shadow-2xl border border-slate-700 w-full max-w-2xl overflow-hidden z-10 animate-slide-up text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-800"
          style={{
            background: `linear-gradient(to right, ${division.colorScheme.bgLight}, #131b2e)`,
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="p-2.5 rounded-xl text-white shadow-soft shrink-0"
              style={{ backgroundColor: division.colorScheme.primary }}
            >
              <DivisionIcon name={division.iconName} size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white">
                  Pilih Prioritas Pekan Ini
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {activeWeek.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {division.name} &bull; Pilih agenda yang menjadi fokus utama pekan ini
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Active Priority Highlight (if already set) */}
        {currentPriority && (
          <div className="px-6 sm:px-8 py-3.5 bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Award size={18} className="text-amber-400 shrink-0" />
              <div className="text-xs truncate">
                <span className="text-amber-300 font-bold uppercase tracking-wider text-[10px] block">
                  Prioritas Saat Ini:
                </span>
                <span className="text-white font-black truncate block">
                  {currentPriority.title}
                </span>
              </div>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={handleRemovePriority}
                disabled={isSubmitting}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={12} />
                <span>Lepas Prioritas</span>
              </button>
            )}
          </div>
        )}

        {/* Search bar & count */}
        <div className="px-6 sm:px-8 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari dari daftar agenda divisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0e1626] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="text-xs text-slate-400 font-semibold shrink-0">
            Tersedia <span className="text-white font-bold">{divisionAgendas.length}</span> agenda
          </div>
        </div>

        {/* Modal Body / Agenda List */}
        <div className="p-6 sm:p-8 pt-2 overflow-y-auto flex-1 space-y-3">
          {divisionAgendas.length === 0 ? (
            <div className="py-12 px-4 text-center bg-[#0e1626]/60 rounded-2xl border border-dashed border-slate-800 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-300">
                  Belum ada agenda kerja untuk {division.name}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Tambahkan agenda kerja pekan ini terlebih dahulu agar dapat dipilih sebagai fokus prioritas divisi.
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAddModal(division.id);
                  }}
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-soft inline-flex items-center gap-1.5 cursor-pointer mt-2"
                  style={{ backgroundColor: division.colorScheme.primary }}
                >
                  <Plus size={14} />
                  <span>Tambah Agenda Baru</span>
                </button>
              )}
            </div>
          ) : filteredAgendas.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Tidak ada agenda yang cocok dengan pencarian "{searchQuery}".
            </div>
          ) : (
            filteredAgendas.map((agenda) => {
              const isSelected =
                currentPriority?.sourceAgendaId === agenda.id ||
                currentPriority?.title === agenda.title;

              return (
                <div
                  key={agenda.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-soft ring-1 ring-amber-500/30'
                      : 'bg-[#0e1626]/90 border-slate-800 hover:bg-[#111c33] hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/30">
                        {agenda.day}
                      </span>
                      {agenda.time && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Clock size={11} />
                          {agenda.time}
                        </span>
                      )}
                      <PriorityBadge priority={agenda.priority} size="sm" />
                      <StatusBadge status={agenda.status} size="sm" />
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Award size={11} className="text-amber-400" />
                          <span>Prioritas Terpilih</span>
                        </span>
                      )}
                    </div>

                    {/* Title & notes */}
                    <h3 className="text-sm font-extrabold text-white leading-snug">
                      {agenda.title}
                    </h3>
                    {agenda.notes && (
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {agenda.notes}
                      </p>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-1">
                      {agenda.pic && (
                        <div className="flex items-center gap-1">
                          <User size={11} />
                          <span>{agenda.pic}</span>
                        </div>
                      )}
                      {agenda.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={11} />
                          <span>{agenda.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Select Action Button */}
                  <div className="shrink-0 flex items-center justify-end">
                    {isSelected ? (
                      <button
                        type="button"
                        onClick={handleRemovePriority}
                        disabled={!canEdit || isSubmitting}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Klik untuk membatalkan status prioritas"
                      >
                        <Check size={14} className="text-amber-400" />
                        <span>Prioritas Aktif</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectPriority(agenda)}
                        disabled={!canEdit || isSubmitting}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-soft transition-all hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: division.colorScheme.primary,
                        }}
                      >
                        <Sparkles size={13} />
                        <span>Pilih Sebagai Prioritas</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 sm:px-8 py-4 bg-[#0e1626] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400 shrink-0" />
            <span>
              Agenda yang dipilih akan disematkan sebagai <strong>Fokus Prioritas</strong> pada Dashboard dan TV Slideshow pekan ini.
            </span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer ml-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
