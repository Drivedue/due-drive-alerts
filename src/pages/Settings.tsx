
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bell, Mail, MessageSquare, Shield, CreditCard, HelpCircle, ChevronRight, Phone } from "lucide-react";
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

  const faqData = [
    {
      question: "How many vehicles can I register?",
      answer: "Free users: 1 vehicle\nPro users: Up to 5 vehicles\nTeam users: More than 5 vehicles"
    },
    {
      question: "What reminders will I receive?",
      answer: "You'll get notifications 1 day, 1 week, 2, 3, and 4 weeks before document expiry."
    },
    {
      question: "What types of notifications are supported?",
      answer: "Push, Email, and SMS (depending on your plan and preferences)."
    },
    {
      question: "Can I change my reminder preferences?",
      answer: "Yes, you can adjust notification channels in your settings at any time."
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

      {/* Account Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-3"
            onClick={() => navigate('/upgrade')}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-gray-600" />
              <span>Subscription</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{user.plan}</Badge>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Policy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 leading-relaxed">
            We value your privacy. DriveDue only collects necessary information, such as your name, email, phone number, and vehicle document details, to provide timely reminders. Your data is securely stored and never shared with third parties. Notifications are sent based on your selected preferences. By using the app, you agree to our data use policy.
          </p>
        </CardContent>
      </Card>

      {/* Help & FAQ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & FAQ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 whitespace-pre-line">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Us */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Us
          </CardTitle>
          <CardDescription>Need support or have a question?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-600" />
            <span className="text-sm">drivedue.company@gmail.com</span>
          </div>
          <div className="flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-gray-600" />
            <span className="text-sm">WhatsApp: +234 701 297 5251</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">We're here to help!</p>
        </CardContent>
      </Card>

      {/* Upgrade Prompt for Free Users */}
      {user.plan === "Free" && (
        <Card className="bg-gradient-to-r from-[#0A84FF] to-purple-600 text-white">
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
