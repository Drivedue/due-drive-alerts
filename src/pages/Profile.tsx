
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Save, X } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [userPlan, setUserPlan] = useState("Free");
  const [profile, setProfile] = useState<any>(null);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      setProfile(profileData);

      // Get subscription data
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subscriptionData) {
        setUserPlan(subscriptionData.plan_code === 'pro' ? 'Pro' : 'Free');
      }

      // Set form data
      setFormData({
        fullName: profileData?.full_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: profileData?.phone || user.user_metadata?.phone || ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      // Update or insert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          phone: formData.phone
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
      
      setIsEditing(false);
      // Refresh data
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      fullName: profile?.full_name || user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || user?.user_metadata?.phone || ''
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <MobileLayout title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  }) : 'Recently';

  return (
    <ProtectedRoute>
      <MobileLayout title="Profile">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <div className="bg-[#0A84FF]/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="h-10 w-10 text-[#0A84FF]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {formData.fullName || 'User'}
            </h2>
            <p className="text-gray-600 text-sm mb-3">{formData.email}</p>
            <Badge variant={userPlan === "Pro" ? "default" : "secondary"}>
              {userPlan} Plan
            </Badge>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Account Information</CardTitle>
              {!isEditing ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true}
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Account Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Member since:</span>
              <span className="font-medium">{joinDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicles registered:</span>
              <span className="font-medium">0 of 5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <Badge variant={userPlan === "Pro" ? "default" : "secondary"}>
                {userPlan}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-[#0A84FF] hover:bg-[#0A84FF]/90"
            onClick={() => navigate('/settings')}
          >
            Upgrade to Pro
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </MobileLayout>
    </ProtectedRoute>
  );
};

export default Profile;
