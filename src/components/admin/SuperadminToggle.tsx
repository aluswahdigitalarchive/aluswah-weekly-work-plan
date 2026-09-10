import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAgenda } from '../../context/AgendaContext';

export const SuperadminToggle: React.FC = () => {
  const { isSuperAdmin, setIsSuperAdmin } = useAgenda();

  return (
    <button
      onClick={() => setIsSuperAdmin(!isSuperAdmin)}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-soft select-none ${
        isSuperAdmin
          ? 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-300 text-amber-900 shadow-sm'
          : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/80'
      }`}
      title={
        isSuperAdmin
          ? 'Superadmin Aktif: Anda dapat menambah & menyunting agenda'
          : 'Klik untuk mengaktifkan Mode Superadmin'
      }
    >
      {isSuperAdmin ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <ShieldCheck size={15} className="text-amber-600 shrink-0" />
          <span className="hidden sm:inline">Superadmin</span>
          <span className="text-[10px] bg-amber-200/70 text-amber-800 px-1.5 py-0.2 rounded font-extrabold uppercase">
            ON
          </span>
        </>
      ) : (
        <>
          <ShieldAlert size={15} className="text-slate-400 shrink-0" />
          <span className="hidden sm:inline">Superadmin</span>
          <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-extrabold uppercase">
            OFF
          </span>
        </>
      )}
    </button>
  );
};
