-- Migration: Allow authenticated users to manage weekly_priorities in app_settings
DROP POLICY IF EXISTS "app_settings_priorities_authenticated" ON public.app_settings;
CREATE POLICY "app_settings_priorities_authenticated"
ON public.app_settings
FOR ALL
TO authenticated
USING (key = 'weekly_priorities' OR public.is_superadmin())
WITH CHECK (key = 'weekly_priorities' OR public.is_superadmin());

-- Ensure weekly_priorities row exists
INSERT INTO public.app_settings (key, value)
VALUES ('weekly_priorities', '[]')
ON CONFLICT (key) DO NOTHING;
