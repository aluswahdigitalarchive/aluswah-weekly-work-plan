import React from 'react';
import { Check } from 'lucide-react';

interface ChecklistButtonProps {
  isCompleted: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabel?: boolean;
  disabled?: boolean;
}

export const ChecklistButton: React.FC<ChecklistButtonProps> = ({
  isCompleted,
  onToggle,
  size = 'md',
  label = 'Sudah Berlangsung',
  showLabel = false,
  disabled = false,
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 rounded-md',
    md: 'w-6 h-6 rounded-lg',
    lg: 'w-7 h-7 rounded-xl',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onToggle();
      }}
      title={
        disabled
          ? 'Hanya divisi terkait atau Superadmin yang dapat mencentang agenda ini'
          : isCompleted
          ? 'Tandai belum selesai'
          : 'Ceklis: Kegiatan sudah berlangsung / selesai'
      }
      className={`group inline-flex items-center gap-2 select-none transition-all duration-200 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${showLabel ? 'px-2.5 py-1 rounded-xl hover:bg-slate-100' : ''}`}
    >
      <div
        className={`flex items-center justify-center border-2 transition-all duration-200 ${sizeClasses[size]} ${
          isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm ring-2 ring-emerald-200/80 scale-105'
            : 'border-slate-300 bg-white hover:border-emerald-400 group-hover:bg-emerald-50/50 text-transparent group-hover:text-emerald-400'
        }`}
      >
        <Check size={iconSizes[size]} strokeWidth={3} className="transition-transform" />
      </div>

      {showLabel && (
        <span
          className={`text-xs font-bold transition-colors ${
            isCompleted ? 'text-emerald-700 line-through opacity-80' : 'text-slate-600 group-hover:text-navy-900'
          }`}
        >
          {label}
        </span>
      )}
    </button>
  );
};
