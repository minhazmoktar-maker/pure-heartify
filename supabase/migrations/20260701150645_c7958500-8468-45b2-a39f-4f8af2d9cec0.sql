
-- 1. Profiles: restrict SELECT to owner
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. channels_state: admin-only
DROP POLICY IF EXISTS "Authenticated can view channel state" ON public.channels_state;
CREATE POLICY "Admins can view channel state"
  ON public.channels_state FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Lock down SECURITY DEFINER helpers from direct API execution.
-- has_role is invoked from RLS policies (which run as definer), not from the client.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
