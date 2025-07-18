import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🔧 Setting up cron job for document expiry checks...");

    // Check if pg_cron extension is enabled
    const { data: extensions, error: extensionsError } = await supabase
      .rpc('pg_cron_job_list')
      .then(() => ({ data: true, error: null }))
      .catch(error => ({ data: false, error }));

    if (extensionsError || !extensions) {
      console.log("⚠️ pg_cron extension not available, creating manual schedule");
      
      // Return instructions for manual setup
      return new Response(
        JSON.stringify({
          success: false,
          error: "pg_cron extension not available",
          instructions: {
            title: "Manual Cron Setup Required",
            description: "To enable automatic document checks, you need to set up a cron job manually.",
            steps: [
              "1. Go to your Supabase SQL Editor",
              "2. Enable the pg_cron extension: CREATE EXTENSION IF NOT EXISTS pg_cron;",
              "3. Create the cron job with the provided SQL",
              "4. The system will check for expiring documents daily at 9 AM"
            ],
            sql: `
-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily checks at 9 AM
SELECT cron.schedule(
  'check-expiring-documents-daily',
  '0 9 * * *', -- Every day at 9 AM
  $$
  SELECT
    net.http_post(
      url := 'https://mhtxarzcokmwodflefeo.supabase.co/functions/v1/check-expiring-documents',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odHhhcnpjb2ttd29kZmxlZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzAxMjcsImV4cCI6MjA2NzIwNjEyN30.JQ3NW5-8jy_woPU1BwuVyxwndtpJ5HqP7Bu4PWPhLe0"}'::jsonb,
      body := '{"manual": false}'::jsonb
    ) as request_id;
  $$
);
            `
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // If pg_cron is available, set up the cron job
    const cronSQL = `
      SELECT cron.schedule(
        'check-expiring-documents-daily',
        '0 9 * * *', -- Every day at 9 AM
        $$
        SELECT
          net.http_post(
            url := 'https://mhtxarzcokmwodflefeo.supabase.co/functions/v1/check-expiring-documents',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odHhhcnpjb2ttd29kZmxlZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzAxMjcsImV4cCI6MjA2NzIwNjEyN30.JQ3NW5-8jy_woPU1BwuVyxwndtpJ5HqP7Bu4PWPhLe0"}'::jsonb,
            body := '{"manual": false}'::jsonb
          ) as request_id;
        $$
      );
    `;

    const { error: cronError } = await supabase.rpc('exec_sql', { sql: cronSQL });

    if (cronError) {
      console.error("❌ Failed to create cron job:", cronError);
      throw new Error(`Failed to create cron job: ${cronError.message}`);
    }

    console.log("✅ Cron job created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cron job set up successfully - documents will be checked daily at 9 AM",
        schedule: "0 9 * * * (Every day at 9 AM)",
        cronJobName: "check-expiring-documents-daily"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Setup cron job error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack || error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);