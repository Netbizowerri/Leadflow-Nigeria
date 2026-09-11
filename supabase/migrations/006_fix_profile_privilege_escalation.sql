-- =============================================================
-- LeadFlow Nigeria 006: Close privilege-escalation hole on profiles
--
-- The "Users can update own profile" policy allowed any authenticated
-- user to UPDATE their own row and change role, is_verified and
-- is_active -- i.e. self-promote to super_admin.
--
-- This migration:
--   1. Revokes broad INSERT/UPDATE on profiles from authenticated.
--   2. Grants column-scoped UPDATE (full_name only).
--   3. Adds a before-update trigger that blocks any change to
--      role / is_verified / is_active unless a *verified, active*
--      super admin is acting (defense in depth, survives future
--      grant regressions). Out-of-band contexts (auth.uid() IS NULL,
--      e.g. SQL editor / service_role) are still allowed.
-- =============================================================

-- 1. Revoke broad INSERT/UPDATE from authenticated. The admin RPCs
--    (004) are SECURITY DEFINER and do not need invoker table grants;
--    the signup trigger (001) inserts as its definer.
REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;

-- 2. Users may still update ONLY their own display name.
GRANT UPDATE (full_name) ON public.profiles TO authenticated;

-- 3. Defense-in-depth trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Only a verified super admin may change role or verification fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();