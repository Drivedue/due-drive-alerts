
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, User } from "lucide-react";

interface ProfilePictureProps {
  profile: any;
  onImageUpdate?: (imageUrl: string) => void;
}

const ProfilePicture = ({ profile, onImageUpdate }: ProfilePictureProps) => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      if (!user) {
        throw new Error('You must be logged in to upload images.');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file.');
      }

      // Validate file size (max 2MB for profile pictures)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size must be less than 2MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      console.log('Uploading profile picture:', fileName);

      // Upload to the vehicle-images bucket (reusing existing bucket)
      const { data, error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing profile picture
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

      const publicUrl = urlData.publicUrl;
      console.log('Profile picture URL:', publicUrl);

      // Update the profile with the new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          profile_image: publicUrl,
          full_name: profile?.full_name,
          phone: profile?.phone
        });

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });

      // Call the callback if provided
      if (onImageUpdate) {
        onImageUpdate(publicUrl);
      }

    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture. Please try again.",
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="relative">
      <Avatar className="w-20 h-20 mx-auto">
        <AvatarImage src={profile?.profile_image} alt="Profile picture" />
        <AvatarFallback className="bg-[#0A84FF]/10 text-[#0A84FF] text-xl">
          {displayName ? getInitials(displayName) : <User className="h-8 w-8" />}
        </AvatarFallback>
      </Avatar>
      
      <label className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 cursor-pointer">
        <div className="bg-[#0A84FF] p-2 rounded-full hover:bg-[#0A84FF]/90 transition-colors">
          <Camera className="h-4 w-4 text-white" />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
      
      {uploading && (
        <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
          <div className="text-white text-xs">Uploading...</div>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
