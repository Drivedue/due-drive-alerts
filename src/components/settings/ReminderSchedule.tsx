
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ReminderSchedule = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reminders, setReminders] = useState({
    fourWeeks: true,
    threeWeeks: true,
    twoWeeks: true,
    oneWeek: true,
    oneDay: true
  });

  // Load user reminder preferences
  useEffect(() => {
    const loadReminderPreferences = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('reminder_4_weeks, reminder_3_weeks, reminder_2_weeks, reminder_1_week, reminder_1_day')
          .eq('id', user.id)
          .single();

        if (profile) {
          setReminders({
            fourWeeks: profile.reminder_4_weeks ?? true,
            threeWeeks: profile.reminder_3_weeks ?? true,
            twoWeeks: profile.reminder_2_weeks ?? true,
            oneWeek: profile.reminder_1_week ?? true,
            oneDay: profile.reminder_1_day ?? true
          });
        }
      } catch (error) {
        console.error('Error loading reminder preferences:', error);
      }
    };

    loadReminderPreferences();
  }, [user]);

  const handleReminderChange = async (type: keyof typeof reminders) => {
    const newValue = !reminders[type];
    
    try {
      // Map frontend keys to database fields
      const dbFieldMap = {
        fourWeeks: 'reminder_4_weeks',
        threeWeeks: 'reminder_3_weeks',
        twoWeeks: 'reminder_2_weeks',
        oneWeek: 'reminder_1_week',
        oneDay: 'reminder_1_day'
      };

      const dbField = dbFieldMap[type];
      
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({ [dbField]: newValue })
        .eq('id', user?.id);

      if (error) throw error;

      // Update local state
      setReminders(prev => ({
        ...prev,
        [type]: newValue
      }));
      
      toast({
        title: "Reminder Settings Updated",
        description: `${type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} reminder ${newValue ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder settings",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Reminder Schedule</CardTitle>
        <CardDescription>When to send renewal reminders</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(reminders).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="capitalize">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} before expiry
            </span>
            <Switch
              checked={value}
              onCheckedChange={() => handleReminderChange(key as keyof typeof reminders)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ReminderSchedule;
