
-- Fix Documents RLS INSERT policy to include WITH CHECK clause for security
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;

CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add input validation trigger for documents to prevent malicious data
CREATE OR REPLACE FUNCTION public.validate_document_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate document title length and content
  IF LENGTH(NEW.title) < 1 OR LENGTH(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Document title must be between 1 and 200 characters';
  END IF;
  
  -- Validate document type is from allowed list
  IF NEW.document_type NOT IN ('registration', 'insurance', 'inspection', 'license', 'other') THEN
    RAISE EXCEPTION 'Invalid document type';
  END IF;
  
  -- Validate expiry date is not in the past for new documents
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Expiry date cannot be in the past';
  END IF;
  
  -- Validate reminder days is reasonable
  IF NEW.reminder_days IS NOT NULL AND (NEW.reminder_days < 1 OR NEW.reminder_days > 365) THEN
    RAISE EXCEPTION 'Reminder days must be between 1 and 365';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document validation
DROP TRIGGER IF EXISTS validate_document_trigger ON public.documents;
CREATE TRIGGER validate_document_trigger
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.validate_document_input();

-- Add input validation trigger for vehicles
CREATE OR REPLACE FUNCTION public.validate_vehicle_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate license plate format (basic validation)
  IF LENGTH(NEW.license_plate) < 1 OR LENGTH(NEW.license_plate) > 20 THEN
    RAISE EXCEPTION 'License plate must be between 1 and 20 characters';
  END IF;
  
  -- Validate make and model
  IF LENGTH(NEW.make) < 1 OR LENGTH(NEW.make) > 50 THEN
    RAISE EXCEPTION 'Vehicle make must be between 1 and 50 characters';
  END IF;
  
  IF LENGTH(NEW.model) < 1 OR LENGTH(NEW.model) > 50 THEN
    RAISE EXCEPTION 'Vehicle model must be between 1 and 50 characters';
  END IF;
  
  -- Validate year is reasonable
  IF NEW.year < 1900 OR NEW.year > EXTRACT(YEAR FROM CURRENT_DATE) + 1 THEN
    RAISE EXCEPTION 'Vehicle year must be between 1900 and next year';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vehicle validation
DROP TRIGGER IF EXISTS validate_vehicle_trigger ON public.vehicles;
CREATE TRIGGER validate_vehicle_trigger
  BEFORE INSERT OR UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.validate_vehicle_input();
