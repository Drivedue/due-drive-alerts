
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
  compact?: boolean;
}

// Extend window object to include PaystackPop
declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaystackUpgrade = ({ userPlan, onUpgradeSuccess, compact = false }: PaystackUpgradeProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Paystack configuration
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
        
        // Call the onUpgradeSuccess callback if provided
        if (onUpgradeSuccess) {
          onUpgradeSuccess();
        }
        
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
        setIsLoading(false);
      }
    });
    
    handler.openIframe();
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

  if (userPlan === "Pro") {
    if (compact) {
      return null;
    }
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

  if (compact) {
    return (
      <Button 
        onClick={handleUpgrade}
        disabled={isLoading}
        size="sm"
        className="bg-[#0A84FF] hover:bg-[#0A84FF]/90 px-3 py-1 text-xs"
      >
        {isLoading ? "Processing..." : "Upgrade"}
      </Button>
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

export default PaystackUpgrade;
