import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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

  try {
    const { id, email, number, parameters } = await req.json();
    
    await notificationapi.send({
      type: 'drivedue_push',
      to: {
        id: email || 'drivedue.company@gmail.com'
      },
      parameters: parameters || {
        "comment": "testComment"
      }
    });

    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Push notification error:', error);
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