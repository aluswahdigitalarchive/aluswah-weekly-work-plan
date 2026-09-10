import React from 'react';

interface ProgressBarProps {
  progress: number;
  height?: 'sm' | 'md' | 'lg' | 'tv';
  color?: 'primary' | 'teal' | 'success' | 'gradient';
  showPercentage?: boolean;
  animate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'md',
  color = 'gradient',
  showPercentage = false,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
    tv: 'h-4',
  };

  const fillColors = {
    primary: 'bg-brand-500',
    teal: 'bg-tealbrand-500',
    success: 'bg-emerald-500',
    gradient: 'bg-gradient-to-r from-brand-600 via-brand-500 to-tealbrand-500',
  };

  return (
    <div className="w-full flex items-center gap-3">
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5 ${heightClasses[height]}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${fillColors[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs font-semibold text-navy-700 min-w-[2.5rem] text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
};
