-- Add reminder schedule preference columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN reminder_4_weeks BOOLEAN DEFAULT true,
ADD COLUMN reminder_3_weeks BOOLEAN DEFAULT true,
ADD COLUMN reminder_2_weeks BOOLEAN DEFAULT true,
ADD COLUMN reminder_1_week BOOLEAN DEFAULT true,
ADD COLUMN reminder_1_day BOOLEAN DEFAULT true;