import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import notificationapi from 'npm:notificationapi-node-server-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

notificationapi.init(
  Deno.env.get("NOTIFICATIONAPI_CLIENT_ID")!,
  Deno.env.get("NOTIFICATIONAPI_API_KEY")!
);

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

    // Create the user profile in NotificationAPI
    const notificationApiPayload = {
      user_id: user_id,
      email: email,
      phone_number: phone,
      properties: {
        name: full_name || '',
        preferred_channels: preferred_channels || ['email']
      }
    };

    console.log('Syncing user profile to NotificationAPI:', notificationApiPayload);

    // Check if required environment variables exist
    const clientId = Deno.env.get("NOTIFICATIONAPI_CLIENT_ID");
    const apiKey = Deno.env.get("NOTIFICATIONAPI_API_KEY");
    
    if (!clientId || !apiKey) {
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
      apiKey: apiKey ? 'Present' : 'Missing' 
    });

    // Send to NotificationAPI
    const response = await fetch('https://api.notificationapi.com/api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(clientId + ':' + apiKey)}`
      },
      body: JSON.stringify(notificationApiPayload)
    });

    console.log('NotificationAPI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('NotificationAPI error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: `NotificationAPI error: ${response.status} ${errorData}`
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const result = await response.json();
    console.log('User profile synced successfully:', result);

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
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