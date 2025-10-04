-- Create email_alias_requests table
CREATE TABLE IF NOT EXISTS public.email_alias_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  requested_alias TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_aliases table to store approved aliases
CREATE TABLE IF NOT EXISTS public.email_aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  alias TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add email_alias column to doctor_profiles
ALTER TABLE public.doctor_profiles 
ADD COLUMN IF NOT EXISTS email_alias TEXT REFERENCES public.email_aliases(alias);

-- Add is_admin column to doctor_profiles
ALTER TABLE public.doctor_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Set patientpathway@admin.com as admin by default
UPDATE public.doctor_profiles 
SET is_admin = true 
WHERE email = 'patientpathway@admin.com';

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_is_admin ON public.doctor_profiles(is_admin);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_alias_requests_doctor_id ON public.email_alias_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_email_alias_requests_status ON public.email_alias_requests(status);
CREATE INDEX IF NOT EXISTS idx_email_alias_requests_requested_at ON public.email_alias_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_email_aliases_doctor_id ON public.email_aliases(doctor_id);
CREATE INDEX IF NOT EXISTS idx_email_aliases_alias ON public.email_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_email_aliases_is_active ON public.email_aliases(is_active);

-- Enable Row Level Security
ALTER TABLE public.email_alias_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_aliases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_alias_requests
CREATE POLICY "Doctors can view their own alias requests" 
  ON public.email_alias_requests 
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can create alias requests" 
  ON public.email_alias_requests 
  FOR INSERT 
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for email_aliases
CREATE POLICY "Doctors can view their own aliases" 
  ON public.email_aliases 
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Admin policies (for admin portal)
CREATE POLICY "Admins can view all alias requests" 
  ON public.email_alias_requests 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_profiles 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage all aliases" 
  ON public.email_aliases 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_profiles 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- Function to check if alias is available
CREATE OR REPLACE FUNCTION public.is_alias_available(requested_alias TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if alias exists in email_aliases table
  IF EXISTS (
    SELECT 1 FROM public.email_aliases ea
    WHERE ea.alias = requested_alias 
    AND ea.is_active = true
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check if alias is already requested and pending
  IF EXISTS (
    SELECT 1 FROM public.email_alias_requests ear
    WHERE ear.requested_alias = requested_alias 
    AND ear.status = 'pending'
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve alias request
CREATE OR REPLACE FUNCTION public.approve_alias_request(
  request_id UUID,
  approved_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Get the request details
  SELECT * INTO request_record 
  FROM public.email_alias_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if alias is still available
  IF NOT public.is_alias_available(request_record.requested_alias) THEN
    RETURN FALSE;
  END IF;
  
  -- Create the alias
  INSERT INTO public.email_aliases (doctor_id, alias)
  VALUES (request_record.doctor_id, request_record.requested_alias);
  
  -- Update the request status
  UPDATE public.email_alias_requests 
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = approved_by,
    updated_at = now()
  WHERE id = request_id;
  
  -- Update doctor profile with the alias
  UPDATE public.doctor_profiles 
  SET 
    email_alias = request_record.requested_alias,
    updated_at = now()
  WHERE id = request_record.doctor_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject alias request
CREATE OR REPLACE FUNCTION public.reject_alias_request(
  request_id UUID,
  rejected_by UUID,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the request status
  UPDATE public.email_alias_requests 
  SET 
    status = 'rejected',
    reviewed_at = now(),
    reviewed_by = rejected_by,
    rejection_reason = rejection_reason,
    updated_at = now()
  WHERE id = request_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.email_alias_requests TO authenticated;
GRANT SELECT ON public.email_aliases TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_alias_available(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_alias_request(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_alias_request(UUID, UUID, TEXT) TO authenticated;

-- Admin permissions
GRANT ALL ON public.email_alias_requests TO authenticated;
GRANT ALL ON public.email_aliases TO authenticated;
