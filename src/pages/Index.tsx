
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Calendar, Bell, Shield, Users, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock user data - in real app this would come from auth context
  const user = {
    name: "John Doe",
    plan: "Free",
    vehiclesCount: 1,
    documentsExpiringSoon: 2
  };

  const features = [
    {
      icon: Car,
      title: "Vehicle Management",
      description: "Add and manage multiple vehicles with their documents"
    },
    {
      icon: Calendar,
      title: "Smart Reminders",
      description: "Get notified before document expiry"
    },
    {
      icon: Bell,
      title: "Multi-Channel Alerts",
      description: "Push, email, and SMS notifications"
    },
    {
      icon: Shield,
      title: "Never Miss Renewals",
      description: "Stay compliant with automatic tracking"
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "Free",
      features: ["1 Vehicle", "Push Notifications", "Email Reminders"],
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99/month",
      features: ["Up to 5 Vehicles", "SMS Notifications", "Priority Support"],
      popular: true
    },
    {
      name: "Team",
      price: "$29.99/month",
      features: ["Unlimited Vehicles", "Team Management", "24/7 Support"],
      popular: false
    }
  ];

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="text-gray-600">Stay on top of your vehicle documents</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={user.plan === "Pro" ? "default" : "secondary"}>
                {user.plan} Plan
              </Badge>
              <Button onClick={() => navigate('/settings')}>Settings</Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-4 w-4 text-[#0A84FF]" />
                  Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0A84FF]">{user.vehiclesCount}</div>
                <p className="text-xs text-gray-600">Registered vehicles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  Expiring Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{user.documentsExpiringSoon}</div>
                <p className="text-xs text-gray-600">Documents need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-green-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-gray-600">Reminder system</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/vehicles')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Manage Vehicles
                </CardTitle>
                <CardDescription className="text-sm">Add new vehicles and update documents</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/documents')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  View Documents
                </CardTitle>
                <CardDescription className="text-sm">Check expiry dates and manage renewals</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#0A84FF] p-2 rounded-full">
              <Car className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Drive<span className="text-[#0A84FF]">Due</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
            Never miss another vehicle document renewal. Get timely reminders for licenses, insurance, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-[#0A84FF] hover:bg-[#0A84FF]/90" onClick={() => navigate('/register')}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => setIsLoggedIn(true)}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader className="pb-2">
                <div className="mx-auto bg-blue-100 p-2 rounded-full w-fit mb-2">
                  <feature.icon className="h-5 w-5 text-[#0A84FF]" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600">Select the perfect plan for your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-[#0A84FF] border-2' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#0A84FF]">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-2xl font-bold text-[#0A84FF]">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-[#0A84FF] hover:bg-[#0A84FF]/90' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate('/register')}
                  >
                    {plan.name === "Free" ? "Start Free" : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
