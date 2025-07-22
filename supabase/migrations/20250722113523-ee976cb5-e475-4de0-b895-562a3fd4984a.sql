-- Update the validation function to allow editing documents with expiry dates in the past
-- This removes the restriction that prevents editing expired documents

CREATE OR REPLACE FUNCTION public.validate_document_input()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Validate document title length and content
  IF LENGTH(NEW.title) < 1 OR LENGTH(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Document title must be between 1 and 200 characters';
  END IF;
  
  -- Validate document type is from allowed list
  IF NEW.document_type NOT IN ('registration', 'insurance', 'inspection', 'license', 'other') THEN
    RAISE EXCEPTION 'Invalid document type';
  END IF;
  
  -- Remove the past date validation to allow editing of expired documents
  -- Users should be able to update documents regardless of expiry status
  
  -- Validate reminder days is reasonable
  IF NEW.reminder_days IS NOT NULL AND (NEW.reminder_days < 1 OR NEW.reminder_days > 365) THEN
    RAISE EXCEPTION 'Reminder days must be between 1 and 365';
  END IF;
  
  RETURN NEW;
END;
$function$;