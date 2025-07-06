
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
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
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

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from payment metadata
    const customerEmail = verifyData.data.customer.email;
    console.log("Looking for user with email:", customerEmail);
    
    // Find user by email using auth admin
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error("Error fetching users:", userError);
      throw new Error("Failed to find user");
    }

    const user = userData.users.find(u => u.email === customerEmail);
    if (!user) {
      console.error("User not found for email:", customerEmail);
      throw new Error("User not found");
    }

    console.log("Found user:", user.id);

    // First, deactivate any existing subscriptions for this user
    const { error: deactivateError } = await supabase
      .from('subscriptions')
      .update({ status: 'inactive' })
      .eq('user_id', user.id);

    if (deactivateError) {
      console.error("Error deactivating old subscriptions:", deactivateError);
    }

    // Create new active subscription
    const subscriptionData = {
      user_id: user.id,
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified and subscription activated",
        user_id: user.id,
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
