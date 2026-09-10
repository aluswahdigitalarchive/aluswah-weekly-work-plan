import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  AgendaItem,
  Division,
  WeekInfo,
  WeeklyStats,
  PriorityItem,
} from '../types';
import {
  getActiveWeeklyPlan,
  getWeeklyPlans,
  createWeeklyPlan as apiCreateWeeklyPlan,
  activateWeeklyPlan as apiActivateWeeklyPlan,
} from '../services/weeklyPlans';
import { getDivisions, updateDivision } from '../services/divisions';
import {
  getAllTasks,
  updateTaskStatus,
  createTask,
  updateTask,
  deleteTask,
} from '../services/tasks';
import { getAppSetting } from '../services/appSettings';
import {
  mapTaskRowToAgendaItem,
  mapWeeklyPlanRowToWeekInfo,
  mapDivisionRowToBaseDivision,
} from '../services/mappers';
import { DivisionRow, WeeklyPlanRow, TaskRow, AppSettingRow } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useRealtimeAgenda, RealtimeStatus } from '../hooks/useRealtimeAgenda';

interface AgendaContextType {
  // Loading & Error States
  isLoading: boolean;
  error: string | null;
  refetchData: () => Promise<void>;

  // Realtime & Settings
  realtimeStatus: RealtimeStatus;
  presentationInterval: number;

  // Superadmin & Authorization
  isSuperAdmin: boolean;
  setIsSuperAdmin: (val: boolean) => void;
  canManageDivision: (divisionId: string) => boolean;
  canManageAgenda: (agenda: AgendaItem) => boolean;

  // Weeks
  activeWeek: WeekInfo;
  setActiveWeek: (week: WeekInfo) => void;
  availableWeeks: WeekInfo[];
  allPlans: WeeklyPlanRow[];
  createWeeklyPlan: (planData: {
    week_number: number;
    year: number;
    title: string;
    week_start: string;
    week_end: string;
    is_active?: boolean;
  }) => Promise<void>;
  activateWeeklyPlan: (planId: string) => Promise<void>;

  // Data
  agendas: AgendaItem[];
  divisions: Division[];

  // Task / Agenda mutations
  toggleCompleteAgenda: (agendaId: string) => void;
  saveAgenda: (agendaData: Partial<AgendaItem>) => Promise<void>;
  deleteAgenda: (agendaId: string) => Promise<void>;
  updateDivisionMetadata: (
    divisionId: string,
    updates: { role_title?: string; lead_name?: string }
  ) => Promise<void>;

  // Modal State
  isModalOpen: boolean;
  editingAgenda: AgendaItem | null;
  openAddModal: (prefilledDivisionId?: string, prefilledWeekNumber?: number) => void;
  openEditModal: (agenda: AgendaItem) => void;
  closeModal: () => void;
  isWeeklyPlanModalOpen: boolean;
  openWeeklyPlanModal: () => void;
  closeWeeklyPlanModal: () => void;

  // Dynamic stats
  weeklyStats: WeeklyStats;
  todayAgendas: AgendaItem[];
  getDivisionsForActiveWeek: () => Division[];
  dayAgendaCounts: { day: string; fullDay: string; date: string; count: number }[];

  // Priorities management
  priorities: PriorityItem[];
  activePriorities: PriorityItem[];
  addPriorityFromAgenda: (agenda: AgendaItem) => void;
  addCustomPriority: (priorityData: Omit<PriorityItem, 'id'>) => void;
  removePriority: (priorityId: string) => void;
  clearWeekPriorities: () => void;
  isPriorityModalOpen: boolean;
  openPriorityModal: (initialTab?: 'agenda' | 'custom') => void;
  closePriorityModal: () => void;
  priorityModalTab: 'agenda' | 'custom';
  setPriorityModalTab: (tab: 'agenda' | 'custom') => void;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PRIORITIES = 'wwp_priorities_v2';

const FALLBACK_WEEK: WeekInfo = {
  weekNumber: 37,
  year: 2026,
  dateRange: '7–12 September 2026',
  label: 'PEKAN 37 (Saat Ini)',
};

export const AgendaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth Integration
  const { isSuperAdmin: authIsSuperAdmin, isDivision, userDivisionId } = useAuth();
  const [localSuperAdminOverride, setLocalSuperAdminOverride] = useState<boolean | null>(null);

  // isSuperAdmin derived from auth, with optional local override for dev/testing
  const isSuperAdmin = localSuperAdminOverride !== null ? localSuperAdminOverride : authIsSuperAdmin;
  const setIsSuperAdmin = (val: boolean) => {
    setLocalSuperAdminOverride(val);
  };

  // Permission checkers
  const canManageDivision = useCallback(
    (divisionId: string): boolean => {
      if (isSuperAdmin) return true;
      if (isDivision && userDivisionId && divisionId === userDivisionId) return true;
      return false;
    },
    [isSuperAdmin, isDivision, userDivisionId]
  );

  const canManageAgenda = useCallback(
    (agenda: AgendaItem): boolean => {
      if (isSuperAdmin) return true;
      if (isDivision && userDivisionId && agenda.divisionId === userDivisionId) return true;
      return false;
    },
    [isSuperAdmin, isDivision, userDivisionId]
  );

  // 1. Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [presentationInterval, setPresentationInterval] = useState<number>(10);

  // 3. Raw Database Rows State
  const [activePlanRow, setActivePlanRow] = useState<WeeklyPlanRow | null>(null);
  const [_allPlansRows, setAllPlansRows] = useState<WeeklyPlanRow[]>([]);
  const [divisionRows, setDivisionRows] = useState<DivisionRow[]>([]);

  // 4. Mapped Agendas & Weeks State
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [activeWeek, setActiveWeek] = useState<WeekInfo>(FALLBACK_WEEK);
  const [availableWeeks, setAvailableWeeks] = useState<WeekInfo[]>([FALLBACK_WEEK]);

  // 5. Priorities state
  const [priorities, setPriorities] = useState<PriorityItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRIORITIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved priorities', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PRIORITIES, JSON.stringify(priorities));
  }, [priorities]);

  // Priority Manager Modal State
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [priorityModalTab, setPriorityModalTab] = useState<'agenda' | 'custom'>('agenda');

  const openPriorityModal = (initialTab: 'agenda' | 'custom' = 'agenda') => {
    setPriorityModalTab(initialTab);
    setIsPriorityModalOpen(true);
  };

  const closePriorityModal = () => {
    setIsPriorityModalOpen(false);
  };

  // 6. Fetch live data from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step A: Fetch active weekly plan, all weekly plans, divisions, app settings, and all tasks in parallel
      const [activePlan, allPlans, rawDivisions, intervalSetting, allTaskRows] = await Promise.all([
        getActiveWeeklyPlan(),
        getWeeklyPlans(),
        getDivisions(),
        getAppSetting('presentation_interval'),
        getAllTasks(),
      ]);

      if (!activePlan) {
        throw new Error('Tidak ditemukan rencana pekanan yang aktif (is_active = true) di database.');
      }

      setActivePlanRow(activePlan);
      setAllPlansRows(allPlans);
      setDivisionRows(rawDivisions);

      if (intervalSetting) {
        const parsed = parseInt(intervalSetting, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setPresentationInterval(parsed);
        }
      }

      // Map plans to WeekInfo
      const mappedActiveWeek = mapWeeklyPlanRowToWeekInfo(activePlan);
      const mappedWeeks = allPlans.map(mapWeeklyPlanRowToWeekInfo);
      setAvailableWeeks(mappedWeeks.length > 0 ? mappedWeeks : [mappedActiveWeek]);

      // Preserve currently selected week if still present, otherwise default to active week
      setActiveWeek((prev) => {
        const found = mappedWeeks.find((w) => w.weekNumber === prev.weekNumber);
        return found || mappedActiveWeek;
      });

      // Map tasks to AgendaItem using planWeekMap
      const planWeekMap = new Map<string, number>();
      allPlans.forEach((p) => planWeekMap.set(p.id, p.week_number));

      const divNameMap = new Map<string, string>();
      rawDivisions.forEach((d) => divNameMap.set(d.id, d.name));

      const mappedAgendas = allTaskRows.map((task) =>
        mapTaskRowToAgendaItem(
          task,
          divNameMap.get(task.division_id) || 'Divisi',
          planWeekMap.get(task.weekly_plan_id) || activePlan.week_number
        )
      );

      setAgendas(mappedAgendas);
    } catch (err: unknown) {
      console.error('Error loading Supabase data in AgendaContext:', err);
      let msg = 'Terjadi kesalahan saat memuat data dari Supabase.';
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        msg = String((err as { message: unknown }).message);
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // 7. Realtime Subscription Event Handlers
  const handleRealtimeTaskInsert = useCallback(
    (newTaskRow: TaskRow) => {
      const plan = _allPlansRows.find((p) => p.id === newTaskRow.weekly_plan_id) || activePlanRow;
      const weekNumber = plan ? plan.week_number : activeWeek.weekNumber;

      const div = divisionRows.find((d) => d.id === newTaskRow.division_id);
      const divisionName = div ? div.name : 'Divisi';
      const newAgenda = mapTaskRowToAgendaItem(
        newTaskRow,
        divisionName,
        weekNumber
      );

      // Duplicate event protection: if already in state, update in place
      setAgendas((prev) => {
        const existsIndex = prev.findIndex((item) => item.id === newTaskRow.id);
        if (existsIndex >= 0) {
          const updated = [...prev];
          updated[existsIndex] = newAgenda;
          return updated;
        }
        return [newAgenda, ...prev];
      });
    },
    [_allPlansRows, activePlanRow, divisionRows, activeWeek.weekNumber]
  );

  const handleRealtimeTaskUpdate = useCallback(
    (updatedTaskRow: TaskRow) => {
      const plan = _allPlansRows.find((p) => p.id === updatedTaskRow.weekly_plan_id) || activePlanRow;
      const weekNumber = plan ? plan.week_number : activeWeek.weekNumber;

      const div = divisionRows.find((d) => d.id === updatedTaskRow.division_id);
      const divisionName = div ? div.name : 'Divisi';
      const updatedAgenda = mapTaskRowToAgendaItem(
        updatedTaskRow,
        divisionName,
        weekNumber
      );

      setAgendas((prev) => {
        const existsIndex = prev.findIndex((item) => item.id === updatedTaskRow.id);
        if (existsIndex >= 0) {
          const updated = [...prev];
          updated[existsIndex] = updatedAgenda;
          return updated;
        }
        return [updatedAgenda, ...prev];
      });
    },
    [_allPlansRows, activePlanRow, divisionRows, activeWeek.weekNumber]
  );

  const handleRealtimeTaskDelete = useCallback((oldTask: { id: string }) => {
    setAgendas((prev) => prev.filter((item) => item.id !== oldTask.id));
  }, []);

  const handleRealtimeWeeklyPlanChange = useCallback(
    (planRow: WeeklyPlanRow) => {
      // If an admin switched active weekly plans
      if (planRow.is_active && activePlanRow && planRow.id !== activePlanRow.id) {
        console.log('Realtime: Pekan kerja aktif berganti. Memuat ulang data...');
        void loadData();
        return;
      }

      // If active plan metadata was updated
      if (activePlanRow && planRow.id === activePlanRow.id) {
        setActivePlanRow(planRow);
        setActiveWeek(mapWeeklyPlanRowToWeekInfo(planRow));
      }

      // Update available weeks list
      setAvailableWeeks((prev) =>
        prev.map((w) =>
          w.weekNumber === planRow.week_number ? mapWeeklyPlanRowToWeekInfo(planRow) : w
        )
      );
    },
    [activePlanRow, loadData]
  );

  const handleRealtimeDivisionChange = useCallback((divisionRow: DivisionRow) => {
    setDivisionRows((prev) =>
      prev.map((d) => (d.id === divisionRow.id ? divisionRow : d))
    );
  }, []);

  const handleRealtimeAppSettingChange = useCallback((settingRow: AppSettingRow) => {
    if (settingRow.key === 'presentation_interval') {
      const parsed = parseInt(settingRow.value || '10', 10);
      if (!isNaN(parsed) && parsed > 0) {
        setPresentationInterval(parsed);
      }
    }
  }, []);

  // Connect the unified Realtime subscription hook
  const { status: realtimeStatus } = useRealtimeAgenda({
    onTaskInsert: handleRealtimeTaskInsert,
    onTaskUpdate: handleRealtimeTaskUpdate,
    onTaskDelete: handleRealtimeTaskDelete,
    onWeeklyPlanChange: handleRealtimeWeeklyPlanChange,
    onDivisionChange: handleRealtimeDivisionChange,
    onAppSettingChange: handleRealtimeAppSettingChange,
  });

  // 8. Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);

  const openAddModal = (prefilledDivisionId?: string, prefilledWeekNumber?: number) => {
    let defaultDivId = prefilledDivisionId;
    if (isDivision && userDivisionId) {
      defaultDivId = userDivisionId;
    } else if (!defaultDivId) {
      defaultDivId = divisionRows[0]?.id || '';
    }
    const divName = divisionRows.find((d) => d.id === defaultDivId)?.name || '';

    setEditingAgenda({
      id: '',
      weekNumber: prefilledWeekNumber || activeWeek.weekNumber,
      title: '',
      time: '09:00 - 11:00',
      day: 'Senin',
      date: '7 Sep 2026',
      status: 'not-started',
      priority: 'medium',
      pic: '',
      location: '',
      notes: '',
      divisionId: defaultDivId,
      divisionName: divName,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (agenda: AgendaItem) => {
    setEditingAgenda({ ...agenda });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAgenda(null);
  };

  const [isWeeklyPlanModalOpen, setIsWeeklyPlanModalOpen] = useState(false);
  const openWeeklyPlanModal = () => setIsWeeklyPlanModalOpen(true);
  const closeWeeklyPlanModal = () => setIsWeeklyPlanModalOpen(false);

  // 9. Toggle complete checklist (Optimistic UI + Background Supabase mutation)
  const toggleCompleteAgenda = async (agendaId: string) => {
    const target = agendas.find((a) => a.id === agendaId);
    if (!target) return;

    if (!canManageAgenda(target)) {
      console.warn('Akses ditolak: Anda tidak memiliki izin mengubah status agenda divisi ini.');
      return;
    }

    const newStatus: 'completed' | 'in-progress' =
      target.status === 'completed' ? 'in-progress' : 'completed';
    const newProgress = newStatus === 'completed' ? 100 : 50;

    // Optimistic state update
    setAgendas((prev) =>
      prev.map((item) =>
        item.id === agendaId ? { ...item, status: newStatus } : item
      )
    );

    // Call Supabase service in background
    try {
      const dbStatus = newStatus === 'completed' ? 'COMPLETED' : 'IN_PROGRESS';
      await updateTaskStatus(agendaId, dbStatus, newProgress);
    } catch (err) {
      console.error('Gagal memperbarui status task di Supabase:', err);
      // Revert on error
      setAgendas((prev) =>
        prev.map((item) =>
          item.id === agendaId ? { ...item, status: target.status } : item
        )
      );
    }
  };

  // 10. Save or Update Agenda
  const saveAgenda = async (agendaData: Partial<AgendaItem>) => {
    if (!agendaData.title || !agendaData.divisionId) return;

    if (!canManageDivision(agendaData.divisionId)) {
      console.warn('Akses ditolak: Anda tidak memiliki izin menyimpan agenda untuk divisi ini.');
      throw new Error('Akses ditolak: Anda tidak memiliki izin menyimpan agenda untuk divisi ini.');
    }

    const division = divisionRows.find((d) => d.id === agendaData.divisionId);
    const divisionName = division ? division.name : agendaData.divisionName || '';

    const dbStatus = (agendaData.status || 'not-started')
      .toUpperCase()
      .replace('-', '_') as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
    const dbPriority = (agendaData.priority || 'medium').toUpperCase() as
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH';

    if (agendaData.id) {
      // UPDATE
      const target = agendas.find((a) => a.id === agendaData.id);
      if (!target || !canManageAgenda(target)) {
        throw new Error('Akses ditolak: Anda tidak memiliki izin menyunting agenda ini.');
      }

      const targetPlan =
        _allPlansRows.find((p) => p.week_number === agendaData.weekNumber) ||
        activePlanRow;

      const updatedRow = await updateTask(agendaData.id, {
        title: agendaData.title,
        status: dbStatus,
        priority: dbPriority,
        pic: agendaData.pic || null,
        location: agendaData.location || null,
        notes: agendaData.notes || null,
        division_id: agendaData.divisionId,
        weekly_plan_id: targetPlan ? targetPlan.id : undefined,
      });

      if (updatedRow) {
        setAgendas((prev) =>
          prev.map((item) =>
            item.id === agendaData.id
              ? {
                  ...item,
                  ...agendaData,
                  weekNumber: targetPlan ? targetPlan.week_number : item.weekNumber,
                  divisionName,
                }
              : item
          )
        );
      }
    } else {
      // INSERT (Create new task)
      const targetPlan =
        _allPlansRows.find((p) => p.week_number === agendaData.weekNumber) ||
        activePlanRow;
      const targetWeeklyPlanId = targetPlan?.id;
      if (!targetWeeklyPlanId) {
        throw new Error('Tidak dapat membuat task: ID weekly plan tidak ditemukan.');
      }

      const taskDate = targetPlan.week_start || new Date().toISOString().slice(0, 10);

      const createdRow = await createTask({
        weekly_plan_id: targetWeeklyPlanId,
        division_id: agendaData.divisionId,
        title: agendaData.title,
        date: taskDate,
        start_time: '09:00:00',
        end_time: '11:00:00',
        status: dbStatus,
        priority: dbPriority,
        progress: dbStatus === 'COMPLETED' ? 100 : 0,
        pic: agendaData.pic || null,
        location: agendaData.location || null,
        notes: agendaData.notes || null,
      });

      if (createdRow) {
        const newAgendaItem = mapTaskRowToAgendaItem(
          createdRow,
          divisionName,
          targetPlan.week_number
        );
        setAgendas((prev) => [newAgendaItem, ...prev]);
      }
    }

    closeModal();
  };

  // 11. Delete Agenda
  const deleteAgenda = async (agendaId: string) => {
    const target = agendas.find((a) => a.id === agendaId);
    if (!target) return;

    if (!canManageAgenda(target)) {
      console.warn('Akses ditolak: Anda tidak memiliki izin menghapus agenda ini.');
      throw new Error('Akses ditolak: Anda tidak memiliki izin menghapus agenda ini.');
    }

    // Optimistic UI delete
    setAgendas((prev) => prev.filter((item) => item.id !== agendaId));

    try {
      await deleteTask(agendaId);
    } catch (err) {
      console.error('Gagal menghapus task di Supabase:', err);
      // Rollback
      setAgendas((prev) => [...prev, target]);
      throw err;
    }

    closeModal();
  };

  const updateDivisionMetadata = async (
    divisionId: string,
    updates: { role_title?: string; lead_name?: string }
  ) => {
    // Optimistic UI update
    setDivisionRows((prev) =>
      prev.map((d) => (d.id === divisionId ? { ...d, ...updates } : d))
    );

    try {
      await updateDivision(divisionId, updates);
    } catch (err) {
      console.error('Gagal memperbarui profil divisi di Supabase:', err);
      // Revert if error
      void loadData();
      throw err;
    }
  };

  const handleCreateWeeklyPlan = async (planData: {
    week_number: number;
    year: number;
    title: string;
    week_start: string;
    week_end: string;
    is_active?: boolean;
  }) => {
    try {
      const newPlan = await apiCreateWeeklyPlan(planData);
      setAllPlansRows((prev) => {
        const exists = prev.some((p) => p.id === newPlan.id);
        if (exists) return prev;
        return [newPlan, ...prev].sort((a, b) => b.week_number - a.week_number);
      });
      const mappedWeek = mapWeeklyPlanRowToWeekInfo(newPlan);
      setAvailableWeeks((prev) => {
        const exists = prev.some((w) => w.weekNumber === mappedWeek.weekNumber);
        if (exists) return prev;
        return [mappedWeek, ...prev].sort((a, b) => b.weekNumber - a.weekNumber);
      });
      if (newPlan.is_active) {
        setActivePlanRow(newPlan);
        setActiveWeek(mappedWeek);
      }
    } catch (err) {
      console.error('Gagal membuat pekan kerja baru di Supabase:', err);
      throw err;
    }
  };

  const handleActivateWeeklyPlan = async (planId: string) => {
    try {
      await apiActivateWeeklyPlan(planId);
      await loadData();
    } catch (err) {
      console.error('Gagal mengaktifkan pekan kerja di Supabase:', err);
      throw err;
    }
  };

  // 12. Priorities Management
  const addPriorityFromAgenda = (agenda: AgendaItem) => {
    const existing = priorities.find((p) => p.sourceAgendaId === agenda.id);
    if (existing) return;

    const newPriority: PriorityItem = {
      id: `p-${Date.now()}`,
      weekNumber: activeWeek.weekNumber,
      level: agenda.priority,
      title: agenda.title,
      division: agenda.divisionName,
      divisionId: agenda.divisionId,
      target: `${agenda.day}, ${agenda.date}`,
      progress: agenda.status === 'completed' ? 100 : agenda.status === 'in-progress' ? 50 : 0,
      sourceAgendaId: agenda.id,
    };

    setPriorities((prev) => [newPriority, ...prev]);
  };

  const addCustomPriority = (priorityData: Omit<PriorityItem, 'id'>) => {
    const newPriority: PriorityItem = {
      id: `cp-${Date.now()}`,
      ...priorityData,
    };
    setPriorities((prev) => [newPriority, ...prev]);
  };

  const removePriority = (priorityId: string) => {
    setPriorities((prev) => prev.filter((p) => p.id !== priorityId));
  };

  const clearWeekPriorities = () => {
    setPriorities((prev) => prev.filter((p) => p.weekNumber !== activeWeek.weekNumber));
  };

  const activePriorities = useMemo(() => {
    return priorities.filter((p) => p.weekNumber === activeWeek.weekNumber);
  }, [priorities, activeWeek.weekNumber]);

  // 13. Dynamic Agendas for Active Week
  const activeWeekAgendas = useMemo(() => {
    return agendas.filter((a) => a.weekNumber === activeWeek.weekNumber);
  }, [agendas, activeWeek.weekNumber]);

  // 14. Helper to calculate Division with live agendas & progress
  const getDivisionsForActiveWeek = useCallback((): Division[] => {
    return divisionRows.map((divRow) => {
      const baseDivision = mapDivisionRowToBaseDivision(divRow);
      const divisionAgendas = activeWeekAgendas.filter(
        (a) => a.divisionId === divRow.id || a.divisionId === divRow.slug
      );

      const total = divisionAgendas.length;
      const completed = divisionAgendas.filter((a) => a.status === 'completed').length;
      const inProgress = divisionAgendas.filter((a) => a.status === 'in-progress').length;
      const delayed = divisionAgendas.filter((a) => a.status === 'delayed').length;
      const notStarted = divisionAgendas.filter((a) => a.status === 'not-started').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...baseDivision,
        agendas: divisionAgendas,
        totalAgenda: total,
        completedAgenda: completed,
        inProgressAgenda: inProgress,
        delayedAgenda: delayed,
        pendingAgenda: notStarted,
        priorityHighlight:
          activePriorities.find((p) => p.divisionId === divRow.id || p.divisionId === divRow.slug)?.title ||
          '',
        progress,
      };
    });
  }, [divisionRows, activeWeekAgendas, activePriorities]);

  // 15. Dynamic Stats
  const weeklyStats: WeeklyStats = useMemo(() => {
    const total = activeWeekAgendas.length;
    const completed = activeWeekAgendas.filter((a) => a.status === 'completed').length;
    const inProgress = activeWeekAgendas.filter((a) => a.status === 'in-progress').length;
    const delayed = activeWeekAgendas.filter((a) => a.status === 'delayed').length;
    const notStarted = activeWeekAgendas.filter((a) => a.status === 'not-started').length;

    return {
      totalAgenda: total,
      completed,
      inProgress,
      delayed,
      notStarted,
    };
  }, [activeWeekAgendas]);

  // Today Agendas
  const todayAgendas = useMemo(() => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayName = dayNames[new Date().getDay()] || 'Selasa';
    return activeWeekAgendas.filter((a) => a.day === todayName);
  }, [activeWeekAgendas]);

  // Day Agenda Distribution (MON - SAT)
  const dayAgendaCounts = useMemo(() => {
    const days = [
      { day: 'MON', fullDay: 'Senin', date: '7 Sep' },
      { day: 'TUE', fullDay: 'Selasa', date: '8 Sep' },
      { day: 'WED', fullDay: 'Rabu', date: '9 Sep' },
      { day: 'THU', fullDay: 'Kamis', date: '10 Sep' },
      { day: 'FRI', fullDay: 'Jumat', date: '11 Sep' },
      { day: 'SAT', fullDay: 'Sabtu', date: '12 Sep' },
    ];

    return days.map((d) => {
      const count = activeWeekAgendas.filter((a) => a.day === d.fullDay).length;
      return {
        ...d,
        count,
      };
    });
  }, [activeWeekAgendas]);

  const fullDivisions = useMemo(() => {
    return getDivisionsForActiveWeek();
  }, [getDivisionsForActiveWeek]);

  return (
    <AgendaContext.Provider
      value={{
        isLoading,
        error,
        refetchData: loadData,
        realtimeStatus,
        presentationInterval,
        isSuperAdmin,
        setIsSuperAdmin,
        canManageDivision,
        canManageAgenda,
        activeWeek,
        setActiveWeek,
        availableWeeks,
        allPlans: _allPlansRows,
        createWeeklyPlan: handleCreateWeeklyPlan,
        activateWeeklyPlan: handleActivateWeeklyPlan,
        agendas,
        divisions: fullDivisions,
        toggleCompleteAgenda,
        saveAgenda,
        deleteAgenda,
        updateDivisionMetadata,
        isModalOpen,
        editingAgenda,
        openAddModal,
        openEditModal,
        closeModal,
        isWeeklyPlanModalOpen,
        openWeeklyPlanModal,
        closeWeeklyPlanModal,
        weeklyStats,
        todayAgendas,
        getDivisionsForActiveWeek,
        dayAgendaCounts,
        priorities,
        activePriorities,
        addPriorityFromAgenda,
        addCustomPriority,
        removePriority,
        clearWeekPriorities,
        isPriorityModalOpen,
        openPriorityModal,
        closePriorityModal,
        priorityModalTab,
        setPriorityModalTab,
      }}
    >
      {children}
    </AgendaContext.Provider>
  );
};

export const useAgenda = () => {
  const context = useContext(AgendaContext);
  if (!context) {
    throw new Error('useAgenda must be used within an AgendaProvider');
  }
  return context;
};
