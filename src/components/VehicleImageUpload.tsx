
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Upload, X } from "lucide-react";

interface VehicleImageUploadProps {
  vehicleId?: string;
  onImageUploaded?: (imageUrl: string) => void;
  currentImageUrl?: string;
}

const VehicleImageUpload = ({ vehicleId, onImageUploaded, currentImageUrl }: VehicleImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      if (!user) {
        throw new Error('You must be logged in to upload images.');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file.');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${vehicleId || Date.now()}_${Math.random()}.${fileExt}`;

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
      setImageUrl(publicUrl);
      
      // If we have a vehicle ID, update the vehicle record with the image URL
      if (vehicleId) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({ vehicle_image: publicUrl })
          .eq('id', vehicleId)
          .eq('user_id', user.id);

        if (updateError) {
          throw updateError;
        }
      }

      onImageUploaded?.(publicUrl);

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
    if (!imageUrl) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user?.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('vehicle-images')
        .remove([filePath]);

      if (error) {
        console.error('Error removing image:', error);
      }

      // Update vehicle record to remove image URL
      if (vehicleId && user) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({ vehicle_image: null })
          .eq('id', vehicleId)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating vehicle:', updateError);
        }
      }

      setImageUrl('');
      onImageUploaded?.('');

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Vehicle Photo</label>
        {imageUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeImage}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Vehicle"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
            <label className="cursor-pointer">
              <Camera className="h-8 w-8 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={uploadImage}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <label className="cursor-pointer block">
            <div className="space-y-2">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> a vehicle photo
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-gray-600">
          Uploading image...
        </div>
      )}
    </div>
  );
};

export default VehicleImageUpload;
