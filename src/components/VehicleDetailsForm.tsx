
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface VehicleDetailsFormProps {
  onClose: () => void;
  onSubmit: (vehicleData: any) => void;
  vehicle?: any;
}

const VehicleDetailsForm = ({ onClose, onSubmit, vehicle }: VehicleDetailsFormProps) => {
  const [formData, setFormData] = useState({
    plateNumber: vehicle?.license_plate || '',
    vehicleType: vehicle?.vehicle_type || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year?.toString() || '',
    ownerEmail: vehicle?.owner_email || '',
    color: vehicle?.color || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const vehicleTypes = [
    "Private",
    "Commercial", 
    "Motorcycle"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{vehicle ? 'Edit Vehicle' : 'Add Vehicle Details'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vehicle Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plateNumber">Plate Number</Label>
                  <Input
                    id="plateNumber"
                    value={formData.plateNumber}
                    onChange={(e) => handleChange('plateNumber', e.target.value)}
                    placeholder="ABC-123-XY"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select onValueChange={(value) => handleChange('vehicleType', value)} value={formData.vehicleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => handleChange('make', e.target.value)}
                    placeholder="Toyota"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    placeholder="Camry"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="Blue"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="ownerEmail">Owner Email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => handleChange('ownerEmail', e.target.value)}
                  placeholder="owner@example.com"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-[#0A84FF] hover:bg-[#0A84FF]/90">
                Save Vehicle Details
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleDetailsForm;
