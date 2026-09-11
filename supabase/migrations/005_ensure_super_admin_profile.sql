-- =============================================================
-- LeadFlow Nigeria 005: Ensure Super Admin profile exists
-- The trigger (001) only fires for users created AFTER it was
-- applied. Netbiz0925@gmail.com pre-dates it, so it has no
-- profile row -> the app could not load, verify, or promote it.
--
-- This migration creates the row (keyed to the auth user by
-- email) and promotes it to super_admin, idempotently.
-- =============================================================

INSERT INTO public.profiles (id, email, full_name, role, is_verified, is_active, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Netbiz0925'),
  'super_admin',
  TRUE,
  TRUE,
  COALESCE(u.created_at, now()),
  now()
FROM auth.users u
WHERE u.email ILIKE 'Netbiz0925@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email       = EXCLUDED.email,
  full_name   = public.profiles.full_name, -- keep an existing real name if set
  role        = 'super_admin',
  is_verified = TRUE,
  is_active   = TRUE,
  updated_at  = now();
