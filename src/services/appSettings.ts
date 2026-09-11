import { supabase } from '../lib/supabase';

/**
 * Fetch all app settings as a key-value record
 */
export async function getAppSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('app_settings').select('key, value');

  if (error) {
    console.error('Error fetching app settings:', error.message);
    throw error;
  }

  const map: Record<string, string> = {};
  (data || []).forEach((row) => {
    if (row.key && row.value !== null) {
      map[row.key] = row.value;
    }
  });

  return map;
}

/**
 * Fetch a single setting value by key
 */
export async function getAppSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching setting ${key}:`, error.message);
    throw error;
  }

  return data ? data.value : null;
}

/**
 * Set or upsert an app setting by key
 */
export async function setAppSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) {
    console.error(`Error saving setting ${key}:`, error.message);
    throw error;
  }
}
