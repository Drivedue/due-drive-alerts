
import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ReminderSchedule from "@/components/settings/ReminderSchedule";
import AccountSettings from "@/components/settings/AccountSettings";
import InformationSection from "@/components/settings/InformationSection";
import UpgradePrompt from "@/components/settings/UpgradePrompt";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";

const Settings = () => {
  const { user, signOut } = useAuth();
  const [userPlan, setUserPlan] = useState("Free");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      // Fetch user profile and subscription data
      const fetchUserData = async () => {
        // Get profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);

        // Get subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (subscriptionData) {
          setUserPlan(subscriptionData.plan_code === 'pro' ? 'Pro' : 'Free');
        }
      };

      fetchUserData();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ProtectedRoute>
      <MobileLayout title="Settings">
        <NotificationSettings userPlan={userPlan} />
        <ReminderSchedule />
        <AccountSettings userPlan={userPlan} />
        
        {/* User Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            {profile && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{profile.full_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{profile.phone || 'Not set'}</p>
                </div>
              </>
            )}
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full mt-4"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <InformationSection />
        <UpgradePrompt userPlan={userPlan} />
      </MobileLayout>
    </ProtectedRoute>
  );
};

export default Settings;
