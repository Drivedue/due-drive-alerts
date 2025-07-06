
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
      throw new Error("Payment verification failed");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from payment metadata
    const customerEmail = verifyData.data.customer.email;
    
    // Find user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error("Error fetching users:", userError);
      throw new Error("Failed to find user");
    }

    const user = userData.users.find(u => u.email === customerEmail);
    if (!user) {
      throw new Error("User not found");
    }

    // Create or update subscription
    const subscriptionData = {
      user_id: user.id,
      plan_code: 'pro',
      status: 'active',
      paystack_customer_code: verifyData.data.customer.customer_code,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    };

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id'
      });

    if (subscriptionError) {
      console.error("Subscription upsert error:", subscriptionError);
      throw new Error("Failed to update subscription");
    }

    console.log("Successfully verified payment and updated subscription for user:", user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified and subscription activated",
        user_id: user.id,
        plan: 'pro'
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
