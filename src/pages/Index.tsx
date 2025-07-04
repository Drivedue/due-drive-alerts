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
      description: "Manage multiple vehicles"
    },
    {
      icon: Calendar,
      title: "Smart Reminders", 
      description: "Never miss renewals"
    },
    {
      icon: Bell,
      title: "Multi-Channel Alerts",
      description: "Push, email & SMS"
    },
    {
      icon: Shield,
      title: "Stay Compliant",
      description: "Automatic tracking"
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "Free",
      features: ["1 Vehicle", "Push Notifications"],
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99/mo",
      features: ["5 Vehicles", "SMS Notifications"],
      popular: true
    },
    {
      name: "Team",
      price: "$29.99/mo",
      features: ["Unlimited", "Team Management"],
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-[#0A84FF] p-2 rounded-full">
              <Car className="h-5 w-5 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Drive<span className="text-[#0A84FF]">Due</span>
          </h1>
          <p className="text-base text-gray-600 mb-4 max-w-lg mx-auto">
            Never miss vehicle document renewals. Get timely reminders for licenses, insurance, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button size="lg" className="bg-[#0A84FF] hover:bg-[#0A84FF]/90" onClick={() => navigate('/register')}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => setIsLoggedIn(true)}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features List */}
        <div className="mb-8 max-w-2xl mx-auto">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <feature.icon className="h-4 w-4 text-[#0A84FF]" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Section */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Simple Pricing</h2>
            <p className="text-sm text-gray-600">Choose the right plan for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-[#0A84FF] border-2' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#0A84FF] text-xs">
                    Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-xl font-bold text-[#0A84FF]">{plan.price}</div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ul className="space-y-1 mb-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full text-sm ${plan.popular ? 'bg-[#0A84FF] hover:bg-[#0A84FF]/90' : ''}`}
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
