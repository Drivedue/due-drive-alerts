
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        toast({
          title: "Invalid Payment Reference",
          description: "No payment reference found",
          variant: "destructive"
        });
        navigate('/settings');
        return;
      }

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to verify payment",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { reference }
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          toast({
            title: "Payment Verified!",
            description: "Your Pro subscription is now active",
          });
        } else {
          throw new Error('Payment verification failed');
        }

      } catch (error: any) {
        console.error('Payment verification error:', error);
        toast({
          title: "Verification Failed",
          description: error.message || "Failed to verify payment",
          variant: "destructive"
        });
      }

      navigate('/settings');
    };

    verifyPayment();
  }, [searchParams, navigate, toast, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your payment...</p>
      </div>
    </div>
  );
};

export default PaymentVerification;
