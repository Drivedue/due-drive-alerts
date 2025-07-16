-- Add in_app_notifications column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN in_app_notifications boolean DEFAULT true;