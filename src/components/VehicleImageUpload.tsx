
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Upload, X, ZoomIn } from "lucide-react";

interface Vehicle {
  id: string;
  license_plate: string;
  make: string;
  model: string;
  vehicle_image?: string;
}

interface VehicleImageUploadProps {
  vehicles: Vehicle[];
  onImageUploaded: () => void;
}

const VehicleImageUpload = ({ vehicles, onImageUploaded }: VehicleImageUploadProps) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      if (!user) {
        throw new Error('You must be logged in to upload images.');
      }

      if (!selectedVehicleId) {
        throw new Error('Please select a vehicle first.');
      }

      const file = event.target.files[0];
      
      // Validate file type - only JPEG
      if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
        throw new Error('Please select a JPEG image file only.');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB.');
      }

      const fileExt = 'jpg';
      const fileName = `${user.id}/${selectedVehicleId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;
      setPreviewUrl(publicUrl);
      
      // Update the vehicle record with the image URL
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ vehicle_image: publicUrl })
        .eq('id', selectedVehicleId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      onImageUploaded();

      toast({
        title: "Success",
        description: "Vehicle image uploaded successfully!",
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (!selectedVehicle?.vehicle_image || !user) return;

    try {
      // Extract file path from URL
      const urlParts = selectedVehicle.vehicle_image.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('vehicle-images')
        .remove([filePath]);

      if (error) {
        console.error('Error removing image:', error);
      }

      // Update vehicle record to remove image URL
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ vehicle_image: null })
        .eq('id', selectedVehicleId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating vehicle:', updateError);
      }

      setPreviewUrl('');
      onImageUploaded();

      toast({
        title: "Success",
        description: "Vehicle image removed successfully!",
      });

    } catch (error: any) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image.",
        variant: "destructive"
      });
    }
  };

  const currentImageUrl = previewUrl || selectedVehicle?.vehicle_image || '';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="h-4 w-4" />
          Vehicle Photo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Vehicle Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select Vehicle</label>
          <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Choose a vehicle..." />
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

        {/* Image Upload/Display */}
        {selectedVehicleId && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Photo</label>
              {currentImageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  className="text-red-600 hover:text-red-700 h-7 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {currentImageUrl ? (
              <div className="flex items-center gap-3">
                {/* Circular preview image */}
                <div className="relative">
                  <img
                    src={currentImageUrl}
                    alt="Vehicle"
                    className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                  />
                  {/* Enlargeable dialog trigger */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-full flex items-center justify-center opacity-0 hover:opacity-100">
                        <ZoomIn className="h-4 w-4 text-white" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <img
                        src={currentImageUrl}
                        alt="Vehicle"
                        className="w-full h-auto rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                
                {/* Replace photo button */}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-8 text-xs"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Camera className="h-3 w-3 mr-1" />
                        {uploading ? "Uploading..." : "Replace Photo"}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg"
                      onChange={uploadImage}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <label className="cursor-pointer block">
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <div className="text-xs text-gray-600">
                      <span className="font-medium text-blue-600">Click to upload</span> JPEG photo
                    </div>
                    <p className="text-xs text-gray-500">JPEG only, up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg"
                    onChange={uploadImage}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {uploading && (
              <div className="text-center text-xs text-gray-600">
                Uploading image...
              </div>
            )}
          </div>
        )}

        {vehicles.length === 0 && (
          <div className="text-center py-3">
            <p className="text-xs text-gray-500">
              No vehicles found. Add a vehicle first to upload photos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleImageUpload;
