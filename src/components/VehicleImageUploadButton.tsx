
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Upload } from "lucide-react";

const VehicleImageUploadButton = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const fileName = `${user.id}/vehicle_${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);

      const { data, error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', urlData.publicUrl);

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
      // Reset the input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300">
      <CardContent className="p-6 text-center">
        <label className="cursor-pointer block">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-blue-50 p-4 rounded-full">
              <Camera className="h-8 w-8 text-[#0A84FF]" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Upload Vehicle Picture</h4>
              <p className="text-sm text-gray-600">Add photos of your vehicles for easy identification</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2" disabled={uploading} type="button">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Choose Photo"}
            </Button>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </CardContent>
    </Card>
  );
};

export default VehicleImageUploadButton;
