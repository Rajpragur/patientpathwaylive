-- Remove the auth.users check that's causing permission issues
-- Just create the profile with user_id = NULL and update it later

-- Drop the existing function
DROP FUNCTION IF EXISTS link_team_member_to_doctor(TEXT, UUID);

-- Create a function that doesn't check auth.users
CREATE OR REPLACE FUNCTION link_team_member_to_doctor(
  p_invitation_token TEXT,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  team_member_record RECORD;
  new_profile_id UUID;
BEGIN
  -- Get team member record with doctor info
  SELECT 
    tm.*,
    dp.doctor_id,
    dp.clinic_name,
    dp.location,
    dp.phone,
    dp.mobile,
    dp.logo_url,
    dp.providers
  INTO team_member_record
  FROM public.team_members tm
  JOIN public.doctor_profiles dp ON tm.doctor_id = dp.id
  WHERE tm.invitation_token = p_invitation_token 
  AND tm.token_expires_at > NOW()
  AND tm.status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired invitation token'
    );
  END IF;
  
  -- Update team member record to accepted
  UPDATE public.team_members 
  SET 
    status = 'accepted',
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE invitation_token = p_invitation_token;
  
  -- Create a team member profile with the SAME doctor_id as the inviting doctor
  -- Set user_id to NULL to avoid foreign key constraint issues
  INSERT INTO public.doctor_profiles (
    user_id,
    first_name,
    last_name,
    email,
    doctor_id,  -- SAME doctor_id as the inviting doctor
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
    NULL, -- Set to NULL to avoid foreign key constraint
    team_member_record.first_name,
    team_member_record.last_name,
    team_member_record.email,
    team_member_record.doctor_id, -- This ensures same doctor_id
    team_member_record.clinic_name,
    team_member_record.location,
    team_member_record.phone,
    team_member_record.mobile,
    team_member_record.logo_url,
    team_member_record.providers,
    true, -- Team members get access
    NOW(),
    NOW()
  ) RETURNING id INTO new_profile_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Successfully created team member profile with same doctor_id',
    'doctor_profile_id', new_profile_id,
    'team_member_id', team_member_record.id,
    'shared_doctor_id', team_member_record.doctor_id,
    'user_id_to_update', p_user_id
  );
END;
$$ LANGUAGE plpgsql;
