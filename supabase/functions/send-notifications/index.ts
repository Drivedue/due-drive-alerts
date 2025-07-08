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
    const vehicleName = document.vehicles 
      ? `${document.vehicles.make} ${document.vehicles.model}`
      : 'your vehicle';
    
    const vehicleNameOrPlate = document.vehicles 
      ? `${document.vehicles.make} ${document.vehicles.model} (${document.vehicles.license_plate})`
      : 'your vehicle';

    const userName = profile.full_name ? profile.full_name.split(' ')[0] : 'there';
    const documentType = document.document_type.charAt(0).toUpperCase() + document.document_type.slice(1);
    const formattedExpiryDate = expiryDate.toLocaleDateString();

    // Custom notification templates
    const pushTemplates = {
      '4_weeks': {
        title: 'Early Reminder',
        body: `${documentType} for ${vehicleNameOrPlate} expires on ${formattedExpiryDate}. Renew early to stay compliant.`
      },
      '3_weeks': {
        title: "Don't Forget!",
        body: `3 weeks left: ${vehicleName}'s ${documentType} expires on ${formattedExpiryDate}.`
      },
      '2_weeks': {
        title: '2 Weeks Left!',
        body: `Your ${documentType} for ${vehicleName} expires soon – ${formattedExpiryDate}. Renew today.`
      },
      '1_week': {
        title: '1 Week Remaining',
        body: `Reminder: ${vehicleName}'s ${documentType} expires on ${formattedExpiryDate}.`
      },
      '1_day': {
        title: 'Final Alert',
        body: `Tomorrow is the deadline! ${vehicleName}'s ${documentType} expires on ${formattedExpiryDate}.`
      }
    };

    const smsTemplates = {
      '4_weeks': `DriveDue: ${documentType} for ${vehicleNameOrPlate} expires on ${formattedExpiryDate}. Renew early and avoid last-minute stress.`,
      '3_weeks': `Reminder: 3 weeks left! ${vehicleName}'s ${documentType} expires on ${formattedExpiryDate}. – DriveDue`,
      '2_weeks': `2 weeks to go: ${vehicleName}'s ${documentType} expires on ${formattedExpiryDate}. Set your renewal in motion. – DriveDue`,
      '1_week': `Heads up! ${documentType} for ${vehicleName} expires on ${formattedExpiryDate}. Renew to avoid penalties. – DriveDue`,
      '1_day': `URGENT: ${documentType} for ${vehicleName} expires tomorrow (${formattedExpiryDate}). Renew now! – DriveDue`
    };

    const emailSubjects = {
      '4_weeks': `Early Reminder: Renew ${vehicleName}'s ${documentType} Before ${formattedExpiryDate}`,
      '3_weeks': `Still Time! 3 Weeks Left to Renew ${documentType}`,
      '2_weeks': `Two-Week Countdown: ${vehicleName}'s ${documentType} Expires Soon`,
      '1_week': `Only 1 Week Left to Renew ${documentType}`,
      '1_day': `Final Reminder: ${vehicleName}'s ${documentType} Expires Tomorrow`
    };

    const reminderTimingText = {
      '4_weeks': '4 weeks',
      '3_weeks': '3 weeks',
      '2_weeks': '2 weeks',
      '1_week': '1 week',
      '1_day': '1 day'
    }[reminderType];

    const emailBody = `
      <p>Hi ${userName},</p>
      
      <p>Just a quick reminder from your friends at <strong>DriveDue</strong></p>
      
      <p>Your <strong>${documentType}</strong> for <strong>${vehicleNameOrPlate}</strong> is set to expire on <strong>${formattedExpiryDate}</strong>.</p>
      
      <p>You're receiving this reminder ${reminderTimingText} in advance — just as you requested.</p>
      
      <p>To avoid penalties, late fees, or disruptions, we recommend renewing this document before the deadline.</p>
      
      <p>Already renewed? You can update your record in the DriveDue app anytime.</p>
      
      <p><strong>Need help?</strong><br>
      drivedue.company@gmail.com | WhatsApp: +2347012975251</p>
      
      <p>Stay compliant,<br>
      The DriveDue Team</p>
    `;

    const templates = {
      email: {
        subject: emailSubjects[reminderType],
        body: emailBody
      },
      push: pushTemplates[reminderType],
      sms: {
        body: smsTemplates[reminderType]
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
          vehicle_info: vehicleNameOrPlate,
          expiry_date: formattedExpiryDate,
          days_remaining: daysUntilExpiry.toString(),
          reminder_period: reminderTimingText,
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