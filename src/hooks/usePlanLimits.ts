
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PlanLimits {
  vehicles: number;
  documents: number;
}

interface UserPlan {
  plan_type: 'free' | 'pro';
  limits: PlanLimits;
}

export const usePlanLimits = () => {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<UserPlan>({
    plan_type: 'free',
    limits: { vehicles: 1, documents: 5 }
  });
  const [vehicleCount, setVehicleCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUserPlan = async () => {
    if (!user) return;

    try {
      console.log('Fetching user plan for:', user.id);

      // First check the profiles table for plan_type
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // If profile doesn't exist, create it with default plan
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, plan_type: 'free' });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }

      // Also check for active subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      console.log('Profile data:', profileData);
      console.log('Subscription data:', subscriptionData);

      // Determine plan type based on both profile and subscription
      let planType = 'free';
      
      if (subscriptionData && subscriptionData.plan_code === 'pro') {
        planType = 'pro';
        
        // If subscription is active but profile doesn't reflect it, update profile
        if (profileData?.plan_type !== 'pro') {
          console.log('Syncing profile plan type with active subscription');
          const { error: syncError } = await supabase
            .from('profiles')
            .update({ plan_type: 'pro' })
            .eq('id', user.id);
          
          if (syncError) {
            console.error('Error syncing profile plan type:', syncError);
          }
        }
      } else if (profileData?.plan_type === 'pro') {
        planType = 'pro';
      }

      console.log('Final determined plan type:', planType);

      setUserPlan({
        plan_type: planType as 'free' | 'pro',
        limits: planType === 'pro' 
          ? { vehicles: Infinity, documents: Infinity }
          : { vehicles: 1, documents: 5 }
      });
    } catch (error) {
      console.error('Error fetching user plan:', error);
    }
  };

  const fetchCounts = async () => {
    if (!user) return;

    try {
      const [vehiclesResult, documentsResult] = await Promise.all([
        supabase
          .from('vehicles')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('documents')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
      ]);

      setVehicleCount(vehiclesResult.count || 0);
      setDocumentCount(documentsResult.count || 0);
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPlan();
      fetchCounts();
    }
  }, [user]);

  const canAddVehicle = vehicleCount < userPlan.limits.vehicles;
  const canAddDocument = documentCount < userPlan.limits.documents;

  return {
    userPlan,
    vehicleCount,
    documentCount,
    canAddVehicle,
    canAddDocument,
    loading,
    refreshCounts: () => {
      fetchUserPlan();
      fetchCounts();
    }
  };
};
