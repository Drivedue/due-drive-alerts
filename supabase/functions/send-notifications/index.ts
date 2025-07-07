import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  documentId: string;
  reminderType: '4_weeks' | '3_weeks' | '2_weeks' | '1_week' | '1_day';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const notificationApiKey = Deno.env.get("NOTIFICATIONAPI_API_KEY")!;
    const notificationClientId = Deno.env.get("NOTIFICATIONAPI_CLIENT_ID")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { documentId, reminderType }: NotificationRequest = await req.json();

    // Get document and user details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        *,
        vehicles(make, model, license_plate)
      `)
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error("Document not found");
    }

    // Get user profile with notification preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', document.user_id)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found");
    }

    // Get user email from auth
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(document.user_id);
    if (userError || !user) {
      throw new Error("User not found");
    }

    // Check if user has Pro plan for SMS
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', document.user_id)
      .eq('status', 'active')
      .eq('plan_code', 'pro')
      .single();

    const isProUser = !!subscription;

    // Calculate days until expiry
    const expiryDate = new Date(document.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Create notification content
    const vehicleInfo = document.vehicles 
      ? `${document.vehicles.make} ${document.vehicles.model} (${document.vehicles.license_plate})`
      : 'your vehicle';

    const reminderText = {
      '4_weeks': '4 weeks',
      '3_weeks': '3 weeks', 
      '2_weeks': '2 weeks',
      '1_week': '1 week',
      '1_day': '1 day'
    }[reminderType];

    const templates = {
      email: {
        subject: `${document.document_type.toUpperCase()} Expiry Reminder - ${reminderText} notice`,
        body: `
          <h2>Document Expiry Reminder</h2>
          <p>Hello,</p>
          <p>This is a reminder that your <strong>${document.document_type}</strong> document for ${vehicleInfo} will expire in ${reminderText}.</p>
          <p><strong>Document:</strong> ${document.title}</p>
          <p><strong>Expiry Date:</strong> ${expiryDate.toLocaleDateString()}</p>
          <p><strong>Days Remaining:</strong> ${daysUntilExpiry}</p>
          ${document.document_number ? `<p><strong>Document Number:</strong> ${document.document_number}</p>` : ''}
          <p>Please ensure you renew this document before it expires to avoid any inconvenience.</p>
          <p>Best regards,<br>DriveDue Team</p>
        `
      },
      push: {
        title: `${document.document_type.toUpperCase()} expires in ${reminderText}`,
        body: `${document.title} for ${vehicleInfo} expires on ${expiryDate.toLocaleDateString()}. Renew now to stay compliant.`
      },
      sms: {
        body: `DriveDue Reminder: Your ${document.document_type} "${document.title}" for ${vehicleInfo} expires in ${reminderText} (${expiryDate.toLocaleDateString()}). Renew now to avoid issues.`
      }
    };

    const notifications = [];

    // Send Email notification
    if (profile.email_notifications) {
      notifications.push({
        notificationId: 'document_expiry_email',
        user: {
          id: document.user_id,
          email: user.user.email
        },
        mergeTags: {
          document_type: document.document_type,
          document_title: document.title,
          vehicle_info: vehicleInfo,
          expiry_date: expiryDate.toLocaleDateString(),
          days_remaining: daysUntilExpiry.toString(),
          reminder_period: reminderText,
          document_number: document.document_number || '',
          subject: templates.email.subject,
          body: templates.email.body
        }
      });
    }

    // Send Push notification
    if (profile.push_notifications) {
      notifications.push({
        notificationId: 'document_expiry_push',
        user: {
          id: document.user_id,
          email: user.user.email
        },
        mergeTags: {
          title: templates.push.title,
          body: templates.push.body
        }
      });
    }

    // Send SMS notification (Pro users only)
    if (profile.sms_notifications && isProUser && profile.phone) {
      notifications.push({
        notificationId: 'document_expiry_sms',
        user: {
          id: document.user_id,
          phone: profile.phone
        },
        mergeTags: {
          body: templates.sms.body
        }
      });
    }

    // Send notifications via NotificationAPI
    const results = [];
    for (const notification of notifications) {
      try {
        const response = await fetch('https://api.notificationapi.com/notifications', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${notificationClientId}:${notificationApiKey}`)}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notification)
        });

        if (!response.ok) {
          throw new Error(`NotificationAPI error: ${await response.text()}`);
        }

        const result = await response.json();
        results.push({ type: notification.notificationId, success: true, result });
      } catch (error) {
        console.error(`Failed to send ${notification.notificationId}:`, error);
        results.push({ type: notification.notificationId, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        document: document.title,
        reminderType,
        notifications: results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);