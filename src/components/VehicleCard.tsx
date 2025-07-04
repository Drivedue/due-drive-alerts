
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";

interface VehicleCardProps {
  vehicle: any;
  onEdit: (vehicle: any) => void;
  onAddDocument: (vehicleId: string) => void;
}

const VehicleCard = ({ vehicle, onEdit, onAddDocument }: VehicleCardProps) => {
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
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
