-- Fix the is_alias_available function to only check approved aliases, not pending requests
-- This allows multiple doctors to request the same alias, and admin can approve the one they want

CREATE OR REPLACE FUNCTION public.is_alias_available(requested_alias TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only check if alias exists in email_aliases table (approved aliases)
  -- Do NOT check pending requests - multiple doctors can request the same alias
  IF EXISTS (
    SELECT 1 FROM public.email_aliases ea
    WHERE ea.alias = requested_alias 
    AND ea.is_active = true
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Alias is available if not in approved aliases
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the approve_alias_request function to check if alias is still available at approval time
CREATE OR REPLACE FUNCTION public.approve_alias_request(
  request_id UUID,
  approved_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  request_record RECORD;
  alias_exists BOOLEAN;
BEGIN
  RAISE NOTICE 'Starting approve_alias_request for request_id: %, approved_by: %', request_id, approved_by;
  
  -- Get the request details
  SELECT * INTO request_record 
  FROM public.email_alias_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Request not found or already processed for request_id: %', request_id;
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
  
  RAISE NOTICE 'Found request for alias: %, doctor_id: %', request_record.requested_alias, request_record.doctor_id;
  
  -- Check if alias is still available (only checks approved aliases, not pending requests)
  SELECT EXISTS (
    SELECT 1 FROM public.email_aliases 
    WHERE alias = request_record.requested_alias 
    AND is_active = true
  ) INTO alias_exists;
  
  RAISE NOTICE 'Alias exists check: %', alias_exists;
  
  IF alias_exists THEN
    RAISE EXCEPTION 'Alias "%" has already been approved for another doctor', request_record.requested_alias;
  END IF;
  
  -- Create the alias
  RAISE NOTICE 'Creating alias in email_aliases table';
  INSERT INTO public.email_aliases (doctor_id, alias)
  VALUES (request_record.doctor_id, request_record.requested_alias);
  RAISE NOTICE 'Alias created successfully';
  
  -- Update the request status
  RAISE NOTICE 'Updating request status to approved';
  UPDATE public.email_alias_requests 
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = approved_by,
    updated_at = now()
  WHERE id = request_id;
  RAISE NOTICE 'Request status updated';
  
  -- Update doctor profile with the alias
  RAISE NOTICE 'Updating doctor profile with alias';
  UPDATE public.doctor_profiles 
  SET 
    email_alias = request_record.requested_alias,
    updated_at = now()
  WHERE id = request_record.doctor_id;
  RAISE NOTICE 'Doctor profile updated';
  
  -- Reject all other pending requests for the same alias
  RAISE NOTICE 'Rejecting other pending requests for the same alias';
  UPDATE public.email_alias_requests
  SET
    status = 'rejected',
    reviewed_at = now(),
    reviewed_by = approved_by,
    rejection_reason = 'Alias was approved for another doctor',
    updated_at = now()
  WHERE requested_alias = request_record.requested_alias
    AND status = 'pending'
    AND id != request_id;
  RAISE NOTICE 'Other requests rejected';
  
  RAISE NOTICE 'Alias approval completed successfully';
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in approve_alias_request: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the new behavior
COMMENT ON FUNCTION public.is_alias_available(TEXT) IS 
'Checks if an email alias is available. Only checks approved aliases, not pending requests. This allows multiple doctors to request the same alias.';

COMMENT ON FUNCTION public.approve_alias_request(UUID, UUID) IS 
'Approves an email alias request. Checks availability at approval time and automatically rejects other pending requests for the same alias.';

