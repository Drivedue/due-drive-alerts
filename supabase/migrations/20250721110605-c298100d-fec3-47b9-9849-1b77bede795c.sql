-- Test and fix the auto-sync triggers for profiles table

-- First, let's check if triggers exist and recreate them properly
DROP TRIGGER IF EXISTS auto_sync_user_profile_trigger ON public.profiles;
DROP TRIGGER IF EXISTS auto_sync_new_user_profile_trigger ON public.profiles;

-- Update the trigger function to use the correct edge function URL and handle errors better
CREATE OR REPLACE FUNCTION public.trigger_auto_sync_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the trigger activation
  RAISE LOG 'Auto-sync trigger activated for user: %', NEW.id;
  
  -- Call the auto-sync edge function using pg_net
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

-- Create the triggers
CREATE TRIGGER auto_sync_user_profile_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_auto_sync_user_profile();

CREATE TRIGGER auto_sync_new_user_profile_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_auto_sync_user_profile();