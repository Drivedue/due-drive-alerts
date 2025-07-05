
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Edit, FileText, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VehicleCardProps {
  vehicle: any;
  onEdit: (vehicle: any) => void;
  onAddDocument: (vehicleId: string) => void;
}

const VehicleCard = ({ vehicle, onEdit, onAddDocument }: VehicleCardProps) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user || !vehicle.id) return;
    
    try {
      setLoadingDocuments(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .eq('user_id', user.id);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user, vehicle.id]);

  const getVehicleTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'private':
        return 'bg-blue-100 text-blue-600';
      case 'commercial':
        return 'bg-green-100 text-green-600';
      case 'motorcycle':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'drivers_license': "Driver's License",
      'vehicle_license': 'Vehicle License',
      'insurance': 'Insurance',
      'vehicle_inspection_certificate': 'Vehicle Inspection Certificate',
      'road_worthiness': 'Road Worthiness',
      'registration': 'Registration',
      'other': 'Other'
    };
    return types[type] || type;
  };

  const getDocumentNumberColor = (index: number) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-red-500 text-white',
      'bg-yellow-500 text-white',
      'bg-indigo-500 text-white',
      'bg-pink-500 text-white',
      'bg-teal-500 text-white'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div 
            className="font-semibold text-lg text-[#0A84FF] cursor-pointer hover:underline" 
            onClick={() => onAddDocument(vehicle.id)}
          >
            {vehicle.license_plate}
          </div>
          <div className="flex gap-2">
            {vehicle.vehicle_type && (
              <Badge className={getVehicleTypeColor(vehicle.vehicle_type)}>
                {vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1)}
              </Badge>
            )}
            <Button onClick={() => onEdit(vehicle)} variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
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
          {vehicle.owner_email && (
            <div className="flex justify-between">
              <span>Owner Email:</span>
              <span className="font-medium text-xs">{vehicle.owner_email}</span>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Collapsible open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Documents</span>
                <Badge variant="secondary" className="text-xs">
                  {documents.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddDocument(vehicle.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-[#0A84FF] hover:text-[#0A84FF]/80 text-xs"
                >
                  Add Document
                </Button>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDocumentsOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3">
              {loadingDocuments ? (
                <div className="text-xs text-gray-500">Loading documents...</div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getDocumentNumberColor(index)}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {getDocumentTypeLabel(doc.document_type)}
                        </div>
                        {doc.expiry_date && (
                          <div className="text-xs text-gray-500">
                            Exp: {new Date(doc.expiry_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 p-2">No documents added</div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
