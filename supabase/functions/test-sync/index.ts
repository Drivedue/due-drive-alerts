import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { NotificationAPI } from 'npm:notificationapi-node-server-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Test sync function called');

  try {
    // Check if secrets are configured
    const clientId = Deno.env.get("NOTIFICATIONAPI_CLIENT_ID");
    const clientSecret = Deno.env.get("NOTIFICATIONAPI_CLIENT_SECRET");
    
    console.log('ClientID exists:', !!clientId);
    console.log('ClientSecret exists:', !!clientSecret);
    
    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({
        success: false,
        error: 'NotificationAPI credentials not configured',
        missing: {
          clientId: !clientId,
          clientSecret: !clientSecret
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Initialize NotificationAPI
    const notificationapi = new NotificationAPI({
      clientId,
      clientSecret
    });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Test with a single user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '36be625c-e302-4efa-85d2-531f5eb05414')
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    console.log('Profile found:', profile);

    // Get user email from auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
    
    if (authError || !authUser.user) {
      console.error('Error fetching auth user:', authError);
      throw new Error('User not found in auth');
    }

    console.log('Auth user found:', authUser.user.email);

    // Build preferred channels
    const preferredChannels = [];
    if (profile.email_notifications) preferredChannels.push('email');
    if (profile.sms_notifications) preferredChannels.push('sms');
    if (profile.push_notifications) preferredChannels.push('push');

    console.log('Preferred channels:', preferredChannels);

    // Test sync to NotificationAPI
    const syncPayload = {
      id: profile.id,
      email: authUser.user.email,
      number: profile.phone || undefined,
      pushTokens: [],
      preferences: {
        channels: preferredChannels.length > 0 ? preferredChannels : ['email']
      }
    };

    console.log('Syncing to NotificationAPI with payload:', syncPayload);

    await notificationapi.users.identify(syncPayload);

    console.log('Test sync successful');

    // Log to sync_logs
    await supabase.from('sync_logs').insert({
      user_id: profile.id,
      sync_type: 'test_sync',
      status: 'success',
      retry_count: 0
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Test sync successful',
      user: {
        id: profile.id,
        email: authUser.user.email,
        channels: preferredChannels
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Test sync error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});