import { supabase, WeeklyPlanRow } from '../lib/supabase';

/**
 * Fetch the currently active weekly plan (is_active = true)
 */
export async function getActiveWeeklyPlan(): Promise<WeeklyPlanRow | null> {
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('is_active', true)
    .order('week_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active weekly plan from Supabase:', error.message);
    throw error;
  }

  return data;
}

/**
 * Fetch all weekly plans ordered by year and week number
 */
export async function getWeeklyPlans(): Promise<WeeklyPlanRow[]> {
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .order('year', { ascending: false })
    .order('week_number', { ascending: false });

  if (error) {
    console.error('Error fetching weekly plans from Supabase:', error.message);
    throw error;
  }

  return data || [];
}

/**
 * Create a new weekly plan - SUPERADMIN only
 */
export async function createWeeklyPlan(planData: {
  week_number: number;
  year: number;
  title: string;
  week_start: string;
  week_end: string;
  is_active?: boolean;
}): Promise<WeeklyPlanRow> {
  const { data, error } = await supabase
    .from('weekly_plans')
    .insert({
      week_number: planData.week_number,
      year: planData.year,
      title: planData.title,
      week_start: planData.week_start,
      week_end: planData.week_end,
      is_active: planData.is_active || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating weekly plan in Supabase:', error.message);
    throw error;
  }

  return data;
}

/**
 * Activate a weekly plan - SUPERADMIN only
 * Note: Database trigger automatically deactivates any other active plan atomically.
 */
export async function activateWeeklyPlan(planId: string): Promise<WeeklyPlanRow> {
  const { data, error } = await supabase
    .from('weekly_plans')
    .update({ is_active: true })
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error('Error activating weekly plan in Supabase:', error.message);
    throw error;
  }

  return data;
}

/**
 * Delete a weekly plan - SUPERADMIN only
 */
export async function deleteWeeklyPlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from('weekly_plans')
    .delete()
    .eq('id', planId);

  if (error) {
    console.error('Error deleting weekly plan in Supabase:', error.message);
    throw error;
  }
}
