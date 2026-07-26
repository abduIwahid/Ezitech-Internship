-- Seed a few doctor users into auth.users so the profiles trigger creates doctor profiles
-- Uses the same insert pattern as seed_db.py. Adjust emails/passwords as needed.

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES
  (
    '10000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000000',
    'mira.shah@medisight.ai',
    crypt('MedisightTemp1', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Dr. Mira Shah", "role": "doctor", "department": "Cardiology"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000000',
    'samuel.ortega@medisight.ai',
    crypt('MedisightTemp2', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Dr. Samuel Ortega", "role": "doctor", "department": "Endocrinology"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000000',
    'priya.nair@medisight.ai',
    crypt('MedisightTemp3', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Dr. Priya Nair", "role": "doctor", "department": "Nephrology"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- OPTIONAL: confirm profiles were created
-- SELECT id, full_name, role, department FROM public.profiles WHERE full_name ILIKE 'Dr.%';
