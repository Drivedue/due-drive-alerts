
-- Add notification preference columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email_notifications BOOLEAN DEFAULT true,
ADD COLUMN push_notifications BOOLEAN DEFAULT true,
ADD COLUMN sms_notifications BOOLEAN DEFAULT false,
ADD COLUMN reminder_days INTEGER DEFAULT 30;
