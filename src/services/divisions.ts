import { supabase, DivisionRow } from '../lib/supabase';

/**
 * Fetch all active divisions ordered by display_order
 */
export async function getDivisions(): Promise<DivisionRow[]> {
  const { data, error } = await supabase
    .from('divisions')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching divisions from Supabase:', error.message);
    throw error;
  }

  return data || [];
}

/**
 * Update division metadata (subtitle/role_title, penanggung jawab/lead_name) - SUPERADMIN only
 */
export async function updateDivision(
  id: string,
  updates: { role_title?: string; lead_name?: string }
): Promise<DivisionRow> {
  const { data, error } = await supabase
    .from('divisions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating division in Supabase:', error.message);
    throw error;
  }

  return data;
}
