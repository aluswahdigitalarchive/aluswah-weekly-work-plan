-- Migration: Rename Divisi Kesehatan to Unit Kesehatan and create auth user kesehatan@aluswah.id
UPDATE public.divisions
SET name = 'Unit Kesehatan',
    updated_at = now()
WHERE slug = 'kesehatan';

DO 
DECLARE
  v_user_id uuid;
  v_div_id uuid;
BEGIN
  -- Get division ID
  SELECT id INTO v_div_id FROM public.divisions WHERE slug = 'kesehatan';

  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'kesehatan@aluswah.id';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      reauthentication_token,
      email_change_token_current,
      phone_change,
      phone_change_token,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'kesehatan@aluswah.id',
      crypt('Aluswah2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Unit Kesehatan"}'::jsonb,
      false,
      '', '', '', '', '', '', '', '',
      now(),
      now()
    );

    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      created_at,
      updated_at,
      last_sign_in_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id::text,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'kesehatan@aluswah.id'),
      'email',
      now(),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Aluswah2026!', gen_salt('bf')),
        raw_user_meta_data = '{"full_name":"Unit Kesehatan"}'::jsonb,
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Upsert profile
  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    division_id,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'Unit Kesehatan',
    'DIVISION',
    v_div_id,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    division_id = EXCLUDED.division_id,
    updated_at = now();

END ;
