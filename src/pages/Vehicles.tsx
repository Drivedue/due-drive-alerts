import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Car, Search, Clock, AlertCircle, CheckCircle, Plus } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import AddVehicleForm from "@/components/AddVehicleForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Vehicles = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if add parameter is present in URL
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true);
    }
  }, [searchParams]);

  // Fetch vehicles from database
  const fetchVehicles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [user]);

  const handleAddVehicle = () => {
    setShowAddForm(true);
    setSearchParams({ add: 'true' });
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    searchParams.delete('add');
    setSearchParams(searchParams);
  };

  const handleVehicleSubmitted = () => {
    // Refresh the vehicles list
    fetchVehicles();
    handleCloseAddForm();
  };

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
    vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: vehicles.length,
    expiring: 0, // This would need document data to calculate
    valid: vehicles.length
  };

  if (loading) {
    return (
      <MobileLayout title="My Vehicles">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading vehicles...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="My Vehicles">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-[#0A84FF]">{stats.total}</div>
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
        {filteredVehicles.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-8 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-600 text-sm mb-4">
                {searchQuery ? "No vehicles match your search." : "You haven't added any vehicles yet."}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddVehicle} className="bg-[#0A84FF] hover:bg-[#0A84FF]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vehicle
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-lg">{vehicle.license_plate}</div>
                  <Badge className="bg-green-100 text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Active
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Make & Model:</span>
                    <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Year:</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                  {vehicle.color && (
                    <div className="flex justify-between">
                      <span>Color:</span>
                      <span className="font-medium">{vehicle.color}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 shadow-lg"
        onClick={handleAddVehicle}
      >
        <Car className="h-6 w-6" />
      </Button>

      {/* Add Vehicle Form Modal */}
      {showAddForm && (
        <AddVehicleForm
          onClose={handleCloseAddForm}
          onSubmitted={handleVehicleSubmitted}
        />
      )}
    </MobileLayout>
  );
};

export default Vehicles;
