
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Plus } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";

interface VehiclesListProps {
  vehicles: any[];
  searchQuery: string;
  onAddVehicle: () => void;
  onEditVehicle: (vehicle: any) => void;
  onAddDocument: (vehicleId: string) => void;
}

const VehiclesList = ({ 
  vehicles, 
  searchQuery, 
  onAddVehicle, 
  onEditVehicle, 
  onAddDocument 
}: VehiclesListProps) => {
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredVehicles.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-600 text-sm mb-4">
            {searchQuery ? "No vehicles match your search." : "You haven't added any vehicles yet."}
          </p>
          {!searchQuery && (
            <Button onClick={onAddVehicle} className="bg-[#0A84FF] hover:bg-[#0A84FF]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Vehicle
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredVehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onEdit={onEditVehicle}
          onAddDocument={onAddDocument}
        />
      ))}
    </div>
  );
};

export default VehiclesList;
