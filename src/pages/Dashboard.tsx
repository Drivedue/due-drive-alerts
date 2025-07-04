
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, Calendar, Bell, AlertTriangle, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Mock user data
  const user = {
    name: "John Doe",
    plan: "Free",
    vehiclesCount: 1,
    maxVehicles: 1
  };

  // Mock vehicle data
  const vehicles = [
    {
      id: 1,
      name: "Honda Civic",
      plate: "ABC-123",
      documents: [
        { type: "License", expiry: "2024-08-15", daysLeft: 42, status: "warning" },
        { type: "Insurance", expiry: "2024-12-31", daysLeft: 180, status: "safe" },
        { type: "Roadworthiness", expiry: "2024-07-20", daysLeft: 17, status: "urgent" }
      ]
    }
  ];

  // Mock upcoming renewals
  const upcomingRenewals = [
    { vehicle: "Honda Civic", document: "Roadworthiness", daysLeft: 17, status: "urgent" },
    { vehicle: "Honda Civic", document: "License", daysLeft: 42, status: "warning" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'safe': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (daysLeft: number) => {
    if (daysLeft <= 30) return 'bg-red-500';
    if (daysLeft <= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={user.plan === "Pro" ? "default" : "secondary"}>
              {user.plan} Plan
            </Badge>
            <Button onClick={() => navigate('/settings')} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{user.vehiclesCount}</div>
              <p className="text-sm text-gray-600">of {user.maxVehicles} allowed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Urgent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">1</div>
              <p className="text-sm text-gray-600">Expiring soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">1</div>
              <p className="text-sm text-gray-600">Need attention</p>
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
              <p className="text-sm text-gray-600">Reminders on</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Vehicles Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Vehicles</h2>
              <Button onClick={() => navigate('/vehicles')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </div>

            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                        <CardDescription>{vehicle.plate}</CardDescription>
                      </div>
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vehicle.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.type}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {doc.daysLeft} days left
                            </span>
                          </div>
                          <div className="w-20">
                            <Progress 
                              value={Math.min((doc.daysLeft / 365) * 100, 100)} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Renewals */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Renewals</h2>
            
            <div className="space-y-4">
              {upcomingRenewals.map((renewal, index) => (
                <Card key={index} className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{renewal.vehicle}</h3>
                      <Badge className={getStatusColor(renewal.status)}>
                        {renewal.daysLeft} days
                      </Badge>
                    </div>
                    <p className="text-gray-600">{renewal.document} renewal due</p>
                    <Button className="mt-3 w-full" variant="outline">
                      Renew Now
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Upgrade Prompt */}
              <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-2">Upgrade to Pro</h3>
                  <p className="text-blue-100 mb-4">
                    Add up to 5 vehicles and get SMS notifications
                  </p>
                  <Button variant="secondary" className="w-full">
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
