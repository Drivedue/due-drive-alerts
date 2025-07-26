
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import DocumentEditModal from "@/components/DocumentEditModal";
import VehicleImageUpload from "@/components/VehicleImageUpload";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickStats from "@/components/dashboard/QuickStats";
import UpcomingRenewals from "@/components/dashboard/UpcomingRenewals";
import InAppNotifications from "@/components/InAppNotifications";

import { usePayment } from "@/hooks/usePayment";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [upcomingRenewals, setUpcomingRenewals] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState("Free");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ vehicleCount: 0, documentCount: 0, expiredCount: 0 });
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { isUpgrading, handleUpgrade } = usePayment();
  
  // Get user's display name from profile first, then auth metadata or email
  const userName = userProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Optimized data fetching with parallel requests
  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch all data in parallel for better performance, including profile
      const [vehiclesResult, documentsResult, subscriptionResult, profileResult] = await Promise.all([
        supabase
          .from('vehicles')
          .select('id, license_plate, make, model')
          .eq('user_id', user.id),
        
        supabase
          .from('documents')
          .select(`
            id,
            title,
            document_type,
            expiry_date,
            vehicle_id,
            vehicles!inner(license_plate)
          `)
          .eq('user_id', user.id)
          .not('expiry_date', 'is', null),
        
        supabase
          .from('subscriptions')
          .select('status, plan_code')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle(),

        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
      ]);

      if (vehiclesResult.error) throw vehiclesResult.error;
      if (documentsResult.error) throw documentsResult.error;

      const vehiclesData = vehiclesResult.data || [];
      const documentsData = documentsResult.data || [];

      setVehicles(vehiclesData);

      // Set user profile data
      if (profileResult.data) {
        setUserProfile(profileResult.data);
      }

      // Process documents for renewals
      const today = new Date();
      const processedRenewals = documentsData
        .map(doc => {
          const expiryDate = new Date(doc.expiry_date);
          const timeDiff = expiryDate.getTime() - today.getTime();
          const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          let status = 'safe';
          if (daysLeft < 0) {
            status = 'expired';
          } else if (daysLeft <= 30) {
            status = 'warning';
          }

          return {
            ...doc,
            status,
            daysLeft,
            vehiclePlate: doc.vehicles?.license_plate || 'Unknown Vehicle'
          };
        })
        .filter(doc => doc.status === 'expired' || doc.status === 'warning')
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 5);

      setUpcomingRenewals(processedRenewals);

      // Update stats
      const expiredCount = processedRenewals.filter(doc => doc.status === 'expired').length;
      setStats({
        vehicleCount: vehiclesData.length,
        documentCount: documentsData.length,
        expiredCount: expiredCount
      });

      // Set user plan based on active subscription
      if (subscriptionResult.data && subscriptionResult.data.status === 'active') {
        setUserPlan('Pro');
        console.log('Active subscription found, setting plan to Pro:', subscriptionResult.data);
      } else {
        setUserPlan('Free');
        console.log('No active subscription found, setting plan to Free');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleDocumentEdit = (document: any) => {
    setEditingDocument(document);
  };

  const handleDocumentUpdate = () => {
    setEditingDocument(null);
    fetchDashboardData(); // Refresh data after update
  };

  if (loading) {
    return (
      <MobileLayout title="Dashboard">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Dashboard">
      <DashboardHeader
        userName={userName}
        userPlan={userPlan}
        isUpgrading={isUpgrading}
        onUpgrade={() => handleUpgrade(fetchDashboardData)}
      />

      <QuickStats
        vehicleCount={stats.vehicleCount}
        documentCount={stats.documentCount}
        expiredCount={stats.expiredCount}
      />

      {/* In-App Push Notification Popup for Premium Users */}
      <InAppNotifications />

      <UpcomingRenewals
        renewals={upcomingRenewals}
        onDocumentEdit={handleDocumentEdit}
      />

      {/* Document Edit Modal */}
      {editingDocument && (
        <DocumentEditModal
          document={editingDocument}
          onClose={() => setEditingDocument(null)}
          onUpdate={handleDocumentUpdate}
        />
      )}


      {/* Vehicle Image Upload Section */}
      <div className="mt-8">
        <VehicleImageUpload 
          vehicles={vehicles} 
          onImageUploaded={fetchDashboardData}
        />
      </div>
    </MobileLayout>
  );
};

// Extend window object to include PaystackPop
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default Dashboard;
