
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Bell, Calendar, Shield, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Car,
      title: "Vehicle Management",
      description: "Manage multiple vehicles",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Bell,
      title: "Smart Reminders", 
      description: "Never miss renewals",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: Calendar,
      title: "Multi-Channel Alerts",
      description: "Push, email & SMS",
      color: "text-orange-600 bg-orange-100"
    },
    {
      icon: Shield,
      title: "Stay Compliant",
      description: "Automatic tracking",
      color: "text-purple-600 bg-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="text-center mb-8 lg:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
            Never Miss Another
            <span className="text-blue-600 block">Vehicle Renewal</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8 max-w-2xl mx-auto">
            Stay ahead of your vehicle document renewals with smart reminders and automated tracking
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Section - Compact Mobile Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8 lg:mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 lg:p-6">
                <div className={`inline-flex p-2 lg:p-3 rounded-full ${feature.color} mb-2 lg:mb-4`}>
                  <feature.icon className="h-4 w-4 lg:h-6 lg:w-6" />
                </div>
                <h3 className="font-semibold text-sm lg:text-lg text-gray-900 mb-1 lg:mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 leading-tight">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg lg:rounded-2xl shadow-lg p-6 lg:p-12 mb-8 lg:mb-16">
          <div className="text-center mb-6 lg:mb-12">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
              Why Choose DriveDue?
            </h2>
            <p className="text-base lg:text-lg text-gray-600">
              Join thousands of drivers who never miss a renewal
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {[
              "Automatic document tracking",
              "Multi-channel notifications",
              "Mobile-friendly dashboard",
              "Secure document storage", 
              "Multi-vehicle management",
              "Never miss deadlines"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm lg:text-base text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 rounded-lg lg:rounded-2xl p-6 lg:p-12 text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3 lg:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-base lg:text-lg mb-6 lg:mb-8 opacity-90">
            Join DriveDue today and never worry about expired documents again
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-semibold"
          >
            Start Your Free Account
            <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
