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

    console.log("Starting document expiry check...");

    // Get all documents with expiry dates
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        document_type,
        expiry_date,
        user_id,
        reminder_days,
        vehicles(make, model, license_plate)
      `)
      .not('expiry_date', 'is', null);

    if (documentsError) {
      throw new Error(`Failed to fetch documents: ${documentsError.message}`);
    }

    const now = new Date();
    const notifications = [];

    // Check each document for reminder triggers
    for (const document of documents) {
      const expiryDate = new Date(document.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Skip if already expired or too far in future
      if (daysUntilExpiry < 0 || daysUntilExpiry > 28) continue;

      // Check for reminder triggers (4 weeks = 28 days, 3 weeks = 21 days, etc.)
      const reminderDays = [28, 21, 14, 7, 1]; // 4 weeks, 3 weeks, 2 weeks, 1 week, 1 day
      const reminderTypes = ['4_weeks', '3_weeks', '2_weeks', '1_week', '1_day'];

      for (let i = 0; i < reminderDays.length; i++) {
        if (daysUntilExpiry === reminderDays[i]) {
          // Check if we already sent this reminder
          const { data: existingReminder } = await supabase
            .from('notification_logs')
            .select('id')
            .eq('document_id', document.id)
            .eq('reminder_type', reminderTypes[i])
            .single();

          if (!existingReminder) {
            notifications.push({
              documentId: document.id,
              reminderType: reminderTypes[i],
              daysUntilExpiry
            });

            // Log that we're sending this reminder
            await supabase
              .from('notification_logs')
              .insert({
                document_id: document.id,
                reminder_type: reminderTypes[i],
                sent_at: new Date().toISOString()
              });
          }
        }
      }
    }

    console.log(`Found ${notifications.length} notifications to send`);

    // Send notifications
    const results = [];
    for (const notification of notifications) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-notifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notification)
        });

        if (response.ok) {
          const result = await response.json();
          results.push({ ...notification, success: true, result });
        } else {
          const error = await response.text();
          results.push({ ...notification, success: false, error });
        }
      } catch (error) {
        console.error(`Failed to send notification for document ${notification.documentId}:`, error);
        results.push({ ...notification, success: false, error: error.message });
      }
    }

    console.log("Document expiry check completed");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Checked ${documents.length} documents, sent ${results.filter(r => r.success).length} notifications`,
        results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Check expiring documents error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);