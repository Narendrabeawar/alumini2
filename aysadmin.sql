-- aysadmin.sql: Promote a specific user (by email) to admin and approve flags
-- Usage: Run in Supabase SQL Editor (adjust email if needed)

-- 1) Verify user exists
select id, email
from auth.users
where lower(email) = lower('ays_beawar@rediff.com');

-- 2) Promote to admin: ensure profile exists, set is_admin, approve admin_flags
begin;

with u as (
  select id from auth.users where lower(email) = lower('ays_beawar@rediff.com') limit 1
)
insert into public.profiles (id, full_name, is_admin)
select u.id, coalesce((select raw_user_meta_data->>'full_name' from auth.users au where au.id = u.id), ''), true
from u
on conflict (id) do update set is_admin = true;

with u as (
  select id from auth.users where lower(email) = lower('ays_beawar@rediff.com') limit 1
)
insert into public.admin_flags (user_id, status, is_verified)
select u.id, 'approved', true
from u
on conflict (user_id) do update set status = 'approved', is_verified = true;

commit;


