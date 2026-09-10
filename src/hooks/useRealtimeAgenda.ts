import { useEffect, useRef, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, TaskRow, WeeklyPlanRow, DivisionRow, AppSettingRow } from '../lib/supabase';

export type RealtimeStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface UseRealtimeAgendaOptions {
  onTaskInsert?: (task: TaskRow) => void;
  onTaskUpdate?: (task: TaskRow) => void;
  onTaskDelete?: (oldTask: { id: string }) => void;
  onWeeklyPlanChange?: (plan: WeeklyPlanRow) => void;
  onDivisionChange?: (division: DivisionRow) => void;
  onAppSettingChange?: (setting: AppSettingRow) => void;
}

export function useRealtimeAgenda(options: UseRealtimeAgendaOptions) {
  const [status, setStatus] = useState<RealtimeStatus>('CONNECTING');
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    let isSubscribed = true;

    // Single unified channel for all weekly agenda realtime events
    const channel: RealtimeChannel = supabase
      .channel('public:agenda_realtime')
      // 1. Tasks
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          if (isSubscribed && optionsRef.current.onTaskInsert) {
            optionsRef.current.onTaskInsert(payload.new as TaskRow);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          if (isSubscribed && optionsRef.current.onTaskUpdate) {
            optionsRef.current.onTaskUpdate(payload.new as TaskRow);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tasks' },
        (payload) => {
          if (isSubscribed && optionsRef.current.onTaskDelete) {
            optionsRef.current.onTaskDelete(payload.old as { id: string });
          }
        }
      )
      // 2. Weekly Plans
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weekly_plans' },
        (payload) => {
          if (isSubscribed && optionsRef.current.onWeeklyPlanChange) {
            const plan = (payload.new && Object.keys(payload.new).length > 0
              ? payload.new
              : payload.old) as WeeklyPlanRow;
            optionsRef.current.onWeeklyPlanChange(plan);
          }
        }
      )
      // 3. Divisions
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'divisions' },
        (payload) => {
          if (isSubscribed && optionsRef.current.onDivisionChange) {
            optionsRef.current.onDivisionChange(payload.new as DivisionRow);
          }
        }
      )
      // 4. App Settings
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_settings' },
        (payload) => {
          if (isSubscribed && optionsRef.current.onAppSettingChange) {
            optionsRef.current.onAppSettingChange(payload.new as AppSettingRow);
          }
        }
      )
      .subscribe((channelStatus, err) => {
        if (!isSubscribed) return;

        if (channelStatus === 'SUBSCRIBED') {
          setStatus('CONNECTED');
        } else if (channelStatus === 'TIMED_OUT') {
          console.warn('Realtime channel timed out, waiting for auto-reconnect...');
          setStatus('DISCONNECTED');
        } else if (channelStatus === 'CLOSED') {
          setStatus('DISCONNECTED');
        } else if (channelStatus === 'CHANNEL_ERROR') {
          console.error('Realtime channel error:', err);
          setStatus('ERROR');
        }
      });

    return () => {
      isSubscribed = false;
      void channel.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, []);

  return { status };
}
