import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant: 'total' | 'completed' | 'progress' | 'delayed';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  variant,
  trend,
}) => {
  const variantStyles = {
    total: {
      border: 'border-slate-700/80',
      iconBg: 'bg-slate-800 text-slate-300',
      accentDot: 'bg-slate-400',
      valueColor: 'text-white',
    },
    completed: {
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      accentDot: 'bg-emerald-400',
      valueColor: 'text-emerald-400',
    },
    progress: {
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-500/15 text-blue-400',
      accentDot: 'bg-blue-400',
      valueColor: 'text-blue-400',
    },
    delayed: {
      border: 'border-rose-500/30',
      iconBg: 'bg-rose-500/15 text-rose-400',
      accentDot: 'bg-rose-400',
      valueColor: 'text-rose-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`bg-[#131b2e] rounded-3xl p-5 sm:p-6 border ${style.border} shadow-soft hover:shadow-medium transition-all duration-300 relative overflow-hidden group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${style.accentDot}`} />
            <p className="text-xs sm:text-sm font-bold tracking-wider text-slate-400 uppercase">
              {label}
            </p>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${style.valueColor}`}
            >
              {value}
            </span>
            {trend && (
              <span className="text-xs font-bold text-slate-400">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`p-3 rounded-2xl ${style.iconBg} transition-transform group-hover:scale-110 shrink-0 border border-white/5`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};
