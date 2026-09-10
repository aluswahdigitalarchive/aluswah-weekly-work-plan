import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Supabase Configuration Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY in environment variables (.env.local).'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Convenience row types for services & mappers
export type DivisionRow = Database['public']['Tables']['divisions']['Row'];
export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type WeeklyPlanRow = Database['public']['Tables']['weekly_plans']['Row'];
export type AppSettingRow = Database['public']['Tables']['app_settings']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
