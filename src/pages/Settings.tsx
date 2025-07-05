
import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ReminderSchedule from "@/components/settings/ReminderSchedule";
import AccountSettings from "@/components/settings/AccountSettings";
import InformationSection from "@/components/settings/InformationSection";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LogOut, ChevronDown } from "lucide-react";

const Settings = () => {
  const { user, signOut } = useAuth();
  const [userPlan, setUserPlan] = useState("Free");
  const [profile, setProfile] = useState<any>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const fetchUserData = async () => {
    if (!user) return;

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
      setUserPlan('Pro');
    } else {
      setUserPlan('Free');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUpgradeSuccess = () => {
    // Refresh user data after successful upgrade
    fetchUserData();
  };

  return (
    <ProtectedRoute>
      <MobileLayout title="Settings">
        {/* Notifications Section */}
        <Collapsible open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <CollapsibleTrigger className="w-full">
            <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <ChevronDown className={`h-4 w-4 transition-transform ${notificationsOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <NotificationSettings userPlan={userPlan} />
          </CollapsibleContent>
        </Collapsible>

        {/* Reminders Section */}
        <Collapsible open={remindersOpen} onOpenChange={setRemindersOpen}>
          <CollapsibleTrigger className="w-full">
            <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Reminder Schedule</CardTitle>
                  <ChevronDown className={`h-4 w-4 transition-transform ${remindersOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ReminderSchedule />
          </CollapsibleContent>
        </Collapsible>

        {/* Account Section */}
        <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
          <CollapsibleTrigger className="w-full">
            <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Account</CardTitle>
                  <ChevronDown className={`h-4 w-4 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AccountSettings userPlan={userPlan} onUpgradeSuccess={handleUpgradeSuccess} />
          </CollapsibleContent>
        </Collapsible>
        
        {/* Profile Section */}
        <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
          <CollapsibleTrigger className="w-full">
            <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Profile</CardTitle>
                  <ChevronDown className={`h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mb-6">
              <CardContent className="space-y-3 pt-6">
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
          </CollapsibleContent>
        </Collapsible>

        {/* Information Section */}
        <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
          <CollapsibleTrigger className="w-full">
            <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Information</CardTitle>
                  <ChevronDown className={`h-4 w-4 transition-transform ${infoOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <InformationSection />
          </CollapsibleContent>
        </Collapsible>
      </MobileLayout>
    </ProtectedRoute>
  );
};

export default Settings;
