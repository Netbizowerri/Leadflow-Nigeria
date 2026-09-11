-- =============================================================
-- LeadFlow Nigeria: Admin RPC Functions (Super Admin only)
-- These SECURITY DEFINER functions check is_super_admin() before
-- performing privileged operations. Never expose service_role to the client.
-- =============================================================

-- 1. LIST USERS (super admin only) - joins auth.users for sign-in info
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  is_verified BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.email, p.full_name, p.role, p.is_verified, p.is_active,
    p.created_at, p.updated_at,
    u.last_sign_in_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at ASC;
END;
$$;

-- 2. VERIFY USER
CREATE OR REPLACE FUNCTION public.admin_verify_user(target_user_id UUID, verified BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own verification status';
  END IF;

  UPDATE public.profiles
  SET is_verified = COALESCE(verified, true)
  WHERE id = target_user_id;
  RETURN FOUND;
END;
$$;

-- 3. SET USER ACTIVE / INACTIVE
CREATE OR REPLACE FUNCTION public.admin_set_user_active(target_user_id UUID, active BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot deactivate your own account';
  END IF;

  UPDATE public.profiles
  SET is_active = active
  WHERE id = target_user_id;
  RETURN FOUND;
END;
$$;

-- 4. SET USER ROLE (super_admin / admin / user)
CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF new_role NOT IN ('super_admin', 'admin', 'user') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;
  IF target_user_id = auth.uid() AND new_role <> 'super_admin' THEN
    RAISE EXCEPTION 'You cannot demote yourself';
  END IF;

  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_user_id;
  RETURN FOUND;
END;
$$;

-- 5. DELETE USER (removes auth user + cascades to profile & all user data)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
  RETURN FOUND;
END;
$$;

-- 6. GRANT EXECUTE to authenticated (the functions self-guard with is_super_admin())
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_verify_user(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_active(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;