
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Bell, CreditCard, Shield, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock user data
  const [userProfile, setUserProfile] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    plan: "Free"
  });

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false, // Only available for Pro users
    weeklyReports: true,
    marketingEmails: false
  });

  const [isEditing, setIsEditing] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "Free",
      features: ["1 Vehicle", "Push Notifications", "Email Reminders", "Basic Support"],
      current: userProfile.plan === "Free"
    },
    {
      name: "Pro",
      price: "$9.99/month",
      features: ["Up to 5 Vehicles", "SMS Notifications", "Email Reminders", "Push Notifications", "Priority Support"],
      current: userProfile.plan === "Pro"
    },
    {
      name: "Team",
      price: "$29.99/month",
      features: ["Unlimited Vehicles", "Team Management", "All Notification Types", "Advanced Analytics", "24/7 Support"],
      current: userProfile.plan === "Team"
    }
  ];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications({
      ...notifications,
      [key]: value
    });
    
    toast({
      title: "Notification Preferences Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <nav className="space-y-2">
                  <a href="#profile" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700">
                    <User className="h-4 w-4" />
                    Profile
                  </a>
                  <a href="#notifications" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </a>
                  <a href="#billing" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <CreditCard className="h-4 w-4" />
                    Billing & Plans
                  </a>
                  <a href="#security" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <Shield className="h-4 w-4" />
                    Security
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Section */}
            <Card id="profile">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={userProfile.fullName}
                      onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  {isEditing && (
                    <Button type="submit" className="w-full">
                      Save Changes
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card id="notifications">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to receive reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push" className="text-base">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications in your browser</p>
                  </div>
                  <Switch
                    id="push"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Get reminders via email</p>
                  </div>
                  <Switch
                    id="email"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="sms" className="text-base">SMS Notifications</Label>
                      {userProfile.plan === "Free" && <Badge variant="secondary">Pro Only</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">Receive text message reminders</p>
                  </div>
                  <Switch
                    id="sms"
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                    disabled={userProfile.plan === "Free"}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reports" className="text-base">Weekly Reports</Label>
                    <p className="text-sm text-gray-600">Get weekly summaries of your documents</p>
                  </div>
                  <Switch
                    id="reports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing" className="text-base">Marketing Emails</Label>
                    <p className="text-sm text-gray-600">Receive updates and promotional content</p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Billing & Plans Section */}
            <Card id="billing">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Plans
                </CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">Current Plan</h3>
                      <p className="text-blue-600 font-medium">{userProfile.plan} Plan</p>
                    </div>
                    <Badge className="bg-blue-600">Active</Badge>
                  </div>

                  <div className="grid gap-4">
                    {plans.map((plan) => (
                      <Card key={plan.name} className={`${plan.current ? 'border-blue-500 bg-blue-50' : ''}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{plan.name}</h3>
                              <p className="text-2xl font-bold text-blue-600">{plan.price}</p>
                            </div>
                            {plan.current ? (
                              <Badge className="bg-blue-600 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Current
                              </Badge>
                            ) : (
                              <Button variant="outline">
                                {plan.name === "Free" ? "Downgrade" : "Upgrade"}
                              </Button>
                            )}
                          </div>
                          <ul className="space-y-1 text-sm">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Check className="h-3 w-3 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card id="security">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download Account Data
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
