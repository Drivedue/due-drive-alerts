
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Car, Search, Clock, AlertCircle, CheckCircle } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useNavigate } from "react-router-dom";

const Vehicles = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock vehicle data matching the reference design
  const vehicles = [
    {
      id: 1,
      plateNumber: "ABC123",
      status: "expiring",
      expiryDate: "7/12/2025",
      timeRemaining: "29 days left",
      statusColor: "text-orange-600",
      statusBg: "bg-orange-100",
      hasNotifications: true
    },
    {
      id: 2,
      plateNumber: "XYZ789",
      status: "expired",
      expiryDate: "6/7/2025",
      timeRemaining: "Expired 6 days ago",
      statusColor: "text-red-600",
      statusBg: "bg-red-100",
      hasNotifications: false
    },
    {
      id: 3,
      plateNumber: "DEF456",
      status: "valid",
      expiryDate: "4/8/2026",
      timeRemaining: "9 months left",
      statusColor: "text-green-600",
      statusBg: "bg-green-100",
      hasNotifications: false
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      case 'expiring':
        return <Clock className="h-4 w-4" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'expired':
        return 'Expired';
      case 'expiring':
        return 'Expiring Soon';
      case 'valid':
        return 'Valid';
      default:
        return 'Unknown';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: vehicles.length,
    expiring: vehicles.filter(v => v.status === 'expiring').length,
    valid: vehicles.filter(v => v.status === 'valid').length
  };

  return (
    <MobileLayout title="My Vehicles">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-orange-600">{stats.expiring}</div>
            <div className="text-xs text-gray-600">Expiring Soon</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
            <div className="text-xs text-gray-600">Valid</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by plate number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Vehicle List */}
      <div className="space-y-4">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-lg">{vehicle.plateNumber}</div>
                <Badge className={`${vehicle.statusBg} ${vehicle.statusColor} flex items-center gap-1`}>
                  {getStatusIcon(vehicle.status)}
                  {getStatusText(vehicle.status)}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="font-medium">{vehicle.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Remaining:</span>
                  <span className="font-medium">{vehicle.timeRemaining}</span>
                </div>
              </div>

              {vehicle.hasNotifications && (
                <div className="mt-3 flex items-center gap-2 text-blue-600 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>SMS Notifications</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        onClick={() => navigate('/vehicles?add=true')}
      >
        <Car className="h-6 w-6" />
      </Button>
    </MobileLayout>
  );
};

export default Vehicles;
