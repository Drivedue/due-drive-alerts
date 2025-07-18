import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NotificationAPI } from 'npm:notificationapi-node-server-sdk';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  documentId: string;
  reminderType: '4_weeks' | '3_weeks' | '2_weeks' | '1_week' | '1_day';
  isTest?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const notificationClientSecret = Deno.env.get("NOTIFICATIONAPI_CLIENT_SECRET")!;
    const notificationClientId = Deno.env.get("NOTIFICATIONAPI_CLIENT_ID")!;
    
    // Initialize NotificationAPI
    const notificationapi = new NotificationAPI({
      clientId: notificationClientId,
      clientSecret: notificationClientSecret
    });
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { documentId, reminderType, isTest }: NotificationRequest = await req.json();

    console.log(`🔔 Processing notification: ${reminderType} for document: ${documentId}${isTest ? ' (TEST MODE)' : ''}`);

    let document;
    let userName = 'User';
    let vehicleName = 'your vehicle';
    let vehicleNameOrPlate = 'your vehicle';
    let formattedExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

    if (isTest) {
      // Create mock document data for testing
      document = {
        id: 'test-document-id',
        user_id: 'test-user-id',
        title: 'Test Document',
        document_type: 'insurance',
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        vehicles: {
          make: 'Test',
          model: 'Vehicle',
          license_plate: 'TEST-123'
        }
      };
      vehicleName = 'Test Vehicle';
      vehicleNameOrPlate = 'Test Vehicle (TEST-123)';
      console.log('📝 Using test document data');
    } else {
      // Get real document and user details
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select(`
          *,
          vehicles(make, model, license_plate)
        `)
        .eq('id', documentId)
        .single();

      if (docError || !docData) {
        console.error('❌ Document fetch error:', docError);
        throw new Error(`Document not found: ${docError?.message || 'Unknown error'}`);
      }

      document = docData;
      vehicleName = document.vehicles 
        ? `${document.vehicles.make} ${document.vehicles.model}`
        : 'your vehicle';
      
      vehicleNameOrPlate = document.vehicles 
        ? `${document.vehicles.make} ${document.vehicles.model} (${document.vehicles.license_plate})`
        : 'your vehicle';

      const expiryDate = new Date(document.expiry_date);
      formattedExpiryDate = expiryDate.toLocaleDateString();
      console.log(`📋 Found document: ${document.title} - expires ${formattedExpiryDate}`);
    }

    let profile;
    let user;
    let isProUser = false;

    if (isTest) {
      // Use current user for testing
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(document.user_id);
      if (userError) {
        console.error('❌ Cannot get current user for test:', userError);
        throw new Error("Cannot determine current user for test");
      }
      user = userData;

      // Get current user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error for test:', profileError);
        throw new Error("Cannot get profile for test");
      }

      profile = profileData;
      
      // Check if test user has Pro plan
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('status', 'active')
        .eq('plan_code', 'pro')
        .single();

      isProUser = !!subscription;
      userName = profile.full_name ? profile.full_name.split(' ')[0] : 'there';
      console.log(`👤 Test user: ${user.user.email} (Pro: ${isProUser})`);
    } else {
      // Get user profile with notification preferences
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', document.user_id)
        .single();

      if (profileError || !profileData) {
        console.error('❌ Profile fetch error:', profileError);
        throw new Error(`User profile not found: ${profileError?.message || 'Unknown error'}`);
      }

      profile = profileData;

      // Get user email from auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(document.user_id);
      if (userError || !userData) {
        console.error('❌ User fetch error:', userError);
        throw new Error(`User not found: ${userError?.message || 'Unknown error'}`);
      }

      user = userData;

      // Check if user has Pro plan for SMS
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', document.user_id)
        .eq('status', 'active')
        .eq('plan_code', 'pro')
        .single();

      isProUser = !!subscription;
      userName = profile.full_name ? profile.full_name.split(' ')[0] : 'there';
      console.log(`👤 User: ${user.user.email} (Pro: ${isProUser})`);
    }

    // Calculate days until expiry
    const expiryDate = new Date(document.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const documentType = document.document_type.charAt(0).toUpperCase() + document.document_type.slice(1);

    console.log(`📅 Document expires in ${daysUntilExpiry} days (${formattedExpiryDate})`);
    console.log(`🔧 Notification preferences - Email: ${profile.email_notifications}, Push: ${profile.push_notifications}, SMS: ${profile.sms_notifications} (Pro: ${isProUser})`);
    
    if (isTest) {
      console.log('🧪 TEST MODE: Will send to current user regardless of original document owner');
    }

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

    // Send notifications via NotificationAPI SDK
    const results = [];
    console.log(`📤 Sending ${notifications.length} notifications...`);
    
    for (const notification of notifications) {
      try {
        console.log(`🚀 Sending ${notification.notificationId} to user ${notification.user.id || notification.user.email}`);
        
        const response = await notificationapi.send({
          notificationId: notification.notificationId,
          user: notification.user,
          mergeTags: notification.mergeTags
        });
        
        console.log(`✅ Successfully sent ${notification.notificationId}:`, response);
        results.push({ type: notification.notificationId, success: true, response });
      } catch (error) {
        console.error(`❌ Failed to send ${notification.notificationId}:`, error);
        results.push({ 
          type: notification.notificationId, 
          success: false, 
          error: error.message,
          details: error
        });
      }
    }

    console.log(`📊 Notification results: ${results.filter(r => r.success).length}/${results.length} successful`);

    const response = {
      success: true, 
      document: document.title,
      reminderType,
      isTest: isTest || false,
      notifications: results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };

    console.log('🎉 Notification process completed:', response.summary);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Notification error:", error);
    
    const errorResponse = {
      success: false, 
      error: error.message,
      details: error.stack || error.toString(),
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);