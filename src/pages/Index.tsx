
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
      description: "Get notified 4 weeks, 3 weeks, 2 weeks, 1 week, and 1 day before expiry"
    },
    {
      icon: Bell,
      title: "Multi-Channel Alerts",
      description: "Receive notifications via push, email, and SMS (Pro users)"
    },
    {
      icon: Shield,
      title: "Never Miss Renewals",
      description: "Stay compliant with automatic document tracking"
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "Free",
      features: ["1 Vehicle", "Push Notifications", "Email Reminders", "Basic Support"],
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99/month",
      features: ["Up to 5 Vehicles", "SMS Notifications", "Email Reminders", "Push Notifications", "Priority Support"],
      popular: true
    },
    {
      name: "Team",
      price: "$29.99/month",
      features: ["Unlimited Vehicles", "Team Management", "All Notification Types", "Advanced Analytics", "24/7 Support"],
      popular: false
    }
  ];

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
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
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{user.vehiclesCount}</div>
                <p className="text-sm text-gray-600">Registered vehicles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Expiring Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{user.documentsExpiringSoon}</div>
                <p className="text-sm text-gray-600">Documents need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-green-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">Active</div>
                <p className="text-sm text-gray-600">Reminder system</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/vehicles')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Manage Vehicles
                </CardTitle>
                <CardDescription>Add new vehicles and update document information</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/documents')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  View Documents
                </CardTitle>
                <CardDescription>Check expiry dates and manage renewals</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Drive<span className="text-blue-600">Due</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Never miss another vehicle document renewal. Get timely reminders for licenses, insurance, roadworthiness, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/register')}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => setIsLoggedIn(true)}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-gray-600">Select the perfect plan for your vehicle management needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 border-2' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
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
