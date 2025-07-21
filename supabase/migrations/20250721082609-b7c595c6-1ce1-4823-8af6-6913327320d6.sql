-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests  
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the document expiry check to run daily at 9 AM
SELECT cron.schedule(
  'check-expiring-documents-daily',
  '0 9 * * *', -- Daily at 9 AM
  $$
  select
    net.http_post(
        url:='https://mhtxarzcokmwodflefeo.supabase.co/functions/v1/check-expiring-documents',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odHhhcnpjb2ttd29kZmxlZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzAxMjcsImV4cCI6MjA2NzIwNjEyN30.JQ3NW5-8jy_woPU1BwuVyxwndtpJ5HqP7Bu4PWPhLe0"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);