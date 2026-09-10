-- ==============================================================================
-- MIGRATION: 20260908000001_initial_schema.sql
-- DESCRIPTION: Core schema, tables, constraints, indexes, triggers, and RLS
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. REUSABLE TRIGGER FUNCTIONS

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CLOCK_TIMESTAMP();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure status and progress consistency on tasks
CREATE OR REPLACE FUNCTION public.sync_task_status_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND NEW.progress < 100 THEN
    NEW.progress := 100;
  ELSIF NEW.progress = 100 AND NEW.status != 'COMPLETED' THEN
    NEW.status := 'COMPLETED';
  ELSIF NEW.status = 'NOT_STARTED' AND NEW.progress > 0 AND NEW.progress < 100 THEN
    NEW.status := 'IN_PROGRESS';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLES CREATION

-- TABLE: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'SUPERADMIN',
  avatar_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_profiles_role CHECK (role IN ('SUPERADMIN', 'MANAGER', 'STAFF'))
);

-- TABLE: divisions
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NULL,
  icon TEXT NULL,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: weekly_plans
CREATE TABLE IF NOT EXISTS public.weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_weekly_plans_week_number CHECK (week_number >= 1 AND week_number <= 53),
  CONSTRAINT chk_weekly_plans_dates CHECK (week_start <= week_end),
  CONSTRAINT uq_weekly_plans_year_week UNIQUE (year, week_number)
);

-- TABLE: tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_id UUID NOT NULL REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NULL,
  date DATE NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  pic TEXT NULL,
  location TEXT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  progress INTEGER NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_tasks_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  CONSTRAINT chk_tasks_status CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED')),
  CONSTRAINT chk_tasks_progress CHECK (progress >= 0 AND progress <= 100)
);

-- TABLE: app_settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES

-- weekly_plans indexes
CREATE INDEX IF NOT EXISTS idx_weekly_plans_lookup
  ON public.weekly_plans (year, week_number, is_active);

-- tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_weekly_plan_id
  ON public.tasks (weekly_plan_id);

CREATE INDEX IF NOT EXISTS idx_tasks_division_id
  ON public.tasks (division_id);

CREATE INDEX IF NOT EXISTS idx_tasks_date
  ON public.tasks (date);

CREATE INDEX IF NOT EXISTS idx_tasks_status
  ON public.tasks (status);

CREATE INDEX IF NOT EXISTS idx_tasks_priority
  ON public.tasks (priority);

CREATE INDEX IF NOT EXISTS idx_tasks_plan_division
  ON public.tasks (weekly_plan_id, division_id);

-- 5. TRIGGERS

-- updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_divisions ON public.divisions;
CREATE TRIGGER set_updated_at_divisions
BEFORE UPDATE ON public.divisions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_weekly_plans ON public.weekly_plans;
CREATE TRIGGER set_updated_at_weekly_plans
BEFORE UPDATE ON public.weekly_plans
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_tasks ON public.tasks;
CREATE TRIGGER set_updated_at_tasks
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_app_settings ON public.app_settings;
CREATE TRIGGER set_updated_at_app_settings
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Task status & progress consistency trigger
DROP TRIGGER IF EXISTS trg_sync_task_status_progress ON public.tasks;
CREATE TRIGGER trg_sync_task_status_progress
BEFORE INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.sync_task_status_progress();

-- 6. ROW LEVEL SECURITY (RLS)

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check if current user is SUPERADMIN
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'SUPERADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- RLS POLICIES: profiles
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_superadmin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_superadmin"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "profiles_insert_own_or_superadmin" ON public.profiles;
CREATE POLICY "profiles_insert_own_or_superadmin"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "profiles_update_own_or_superadmin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_superadmin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_superadmin())
WITH CHECK (id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "profiles_delete_superadmin" ON public.profiles;
CREATE POLICY "profiles_delete_superadmin"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.is_superadmin());

-- ------------------------------------------------------------------------------
-- RLS POLICIES: divisions
-- ------------------------------------------------------------------------------
-- Anonymous and Authenticated users can read active divisions for presentation / dashboard
DROP POLICY IF EXISTS "divisions_select_active" ON public.divisions;
CREATE POLICY "divisions_select_active"
ON public.divisions
FOR SELECT
TO anon, authenticated
USING (is_active = true OR public.is_superadmin());

-- Only authenticated SUPERADMIN can insert, update, delete
DROP POLICY IF EXISTS "divisions_insert_superadmin" ON public.divisions;
CREATE POLICY "divisions_insert_superadmin"
ON public.divisions
FOR INSERT
TO authenticated
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "divisions_update_superadmin" ON public.divisions;
CREATE POLICY "divisions_update_superadmin"
ON public.divisions
FOR UPDATE
TO authenticated
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "divisions_delete_superadmin" ON public.divisions;
CREATE POLICY "divisions_delete_superadmin"
ON public.divisions
FOR DELETE
TO authenticated
USING (public.is_superadmin());

-- ------------------------------------------------------------------------------
-- RLS POLICIES: weekly_plans
-- ------------------------------------------------------------------------------
-- Anonymous and Authenticated users can read active plans (or superadmin can read all)
DROP POLICY IF EXISTS "weekly_plans_select_active" ON public.weekly_plans;
CREATE POLICY "weekly_plans_select_active"
ON public.weekly_plans
FOR SELECT
TO anon, authenticated
USING (is_active = true OR public.is_superadmin());

-- Only authenticated SUPERADMIN can modify weekly plans
DROP POLICY IF EXISTS "weekly_plans_insert_superadmin" ON public.weekly_plans;
CREATE POLICY "weekly_plans_insert_superadmin"
ON public.weekly_plans
FOR INSERT
TO authenticated
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "weekly_plans_update_superadmin" ON public.weekly_plans;
CREATE POLICY "weekly_plans_update_superadmin"
ON public.weekly_plans
FOR UPDATE
TO authenticated
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "weekly_plans_delete_superadmin" ON public.weekly_plans;
CREATE POLICY "weekly_plans_delete_superadmin"
ON public.weekly_plans
FOR DELETE
TO authenticated
USING (public.is_superadmin());

-- ------------------------------------------------------------------------------
-- RLS POLICIES: tasks
-- ------------------------------------------------------------------------------
-- Anonymous and Authenticated can read tasks of the active weekly plan
DROP POLICY IF EXISTS "tasks_select_active_plan" ON public.tasks;
CREATE POLICY "tasks_select_active_plan"
ON public.tasks
FOR SELECT
TO anon, authenticated
USING (
  weekly_plan_id IN (SELECT id FROM public.weekly_plans WHERE is_active = true)
  OR public.is_superadmin()
);

-- Only authenticated SUPERADMIN can insert, update, or delete tasks
DROP POLICY IF EXISTS "tasks_insert_superadmin" ON public.tasks;
CREATE POLICY "tasks_insert_superadmin"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "tasks_update_superadmin" ON public.tasks;
CREATE POLICY "tasks_update_superadmin"
ON public.tasks
FOR UPDATE
TO authenticated
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "tasks_delete_superadmin" ON public.tasks;
CREATE POLICY "tasks_delete_superadmin"
ON public.tasks
FOR DELETE
TO authenticated
USING (public.is_superadmin());

-- ------------------------------------------------------------------------------
-- RLS POLICIES: app_settings
-- ------------------------------------------------------------------------------
-- Anonymous and Authenticated can read settings (for presentation mode interval, branding, etc.)
DROP POLICY IF EXISTS "app_settings_select_public" ON public.app_settings;
CREATE POLICY "app_settings_select_public"
ON public.app_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated SUPERADMIN can modify settings
DROP POLICY IF EXISTS "app_settings_insert_superadmin" ON public.app_settings;
CREATE POLICY "app_settings_insert_superadmin"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "app_settings_update_superadmin" ON public.app_settings;
CREATE POLICY "app_settings_update_superadmin"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "app_settings_delete_superadmin" ON public.app_settings;
CREATE POLICY "app_settings_delete_superadmin"
ON public.app_settings
FOR DELETE
TO authenticated
USING (public.is_superadmin());
