
REVOKE EXECUTE ON FUNCTION public.nightly_reaudit_sweep() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nightly_reaudit_sweep() TO postgres, service_role;
