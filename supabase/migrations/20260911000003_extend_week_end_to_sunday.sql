-- Migration: Extend week_end to Sunday for weekly plans
UPDATE public.weekly_plans
SET week_end = week_start + 6,
    updated_at = now()
WHERE week_end = week_start + 5;
