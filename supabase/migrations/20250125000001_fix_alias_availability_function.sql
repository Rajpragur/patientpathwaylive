-- Fix ambiguous column reference in is_alias_available function
CREATE OR REPLACE FUNCTION public.is_alias_available(alias_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if alias exists in email_aliases table
  IF EXISTS (
    SELECT 1 FROM public.email_aliases ea
    WHERE ea.alias = alias_to_check 
    AND ea.is_active = true
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check if alias is already requested and pending
  IF EXISTS (
    SELECT 1 FROM public.email_alias_requests ear
    WHERE ear.requested_alias = alias_to_check 
    AND ear.status = 'pending'
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
