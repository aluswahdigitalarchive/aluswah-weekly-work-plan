-- ==============================================================================
-- MIGRATION: 20260909000001_multi_week_plans.sql
-- DESCRIPTION: Enable multi-week visibility and planning. Allows users and divisions
--              to view and plan tasks for future weeks (such as Pekan Depan).
-- ==============================================================================

-- 1. Seed Pekan 38 (Pekan Depan)
INSERT INTO public.weekly_plans (week_number, year, title, week_start, week_end, is_active)
VALUES (38, 2026, 'Rencana Kerja Pekan Depan', '2026-09-14', '2026-09-19', false)
ON CONFLICT (year, week_number) DO NOTHING;

-- 2. Update weekly_plans SELECT policy so all created weeks are visible in WeekSelector
DROP POLICY IF EXISTS "weekly_plans_select_active" ON public.weekly_plans;
DROP POLICY IF EXISTS "weekly_plans_select_all" ON public.weekly_plans;
CREATE POLICY "weekly_plans_select_all" ON public.weekly_plans
FOR SELECT TO anon, authenticated
USING (true);

-- 3. Update tasks SELECT policy so tasks in all available weeks are readable
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_select_all" ON public.tasks;
CREATE POLICY "tasks_select_all" ON public.tasks
FOR SELECT TO anon, authenticated
USING (true);
