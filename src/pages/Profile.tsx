
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Save, X } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567'
  });

  const user = {
    plan: "Free",
    joinDate: "January 2024",
    vehiclesCount: 3,
    maxVehicles: 5
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567'
    });
  };

  return (
    <MobileLayout title="Profile">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{formData.fullName}</h2>
          <p className="text-gray-600 text-sm mb-3">{formData.email}</p>
          <Badge variant={user.plan === "Pro" ? "default" : "secondary"}>
            {user.plan} Plan
          </Badge>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Account Information</CardTitle>
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Account Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Member since:</span>
            <span className="font-medium">{user.joinDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Vehicles registered:</span>
            <span className="font-medium">{user.vehiclesCount} of {user.maxVehicles}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <Badge variant={user.plan === "Pro" ? "default" : "secondary"}>
              {user.plan}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/settings')}
        >
          Upgrade to Pro
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          Sign Out
        </Button>
      </div>
    </MobileLayout>
  );
};

export default Profile;
