
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check } from "lucide-react";
import { config } from "@/lib/config";

interface PaystackUpgradeProps {
  userPlan: string;
  onUpgradeSuccess?: () => void;
}

const PaystackUpgrade = ({ userPlan, onUpgradeSuccess }: PaystackUpgradeProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Paystack configuration from secure config
  const PAYSTACK_PUBLIC_KEY = config.paystack.publicKey;
  const PRO_PLAN_PRICE = 499900; // ₦4,999 in kobo
  const CALLBACK_URL = `${window.location.origin}/payment/callback`;

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upgrade your plan",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting upgrade process for user:', user.email);
      console.log('Using Paystack public key:', PAYSTACK_PUBLIC_KEY);
      console.log('Callback URL:', CALLBACK_URL);
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          email: user.email,
          plan: 'pro',
          callback_url: CALLBACK_URL,
          amount: PRO_PLAN_PRICE,
          public_key: PAYSTACK_PUBLIC_KEY
        }
      });

      console.log('Upgrade response:', data, error);

      if (error) {
        console.error('Upgrade error:', error);
        throw error;
      }

      if (data?.authorization_url) {
        console.log('Redirecting to Paystack:', data.authorization_url);
        // Open Paystack checkout in a new tab
        window.open(data.authorization_url, '_blank');
      } else if (data?.payment_url) {
        console.log('Opening Paystack popup for:', data.payment_url);
        
        // Load Paystack inline script if not already loaded
        if (!window.PaystackPop) {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.onload = () => openPaystackPopup(data);
          document.head.appendChild(script);
        } else {
          openPaystackPopup(data);
        }
      } else {
        toast({
          title: "Upgrade Successful",
          description: "Your subscription has been activated!",
        });
        onUpgradeSuccess?.();
      }

    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to process upgrade. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openPaystackPopup = (paymentData: any) => {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user!.email,
      amount: PRO_PLAN_PRICE,
      ref: paymentData.reference,
      callback: function(response: any) {
        console.log('Payment successful:', response);
        toast({
          title: "Payment Successful",
          description: "Your Pro subscription is being activated...",
        });
        
        // Verify payment and update subscription status
        setTimeout(() => {
          onUpgradeSuccess?.();
        }, 2000);
        
        // Navigate to callback URL for verification
        window.location.href = `${CALLBACK_URL}?reference=${response.reference}`;
      },
      onClose: function() {
        console.log('Payment popup closed');
        toast({
          title: "Payment Cancelled",
          description: "Payment was cancelled. You can try again anytime.",
          variant: "destructive"
        });
      }
    });
    
    handler.openIframe();
  };

  if (userPlan === "Pro") {
    return (
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white upgrade-section">
        <CardContent className="p-4 text-center">
          <Crown className="h-8 w-8 mx-auto mb-2" />
          <h3 className="font-bold mb-2">Pro Member</h3>
          <p className="text-blue-100 text-sm">
            You're enjoying all Pro features!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-2 border-gray-200 upgrade-section">
      <CardHeader>
        <CardTitle className="text-center text-gray-800">Upgrade to Pro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <Check className="h-4 w-4 mr-2 text-green-600" />
            <span>SMS notifications</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Check className="h-4 w-4 mr-2 text-green-600" />
            <span>Manage up to 5 vehicles</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Check className="h-4 w-4 mr-2 text-green-600" />
            <span>Priority support</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">₦4,999</div>
          <div className="text-gray-600 text-sm">per year</div>
        </div>

        <Button 
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full bg-[#0A84FF] hover:bg-[#0A84FF]/90"
        >
          {isLoading ? "Processing..." : "Upgrade Now"}
        </Button>
      </CardContent>
    </Card>
  );
};

// Extend window object to include PaystackPop
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default PaystackUpgrade;
