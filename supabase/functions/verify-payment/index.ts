
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentVerificationRequest {
  reference: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get and validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - missing authorization' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client with user's token to verify requesting user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the requesting user
    const { data: { user: requestingUser }, error: authError } = await supabaseUserClient.auth.getUser();
    
    if (authError || !requestingUser) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Requesting user authenticated:", requestingUser.id, requestingUser.email);

    const { reference }: PaymentVerificationRequest = await req.json();
    
    if (!reference) {
      throw new Error("Payment reference is required");
    }

    console.log("Verifying payment with reference:", reference);

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyResponse.json();
    console.log("Paystack verification response:", verifyData);

    if (!verifyData.status || verifyData.data.status !== "success") {
      console.error("Payment verification failed:", verifyData);
      throw new Error("Payment verification failed");
    }

    // CRITICAL: Verify that the payment email matches the requesting user's email
    const paymentEmail = verifyData.data.customer.email;
    if (paymentEmail.toLowerCase() !== requestingUser.email?.toLowerCase()) {
      console.error("Authorization mismatch - payment email does not match requesting user:", {
        requestingUserEmail: requestingUser.email,
        paymentEmail: paymentEmail
      });
      return new Response(
        JSON.stringify({ success: false, error: 'Payment does not belong to requesting user' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authorization verified - payment email matches requesting user");

    // Initialize Supabase client with service role key for database operations
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Processing subscription for user:", requestingUser.id);

    // First, deactivate any existing subscriptions for this user
    const { error: deactivateError } = await supabase
      .from('subscriptions')
      .update({ status: 'inactive' })
      .eq('user_id', requestingUser.id);

    if (deactivateError) {
      console.error("Error deactivating old subscriptions:", deactivateError);
    }

    // Create new active subscription
    const subscriptionData = {
      user_id: requestingUser.id,
      plan_code: 'pro',
      status: 'active',
      paystack_customer_code: verifyData.data.customer.customer_code || reference,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    };

    console.log("Creating subscription:", subscriptionData);

    const { data: subscriptionResult, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError);
      throw new Error("Failed to create subscription");
    }

    console.log("Successfully created subscription:", subscriptionResult);

    // Update user's plan type in profiles table
    console.log("Updating user profile plan type to 'pro'");
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ plan_type: 'pro' })
      .eq('id', requestingUser.id);

    if (profileUpdateError) {
      console.error("Profile update error:", profileUpdateError);
      throw new Error("Failed to update user profile plan type");
    }

    console.log("Successfully updated user profile plan type");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified and subscription activated",
        user_id: requestingUser.id,
        plan: 'pro',
        subscription: subscriptionResult
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Payment verification error:", error);
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
