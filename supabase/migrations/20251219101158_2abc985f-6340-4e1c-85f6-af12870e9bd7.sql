-- Fix sync_logs RLS policies to restrict writes to service role only

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Service can insert sync logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Service can update sync logs" ON public.sync_logs;

-- Create service-role-only policies
CREATE POLICY "Service role can insert sync logs" 
  ON public.sync_logs 
  FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can update sync logs" 
  ON public.sync_logs 
  FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'service_role');