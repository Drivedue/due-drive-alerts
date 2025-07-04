
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check } from "lucide-react";

interface PaystackUpgradeProps {
  userPlan: string;
  onUpgradeSuccess?: () => void;
}

const PaystackUpgrade = ({ userPlan, onUpgradeSuccess }: PaystackUpgradeProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          email: user.email,
          plan: 'pro',
          callback_url: `${window.location.origin}/payment/callback`
        }
      });

      console.log('Upgrade response:', data, error);

      if (error) {
        console.error('Upgrade error:', error);
        throw error;
      }

      if (data?.payment_url) {
        console.log('Redirecting to payment URL:', data.payment_url);
        // Open Paystack payment page in new tab
        const paymentWindow = window.open(data.payment_url, '_blank');
        
        if (!paymentWindow) {
          // Fallback if popup is blocked
          window.location.href = data.payment_url;
        } else {
          toast({
            title: "Payment Page Opened",
            description: "Complete your payment in the new tab to activate your Pro subscription.",
          });
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
    <Card className="bg-gradient-to-r from-[#0A84FF] to-purple-600 text-white upgrade-section">
      <CardHeader>
        <CardTitle className="text-center">Upgrade to Pro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Check className="h-4 w-4 mr-2" />
            <span>SMS notifications</span>
          </div>
          <div className="flex items-center text-sm">
            <Check className="h-4 w-4 mr-2" />
            <span>Manage up to 5 vehicles</span>
          </div>
          <div className="flex items-center text-sm">
            <Check className="h-4 w-4 mr-2" />
            <span>Priority support</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold">₦9,999</div>
          <div className="text-blue-100 text-sm">per month</div>
        </div>

        <Button 
          onClick={handleUpgrade}
          disabled={isLoading}
          variant="secondary" 
          className="w-full"
        >
          {isLoading ? "Processing..." : "Upgrade Now"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaystackUpgrade;
