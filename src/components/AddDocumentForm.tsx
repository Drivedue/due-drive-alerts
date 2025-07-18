
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Car } from "lucide-react";

interface AddDocumentFormProps {
  onClose: () => void;
  onSubmit: (documentData: any) => void;
  vehicles: any[];
}

const AddDocumentForm = ({ onClose, onSubmit, vehicles }: AddDocumentFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    document_type: '',
    document_number: '',
    vehicle_id: vehicles.length === 1 ? vehicles[0].id : '',
    issue_date: '',
    expiry_date: '',
    notes: ''
  });

  // Get selected vehicle details
  const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map document types to database-accepted values
    const documentTypeMapping: { [key: string]: string } = {
      'drivers_license': 'license',
      'vehicle_license': 'license',
      'insurance': 'insurance',
      'vehicle_inspection_certificate': 'inspection',
      'road_worthiness': 'inspection',
      'registration': 'registration',
      'other': 'other'
    };

    // Ensure all required fields are present
    const documentData = {
      title: formData.title,
      document_type: documentTypeMapping[formData.document_type] || formData.document_type,
      document_number: formData.document_number || '',
      vehicle_id: formData.vehicle_id,
      issue_date: formData.issue_date || null,
      expiry_date: formData.expiry_date || null,
      notes: formData.notes || null
    };
    
    console.log('Submitting document data:', documentData);
    onSubmit(documentData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const documentTypes = [
    { value: 'drivers_license', label: "Driver's License" },
    { value: 'vehicle_license', label: 'Vehicle License' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'vehicle_inspection_certificate', label: 'Vehicle Inspection Certificate' },
    { value: 'road_worthiness', label: 'Road Worthiness' },
    { value: 'registration', label: 'Registration' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 safe-area-bottom">
      <Card className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Document</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form id="document-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Vehicle Registration"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="document_type">Document Type</Label>
              <Select onValueChange={(value) => handleChange('document_type', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="document_number">Document Number</Label>
              <Input
                id="document_number"
                value={formData.document_number}
                onChange={(e) => handleChange('document_number', e.target.value)}
                placeholder="Enter document number"
              />
            </div>
            
            <div>
              <Label htmlFor="vehicle_id">Vehicle</Label>
              <Select 
                onValueChange={(value) => handleChange('vehicle_id', value)} 
                value={formData.vehicle_id}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.license_plate} - {vehicle.make} {vehicle.model} ({vehicle.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Vehicle Details Card */}
            {selectedVehicle && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Selected Vehicle</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">License Plate:</span> {selectedVehicle.license_plate}</div>
                    <div><span className="font-medium">Vehicle:</span> {selectedVehicle.make} {selectedVehicle.model}</div>
                    <div><span className="font-medium">Year:</span> {selectedVehicle.year}</div>
                    {selectedVehicle.color && (
                      <div><span className="font-medium">Color:</span> {selectedVehicle.color}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="issue_date">Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => handleChange('issue_date', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
            
          </form>
        </CardContent>
        <div className="flex gap-2 p-6 pt-4 border-t bg-card">
          <Button type="submit" form="document-form" className="flex-1 bg-primary hover:bg-primary/90">
            Save Document
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AddDocumentForm;
