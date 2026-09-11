import { DivisionRow, TaskRow, WeeklyPlanRow } from '../lib/supabase';
import {
  AgendaItem,
  AgendaStatus,
  DayOfWeek,
  Division,
  DivisionColorScheme,
  PriorityLevel,
  WeekInfo,
} from '../types';

// Palette and metadata lookup by division slug (supporting both full and short slugs)
interface DivisionVisualTheme {
  shortName: string;
  roleTitle: string;
  leadName: string;
  iconName: string;
  colorScheme: DivisionColorScheme;
}

const DIVISION_THEMES: Record<string, DivisionVisualTheme> = {
  'pengawas-sd-ma': {
    shortName: 'SD–MA',
    roleTitle: 'Koordinator Pengawas Pendidikan Dasar & Menengah',
    leadName: 'Ust. Ahmad Fauzi, M.Pd',
    iconName: 'GraduationCap',
    colorScheme: {
      primary: '#6366f1',
      bgLight: 'rgba(99, 102, 241, 0.12)',
      badgeBg: 'rgba(99, 102, 241, 0.22)',
      border: 'rgba(99, 102, 241, 0.35)',
      text: '#a5b4fc',
      gradient: 'from-indigo-600 to-indigo-500',
    },
  },
  'pengawas-tk': {
    shortName: 'TK PAUD',
    roleTitle: 'Pengawas Pendidikan Anak Usia Dini & TK Islam',
    leadName: 'Usth. Siti Rahmawati, S.Pd',
    iconName: 'Sparkles',
    colorScheme: {
      primary: '#f43f5e',
      bgLight: 'rgba(244, 63, 94, 0.12)',
      badgeBg: 'rgba(244, 63, 94, 0.22)',
      border: 'rgba(244, 63, 94, 0.35)',
      text: '#fda4af',
      gradient: 'from-rose-500 to-rose-400',
    },
  },
  'sdm-penjamin-mutu': {
    shortName: 'SDM & Mutu',
    roleTitle: 'Manager HRD & Penjaminan Mutu Internal',
    leadName: 'Drs. H. Mulyadi, M.Pd',
    iconName: 'Users',
    colorScheme: {
      primary: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.12)',
      badgeBg: 'rgba(16, 185, 129, 0.22)',
      border: 'rgba(16, 185, 129, 0.35)',
      text: '#6ee7b7',
      gradient: 'from-emerald-600 to-teal-500',
    },
  },
  'manager-quran': {
    shortName: "Al-Qur'an",
    roleTitle: "Manager Pengkajian & Pembelajaran Al-Qur'an",
    leadName: 'Ust. Muhammad Wildan, Lc, Al-Hafizh',
    iconName: 'BookOpen',
    colorScheme: {
      primary: '#06b6d4',
      bgLight: 'rgba(6, 182, 212, 0.12)',
      badgeBg: 'rgba(6, 182, 212, 0.22)',
      border: 'rgba(6, 182, 212, 0.35)',
      text: '#67e8f9',
      gradient: 'from-cyan-600 to-teal-500',
    },
  },
  'sarana-prasarana': {
    shortName: 'Sarpras',
    roleTitle: 'Manager Sarana Prasarana & Logistik Yayasan',
    leadName: 'Ir. Hendra Gunawan',
    iconName: 'Building2',
    colorScheme: {
      primary: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.12)',
      badgeBg: 'rgba(245, 158, 11, 0.22)',
      border: 'rgba(245, 158, 11, 0.35)',
      text: '#fcd34d',
      gradient: 'from-amber-500 to-amber-600',
    },
  },
  'tim-bilingual': {
    shortName: 'Bilingual',
    roleTitle: 'Koordinator Program Bahasa Internasional (English & Arabic)',
    leadName: 'Sarah Amanda, M.A',
    iconName: 'Languages',
    colorScheme: {
      primary: '#8b5cf6',
      bgLight: 'rgba(139, 92, 246, 0.12)',
      badgeBg: 'rgba(139, 92, 246, 0.22)',
      border: 'rgba(139, 92, 246, 0.35)',
      text: '#c4b5fd',
      gradient: 'from-purple-600 to-indigo-500',
    },
  },
  'tim-media': {
    shortName: 'Media Kreatif',
    roleTitle: 'Kepala Divisi Publikasi, Dokumentasi & Hubungan Masyarakat',
    leadName: 'Rian Pratama, S.I.Kom',
    iconName: 'Camera',
    colorScheme: {
      primary: '#f97316',
      bgLight: 'rgba(249, 115, 22, 0.12)',
      badgeBg: 'rgba(249, 115, 22, 0.22)',
      border: 'rgba(249, 115, 22, 0.35)',
      text: '#fdba74',
      gradient: 'from-orange-500 to-rose-400',
    },
  },
  'tim-it': {
    shortName: 'IT & Sistem',
    roleTitle: 'Kepala Divisi Teknologi Informasi & Infrastruktur Jaringan',
    leadName: 'Fajar Nugraha, S.Kom',
    iconName: 'MonitorCog',
    colorScheme: {
      primary: '#0ea5e9',
      bgLight: 'rgba(14, 165, 233, 0.12)',
      badgeBg: 'rgba(14, 165, 233, 0.22)',
      border: 'rgba(14, 165, 233, 0.35)',
      text: '#7dd3fc',
      gradient: 'from-sky-500 to-blue-600',
    },
  },
};

// Aliases for legacy short slugs
DIVISION_THEMES['sdm-mutu'] = DIVISION_THEMES['sdm-penjamin-mutu'];
DIVISION_THEMES['quran'] = DIVISION_THEMES['manager-quran'];
DIVISION_THEMES['sarpras'] = DIVISION_THEMES['sarana-prasarana'];
DIVISION_THEMES['bilingual'] = DIVISION_THEMES['tim-bilingual'];
DIVISION_THEMES['media'] = DIVISION_THEMES['tim-media'];
DIVISION_THEMES['it'] = DIVISION_THEMES['tim-it'];

/**
 * Convert ISO date string to DayOfWeek in Indonesian
 */
export function getDayOfWeekFromDate(dateStr: string): DayOfWeek {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayIndex = date.getDay(); // 0 = Minggu, 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu
    const days: DayOfWeek[] = ['Senin', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex] || 'Senin';
  }
  return 'Senin';
}

/**
 * Calculate ISO date string (YYYY-MM-DD) given weekStart (Monday) and DayOfWeek
 */
export function calculateDateFromWeekAndDay(weekStart: string, targetDay: DayOfWeek): string {
  const dayOffsets: Record<DayOfWeek, number> = {
    Senin: 0,
    Selasa: 1,
    Rabu: 2,
    Kamis: 3,
    Jumat: 4,
    Sabtu: 5,
  };
  const offset = dayOffsets[targetDay] ?? 0;
  const parts = weekStart.split('-');
  if (parts.length === 3) {
    const base = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    base.setDate(base.getDate() + offset);
    const year = base.getFullYear();
    const month = String(base.getMonth() + 1).padStart(2, '0');
    const day = String(base.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return weekStart;
}

/**
 * Parse time string like '09:00 - 11:00' into start_time and end_time (HH:MM:SS)
 */
export function parseTimeRange(timeStr?: string): { startTime: string; endTime: string | null } {
  if (!timeStr || !timeStr.trim()) {
    return { startTime: '09:00:00', endTime: '11:00:00' };
  }
  const parts = timeStr.split('-').map((s) => s.trim());
  const formatTime = (t: string) => {
    const clean = t.replace('.', ':');
    const sub = clean.split(':');
    if (sub.length === 2) {
      return `${sub[0].padStart(2, '0')}:${sub[1].padStart(2, '0')}:00`;
    }
    if (sub.length === 3) {
      return `${sub[0].padStart(2, '0')}:${sub[1].padStart(2, '0')}:${sub[2].padStart(2, '0')}`;
    }
    return '09:00:00';
  };

  const startTime = formatTime(parts[0]);
  const endTime = parts.length > 1 && parts[1] ? formatTime(parts[1]) : null;
  return { startTime, endTime };
}

/**
 * Format ISO date string (YYYY-MM-DD) to friendly Indonesian date (e.g. 7 Sep 2026)
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    return `${day} ${months[monthIndex] || ''} ${year}`.trim();
  }
  return dateStr;
}

/**
 * Format date range from start & end dates
 */
export function formatDateRange(startStr: string, endStr: string): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const startParts = startStr.split('-');
  const endParts = endStr.split('-');

  if (startParts.length === 3 && endParts.length === 3) {
    const startDay = parseInt(startParts[2], 10);
    const endDay = parseInt(endParts[2], 10);
    const month = months[parseInt(endParts[1], 10) - 1] || '';
    const year = endParts[0];
    return `${startDay}–${endDay} ${month} ${year}`;
  }
  return `${startStr} – ${endStr}`;
}

/**
 * Map Supabase TaskRow to UI AgendaItem
 */
export function mapTaskRowToAgendaItem(
  task: TaskRow,
  divisionName: string,
  weekNumber: number
): AgendaItem {
  const statusMap: Record<string, AgendaStatus> = {
    COMPLETED: 'completed',
    IN_PROGRESS: 'in-progress',
    NOT_STARTED: 'not-started',
    DELAYED: 'delayed',
  };

  const priorityMap: Record<string, PriorityLevel> = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  };

  let formattedTime = '';
  if (task.start_time) {
    const start = task.start_time.slice(0, 5);
    const end = task.end_time ? task.end_time.slice(0, 5) : '';
    formattedTime = end ? `${start} - ${end}` : start;
  }

  return {
    id: task.id,
    weekNumber,
    title: task.title,
    time: formattedTime,
    day: getDayOfWeekFromDate(task.date),
    date: formatFriendlyDate(task.date),
    status: statusMap[task.status] || 'not-started',
    priority: priorityMap[task.priority] || 'medium',
    pic: task.pic || 'Penanggung Jawab',
    location: task.location || '',
    notes: task.notes || '',
    divisionId: task.division_id,
    divisionName,
  };
}

/**
 * Map Supabase WeeklyPlanRow to UI WeekInfo
 */
export function mapWeeklyPlanRowToWeekInfo(plan: WeeklyPlanRow): WeekInfo {
  return {
    weekNumber: plan.week_number,
    year: plan.year,
    dateRange: formatDateRange(plan.week_start, plan.week_end),
    label: `PEKAN ${plan.week_number}${plan.is_active ? ' (Saat Ini)' : ''}`,
  };
}

/**
 * Map Supabase DivisionRow to base Division object
 */
export function mapDivisionRowToBaseDivision(div: DivisionRow): Omit<
  Division,
  | 'totalAgenda'
  | 'completedAgenda'
  | 'inProgressAgenda'
  | 'delayedAgenda'
  | 'pendingAgenda'
  | 'progress'
  | 'priorityHighlight'
  | 'agendas'
> {
  const theme =
    DIVISION_THEMES[div.slug] ||
    DIVISION_THEMES['pengawas-sd-ma'];

  return {
    id: div.id,
    slug: div.slug,
    name: div.name,
    shortName: theme.shortName,
    roleTitle: div.role_title || theme.roleTitle,
    leadName: div.lead_name || theme.leadName,
    iconName: div.icon || theme.iconName,
    colorScheme: theme.colorScheme,
    description: div.description || '',
  };
}
