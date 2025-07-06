
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { config } from "@/lib/config";

export const usePayment = () => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const PAYSTACK_PUBLIC_KEY = config.paystack.publicKey;
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

  const openPaystackPopup = (paymentData: any, onSuccess: () => void) => {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user!.email,
      amount: PRO_PLAN_PRICE,
      ref: paymentData.reference,
      callback: function(response: any) {
        console.log('Payment successful:', response);
        toast({
          title: "Payment Successful!",
          description: "Your Pro subscription is being activated...",
        });
        
        setTimeout(() => {
          onSuccess();
        }, 2000);
        
        window.location.href = `${CALLBACK_URL}?reference=${response.reference}`;
      },
      onClose: function() {
        console.log('Payment popup closed');
        toast({
          title: "Payment Cancelled",
          description: "Payment was cancelled. You can try again anytime.",
          variant: "destructive"
        });
        setIsUpgrading(false);
      }
    });
    
    handler.openIframe();
  };

  const handleUpgrade = async (onSuccess: () => void) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upgrade your plan",
        variant: "destructive"
      });
      return;
    }

    setIsUpgrading(true);

    try {
      console.log('Starting upgrade process for user:', user.email);
      
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
        throw error;
      }

      if (data?.reference) {
        console.log('Opening Paystack popup with reference:', data.reference);
        openPaystackPopup(data, onSuccess);
      } else {
        toast({
          title: "Upgrade Successful",
          description: "Your subscription has been activated!",
        });
        onSuccess();
        setIsUpgrading(false);
      }

    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to process upgrade. Please try again.",
        variant: "destructive"
      });
      setIsUpgrading(false);
    }
  };

  return {
    isUpgrading,
    handleUpgrade
  };
};
