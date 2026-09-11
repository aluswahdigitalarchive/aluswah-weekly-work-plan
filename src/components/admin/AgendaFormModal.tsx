import React, { useState, useEffect } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { useAuth } from '../../context/AuthContext';
import { AgendaStatus, PriorityLevel, DayOfWeek, AgendaItem } from '../../types';
import { X, Trash2, Save, Clock, MapPin, User } from 'lucide-react';
import { DivisionIcon } from '../common/DivisionIcon';

export const AgendaFormModal: React.FC = () => {
  const { isModalOpen, editingAgenda, closeModal, saveAgenda, deleteAgenda, divisions, availableWeeks } = useAgenda();
  const { isSuperAdmin, isDivision } = useAuth();

  const [formData, setFormData] = useState<Partial<AgendaItem>>({});

  useEffect(() => {
    if (editingAgenda) {
      setFormData({ ...editingAgenda });
    } else {
      setFormData({});
    }
  }, [editingAgenda]);

  if (!isModalOpen || !editingAgenda) return null;

  const isEditing = Boolean(editingAgenda.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Judul agenda wajib diisi.');
      return;
    }
    saveAgenda(formData);
  };

  const handleDelete = () => {
    if (window.confirm(`Hapus agenda "${formData.title}"?`)) {
      if (formData.id) {
        deleteAgenda(formData.id);
      }
    }
  };

  const selectedDivision = divisions.find((d) => d.id === formData.divisionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeModal}
      />

      {/* Modal Dialog Content */}
      <div className="relative bg-[#131b2e] rounded-3xl shadow-2xl border border-slate-700 w-full max-w-2xl overflow-hidden z-10 animate-slide-up text-slate-100">
        {/* Header */}
        <div
          className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-800"
          style={{
            background: selectedDivision
              ? `linear-gradient(to right, ${selectedDivision.colorScheme.bgLight}, #131b2e)`
              : '#0e1626',
          }}
        >
          <div className="flex items-center gap-3">
            {selectedDivision && (
              <div
                className="p-2.5 rounded-xl text-white shadow-soft"
                style={{ backgroundColor: selectedDivision.colorScheme.primary }}
              >
                <DivisionIcon name={selectedDivision.iconName} size={20} />
              </div>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isEditing ? 'Sunting Agenda Rencana Kerja' : 'Tambah Agenda Baru'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {isEditing
                  ? 'Perbarui detail pelaksanaan atau ubah status kegiatan'
                  : 'Rencanakan kegiatan untuk pekan berjalan atau pekan mendatang'}
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Target Week & Division */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Week */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Pekan
              </label>
              <select
                value={formData.weekNumber || 37}
                onChange={(e) =>
                  setFormData({ ...formData, weekNumber: parseInt(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0e1626] text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              >
                {availableWeeks.map((w) => (
                  <option key={w.weekNumber} value={w.weekNumber} className="bg-[#131b2e] text-white">
                    {w.label} ({w.dateRange})
                  </option>
                ))}
              </select>
            </div>

            {/* Division */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Divisi Penanggung Jawab
              </label>
              <select
                value={formData.divisionId || (divisions[0]?.id ?? '')}
                disabled={!isSuperAdmin && isDivision}
                onChange={(e) => {
                  const div = divisions.find((d) => d.id === e.target.value);
                  setFormData({
                    ...formData,
                    divisionId: e.target.value,
                    divisionName: div ? div.name : '',
                  });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0e1626] text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${
                  !isSuperAdmin && isDivision ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#131b2e] text-white">
                    {d.name}
                  </option>
                ))}
              </select>
              {!isSuperAdmin && isDivision && (
                <p className="text-[10px] text-sky-400 mt-1">
                  Terkunci sesuai hak akses akun divisi Anda.
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nama Agenda / Rencana Kerja <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Supervisi Pembelajaran Modul Ajar Kelas 8"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-[#0e1626] text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-500"
            />
          </div>

          {/* Row 3: PIC & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Penanggung Jawab (PIC)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nama Penanggung Jawab"
                  value={formData.pic || ''}
                  onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0e1626] text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-500"
                />
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Lokasi Pelaksanaan
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: Ruang Rapat Lt. 2 / Masjid Jami"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0e1626] text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-500"
                />
                <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Row 4: Day & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Hari Pelaksanaan
              </label>
              <select
                value={formData.day || 'Senin'}
                onChange={(e) =>
                  setFormData({ ...formData, day: e.target.value as DayOfWeek })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0e1626] text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              >
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => (
                  <option key={day} value={day} className="bg-[#131b2e] text-white">
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Jam / Rentang Waktu
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: 08:30 - 11:30"
                  value={formData.time || ''}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0e1626] text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-500"
                />
                <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Row 5: Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Tingkat Prioritas
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['high', 'medium', 'low'] as PriorityLevel[]).map((p) => {
                  const isSel = (formData.priority || 'medium') === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-2 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer text-center ${
                        isSel
                          ? p === 'high'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                            : p === 'medium'
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm'
                            : 'bg-slate-700 border-slate-500 text-slate-200 shadow-sm'
                          : 'bg-[#0e1626] border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Status Pelaksanaan
              </label>
              <select
                value={formData.status || 'not-started'}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as AgendaStatus })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0e1626] text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              >
                <option value="completed" className="bg-[#131b2e] text-white">Selesai (Sudah Terlaksana)</option>
                <option value="in-progress" className="bg-[#131b2e] text-white">Sedang Berjalan</option>
                <option value="not-started" className="bg-[#131b2e] text-white">Belum Mulai</option>
                <option value="delayed" className="bg-[#131b2e] text-white">Tertunda / Reschedule</option>
              </select>
            </div>
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Catatan / Arahan Khusus
            </label>
            <textarea
              rows={3}
              placeholder="Tambahkan detail target output atau instruksi pelaksanaan..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-[#0e1626] text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
                <span>Hapus Agenda</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:from-brand-500 hover:to-tealbrand-500 text-white text-xs font-black shadow-soft hover:shadow-medium transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>{isEditing ? 'Simpan Perubahan' : 'Tambahkan Agenda'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
