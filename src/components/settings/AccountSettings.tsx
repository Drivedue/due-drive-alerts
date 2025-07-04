
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ChevronRight, Crown, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AccountSettingsProps {
  userPlan: string;
  onUpgradeSuccess?: () => void;
}

const AccountSettings = ({ userPlan, onUpgradeSuccess }: AccountSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Paystack configuration
  const PAYSTACK_PUBLIC_KEY = "pk_test_fb056fa9b52e672a00eb6fa3cd9e5e0c73d96f2c";
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

      if (data?.payment_url) {
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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-gray-600" />
            <span>Subscription</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={userPlan === "Pro" ? "default" : "secondary"}>{userPlan}</Badge>
            {userPlan === "Pro" && <Crown className="h-4 w-4 text-yellow-600" />}
          </div>
        </div>

        {userPlan === "Free" && (
          <div className="border-t pt-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Upgrade to Pro</h4>
              <div className="space-y-2 mb-4">
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
              
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xl font-bold text-gray-800">₦4,999</div>
                  <div className="text-gray-600 text-xs">per year</div>
                </div>
                <Button 
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  size="sm"
                  className="bg-[#0A84FF] hover:bg-[#0A84FF]/90"
                >
                  {isLoading ? "Processing..." : "Upgrade Now"}
                </Button>
              </div>
            </div>
          </div>
        )}
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

export default AccountSettings;
