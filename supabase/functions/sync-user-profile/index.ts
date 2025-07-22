import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import NotificationAPISDK from 'npm:notificationapi-node-server-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize NotificationAPI
const notificationapi = new NotificationAPISDK({
  clientId: Deno.env.get("NOTIFICATIONAPI_CLIENT_ID")!,
  clientSecret: Deno.env.get("NOTIFICATIONAPI_CLIENT_SECRET")!
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Sync user profile function called');

  try {
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);
    
    const { user_id, email, phone, full_name, preferred_channels } = requestBody;

    // Validate required fields
    if (!user_id || !email) {
      console.error('Missing required fields:', { user_id, email });
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: user_id and email are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Check if required environment variables exist
    const clientId = Deno.env.get("NOTIFICATIONAPI_CLIENT_ID");
    const clientSecret = Deno.env.get("NOTIFICATIONAPI_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      console.error('Missing NotificationAPI credentials');
      return new Response(JSON.stringify({
        success: false,
        error: 'NotificationAPI credentials not configured'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    console.log('Using NotificationAPI credentials:', { 
      clientId: clientId ? 'Present' : 'Missing',
      clientSecret: clientSecret ? 'Present' : 'Missing' 
    });

    // Use NotificationAPI SDK to create/update user
    try {
      const userPayload = {
        id: user_id,
        email: email,
        number: phone || undefined,
        pushTokens: [], // Can be updated later
        preferences: {
          channels: preferred_channels || ['email']
        }
      };

      console.log('Creating/updating user with payload:', userPayload);
      
      await notificationapi.users.identify(userPayload);

      console.log('User profile synced successfully with NotificationAPI SDK');
      
      return new Response(JSON.stringify({
        success: true,
        data: { message: 'User profile synced successfully' }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } catch (sdkError) {
      console.error('NotificationAPI SDK error:', sdkError);
      console.error('SDK Error details:', {
        name: sdkError.name,
        message: sdkError.message,
        stack: sdkError.stack
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: `NotificationAPI SDK error: ${sdkError.message || 'Unknown error'}`,
        details: sdkError.toString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    console.error('Sync user profile error:', error);
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