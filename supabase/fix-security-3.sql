-- Switch set_updated_at to SECURITY INVOKER (triggers don't need elevated privileges)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Drop the public RPC function — admin dashboard now uses direct queries
DROP FUNCTION IF EXISTS public.get_dashboard_stats();
