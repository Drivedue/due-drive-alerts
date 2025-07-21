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

  console.log('Manual sync all users function called');

  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} profiles to sync`);

    const results = [];

    for (const profile of profiles || []) {
      try {
        // Get user email from auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
        
        if (authError || !authUser.user) {
          console.error(`Error fetching auth user ${profile.id}:`, authError);
          results.push({
            user_id: profile.id,
            status: 'failed',
            error: 'User not found in auth'
          });
          continue;
        }

        // Build preferred channels array
        const preferredChannels = [];
        if (profile.email_notifications) preferredChannels.push('email');
        if (profile.sms_notifications) preferredChannels.push('sms');
        if (profile.push_notifications) preferredChannels.push('push');

        console.log(`Syncing user ${profile.id} (${authUser.user.email}) with channels: ${preferredChannels.join(', ')}`);

        // Sync to NotificationAPI
        await notificationapi.users.identify({
          id: profile.id,
          email: authUser.user.email,
          number: profile.phone || undefined,
          pushTokens: [],
          preferences: {
            channels: preferredChannels.length > 0 ? preferredChannels : ['email']
          }
        });

        // Log sync attempt
        await supabase.from('sync_logs').insert({
          user_id: profile.id,
          sync_type: 'manual_bulk_sync',
          status: 'success',
          retry_count: 0
        });

        results.push({
          user_id: profile.id,
          email: authUser.user.email,
          status: 'success',
          channels: preferredChannels
        });

        console.log(`Successfully synced user ${profile.id}`);

      } catch (userError) {
        console.error(`Error syncing user ${profile.id}:`, userError);
        
        // Log failed sync
        await supabase.from('sync_logs').insert({
          user_id: profile.id,
          sync_type: 'manual_bulk_sync',
          status: 'failed',
          error_message: userError.message,
          retry_count: 0
        });

        results.push({
          user_id: profile.id,
          status: 'failed',
          error: userError.message
        });
      }
    }

    console.log('Manual sync completed:', results);

    return new Response(JSON.stringify({
      success: true,
      message: `Synced ${results.length} users`,
      results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Manual sync all users error:', error);
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