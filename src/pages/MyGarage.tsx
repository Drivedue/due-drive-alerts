
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import VehicleDetailsForm from "@/components/VehicleDetailsForm";
import AddDocumentForm from "@/components/AddDocumentForm";
import GarageStats from "@/components/garage/GarageStats";
import GarageSearch from "@/components/garage/GarageSearch";
import VehiclesList from "@/components/garage/VehiclesList";
import AddVehicleButton from "@/components/garage/AddVehicleButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MyGarage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
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

  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);

      if (documentsError) throw documentsError;
      setDocuments(documentsData || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchDocuments();
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

      // Refresh both vehicles and documents to trigger updates
      await fetchDocuments();
      await fetchVehicles();
      
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
      <GarageStats vehicleCount={vehicles.length} documentCount={documents.length} />
      <GarageSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <VehiclesList
        vehicles={vehicles}
        searchQuery={searchQuery}
        onAddVehicle={handleAddVehicle}
        onEditVehicle={handleEditVehicle}
        onAddDocument={handleAddDocument}
      />

      <AddVehicleButton onAddVehicle={handleAddVehicle} />

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
