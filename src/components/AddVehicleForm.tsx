
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddVehicleFormProps {
  vehicle?: any;
  onClose: () => void;
  onSubmitted: () => void;
}

const AddVehicleForm = ({ vehicle, onClose, onSubmitted }: AddVehicleFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    plateNumber: vehicle?.license_plate || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year?.toString() || '',
    color: vehicle?.color || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Input validation functions
  const validatePlateNumber = (plate: string): boolean => {
    return /^[A-Za-z0-9\-\s]{1,20}$/.test(plate);
  };

  const validateMakeModel = (value: string): boolean => {
    return /^[A-Za-z0-9\s\-\.]{1,50}$/.test(value);
  };

  const validateYear = (year: string): boolean => {
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    return yearNum >= 1900 && yearNum <= currentYear + 1;
  };

  const validateColor = (color: string): boolean => {
    return color === '' || /^[A-Za-z\s]{1,30}$/.test(color);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = 'License plate is required';
    } else if (!validatePlateNumber(formData.plateNumber)) {
      newErrors.plateNumber = 'Invalid license plate format';
    }

    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    } else if (!validateMakeModel(formData.make)) {
      newErrors.make = 'Invalid make format';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    } else if (!validateMakeModel(formData.model)) {
      newErrors.model = 'Invalid model format';
    }

    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else if (!validateYear(formData.year)) {
      newErrors.year = 'Year must be between 1900 and next year';
    }

    if (formData.color && !validateColor(formData.color)) {
      newErrors.color = 'Invalid color format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const vehicleData = {
        license_plate: formData.plateNumber.trim(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        color: formData.color.trim() || null,
        user_id: user.id
      };

      let error;
      if (vehicle) {
        // Update existing vehicle
        const result = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', vehicle.id);
        error = result.error;
      } else {
        // Create new vehicle
        const result = await supabase
          .from('vehicles')
          .insert([vehicleData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Vehicle ${vehicle ? 'updated' : 'added'} successfully`,
      });

      onSubmitted();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Error",
        description: `Failed to ${vehicle ? 'update' : 'add'} vehicle. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</CardTitle>
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
                maxLength={20}
                required
                className={errors.plateNumber ? 'border-red-500' : ''}
              />
              {errors.plateNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.plateNumber}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                placeholder="Toyota"
                maxLength={50}
                required
                className={errors.make ? 'border-red-500' : ''}
              />
              {errors.make && (
                <p className="text-red-500 text-sm mt-1">{errors.make}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Camry"
                maxLength={50}
                required
                className={errors.model ? 'border-red-500' : ''}
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model}</p>
              )}
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
                className={errors.year ? 'border-red-500' : ''}
              />
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="color">Color (Optional)</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="Blue"
                maxLength={30}
                className={errors.color ? 'border-red-500' : ''}
              />
              {errors.color && (
                <p className="text-red-500 text-sm mt-1">{errors.color}</p>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-[#0A84FF] hover:bg-[#0A84FF]/90"
                disabled={loading}
              >
                {loading ? 'Saving...' : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
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
