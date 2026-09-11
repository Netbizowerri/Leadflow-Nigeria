-- =============================================================
-- LeadFlow Nigeria: Seed Super Admin
-- Run this AFTER 001 and 002 migrations
--
-- IMPORTANT: You must first sign up as Netbiz0925@gmail.com via the app
-- or via Supabase Dashboard > Auth > Users, then run this SQL.
--
-- Steps:
-- 1. Go to https://supabase.com/dashboard/project/gjqirvjnzounvwptsgzd/auth/users
-- 2. Create a new user: Netbiz0925@gmail.com (choose a strong, unique password)
-- 3. Run this SQL in the SQL Editor
-- =============================================================

-- Promote the super admin user
-- This updates the profile created by the trigger
UPDATE public.profiles
SET
  role = 'super_admin',
  is_verified = true,
  is_active = true,
  full_name = 'Super Admin'
WHERE email = 'Netbiz0925@gmail.com';

-- If the profile doesn't exist yet (user hasn't signed up), this will update 0 rows.
-- After the user signs up, run this again OR the trigger will auto-create with role='user'.

-- Verify the update
SELECT id, email, full_name, role, is_verified, is_active
FROM public.profiles
WHERE email = 'Netbiz0925@gmail.com';
