
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Car, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import VehicleDetailsForm from "@/components/VehicleDetailsForm";
import VehicleCard from "@/components/VehicleCard";
import AddDocumentForm from "@/components/AddDocumentForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MyGarage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchVehicles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id);

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);
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
    setEditingVehicle(null);
    setShowVehicleForm(true);
  };

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleAddDocument = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setShowDocumentForm(true);
  };

  const handleSubmitDocument = async (documentData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          vehicle_id: documentData.vehicle_id,
          title: documentData.title,
          document_type: documentData.document_type,
          document_number: documentData.document_number,
          issue_date: documentData.issue_date || null,
          expiry_date: documentData.expiry_date || null,
          notes: documentData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document added successfully!",
      });

      setShowDocumentForm(false);
      setSelectedVehicleId('');
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive"
      });
    }
  };

  const handleSubmitVehicle = async (vehicleData: any) => {
    if (!user) return;

    try {
      const vehiclePayload = {
        user_id: user.id,
        license_plate: vehicleData.plateNumber,
        vehicle_type: vehicleData.vehicleType,
        make: vehicleData.make,
        model: vehicleData.model,
        year: parseInt(vehicleData.year),
        owner_email: vehicleData.ownerEmail || null,
        color: vehicleData.color || null
      };

      if (editingVehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update(vehiclePayload)
          .eq('id', editingVehicle.id);

        if (error) throw error;
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('vehicles')
          .insert(vehiclePayload);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Vehicle ${editingVehicle ? 'updated' : 'added'} successfully!`,
      });

      fetchVehicles();
      setShowVehicleForm(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingVehicle ? 'update' : 'add'} vehicle`,
        variant: "destructive"
      });
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <MobileLayout title="My Garage">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="My Garage">
      {/* Stats Card */}
      <div className="mb-6">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-[#0A84FF]">{vehicles.length}</div>
            <div className="text-xs text-gray-600">Vehicles</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Vehicles List */}
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
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEditVehicle}
              onAddDocument={handleAddDocument}
            />
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 shadow-lg"
        onClick={handleAddVehicle}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Vehicle Details Form Modal */}
      {showVehicleForm && (
        <VehicleDetailsForm
          onClose={() => setShowVehicleForm(false)}
          onSubmit={handleSubmitVehicle}
          vehicle={editingVehicle}
        />
      )}

      {/* Add Document Form Modal */}
      {showDocumentForm && (
        <AddDocumentForm
          onClose={() => {
            setShowDocumentForm(false);
            setSelectedVehicleId('');
          }}
          onSubmit={handleSubmitDocument}
          vehicles={vehicles.filter(v => v.id === selectedVehicleId)}
        />
      )}
    </MobileLayout>
  );
};

export default MyGarage;
