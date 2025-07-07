import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import VehicleCard from "@/components/VehicleCard";
import AddVehicleForm from "@/components/AddVehicleForm";
import AddDocumentForm from "@/components/AddDocumentForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Car } from "lucide-react";
import PlanLimitsBanner from "@/components/PlanLimitsBanner";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import CompactUpgradeCard from "@/components/CompactUpgradeCard";

const MyGarage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canAddVehicle, canAddDocument, refreshCounts } = usePlanLimits();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  const fetchVehicles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vehicles. Please try again.",
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
    if (!canAddVehicle) {
      toast({
        title: "Vehicle Limit Reached",
        description: "Free plan users are limited to 1 vehicle. Upgrade to Pro for unlimited vehicles.",
        variant: "destructive"
      });
      return;
    }
    setEditingVehicle(null);
    setShowAddVehicle(true);
  };

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setShowAddVehicle(true);
  };

  const handleAddDocument = () => {
    if (!canAddDocument) {
      toast({
        title: "Document Limit Reached",
        description: "Free plan users are limited to 5 documents. Upgrade to Pro for unlimited documents.",
        variant: "destructive"
      });
      return;
    }
    setShowAddDocument(true);
  };

  const handleVehicleSubmitted = () => {
    setShowAddVehicle(false);
    setEditingVehicle(null);
    fetchVehicles();
    refreshCounts();
  };

  const handleDocumentSubmit = async (documentData: any) => {
    if (!user) return;

    try {
      console.log('Submitting document with data:', documentData);
      
      const { error } = await supabase
        .from('documents')
        .insert({
          ...documentData,
          user_id: user.id
        });

      if (error) {
        console.error('Database error:', error);
        if (error.message.includes('limited to 5 documents')) {
          toast({
            title: "Document Limit Reached",
            description: "Free plan users are limited to 5 documents. Upgrade to Pro for unlimited documents.",
            variant: "destructive"
          });
        } else if (error.message.includes('Invalid document type')) {
          toast({
            title: "Invalid Document Type",
            description: "Please select a valid document type from the dropdown.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to add document. Please try again.",
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "Document added successfully!",
      });

      setShowAddDocument(false);
      fetchVehicles();
      refreshCounts();
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: "Error",
        description: "Failed to add document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpgradeSuccess = () => {
    // Refresh counts and page data after successful upgrade
    refreshCounts();
    fetchVehicles();
    toast({
      title: "Welcome to Pro!",
      description: "You now have unlimited access to all features.",
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MobileLayout title="My Garage">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading vehicles...</div>
          </div>
        </MobileLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MobileLayout title="My Garage">
        <PlanLimitsBanner />
        
        <div className="space-y-3">
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first vehicle.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onEdit={handleEditVehicle}
                  onAddDocument={handleAddDocument}
                />
              ))}
            </div>
          )}
          
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleAddVehicle}
              size="sm"
              className="bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white px-4 py-2"
              disabled={!canAddVehicle}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Compact Upgrade Card at bottom */}
        <div className="mt-8">
          <CompactUpgradeCard />
        </div>

        {showAddVehicle && (
          <AddVehicleForm
            vehicle={editingVehicle}
            onClose={() => setShowAddVehicle(false)}
            onSubmitted={handleVehicleSubmitted}
          />
        )}

        {showAddDocument && (
          <AddDocumentForm
            vehicles={vehicles}
            onClose={() => setShowAddDocument(false)}
            onSubmit={handleDocumentSubmit}
          />
        )}
      </MobileLayout>
    </ProtectedRoute>
  );
};

export default MyGarage;
