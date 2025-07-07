
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentEditModalProps {
  document: any;
  onClose: () => void;
  onUpdate: () => void;
}

const DocumentEditModal = ({ document, onClose, onUpdate }: DocumentEditModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: document.title || '',
    document_type: document.document_type || '',
    document_number: document.document_number || '',
    issue_date: document.issue_date || '',
    expiry_date: document.expiry_date || '',
    notes: document.notes || '',
    reminder_days: document.reminder_days || 30
  });

  const documentTypes = [
    { value: 'drivers_license', label: "Driver's License" },
    { value: 'vehicle_license', label: 'Vehicle License' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'vehicle_inspection_certificate', label: 'Vehicle Inspection Certificate' },
    { value: 'road_worthiness', label: 'Road Worthiness' },
    { value: 'registration', label: 'Registration' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) {
      console.error('No user found');
      toast({
        title: "Error",
        description: "You must be logged in to update documents.",
        variant: "destructive"
      });
      return;
    }

    console.log('Saving document with data:', formData);
    console.log('Document ID:', document.id);
    console.log('User ID:', user.id);

    setIsLoading(true);

    try {
      const updateData = {
        title: formData.title.trim(),
        document_type: formData.document_type,
        document_number: formData.document_number?.trim() || null,
        issue_date: formData.issue_date || null,
        expiry_date: formData.expiry_date || null,
        notes: formData.notes?.trim() || null,
        reminder_days: Number(formData.reminder_days) || 30,
        updated_at: new Date().toISOString()
      };

      console.log('Sending update data:', updateData);

      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', document.id)
        .eq('user_id', user.id)
        .select();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('No rows were updated');
        throw new Error('Document not found or you do not have permission to update it');
      }

      console.log('Document updated successfully:', data);

      toast({
        title: "Document Updated",
        description: "Document information has been successfully updated.",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Update Document</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter document title"
              required
            />
          </div>

          <div>
            <Label htmlFor="document_type">Document Type</Label>
            <Select value={formData.document_type} onValueChange={(value) => handleInputChange('document_type', value)}>
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
              onChange={(e) => handleInputChange('document_number', e.target.value)}
              placeholder="Enter document number"
            />
          </div>

          <div>
            <Label htmlFor="issue_date">Issue Date</Label>
            <Input
              id="issue_date"
              type="date"
              value={formData.issue_date}
              onChange={(e) => handleInputChange('issue_date', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => handleInputChange('expiry_date', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="reminder_days">Reminder Days Before Expiry</Label>
            <Input
              id="reminder_days"
              type="number"
              value={formData.reminder_days}
              onChange={(e) => handleInputChange('reminder_days', parseInt(e.target.value) || 30)}
              placeholder="30"
              min="1"
              max="365"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !formData.title.trim() || !formData.document_type} 
              className="flex-1"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentEditModal;
