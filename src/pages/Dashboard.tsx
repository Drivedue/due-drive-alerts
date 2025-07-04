
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, Calendar, Bell, AlertTriangle, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Mock user data
  const user = {
    name: "John Doe",
    plan: "Free",
    vehiclesCount: 3,
    maxVehicles: 5
  };

  // Mock upcoming renewals
  const upcomingRenewals = [
    { vehicle: "ABC123", document: "License", daysLeft: 29, status: "warning" },
    { vehicle: "XYZ789", document: "Insurance", daysLeft: -6, status: "expired" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'safe': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <MobileLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back, {user.name}!</h2>
        <p className="text-gray-600 text-sm">Stay on top of your vehicle documents</p>
        <Badge variant={user.plan === "Pro" ? "default" : "secondary"} className="mt-2">
          {user.plan} Plan
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{user.vehiclesCount}</div>
                <p className="text-xs text-gray-600">Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">2</div>
                <p className="text-xs text-gray-600">Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Renewals</h3>
        
        <div className="space-y-3">
          {upcomingRenewals.map((renewal, index) => (
            <Card key={index} className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{renewal.vehicle}</h4>
                  <Badge className={getStatusColor(renewal.status)}>
                    {renewal.daysLeft > 0 ? `${renewal.daysLeft} days` : 'Expired'}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">{renewal.document} renewal due</p>
                <Button className="w-full" variant="outline" size="sm">
                  Renew Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/vehicles')}>
          <CardContent className="p-4 text-center">
            <Car className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-semibold text-sm">My Vehicles</h4>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/documents')}>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-semibold text-sm">Documents</h4>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Prompt */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-4 text-center">
          <h3 className="font-bold mb-2">Upgrade to Pro</h3>
          <p className="text-blue-100 mb-4 text-sm">
            Add up to 5 vehicles and get SMS notifications
          </p>
          <Button variant="secondary" size="sm" className="w-full">
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    </MobileLayout>
  );
};

export default Dashboard;
