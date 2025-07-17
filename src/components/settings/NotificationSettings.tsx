
import { useState, useEffect } from 'react';
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

      // Auto-sync with NotificationAPI in background
      supabase.functions.invoke('auto-sync-user-profile', {
        body: {
          user_id: user?.id,
          updated_field: updateField,
          new_value: newValue
        }
      }).catch(error => console.error('Background sync error:', error));
      
      toast({
        title: "Settings Updated",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${newValue ? 'enabled' : 'disabled'}`,
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
          Smart Notifications
        </CardTitle>
        <CardDescription>
          Automatic reminders before your documents expire (4 weeks, 3 weeks, 2 weeks, 1 week, and 1 day)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-xs text-muted-foreground">Instant alerts on your device</div>
            </div>
          </div>
          <Switch
            checked={notifications.push}
            onCheckedChange={() => handleNotificationChange('push')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Email Notifications</div>
              <div className="text-xs text-muted-foreground">Detailed reminders in your inbox</div>
            </div>
          </div>
          <Switch
            checked={notifications.email}
            onCheckedChange={() => handleNotificationChange('email')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium flex items-center gap-2">
                SMS Notifications
                {!isProUser && (
                  <Badge variant="secondary" className="text-xs">Pro Only</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">Text message alerts</div>
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
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">In-App Notifications</div>
              <div className="text-xs text-muted-foreground">Pop-up alerts when using the app</div>
            </div>
          </div>
          <Switch
            checked={notifications.inApp}
            onCheckedChange={() => handleNotificationChange('inApp')}
          />
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            ✅ Automatic daily checks at 9 AM<br/>
            📅 Smart reminder schedule: 4 weeks → 3 weeks → 2 weeks → 1 week → 1 day<br/>
            🔔 Only get notified once per reminder period
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
