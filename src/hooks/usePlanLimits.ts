
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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const planType = profile?.plan_type || 'free';
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
    refreshCounts: fetchCounts
  };
};
