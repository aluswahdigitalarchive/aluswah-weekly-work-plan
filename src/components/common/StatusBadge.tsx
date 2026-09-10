import React from 'react';
import { AgendaStatus } from '../../types';
import { CheckCircle2, Clock, AlertCircle, PlayCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AgendaStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const configs = {
    completed: {
      label: 'Selesai',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15 border-emerald-500/30',
      dotColor: 'bg-emerald-400',
      icon: CheckCircle2,
    },
    'in-progress': {
      label: 'Berjalan',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/15 border-blue-500/30',
      dotColor: 'bg-blue-400',
      icon: PlayCircle,
    },
    'not-started': {
      label: 'Belum Mulai',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/15 border-amber-500/30',
      dotColor: 'bg-amber-400',
      icon: Clock,
    },
    delayed: {
      label: 'Tertunda',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/15 border-rose-500/30',
      dotColor: 'bg-rose-400',
      icon: AlertCircle,
    },
  };

  const config = configs[status] || configs['not-started'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon size={iconSizes[size]} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
