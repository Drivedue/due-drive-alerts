
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare } from "lucide-react";
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
    sms: false
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
          .select('push_notifications, email_notifications, sms_notifications')
          .eq('id', user.id)
          .single();

        if (profile) {
          setNotifications({
            push: profile.push_notifications ?? true,
            email: profile.email_notifications ?? true,
            sms: profile.sms_notifications ?? false
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
                         type === 'email' ? 'email_notifications' : 'sms_notifications';
      
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
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
