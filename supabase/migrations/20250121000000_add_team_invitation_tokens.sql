-- Add invitation token and linking system to team_members table
-- This allows team members to be linked to the same doctor profile

-- Add new columns to team_members table
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS invitation_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS linked_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for invitation tokens
CREATE INDEX IF NOT EXISTS idx_team_members_invitation_token ON public.team_members(invitation_token);
CREATE INDEX IF NOT EXISTS idx_team_members_linked_user_id ON public.team_members(linked_user_id);

-- Add function to generate invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Add function to check if invitation token is valid
CREATE OR REPLACE FUNCTION is_invitation_token_valid(token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE invitation_token = token 
    AND token_expires_at > NOW()
    AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql;

-- Add function to link team member to doctor profile
CREATE OR REPLACE FUNCTION link_team_member_to_doctor(
  p_invitation_token TEXT,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  team_member_record RECORD;
  doctor_profile_record RECORD;
  result JSON;
BEGIN
  -- Get team member record
  SELECT * INTO team_member_record
  FROM public.team_members 
  WHERE invitation_token = p_invitation_token 
  AND token_expires_at > NOW()
  AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired invitation token'
    );
  END IF;
  
  -- Get doctor profile
  SELECT * INTO doctor_profile_record
  FROM public.doctor_profiles 
  WHERE id = team_member_record.doctor_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Doctor profile not found'
    );
  END IF;
  
  -- Update team member record
  UPDATE public.team_members 
  SET 
    linked_user_id = p_user_id,
    status = 'accepted',
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE invitation_token = p_invitation_token;
  
  -- Create a team member profile that links to the doctor's profile
  -- This allows the team member to access the same clinic data
  INSERT INTO public.doctor_profiles (
    user_id,
    first_name,
    last_name,
    email,
    doctor_id,
    clinic_name,
    location,
    phone,
    mobile,
    logo_url,
    providers,
    access_control,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    team_member_record.first_name,
    team_member_record.last_name,
    team_member_record.email,
    doctor_profile_record.doctor_id, -- Same doctor_id as the main doctor
    doctor_profile_record.clinic_name,
    doctor_profile_record.location,
    doctor_profile_record.phone,
    doctor_profile_record.mobile,
    doctor_profile_record.logo_url,
    doctor_profile_record.providers,
    true, -- Team members get access
    NOW(),
    NOW()
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Successfully linked to doctor profile',
    'doctor_profile_id', doctor_profile_record.id,
    'team_member_id', team_member_record.id
  );
END;
$$ LANGUAGE plpgsql;

-- Add RLS policy for team members to view their linked doctor's data
CREATE POLICY "Team members can view their linked doctor's profile data" 
  ON public.doctor_profiles 
  FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR 
    doctor_id IN (
      SELECT doctor_id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Add RLS policy for team members to update their own profile
CREATE POLICY "Team members can update their own profile" 
  ON public.doctor_profiles 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add comment explaining the linking system
COMMENT ON COLUMN public.team_members.invitation_token IS 'Unique token for team member invitation links';
COMMENT ON COLUMN public.team_members.linked_user_id IS 'User ID of the team member who accepted the invitation';
COMMENT ON COLUMN public.team_members.token_expires_at IS 'Expiration time for the invitation token';
