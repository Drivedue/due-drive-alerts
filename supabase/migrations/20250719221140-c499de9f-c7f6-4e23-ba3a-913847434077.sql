
-- Update the trigger function to send the correct payload format expected by the auto-sync edge function
CREATE OR REPLACE FUNCTION public.trigger_auto_sync_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the auto-sync edge function using pg_net with the correct payload format
  PERFORM
    net.http_post(
      url := 'https://mhtxarzcokmwodflefeo.supabase.co/functions/v1/auto-sync-user-profile',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odHhhcnpjb2ttd29kZmxlZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzAxMjcsImV4cCI6MjA2NzIwNjEyN30.JQ3NW5-8jy_woPU1BwuVyxwndtpJ5HqP7Bu4PWPhLe0"}'::jsonb,
      body := json_build_object(
        'record', to_jsonb(NEW),
        'old_record', to_jsonb(OLD)
      )::jsonb
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the original operation
    RAISE WARNING 'Failed to sync user profile to NotificationAPI: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create a table to track sync status and failures
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'failed', 'pending'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for sync_logs
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync logs" 
  ON public.sync_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert sync logs" 
  ON public.sync_logs 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service can update sync logs" 
  ON public.sync_logs 
  FOR UPDATE 
  USING (true);
