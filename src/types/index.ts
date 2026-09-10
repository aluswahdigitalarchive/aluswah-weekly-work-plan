export type AgendaStatus = 'completed' | 'in-progress' | 'not-started' | 'delayed';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface DivisionColorScheme {
  primary: string;
  bgLight: string;
  badgeBg: string;
  border: string;
  text: string;
  gradient: string;
}

export interface AgendaItem {
  id: string;
  weekNumber: number; // e.g. 37, 38, 39
  title: string;
  time?: string;
  day: DayOfWeek;
  date: string;
  status: AgendaStatus;
  priority: PriorityLevel;
  pic: string;
  location?: string;
  notes?: string;
  divisionId: string;
  divisionName: string;
}

export interface Division {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  roleTitle: string;
  leadName: string;
  iconName: string;
  colorScheme: DivisionColorScheme;
  progress: number;
  description: string;
  totalAgenda: number;
  completedAgenda: number;
  inProgressAgenda: number;
  delayedAgenda: number;
  pendingAgenda: number;
  priorityHighlight: string;
  agendas: AgendaItem[];
}

export interface WeekInfo {
  weekNumber: number;
  year: number;
  dateRange: string;
  label: string;
}

export interface WeeklyStats {
  totalAgenda: number;
  completed: number;
  inProgress: number;
  delayed: number;
  notStarted: number;
}

export interface PriorityItem {
  id: string;
  weekNumber: number;
  level: PriorityLevel;
  title: string;
  division: string;
  divisionId: string;
  target: string;
  progress?: number;
  sourceAgendaId?: string;
}

export type UserRole = 'SUPERADMIN' | 'DIVISION';

export interface UserProfile {
  id: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  divisionId: string | null;
  avatarUrl?: string | null;
}

