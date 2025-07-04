import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Shield, CreditCard, HelpCircle, ChevronRight } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false
  });

  const [reminders, setReminders] = useState({
    fourWeeks: true,
    threeWeeks: true,
    twoWeeks: true,
    oneWeek: true,
    oneDay: true
  });

  const user = {
    plan: "Free",
    email: "john.doe@example.com"
  };

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    
    toast({
      title: "Settings Updated",
      description: `${type.toUpperCase()} notifications ${notifications[type] ? 'disabled' : 'enabled'}`,
    });
  };

  const handleReminderChange = (type: keyof typeof reminders) => {
    setReminders(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        { icon: CreditCard, label: "Subscription", value: user.plan, action: () => navigate('/upgrade') },
        { icon: Shield, label: "Privacy", action: () => {} },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & FAQ", action: () => {} },
        { icon: Mail, label: "Contact Support", action: () => {} },
      ]
    }
  ];

  return (
    <MobileLayout title="Settings">
      {/* Notification Settings */}
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
                {user.plan === "Free" && (
                  <Badge variant="secondary" className="ml-2 text-xs">Pro Only</Badge>
                )}
              </div>
            </div>
            <Switch
              checked={notifications.sms}
              onCheckedChange={() => handleNotificationChange('sms')}
              disabled={user.plan === "Free"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminder Schedule */}
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

      {/* Other Settings */}
      {settingsSections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {section.items.map((item, itemIndex) => (
              <Button
                key={itemIndex}
                variant="ghost"
                className="w-full justify-between h-auto p-3"
                onClick={item.action}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-gray-600" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <Badge variant="secondary">{item.value}</Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Upgrade Prompt for Free Users */}
      {user.plan === "Free" && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-4 text-center">
            <h3 className="font-bold mb-2">Upgrade to Pro</h3>
            <p className="text-blue-100 mb-4 text-sm">
              Get SMS notifications and manage up to 5 vehicles
            </p>
            <Button variant="secondary" className="w-full">
              Upgrade Now - $9.99/month
            </Button>
          </CardContent>
        </Card>
      )}
    </MobileLayout>
  );
};

export default Settings;
