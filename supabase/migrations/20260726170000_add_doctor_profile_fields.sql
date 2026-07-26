-- Add extended doctor profile fields and a read policy for doctor directory access

alter table public.profiles
  add column specialty text,
  add column phone text,
  add column bio text,
  add column available boolean not null default true,
  add column consultation_fee numeric,
  add column services jsonb not null default '[]'::jsonb;

create policy "Profiles: public doctor directory read access" on public.profiles
  for select using (role = 'doctor');
