import React from 'react';
import { DivisionOverview } from '../components/division/DivisionOverview';
import { useAgenda } from '../context/AgendaContext';
import { AlertCircle } from 'lucide-react';

interface DivisionPageProps {
  divisionSlug: string;
  onNavigateDivision: (slug: string) => void;
  onEnterPresentation: () => void;
}

export const DivisionPage: React.FC<DivisionPageProps> = ({
  divisionSlug,
  onNavigateDivision,
  onEnterPresentation,
}) => {
  const { getDivisionsForActiveWeek } = useAgenda();
  const divisions = getDivisionsForActiveWeek();
  const division = divisions.find((d) => d.slug === divisionSlug);

  if (!division) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-soft space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-xl font-bold text-navy-900">Divisi Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">
          Divisi dengan kode "{divisionSlug}" tidak terdaftar dalam sistem rencana kerja pekan ini.
        </p>
        <button
          onClick={() => onNavigateDivision('/')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors cursor-pointer"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <DivisionOverview
      division={division}
      onNavigateDivision={onNavigateDivision}
      onEnterPresentation={onEnterPresentation}
    />
  );
};
