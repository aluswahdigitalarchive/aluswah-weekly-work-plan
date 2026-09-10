-- ==============================================================================
-- MIGRATION: 20260908000003_auth_realtime_and_data_hardening.sql
-- DESCRIPTION: Revision for SUPERADMIN/DIVISION model, Realtime WAL publications,
--              single active weekly plan auto-deactivation trigger, and task integrity checks.
-- ==============================================================================

-- 1. PROFILE ROLE MODEL HARDENING (SUPERADMIN and DIVISION ONLY)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_role;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_role CHECK (role IN ('SUPERADMIN', 'DIVISION'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profile_role_division;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profile_role_division CHECK (
  (role = 'SUPERADMIN' AND division_id IS NULL) OR
  (role = 'DIVISION' AND division_id IS NOT NULL)
);

-- Helper security definer functions for RLS
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'SUPERADMIN'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_division_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_div_id uuid;
BEGIN
  SELECT division_id INTO v_div_id
  FROM public.profiles
  WHERE id = auth.uid() AND role = 'DIVISION';
  RETURN v_div_id;
END;
$$;

-- 2. DATA INTEGRITY CONSTRAINTS
-- Ensure task title is non-empty after trimming
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS chk_tasks_title_not_empty;
ALTER TABLE public.tasks ADD CONSTRAINT chk_tasks_title_not_empty CHECK (length(trim(title)) > 0);

-- Ensure task start_time <= end_time if both are provided
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS chk_tasks_time_range;
ALTER TABLE public.tasks ADD CONSTRAINT chk_tasks_time_range CHECK (
  start_time IS NULL OR end_time IS NULL OR start_time <= end_time
);

-- 3. SINGLE ACTIVE WEEKLY PLAN AUTOMATION & CONSTRAINT
CREATE OR REPLACE FUNCTION public.ensure_single_active_weekly_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.weekly_plans
    SET is_active = false
    WHERE id <> NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_single_active_weekly_plan ON public.weekly_plans;
CREATE TRIGGER trg_single_active_weekly_plan
BEFORE INSERT OR UPDATE OF is_active ON public.weekly_plans
FOR EACH ROW
WHEN (NEW.is_active = true)
EXECUTE FUNCTION public.ensure_single_active_weekly_plan();

CREATE UNIQUE INDEX IF NOT EXISTS uq_single_active_weekly_plan
ON public.weekly_plans((1))
WHERE is_active = true;

-- 4. REPLICA IDENTITY FULL (SUPABASE REALTIME PAYLOAD INTEGRITY)
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.weekly_plans REPLICA IDENTITY FULL;
ALTER TABLE public.divisions REPLICA IDENTITY FULL;
ALTER TABLE public.app_settings REPLICA IDENTITY FULL;

-- 5. REALTIME PUBLICATION SETUP
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks, public.weekly_plans, public.divisions, public.app_settings;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END $$;
