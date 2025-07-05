
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferencesProps {
  userPlan: string;
}

const NotificationPreferences = ({ userPlan }: NotificationPreferencesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    reminder_days: 30
  });
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? true,
          sms_notifications: data.sms_notifications ?? false,
          reminder_days: data.reminder_days ?? 30
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const updatePreference = async (key: string, value: boolean | number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          [key]: value
        });

      if (error) throw error;

      setPreferences(prev => ({
        ...prev,
        [key]: value
      }));

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">Loading preferences...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Email Notifications</span>
          <Switch
            checked={preferences.email_notifications}
            onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <span>Push Notifications</span>
          <Switch
            checked={preferences.push_notifications}
            onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span>SMS Notifications</span>
            {userPlan === "Free" && (
              <span className="text-xs text-gray-500 ml-2">(Pro Only)</span>
            )}
          </div>
          <Switch
            checked={preferences.sms_notifications}
            onCheckedChange={(checked) => updatePreference('sms_notifications', checked)}
            disabled={userPlan === "Free"}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
