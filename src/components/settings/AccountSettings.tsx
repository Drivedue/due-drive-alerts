import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Crown, Check, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/lib/config";

interface AccountSettingsProps {
  userPlan: string;
  onUpgradeSuccess?: () => void;
}

// Extend window object to include PaystackPop
declare global {
  interface Window {
    PaystackPop: any;
  }
}

const AccountSettings = ({ userPlan, onUpgradeSuccess }: AccountSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const PRO_PLAN_PRICE = 499900; // ₦4,999 in kobo
  const CALLBACK_URL = `${window.location.origin}/payment/callback`;

  const loadPaystackScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  };

  const openPaystackPopup = (paymentData: any) => {
    const handler = window.PaystackPop.setup({
      key: config.paystack.publicKey,
      email: user!.email,
      amount: PRO_PLAN_PRICE,
      ref: paymentData.reference,
      callback: function(response: any) {
        console.log('Payment successful:', response);
        toast({
          title: "Payment Successful!",
          description: "Your Pro subscription is being activated...",
        });
        
        // Call the verification function immediately
        verifyPayment(response.reference);
      },
      onClose: function() {
        console.log('Payment popup closed');
        toast({
          title: "Payment Cancelled",
          description: "Payment was cancelled. You can try again anytime.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    });
    
    handler.openIframe();
  };

  const verifyPayment = async (reference: string) => {
    try {
      console.log('Verifying payment with reference:', reference);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference }
      });

      console.log('Verification response:', data, error);

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Subscription Activated!",
          description: "Your Pro subscription is now active. Refreshing your account...",
        });
        
        // Call the onUpgradeSuccess callback if provided
        if (onUpgradeSuccess) {
          setTimeout(() => {
            onUpgradeSuccess();
          }, 1000);
        }
      } else {
        throw new Error('Payment verification failed');
      }

    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify payment. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      console.log('Callback URL:', CALLBACK_URL);
      
      // Load Paystack script first
      await loadPaystackScript();
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          email: user.email,
          amount: PRO_PLAN_PRICE,
          callback_url: CALLBACK_URL
        }
      });

      console.log('Upgrade response:', data, error);

      if (error) {
        console.error('Upgrade error:', error);
        throw new Error(error.message || 'Failed to create payment session');
      }

      if (data?.reference) {
        console.log('Opening Paystack popup with reference:', data.reference);
        // Open Paystack popup
        openPaystackPopup(data);
      } else {
        throw new Error('No payment reference received from server');
      }

    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to process upgrade. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
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
          <div className="border-t pt-3 space-y-3">
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

            {/* Team Plan Coming Soon */}
            <div className="bg-gray-100 rounded-lg p-4 opacity-75">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-700 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Team Plan
                </h4>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Everything in Pro</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Team collaboration</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Manage unlimited vehicles</span>
                </div>
              </div>
              <Button size="sm" disabled className="w-full">
                Coming Soon
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
