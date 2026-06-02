
-- 1. Restrict profiles to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- 2. Restrict channels_state to authenticated users
DROP POLICY IF EXISTS "Anyone can view channel state" ON public.channels_state;
CREATE POLICY "Authenticated can view channel state"
  ON public.channels_state FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.channels_state FROM anon;

-- 3. Prevent admins from deleting their own role (lockout protection)
CREATE POLICY "Admins cannot delete own role"
  ON public.user_roles
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (user_id <> auth.uid() OR role <> 'admin'::app_role);

-- 4. Revoke EXECUTE on has_role from anon/authenticated (only used internally by RLS as SECURITY DEFINER; RLS evaluation does not require EXECUTE grant to roles)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
