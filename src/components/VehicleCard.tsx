
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, FileText } from "lucide-react";
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Documents</span>
              <Badge variant="secondary" className="text-xs">
                {documents.length}
              </Badge>
            </div>
            <Button
              onClick={() => onAddDocument(vehicle.id)}
              variant="ghost"
              size="sm"
              className="text-[#0A84FF] hover:text-[#0A84FF]/80 text-xs"
            >
              Add Document
            </Button>
          </div>
          
          {loadingDocuments ? (
            <div className="text-xs text-gray-500">Loading documents...</div>
          ) : documents.length > 0 ? (
            <div className="space-y-1">
              {documents.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 truncate">
                    {getDocumentTypeLabel(doc.document_type)}
                  </span>
                  {doc.expiry_date && (
                    <span className="text-gray-500 text-xs">
                      Exp: {new Date(doc.expiry_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
              {documents.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{documents.length - 3} more documents
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No documents added</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
