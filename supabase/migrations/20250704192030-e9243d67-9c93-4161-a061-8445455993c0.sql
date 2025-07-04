
-- Add new columns to vehicles table for the enhanced vehicle details
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Add new columns to documents table for document number and issue date
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS document_number TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS issue_date DATE;

-- Update document_type to include more specific types
-- No ALTER needed for document_type as it's already text and can handle any value
