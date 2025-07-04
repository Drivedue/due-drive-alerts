
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Search, Plus, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import AddVehicleForm from "@/components/AddVehicleForm";
import AddDocumentForm from "@/components/AddDocumentForm";
import DocumentCard from "@/components/documents/DocumentCard";
import DocumentDetailsModal from "@/components/documents/DocumentDetailsModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const VehiclesAndDocuments = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [showAddDocumentForm, setShowAddDocumentForm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch both vehicles and documents
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
    setShowAddVehicleForm(true);
  };

  const handleAddDocument = () => {
    setShowAddDocumentForm(true);
  };

  const handleSubmitVehicle = async (vehicleData: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          user_id: user.id,
          license_plate: vehicleData.plateNumber,
          make: vehicleData.make,
          model: vehicleData.model,
          year: parseInt(vehicleData.year),
          color: vehicleData.color || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle added successfully!",
      });

      fetchData();
      setShowAddVehicleForm(false);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to add vehicle",
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
          vehicle_id: documentData.vehicle_id,
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
      setShowAddDocumentForm(false);
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

  const handleRenewDocument = (document: any) => {
    toast({
      title: "Renewal Process Started",
      description: `Initiating renewal for ${document.title}. You will be redirected to the renewal portal.`,
    });
    
    setTimeout(() => {
      toast({
        title: "Redirecting...",
        description: "Taking you to the renewal portal.",
      });
    }, 1500);
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

  const documentStats = {
    total: documents.length,
    expired: documents.filter(d => d.status === 'expired').length,
    expiring: documents.filter(d => d.status === 'warning').length,
    valid: documents.filter(d => d.status === 'safe').length
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

      {/* Document Status Mini Stats */}
      {documents.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="text-center">
            <CardContent className="p-2">
              <div className="text-sm font-bold text-red-600">{documentStats.expired}</div>
              <div className="text-xs text-gray-600">Expired</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-2">
              <div className="text-sm font-bold text-orange-600">{documentStats.expiring}</div>
              <div className="text-xs text-gray-600">Expiring</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-2">
              <div className="text-sm font-bold text-green-600">{documentStats.valid}</div>
              <div className="text-xs text-gray-600">Valid</div>
            </CardContent>
          </Card>
        </div>
      )}

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
                    <Button onClick={handleAddDocument} className="bg-[#0A84FF] hover:bg-[#0A84FF]/90">
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
                  onRenewDocument={handleRenewDocument}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 shadow-lg"
        onClick={activeTab === 'vehicles' ? handleAddVehicle : handleAddDocument}
      >
        {activeTab === 'vehicles' ? <Car className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>

      {/* Add Vehicle Form Modal */}
      {showAddVehicleForm && (
        <AddVehicleForm
          onClose={() => setShowAddVehicleForm(false)}
          onSubmit={handleSubmitVehicle}
        />
      )}

      {/* Add Document Form Modal */}
      {showAddDocumentForm && (
        <AddDocumentForm
          onClose={() => setShowAddDocumentForm(false)}
          onSubmit={handleSubmitDocument}
          vehicles={vehicles}
        />
      )}
    </MobileLayout>
  );
};

export default VehiclesAndDocuments;
