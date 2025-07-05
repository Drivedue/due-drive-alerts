
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, Calendar, Bell, AlertTriangle, Crown, Camera, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import DocumentEditModal from "@/components/DocumentEditModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [upcomingRenewals, setUpcomingRenewals] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState("Free");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ vehicleCount: 0, documentCount: 0, expiredCount: 0 });
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Get user's display name from auth metadata or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Paystack configuration
  const PAYSTACK_PUBLIC_KEY = "pk_test_fb056fa9b52e672a00eb6fa3cd9e5e0c73d96f2c";
  const PRO_PLAN_PRICE = 499900; // ₦4,999 in kobo
  const CALLBACK_URL = `${window.location.origin}/payment/callback`;

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

      // Set user plan based on subscription
      if (subscriptionResult.data && !subscriptionResult.error) {
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

  const handleUpgrade = async () => {
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
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          email: user.email,
          plan: 'pro',
          callback_url: CALLBACK_URL,
          amount: PRO_PLAN_PRICE,
          public_key: PAYSTACK_PUBLIC_KEY
        }
      });

      console.log('Upgrade response:', data, error);

      if (error) {
        console.error('Upgrade error:', error);
        throw error;
      }

      if (data?.payment_url) {
        console.log('Opening Paystack popup for:', data.payment_url);
        
        // Load Paystack inline script if not already loaded
        if (!window.PaystackPop) {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.onload = () => openPaystackPopup(data);
          document.head.appendChild(script);
        } else {
          openPaystackPopup(data);
        }
      } else {
        toast({
          title: "Upgrade Successful",
          description: "Your subscription has been activated!",
        });
        fetchDashboardData();
      }

    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to process upgrade. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const openPaystackPopup = (paymentData: any) => {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user!.email,
      amount: PRO_PLAN_PRICE,
      ref: paymentData.reference,
      callback: function(response: any) {
        console.log('Payment successful:', response);
        toast({
          title: "Payment Successful",
          description: "Your Pro subscription is being activated...",
        });
        
        // Verify payment and update subscription status
        setTimeout(() => {
          fetchDashboardData();
        }, 2000);
        
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
      }
    });
    
    handler.openIframe();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'safe': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDocumentEdit = (document: any) => {
    setEditingDocument(document);
  };

  const handleDocumentUpdate = () => {
    setEditingDocument(null);
    fetchDashboardData(); // Refresh data after update
  };

  const handleVehicleImageUpload = async () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = false;
    
    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        setUploadingImage(true);
        try {
          // Create a unique filename
          const fileName = `${user!.id}/${Date.now()}-${file.name}`;
          
          // Upload to Supabase storage
          const { data, error } = await supabase.storage
            .from('vehicle-images')
            .upload(fileName, file);

          if (error) {
            throw error;
          }

          toast({
            title: "Image Uploaded",
            description: "Vehicle image uploaded successfully!",
          });
          console.log('Uploaded file:', data);
        } catch (error: any) {
          console.error('Upload error:', error);
          toast({
            title: "Upload Failed",
            description: error.message || "Failed to upload image. Please try again.",
            variant: "destructive"
          });
        } finally {
          setUploadingImage(false);
        }
      }
    };
    
    fileInput.click();
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
      {/* Header with Plan Badge and Upgrade Button */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome back, {userName}!</h2>
            <p className="text-gray-600 text-sm">Stay on top of your vehicle documents</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant={userPlan === "Pro" ? "default" : "secondary"} className="mt-1">
            {userPlan} Plan
          </Badge>
          {userPlan === "Free" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="flex items-center gap-2 text-[#0A84FF] border-[#0A84FF] hover:bg-[#0A84FF]/10"
            >
              <Crown className="h-4 w-4" />
              {isUpgrading ? "Processing..." : "Upgrade to Pro"}
            </Button>
          )}
        </div>
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
                  {renewal.status === 'expired' && (
                    <Button 
                      className="w-full text-xs" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDocumentEdit(renewal)}
                    >
                      If renewed, update with new expiry date!
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle Picture Upload Card */}
      <div className="mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300" onClick={handleVehicleImageUpload}>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-blue-50 p-4 rounded-full">
                <Camera className="h-8 w-8 text-[#0A84FF]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Upload Vehicle Picture</h4>
                <p className="text-sm text-gray-600">Add photos of your vehicles for easy identification</p>
              </div>
              <Button variant="outline" size="sm" className="mt-2" disabled={uploadingImage}>
                <Upload className="h-4 w-4 mr-2" />
                {uploadingImage ? "Uploading..." : "Choose Photo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Edit Modal */}
      {editingDocument && (
        <DocumentEditModal
          document={editingDocument}
          onClose={() => setEditingDocument(null)}
          onUpdate={handleDocumentUpdate}
        />
      )}
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
