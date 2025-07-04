
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

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
    vehicle_id: '',
    issue_date: '',
    expiry_date: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Document</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Select onValueChange={(value) => handleChange('vehicle_id', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-[#0A84FF] hover:bg-[#0A84FF]/90">
                Add Document
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

export default AddDocumentForm;
