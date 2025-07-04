
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface AddVehicleFormProps {
  onClose: () => void;
  onSubmit: (vehicleData: any) => void;
}

const AddVehicleForm = ({ onClose, onSubmit }: AddVehicleFormProps) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    make: '',
    model: '',
    year: '',
    color: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Vehicle</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="plateNumber">License Plate</Label>
              <Input
                id="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => handleChange('plateNumber', e.target.value)}
                placeholder="ABC123"
                required
              />
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
              <Label htmlFor="color">Color (Optional)</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="Blue"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-[#0A84FF] hover:bg-[#0A84FF]/90">
                Add Vehicle
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

export default AddVehicleForm;
