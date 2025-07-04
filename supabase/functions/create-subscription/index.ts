
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSubscriptionRequest {
  email: string;
  plan: string;
  callback_url: string;
  amount?: number;
  public_key?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, plan, callback_url, amount = 499900, public_key }: CreateSubscriptionRequest = await req.json();
    
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    console.log('Processing subscription request:', { email, plan, amount, public_key });

    // Create customer first
    const customerResponse = await fetch('https://api.paystack.co/customer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    const customerData = await customerResponse.json();
    console.log('Customer creation response:', customerData);

    if (!customerData.status) {
      throw new Error(customerData.message || 'Failed to create customer');
    }

    // Create payment transaction (one-time payment, not subscription)
    const paymentResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: amount, // Amount in kobo (₦4,999 = 499900 kobo)
        callback_url: callback_url,
        metadata: {
          plan_type: plan,
          subscription: true,
          customer_code: customerData.data.customer_code
        }
      }),
    });

    const paymentData = await paymentResponse.json();
    console.log('Payment initialization response:', paymentData);

    if (!paymentData.status) {
      throw new Error(paymentData.message || 'Failed to initialize payment');
    }

    return new Response(JSON.stringify({
      success: true,
      payment_url: paymentData.data.authorization_url,
      reference: paymentData.data.reference,
      customer_code: customerData.data.customer_code,
      access_code: paymentData.data.access_code,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in create-subscription function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
