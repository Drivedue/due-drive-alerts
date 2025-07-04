
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const ReminderSchedule = () => {
  const [reminders, setReminders] = useState({
    fourWeeks: true,
    threeWeeks: true,
    twoWeeks: true,
    oneWeek: true,
    oneDay: true
  });

  const handleReminderChange = (type: keyof typeof reminders) => {
    setReminders(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
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
