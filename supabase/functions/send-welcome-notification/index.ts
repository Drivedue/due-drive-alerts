import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import notificationapi from 'npm:notificationapi-node-server-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

notificationapi.init(
  Deno.env.get('NOTIFICATIONAPI_CLIENT_ID')!,
  Deno.env.get('NOTIFICATIONAPI_CLIENT_SECRET')!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Send welcome notification function called');

  try {
    const { email, phoneNumber, mergeTags, userId } = await req.json();
    console.log('Request payload:', { email, phoneNumber, mergeTags, userId });

    // Validate required fields
    if (!email && !userId) {
      console.error('Missing required fields: email or userId required');
      return new Response(JSON.stringify({
        success: false,
        error: 'Email or userId is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    console.log('Sending welcome notification via NotificationAPI');

    await notificationapi.send({
      type: 'welcome', // can be any notification you create
      to: {
        id: userId || email, // uniquely identify the user
        email: email,
        number: phoneNumber
      },
      parameters: mergeTags || {}
    });

    console.log('Welcome notification sent successfully');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Send welcome notification error:', error);
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