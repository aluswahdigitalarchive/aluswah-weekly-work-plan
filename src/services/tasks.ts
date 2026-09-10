import { supabase, TaskRow } from '../lib/supabase';
import type { Database } from '../types/database';

export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

/**
 * Fetch all tasks for a specific weekly plan
 */
export async function getTasksByWeeklyPlan(weeklyPlanId: string): Promise<TaskRow[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('weekly_plan_id', weeklyPlanId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error(`Error fetching tasks for weekly plan ${weeklyPlanId}:`, error.message);
    throw error;
  }

  return data || [];
}

/**
 * Fetch all tasks across all weekly plans
 */
export async function getAllTasks(): Promise<TaskRow[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching all tasks:', error.message);
    throw error;
  }

  return data || [];
}

/**
 * Fetch tasks for a specific division within a weekly plan
 */
export async function getTasksByDivision(
  weeklyPlanId: string,
  divisionId: string
): Promise<TaskRow[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('weekly_plan_id', weeklyPlanId)
    .eq('division_id', divisionId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error(
      `Error fetching tasks for division ${divisionId} in plan ${weeklyPlanId}:`,
      error.message
    );
    throw error;
  }

  return data || [];
}

/**
 * Update task status and progress (checklist toggle)
 */
export async function updateTaskStatus(
  taskId: string,
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'DELAYED',
  progress: number
): Promise<TaskRow | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, progress })
    .eq('id', taskId)
    .select()
    .maybeSingle();

  if (error) {
    console.error(`Error updating task ${taskId}:`, error.message);
    throw error;
  }

  return data;
}

/**
 * Create a new task
 */
export async function createTask(task: TaskInsert): Promise<TaskRow | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error.message);
    throw error;
  }

  return data;
}

/**
 * Update existing task
 */
export async function updateTask(
  taskId: string,
  updates: TaskUpdate
): Promise<TaskRow | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .maybeSingle();

  if (error) {
    console.error(`Error updating task ${taskId}:`, error.message);
    throw error;
  }

  return data;
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);

  if (error) {
    console.error(`Error deleting task ${taskId}:`, error.message);
    throw error;
  }

  return true;
}
