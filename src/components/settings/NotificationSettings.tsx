
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NotificationSettingsProps {
  userPlan: string;
}

const NotificationSettings = ({ userPlan }: NotificationSettingsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProUser, setIsProUser] = useState(false);
  
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    inApp: true
  });

  // Load user preferences and check Pro status
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Check Pro subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('plan_code', 'pro')
          .single();

        setIsProUser(!!subscription);
        console.log('Pro subscription status:', !!subscription);

        // Load user notification preferences
        const { data: profile } = await supabase
          .from('profiles')
          .select('push_notifications, email_notifications, sms_notifications, in_app_notifications')
          .eq('id', user.id)
          .single();

        if (profile) {
          setNotifications({
            push: profile.push_notifications ?? true,
            email: profile.email_notifications ?? true,
            sms: profile.sms_notifications ?? false,
            inApp: profile.in_app_notifications ?? true
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setIsProUser(false);
      }
    };

    loadUserData();
  }, [user, userPlan]);

  const handleNotificationChange = async (type: keyof typeof notifications) => {
    // Check if trying to enable SMS without Pro subscription
    if (type === 'sms' && !notifications.sms && !isProUser) {
      toast({
        title: "Pro Subscription Required",
        description: "SMS notifications are only available for Pro subscribers.",
        variant: "destructive"
      });
      return;
    }

    const newValue = !notifications[type];
    
    try {
      // Update in database
      const updateField = type === 'push' ? 'push_notifications' : 
                         type === 'email' ? 'email_notifications' : 
                         type === 'sms' ? 'sms_notifications' : 'in_app_notifications';
      
      const { error } = await supabase
        .from('profiles')
        .update({ [updateField]: newValue })
        .eq('id', user?.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => ({
        ...prev,
        [type]: newValue
      }));

      // Sync with NotificationAPI
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (profile) {
          const preferredChannels = [];
          if (profile.email_notifications) preferredChannels.push('email');
          if (profile.sms_notifications && isProUser) preferredChannels.push('sms');

          await supabase.functions.invoke('sync-user-profile', {
            body: {
              user_id: user?.id,
              email: user?.email,
              phone: profile.phone,
              full_name: profile.full_name,
              preferred_channels: preferredChannels
            }
          });
        }
      } catch (syncError) {
        console.error('Error syncing with NotificationAPI:', syncError);
        // Don't show error to user as the main operation succeeded
      }
      
      toast({
        title: "Settings Updated",
        description: `${type.toUpperCase()} notifications ${newValue ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>Choose how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-gray-600" />
            <span>Push Notifications</span>
          </div>
          <Switch
            checked={notifications.push}
            onCheckedChange={() => handleNotificationChange('push')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-600" />
            <span>Email Notifications</span>
          </div>
          <Switch
            checked={notifications.email}
            onCheckedChange={() => handleNotificationChange('email')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-gray-600" />
            <div>
              <span>SMS Notifications</span>
              {!isProUser && (
                <Badge variant="secondary" className="ml-2 text-xs">Pro Only</Badge>
              )}
            </div>
          </div>
          <Switch
            checked={notifications.sms}
            onCheckedChange={() => handleNotificationChange('sms')}
            disabled={!isProUser}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-4 w-4 text-gray-600" />
            <span>In-App Notifications</span>
          </div>
          <Switch
            checked={notifications.inApp}
            onCheckedChange={() => handleNotificationChange('inApp')}
          />
        </div>

        {/* Manual Sync Button for Testing */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              console.log('=== Starting Manual Sync Test ===');
              try {
                console.log('Fetching user profile for ID:', user?.id);
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', user?.id)
                  .single();

                console.log('Profile fetch result:', { profile, profileError });

                if (profileError) {
                  console.error('Profile fetch error:', profileError);
                  toast({
                    title: "Profile Error",
                    description: `Failed to fetch profile: ${profileError.message}`,
                    variant: "destructive"
                  });
                  return;
                }

                if (profile) {
                  const preferredChannels = [];
                  if (profile.email_notifications) preferredChannels.push('email');
                  if (profile.sms_notifications && isProUser) preferredChannels.push('sms');
                  if (profile.push_notifications) preferredChannels.push('push');

                  const syncData = {
                    user_id: user?.id,
                    email: user?.email,
                    phone: profile.phone,
                    full_name: profile.full_name,
                    preferred_channels: preferredChannels
                  };

                  console.log('Syncing profile with data:', syncData);
                  console.log('Calling sync-user-profile function...');

                  const { data, error } = await supabase.functions.invoke('sync-user-profile', {
                    body: syncData
                  });

                  console.log('Function response:', { data, error });
                  console.log('Function response data type:', typeof data);
                  console.log('Function response error type:', typeof error);

                  if (error) {
                    console.error('Sync error details:', error);
                    console.error('Error keys:', Object.keys(error));
                    console.error('Error JSON:', JSON.stringify(error, null, 2));
                    
                    let errorMessage = 'Unknown error';
                    if (error.message) errorMessage = error.message;
                    if (error.details) errorMessage += ` - ${error.details}`;
                    if (error.hint) errorMessage += ` (${error.hint})`;
                    
                    toast({
                      title: "Sync Failed",
                      description: errorMessage,
                      variant: "destructive"
                    });
                  } else {
                    console.log('Sync successful with data:', data);
                    toast({
                      title: "Profile Synced",
                      description: data?.message || "Your profile has been synced with NotificationAPI successfully.",
                    });
                  }
                } else {
                  console.error('No profile found for user');
                  toast({
                    title: "No Profile",
                    description: "No profile found for current user.",
                    variant: "destructive"
                  });
                }
              } catch (error: any) {
                console.error('=== Manual sync catch block error ===');
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                console.error('Full error object:', error);
                
                toast({
                  title: "Sync Error",
                  description: error.message || "An unexpected error occurred during manual sync.",
                  variant: "destructive"
                });
              }
              console.log('=== Manual Sync Test Complete ===');
            }}
          >
            Test Sync with NotificationAPI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
