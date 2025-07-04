
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, Calendar, Bell, AlertTriangle, Plus, Settings, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [upcomingRenewals, setUpcomingRenewals] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState("Free");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ vehicleCount: 0, documentCount: 0, expiredCount: 0 });
  
  // Get user's display name from auth metadata or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Optimized data fetching with parallel requests
  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch all data in parallel for better performance
      const [vehiclesResult, documentsResult, subscriptionResult] = await Promise.all([
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
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()
      ]);

      if (vehiclesResult.error) throw vehiclesResult.error;
      if (documentsResult.error) throw documentsResult.error;

      const vehiclesData = vehiclesResult.data || [];
      const documentsData = documentsResult.data || [];

      setVehicles(vehiclesData);

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

      // Set user plan
      if (subscriptionResult.data) {
        setUserPlan('Pro');
      } else {
        setUserPlan('Free');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'safe': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleManageDocuments = () => {
    navigate('/garage');
  };

  const handleUpgradeClick = () => {
    navigate('/settings');
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
      {/* Header with Pro Button */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome back, {userName}!</h2>
            <p className="text-gray-600 text-sm">Stay on top of your vehicle documents</p>
          </div>
          {userPlan === "Free" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpgradeClick}
              className="flex items-center gap-2 text-[#0A84FF] border-[#0A84FF] hover:bg-[#0A84FF]/10"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          )}
        </div>
        <Badge variant={userPlan === "Pro" ? "default" : "secondary"} className="mt-1">
          {userPlan} Plan
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="bg-[#0A84FF]/10 p-2 rounded-full">
                <Car className="h-4 w-4 text-[#0A84FF]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0A84FF]">{stats.vehicleCount}</div>
                <p className="text-xs text-gray-600">Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{stats.documentCount}</div>
                <p className="text-xs text-gray-600">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{stats.expiredCount}</div>
                <p className="text-xs text-gray-600">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      {upcomingRenewals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Renewals</h3>
          
          <div className="space-y-3">
            {upcomingRenewals.map((renewal) => (
              <Card key={renewal.id} className={`border-l-4 ${renewal.status === 'expired' ? 'border-l-red-500' : 'border-l-orange-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{renewal.vehiclePlate}</h4>
                    <Badge className={getStatusColor(renewal.status)}>
                      {renewal.status === 'expired' 
                        ? `Expired ${Math.abs(renewal.daysLeft)} days ago`
                        : `${renewal.daysLeft} days left`
                      }
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{renewal.title} renewal {renewal.status === 'expired' ? 'overdue' : 'due'}</p>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    size="sm"
                    onClick={handleManageDocuments}
                  >
                    Manage Documents
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/garage')}>
          <CardContent className="p-4 text-center">
            <Car className="h-8 w-8 mx-auto mb-2 text-[#0A84FF]" />
            <h4 className="font-semibold text-sm">My Garage</h4>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/garage')}>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-semibold text-sm">Documents</h4>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
