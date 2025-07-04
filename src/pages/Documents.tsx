import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import AddDocumentForm from "@/components/AddDocumentForm";
import DocumentsStats from "@/components/documents/DocumentsStats";
import DocumentsFilters from "@/components/documents/DocumentsFilters";
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
      <DocumentsStats {...stats} />
      
      <DocumentsFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documents={documents}
        vehicles={vehicles}
        onAddDocument={handleAddDocument}
        onViewDetails={handleViewDetails}
        onRenewDocument={handleRenewDocument}
      />

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
