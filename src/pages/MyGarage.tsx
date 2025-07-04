
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Search, Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import VehicleDetailsForm from "@/components/VehicleDetailsForm";
import VehicleCard from "@/components/VehicleCard";
import AddDocumentForm from "@/components/AddDocumentForm";
import DocumentCard from "@/components/documents/DocumentCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MyGarage = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id);

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);

      // Fetch documents with vehicle information
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select(`
          *,
          vehicles (
            license_plate,
            make,
            model
          )
        `)
        .eq('user_id', user.id);

      if (documentsError) throw documentsError;
      
      // Process documents to add status information
      const processedDocuments = (documentsData || []).map(doc => {
        const today = new Date();
        const expiryDate = doc.expiry_date ? new Date(doc.expiry_date) : null;
        let status = 'unknown';
        let daysLeft = 0;

        if (expiryDate) {
          const timeDiff = expiryDate.getTime() - today.getTime();
          daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          if (daysLeft < 0) {
            status = 'expired';
          } else if (daysLeft <= 30) {
            status = 'warning';
          } else {
            status = 'safe';
          }
        }

        return {
          ...doc,
          status,
          daysLeft,
          vehiclePlate: doc.vehicles?.license_plate || 'Unknown Vehicle'
        };
      });

      setDocuments(processedDocuments);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

      let vehicleId;

      if (editingVehicle) {
        // Update existing vehicle
        const { data, error } = await supabase
          .from('vehicles')
          .update(vehiclePayload)
          .eq('id', editingVehicle.id)
          .select()
          .single();

        if (error) throw error;
        vehicleId = editingVehicle.id;
      } else {
        // Create new vehicle
        const { data, error } = await supabase
          .from('vehicles')
          .insert(vehiclePayload)
          .select()
          .single();

        if (error) throw error;
        vehicleId = data.id;
      }

      // Add documents if any
      if (vehicleData.documents && vehicleData.documents.length > 0) {
        const documentsToInsert = vehicleData.documents.map((doc: any) => ({
          user_id: user.id,
          vehicle_id: vehicleId,
          title: `${doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
          document_type: doc.documentType,
          document_number: doc.documentNumber || null,
          issue_date: doc.issueDate || null,
          expiry_date: doc.expiryDate || null
        }));

        const { error: docsError } = await supabase
          .from('documents')
          .insert(documentsToInsert);

        if (docsError) throw docsError;
      }

      toast({
        title: "Success",
        description: `Vehicle ${editingVehicle ? 'updated' : 'added'} successfully!`,
      });

      fetchData();
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

  const handleSubmitDocument = async (documentData: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: documentData.title,
          document_type: documentData.document_type,
          document_number: documentData.document_number || null,
          vehicle_id: selectedVehicleId || documentData.vehicle_id,
          issue_date: documentData.issue_date || null,
          expiry_date: documentData.expiry_date || null,
          notes: documentData.notes || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document added successfully!",
      });

      fetchData();
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

  const handleViewDetails = (document: any) => {
    console.log('Viewing details for document:', document);
  };

  const handleEditDocument = (document: any) => {
    toast({
      title: "Document Editor",
      description: `Opening editor for ${document.title}. You can update the expiry date and other details.`,
    });
    console.log('Editing document:', document);
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter(document =>
    document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    document.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-[#0A84FF]">{vehicles.length}</div>
            <div className="text-xs text-gray-600">Vehicles</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-600">{documents.length}</div>
            <div className="text-xs text-gray-600">Documents</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={`Search ${activeTab === 'vehicles' ? 'vehicles' : 'documents'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="mt-4">
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
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="space-y-3">
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {searchQuery ? "No documents match your search." : "You haven't added any documents yet."}
                  </p>
                  {vehicles.length === 0 ? (
                    <p className="text-gray-500 text-xs">
                      Add a vehicle first to create documents for it.
                    </p>
                  ) : !searchQuery && (
                    <Button onClick={() => setShowDocumentForm(true)} className="bg-[#0A84FF] hover:bg-[#0A84FF]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onViewDetails={handleViewDetails}
                  onEditDocument={handleEditDocument}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 shadow-lg"
        onClick={activeTab === 'vehicles' ? handleAddVehicle : () => setShowDocumentForm(true)}
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
          onClose={() => setShowDocumentForm(false)}
          onSubmit={handleSubmitDocument}
          vehicles={vehicles}
        />
      )}
    </MobileLayout>
  );
};

export default MyGarage;
