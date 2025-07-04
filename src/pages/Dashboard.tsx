import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, Calendar, Bell, AlertTriangle, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import PaystackUpgrade from "@/components/PaystackUpgrade";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState("Free");
  const [loading, setLoading] = useState(true);
  
  // Get user's display name from auth metadata or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Fetch user data including vehicles, documents, and subscription
  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id);

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);

      // Fetch documents with vehicle information
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select(`
          *,
          vehicles (
            license_plate,
            make,
            model
          )
        `)
        .eq('user_id', user.id);

      if (documentsError) throw documentsError;
      
      // Process documents to add status information
      const processedDocuments = (documentsData || []).map(doc => {
        const today = new Date();
        const expiryDate = doc.expiry_date ? new Date(doc.expiry_date) : null;
        let status = 'unknown';
        let daysLeft = 0;

        if (expiryDate) {
          const timeDiff = expiryDate.getTime() - today.getTime();
          daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          if (daysLeft < 0) {
            status = 'expired';
          } else if (daysLeft <= 30) {
            status = 'warning';
          } else {
            status = 'safe';
          }
        }

        return {
          ...doc,
          status,
          daysLeft,
          vehiclePlate: doc.vehicles?.license_plate || 'Unknown Vehicle'
        };
      });

      setDocuments(processedDocuments);

      // Get subscription status
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subscriptionData) {
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
    fetchUserData();
  }, [user]);

  // Refresh data every 30 seconds to keep dashboard updated
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Get upcoming renewals (expired and expiring soon documents)
  const upcomingRenewals = documents.filter(doc => 
    doc.status === 'expired' || doc.status === 'warning'
  ).slice(0, 5); // Show max 5 items

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'safe': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleEditDocument = (document: any) => {
    toast({
      title: "Opening My Garage",
      description: `Navigate to My Garage to manage your documents.`,
    });
    
    // Navigate to the garage page
    navigate('/garage');
  };

  const handleUpgradeSuccess = () => {
    // Refresh user data after successful upgrade
    fetchUserData();
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
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back, {userName}!</h2>
        <p className="text-gray-600 text-sm">Stay on top of your vehicle documents</p>
        <Badge variant={userPlan === "Pro" ? "default" : "secondary"} className="mt-2">
          {userPlan} Plan
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#0A84FF]/10 p-2 rounded-full">
                <Car className="h-5 w-5 text-[#0A84FF]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0A84FF]">{vehicles.length}</div>
                <p className="text-xs text-gray-600">Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{upcomingRenewals.length}</div>
                <p className="text-xs text-gray-600">Need Attention</p>
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
                    onClick={() => handleEditDocument(renewal)}
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

      {/* Upgrade Prompt */}
      <PaystackUpgrade userPlan={userPlan} onUpgradeSuccess={handleUpgradeSuccess} />
    </MobileLayout>
  );
};

export default Dashboard;
