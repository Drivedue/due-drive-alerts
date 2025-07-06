
-- Add vehicle_image column to vehicles table if it doesn't exist
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS vehicle_image TEXT;

-- Create vehicle-images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own vehicle images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'vehicle-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to view their own images
CREATE POLICY "Users can view their own vehicle images" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'vehicle-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to update their own images
CREATE POLICY "Users can update their own vehicle images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'vehicle-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own vehicle images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'vehicle-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
