import React from 'react';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
}) => {
  const configs = {
    high: {
      label: 'HIGH',
      textColor: 'text-amber-800',
      bgColor: 'bg-amber-100/90 border-amber-300',
      indicator: 'bg-amber-500',
    },
    medium: {
      label: 'MEDIUM',
      textColor: 'text-sky-800',
      bgColor: 'bg-sky-100/90 border-sky-300',
      indicator: 'bg-sky-500',
    },
    low: {
      label: 'LOW',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-100 border-slate-300',
      indicator: 'bg-slate-400',
    },
  };

  const config = configs[priority] || configs.medium;
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold tracking-wider rounded border uppercase ${config.bgColor} ${config.textColor} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.indicator}`} />
      <span>{config.label}</span>
    </span>
  );
};
