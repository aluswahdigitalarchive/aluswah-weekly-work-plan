import React, { useState, useEffect } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { X, CalendarPlus, Save, AlertCircle, Calendar, Sparkles } from 'lucide-react';

interface WeeklyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyPlanModal: React.FC<WeeklyPlanModalProps> = ({ isOpen, onClose }) => {
  const { availableWeeks, createWeeklyPlan } = useAgenda();

  const [weekNumber, setWeekNumber] = useState<number>(38);
  const [year, setYear] = useState<number>(2026);
  const [title, setTitle] = useState<string>('');
  const [weekStart, setWeekStart] = useState<string>('');
  const [weekEnd, setWeekEnd] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSaving(false);

      // Auto-suggest next week number
      const maxWeek = availableWeeks.length > 0
        ? Math.max(...availableWeeks.map((w) => w.weekNumber))
        : 37;
      const nextWeek = maxWeek + 1;
      setWeekNumber(nextWeek);
      setYear(2026);
      setTitle(`Rencana Kerja Pekan ${nextWeek}`);

      // Auto-suggest next Monday & Sunday based on current date or previous week
      const now = new Date();
      // Calculate next Monday
      const day = now.getDay();
      const diffToMonday = day === 0 ? 1 : 8 - day;
      const nextMon = new Date(now);
      nextMon.setDate(now.getDate() + diffToMonday);

      const nextSun = new Date(nextMon);
      nextSun.setDate(nextMon.getDate() + 6);

      const formatIso = (d: Date) => d.toISOString().slice(0, 10);
      setWeekStart(formatIso(nextMon));
      setWeekEnd(formatIso(nextSun));
      setIsActive(false);
    }
  }, [isOpen, availableWeeks]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !weekStart || !weekEnd) {
      setError('Harap lengkapi semua kolom.');
      return;
    }

    if (weekNumber < 1 || weekNumber > 53) {
      setError('Nomor pekan harus berada di antara 1 dan 53.');
      return;
    }

    if (weekStart > weekEnd) {
      setError('Tanggal mulai tidak boleh melebihi tanggal selesai.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createWeeklyPlan({
        week_number: weekNumber,
        year,
        title: title.trim(),
        week_start: weekStart,
        week_end: weekEnd,
        is_active: isActive,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat pekan kerja baru.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className="relative bg-[#131b2e] border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 text-slate-100 flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0e1626] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-tealbrand-600 flex items-center justify-center text-white shadow-soft shrink-0">
              <CalendarPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Buat Periode Pekan Kerja Baru</span>
              </h2>
              <p className="text-xs text-slate-400">
                Khusus Superadmin • Digital Planning Board
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Week Number & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nomor Pekan (1-53)
              </label>
              <input
                type="number"
                min={1}
                max={53}
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-[#0e1626] border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-brand-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tahun
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-[#0e1626] border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-brand-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Row 2: Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Judul Periode Pekan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Rencana Kerja Pekan 38"
              className="w-full px-3.5 py-2.5 bg-[#0e1626] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              required
            />
          </div>

          {/* Row 3: Start Date & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-brand-400" />
                <span>Tanggal Mulai (Senin)</span>
              </label>
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0e1626] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-tealbrand-400" />
                <span>Tanggal Selesai (Minggu)</span>
              </label>
              <input
                type="date"
                value={weekEnd}
                onChange={(e) => setWeekEnd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0e1626] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Row 4: Is Active Toggle */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Jadikan Pekan Aktif Sekarang</span>
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Jika dicentang, pekan ini akan langsung menjadi fokus utama pada Presentation Mode (TV Display) dan Dashboard. Jika tidak, pekan ini akan tersimpan sebagai pekan perencanaan mendatang.
                </span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:from-brand-500 hover:to-tealbrand-500 text-white text-xs font-bold rounded-xl shadow-soft transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={15} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pekan Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
