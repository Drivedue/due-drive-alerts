
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Edit, FileText, ChevronDown, ZoomIn } from "lucide-react";
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
      'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md',
      'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md',
      'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md',
      'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md',
      'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md',
      'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md',
      'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md',
      'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
    ];
    return colors[index % colors.length];
  };

  const getDocumentHeaderNumberColor = () => {
    return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Circular vehicle image with enlarge option */}
            {vehicle.vehicle_image && (
              <div className="relative">
                <img
                  src={vehicle.vehicle_image}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-12 h-12 object-cover rounded-full border-2 border-gray-200"
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-full flex items-center justify-center opacity-0 hover:opacity-100">
                      <ZoomIn className="h-3 w-3 text-white" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <img
                      src={vehicle.vehicle_image}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
            
            <div>
              <div 
                className="font-semibold text-base text-[#0A84FF] cursor-pointer hover:underline" 
                onClick={() => onAddDocument(vehicle.id)}
              >
                {vehicle.license_plate}
              </div>
              <div className="text-xs text-gray-600">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {vehicle.vehicle_type && (
              <Badge className={`text-xs ${getVehicleTypeColor(vehicle.vehicle_type)}`}>
                {vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1)}
              </Badge>
            )}
            <Button onClick={() => onEdit(vehicle)} variant="outline" size="sm" className="h-7 px-2">
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Compact vehicle details */}
        {(vehicle.color || vehicle.owner_email) && (
          <div className="space-y-1 text-xs text-gray-600 mb-3 ml-15">
            {vehicle.color && (
              <div className="flex justify-between">
                <span>Color:</span>
                <span className="font-medium text-xs">{vehicle.color}</span>
              </div>
            )}
            {vehicle.owner_email && (
              <div className="flex justify-between">
                <span>Owner Email:</span>
                <span className="font-medium text-xs break-all">{vehicle.owner_email}</span>
              </div>
            )}
          </div>
        )}

        {/* Documents Section */}
        <div className="pt-2 border-t border-gray-100">
          <Collapsible open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Documents</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${getDocumentHeaderNumberColor()}`}>
                  {documents.length}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddDocument(vehicle.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-[#0A84FF] hover:text-[#0A84FF]/80 text-xs h-6 px-2"
                >
                  Add
                </Button>
                <ChevronDown className={`h-3 w-3 transition-transform ${isDocumentsOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2">
              {loadingDocuments ? (
                <div className="text-xs text-gray-500 p-2">Loading documents...</div>
              ) : documents.length > 0 ? (
                <div className="space-y-1">
                  {documents.map((doc, index) => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${getDocumentNumberColor(index)}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-800">
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
