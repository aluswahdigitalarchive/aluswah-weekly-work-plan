import React, { useState } from 'react';
import { Division } from '../../types';
import { useAgenda } from '../../context/AgendaContext';
import { X, Save, Edit3, UserCheck, AlertCircle } from 'lucide-react';
import { DivisionIcon } from '../common/DivisionIcon';

interface EditDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  division: Division;
}

export const EditDivisionModal: React.FC<EditDivisionModalProps> = ({
  isOpen,
  onClose,
  division,
}) => {
  const { updateDivisionMetadata } = useAgenda();
  const [roleTitle, setRoleTitle] = useState(division.roleTitle);
  const [leadName, setLeadName] = useState(division.leadName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim() || !leadName.trim()) {
      setError('Subtitle dan Penanggung Jawab tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateDivisionMetadata(division.id, {
        role_title: roleTitle.trim(),
        lead_name: leadName.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan divisi.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-[#131b2e] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0e1626]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-soft shrink-0"
              style={{ backgroundColor: division.colorScheme.primary }}
            >
              <DivisionIcon name={division.iconName} size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Edit Profil Divisi</span>
              </h2>
              <p className="text-xs text-slate-400">
                {division.name}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Subtitle / Role Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Edit3 size={14} className="text-brand-400" />
              <span>Subtitle / Deskripsi Peran Divisi</span>
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Contoh: Koordinator Pengawas Pendidikan Dasar & Menengah"
              className="w-full px-3.5 py-2.5 bg-[#0e1626] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Teks ini tampil tepat di bawah nama divisi pada header dan slide presentasi.
            </p>
          </div>

          {/* Lead Name / PIC */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <UserCheck size={14} className="text-emerald-400" />
              <span>Penanggung Jawab (PIC / Pimpinan)</span>
            </label>
            <input
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="Contoh: Ust. Ahmad Fauzi, M.Pd"
              className="w-full px-3.5 py-2.5 bg-[#0e1626] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Nama penanggung jawab divisi yang bertanggung jawab atas program kerja pekanan.
            </p>
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
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
