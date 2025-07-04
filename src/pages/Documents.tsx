
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, FileText, AlertCircle, CheckCircle, Clock, Eye, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import AddDocumentForm from "@/components/AddDocumentForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Documents = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [documents, setDocuments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch documents and vehicles from database
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
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddDocument = () => {
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
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

      // Refresh the documents list
      fetchData();
      handleCloseAddForm();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      case 'safe':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'safe': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string, daysLeft: number) => {
    if (status === 'expired') return `Expired ${Math.abs(daysLeft)} days ago`;
    if (status === 'warning') return `${daysLeft} days left`;
    if (status === 'safe') return 'Valid';
    return 'Unknown';
  };

  const filterDocuments = (filter: string) => {
    switch (filter) {
      case 'expired':
        return documents.filter(doc => doc.status === 'expired');
      case 'expiring':
        return documents.filter(doc => doc.status === 'warning');
      case 'valid':
        return documents.filter(doc => doc.status === 'safe');
      default:
        return documents;
    }
  };

  const stats = {
    total: documents.length,
    expired: documents.filter(d => d.status === 'expired').length,
    expiring: documents.filter(d => d.status === 'warning').length,
    valid: documents.filter(d => d.status === 'safe').length
  };

  if (loading) {
    return (
      <MobileLayout title="Documents">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading documents...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Documents">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-red-600">{stats.expired}</div>
            <div className="text-xs text-gray-600">Expired</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-orange-600">{stats.expiring}</div>
            <div className="text-xs text-gray-600">Expiring</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-green-600">{stats.valid}</div>
            <div className="text-xs text-gray-600">Valid</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="expired" className="text-xs">Expired</TabsTrigger>
          <TabsTrigger value="expiring" className="text-xs">Expiring</TabsTrigger>
          <TabsTrigger value="valid" className="text-xs">Valid</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-3">
            {filterDocuments(activeTab).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {activeTab === 'all' 
                      ? "You haven't added any documents yet."
                      : `No ${activeTab} documents found.`
                    }
                  </p>
                  {vehicles.length === 0 ? (
                    <p className="text-gray-500 text-xs">
                      Add a vehicle first to create documents for it.
                    </p>
                  ) : (
                    <Button onClick={handleAddDocument} className="bg-[#0A84FF] hover:bg-[#0A84FF]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filterDocuments(activeTab).map((document) => (
                <Card key={document.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-sm">{document.title}</h3>
                        <p className="text-xs text-gray-600">{document.vehiclePlate}</p>
                      </div>
                      <Badge className={`${getStatusColor(document.status)} flex items-center gap-1`}>
                        {getStatusIcon(document.status)}
                        {getStatusText(document.status, document.daysLeft)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                      <span>Expires: {document.expiry_date || 'No expiry date'}</span>
                      <Calendar className="h-3 w-3" />
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>{document.title} Details</DialogTitle>
                            <DialogDescription>
                              Complete information for your {document.title.toLowerCase()}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Vehicle</label>
                                <p className="text-sm text-gray-900">{document.vehiclePlate}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Document Type</label>
                                <p className="text-sm text-gray-900">{document.document_type}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Created Date</label>
                                <p className="text-sm text-gray-900">{new Date(document.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                                <p className="text-sm text-gray-900">{document.expiry_date || 'No expiry date'}</p>
                              </div>
                            </div>
                            {document.notes && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Notes</label>
                                <p className="text-sm text-gray-900">{document.notes}</p>
                              </div>
                            )}
                            <div>
                              <label className="text-sm font-medium text-gray-700">Status</label>
                              <Badge className={`${getStatusColor(document.status)} mt-1`}>
                                {getStatusIcon(document.status)}
                                {getStatusText(document.status, document.daysLeft)}
                              </Badge>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleRenewDocument(document)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Renew Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 shadow-lg"
        onClick={handleAddDocument}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Document Form Modal */}
      {showAddForm && (
        <AddDocumentForm
          onClose={handleCloseAddForm}
          onSubmit={handleSubmitDocument}
          vehicles={vehicles}
        />
      )}
    </MobileLayout>
  );
};

export default Documents;
