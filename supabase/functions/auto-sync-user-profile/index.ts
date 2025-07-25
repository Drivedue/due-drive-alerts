import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { NotificationAPI } from 'npm:notificationapi-node-server-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize NotificationAPI
const notificationapi = new NotificationAPI({
  clientId: Deno.env.get("NOTIFICATIONAPI_CLIENT_ID")!,
  clientSecret: Deno.env.get("NOTIFICATIONAPI_CLIENT_SECRET")!
});

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Auto sync user profile function called');

  try {
    const { record, old_record } = await req.json();
    console.log('Webhook payload received:', { record, old_record });

    // Log sync attempt to sync_logs table
    const logSyncAttempt = async (userId: string, status: string, errorMessage?: string) => {
      try {
        await supabase.from('sync_logs').insert({
          user_id: userId,
          sync_type: 'notification_api_profile',
          status,
          error_message: errorMessage,
          retry_count: 0
        });
      } catch (logError) {
        console.error('Failed to log sync attempt:', logError);
      }
    };
    
    // This function is triggered by database webhooks when profiles table is updated
    const userId = record.id;
    
    if (!userId) {
      console.error('No user ID found in record');
      return new Response(JSON.stringify({
        success: false,
        error: 'No user ID found'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Get user email from auth.users (using service role key)
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      console.error('Error fetching user from auth:', authError);
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found in auth'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Build preferred channels array based on notification preferences
    const preferredChannels = [];
    if (record.email_notifications) preferredChannels.push('email');
    if (record.sms_notifications) preferredChannels.push('sms');
    if (record.push_notifications) preferredChannels.push('push');

    const syncPayload = {
      user_id: userId,
      email: authUser.user.email,
      phone: record.phone,
      full_name: record.full_name,
      preferred_channels: preferredChannels.length > 0 ? preferredChannels : ['email']
    };

    console.log('Auto-syncing user profile to NotificationAPI:', syncPayload);

    // Create/update user in NotificationAPI
    try {
      await notificationapi.users.identify({
        id: userId,
        email: authUser.user.email,
        number: record.phone || undefined,
        pushTokens: [],
        preferences: {
          channels: preferredChannels.length > 0 ? preferredChannels : ['email']
        }
      });

      console.log('User profile auto-synced successfully');
      
      // Log successful sync
      await logSyncAttempt(userId, 'success');
      
      return new Response(JSON.stringify({
        success: true,
        data: { message: 'User profile auto-synced successfully' }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } catch (notificationError) {
      console.error('NotificationAPI error during auto-sync:', notificationError);
      
      // Log failed sync
      await logSyncAttempt(userId, 'failed', `NotificationAPI error: ${notificationError.message}`);
      
      return new Response(JSON.stringify({
        success: false,
        error: `NotificationAPI error: ${notificationError.message}`,
        details: notificationError.toString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    console.error('Auto sync user profile error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});