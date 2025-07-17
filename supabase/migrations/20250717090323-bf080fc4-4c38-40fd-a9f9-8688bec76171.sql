-- Create a cron job to automatically check for expiring documents daily
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the check-expiring-documents function to run daily at 9 AM
SELECT cron.schedule(
  'check-expiring-documents-daily',
  '0 9 * * *', -- Daily at 9 AM
  $$
  SELECT
    net.http_post(
        url := 'https://mhtxarzcokmwodflefeo.supabase.co/functions/v1/check-expiring-documents',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odHhhcnpjb2ttd29kZmxlZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzAxMjcsImV4cCI6MjA2NzIwNjEyN30.JQ3NW5-8jy_woPU1BwuVyxwndtpJ5HqP7Bu4PWPhLe0"}'::jsonb,
        body := '{"automated": true}'::jsonb
    ) as request_id;
  $$
);

-- Simplify profiles table by removing redundant reminder preference columns
-- Keep only the essential notification settings
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS reminder_4_weeks,
DROP COLUMN IF EXISTS reminder_3_weeks,
DROP COLUMN IF EXISTS reminder_2_weeks,
DROP COLUMN IF EXISTS reminder_1_week,
DROP COLUMN IF EXISTS reminder_1_day,
DROP COLUMN IF EXISTS reminder_days;