
-- Add a column to profiles table to track user plan
ALTER TABLE public.profiles 
ADD COLUMN plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro'));

-- Add a comment to document the limits
COMMENT ON COLUMN public.profiles.plan_type IS 'User plan type: free (1 vehicle, 5 documents) or pro (unlimited)';

-- Create a function to check vehicle limit
CREATE OR REPLACE FUNCTION public.check_vehicle_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is on free plan
  IF (SELECT plan_type FROM public.profiles WHERE id = NEW.user_id) = 'free' THEN
    -- Check if user already has 1 vehicle
    IF (SELECT COUNT(*) FROM public.vehicles WHERE user_id = NEW.user_id) >= 1 THEN
      RAISE EXCEPTION 'Free plan users are limited to 1 vehicle. Upgrade to Pro for unlimited vehicles.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check document limit
CREATE OR REPLACE FUNCTION public.check_document_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is on free plan
  IF (SELECT plan_type FROM public.profiles WHERE id = NEW.user_id) = 'free' THEN
    -- Check if user already has 5 documents
    IF (SELECT COUNT(*) FROM public.documents WHERE user_id = NEW.user_id) >= 5 THEN
      RAISE EXCEPTION 'Free plan users are limited to 5 documents. Upgrade to Pro for unlimited documents.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to enforce limits
CREATE TRIGGER vehicle_limit_trigger
  BEFORE INSERT ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_vehicle_limit();

CREATE TRIGGER document_limit_trigger
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.check_document_limit();
