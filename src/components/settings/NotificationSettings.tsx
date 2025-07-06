
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

  // Check if user actually has active Pro subscription
  useEffect(() => {
    const checkProStatus = async () => {
      if (!user) return;

      try {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('plan_code', 'pro')
          .single();

        setIsProUser(!!subscription);
        console.log('Pro subscription status:', !!subscription);
      } catch (error) {
        console.error('Error checking Pro status:', error);
        setIsProUser(false);
      }
    };

    checkProStatus();
  }, [user, userPlan]);

  const handleNotificationChange = (type: keyof typeof notifications) => {
    // Check if trying to enable SMS without Pro subscription
    if (type === 'sms' && !notifications.sms && !isProUser) {
      toast({
        title: "Pro Subscription Required",
        description: "SMS notifications are only available for Pro subscribers.",
        variant: "destructive"
      });
      return;
    }

    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    
    toast({
      title: "Settings Updated",
      description: `${type.toUpperCase()} notifications ${notifications[type] ? 'disabled' : 'enabled'}`,
    });
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
