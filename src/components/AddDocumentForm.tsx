
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Car } from "lucide-react";
import { useHaptics } from '@/hooks/useHaptics';
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';

interface AddDocumentFormProps {
  onClose: () => void;
  onSubmit: (documentData: any) => void;
  vehicles: any[];
}

const AddDocumentForm = ({ onClose, onSubmit, vehicles }: AddDocumentFormProps) => {
  const { vibrate } = useHaptics();
  const { safeAreaInsets } = useMobileCapabilities();
  
  const [formData, setFormData] = useState({
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
    vibrate('success');
    
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

    // Generate title from document type and auto-generate title
    const selectedDocumentType = documentTypes.find(dt => dt.value === formData.document_type);
    const autoTitle = selectedDocumentType ? selectedDocumentType.label : 'Document';
    
    const documentData = {
      title: autoTitle,
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

  const handleClose = () => {
    vibrate('light');
    onClose();
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
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-0">
      <Card 
        className="w-full rounded-t-3xl rounded-b-none flex flex-col animate-slide-up"
        style={{ 
          maxHeight: '90vh',
          paddingBottom: Math.max(safeAreaInsets.bottom, 0)
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 pb-4">
          <CardTitle className="text-xl">Add New Document</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="h-10 w-10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto px-6 py-0">
          <form id="document-form" onSubmit={handleSubmit} className="space-y-5 pb-4">
            <div>
              <Label htmlFor="document_type" className="text-base font-medium">Document Type</Label>
              <Select onValueChange={(value) => handleChange('document_type', value)} required>
                <SelectTrigger className="h-12 text-base mt-2">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-base py-3">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="document_number" className="text-base font-medium">Document Number</Label>
              <Input
                id="document_number"
                value={formData.document_number}
                onChange={(e) => handleChange('document_number', e.target.value)}
                placeholder="Enter document number"
                className="h-12 text-base mt-2"
                style={{ fontSize: '16px' }}
              />
            </div>
            
            <div>
              <Label htmlFor="vehicle_id" className="text-base font-medium">Vehicle</Label>
              <Select 
                onValueChange={(value) => handleChange('vehicle_id', value)} 
                value={formData.vehicle_id}
                required
              >
                <SelectTrigger className="h-12 text-base mt-2">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id} className="text-base py-3">
                      {vehicle.license_plate} - {vehicle.make} {vehicle.model} ({vehicle.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Vehicle Details Card */}
            {selectedVehicle && (
              <Card className="bg-blue-50/50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Selected Vehicle</span>
                  </div>
                  <div className="text-sm space-y-2">
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
              <Label htmlFor="issue_date" className="text-base font-medium">Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => handleChange('issue_date', e.target.value)}
                className="h-12 text-base mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="expiry_date" className="text-base font-medium">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
                className="h-12 text-base mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-base font-medium">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                className="text-base mt-2 resize-none"
                style={{ fontSize: '16px' }}
              />
            </div>
          </form>
        </CardContent>
        
        {/* Fixed button section at bottom */}
        <div className="flex gap-4 p-6 pt-4 border-t bg-card flex-shrink-0">
          <Button 
            type="submit" 
            form="document-form" 
            className="flex-1 bg-primary hover:bg-primary/90 h-12 text-base font-semibold rounded-xl"
          >
            Save Document
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            className="flex-1 h-12 text-base font-medium rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AddDocumentForm;
