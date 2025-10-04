-- Create a function to safely remove team members with proper permissions
-- This function runs with SECURITY DEFINER to bypass RLS policies

CREATE OR REPLACE FUNCTION remove_team_member(
  p_team_member_id UUID,
  p_doctor_id UUID
)
RETURNS JSON AS $$
DECLARE
  team_member_record RECORD;
  doctor_profile_record RECORD;
  deleted_doctor_profile_id UUID;
  deleted_team_member_id UUID;
BEGIN
  -- Verify that the calling user is the doctor who owns this team member
  SELECT * INTO doctor_profile_record
  FROM public.doctor_profiles 
  WHERE id = p_doctor_id 
  AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: You can only remove team members from your own clinic'
    );
  END IF;
  
  -- Get the team member record
  SELECT * INTO team_member_record
  FROM public.team_members 
  WHERE id = p_team_member_id 
  AND doctor_id = p_doctor_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Team member not found or does not belong to your clinic'
    );
  END IF;
  
  -- Step 1: Delete the doctor profile if it exists (with SECURITY DEFINER, this bypasses RLS)
  IF team_member_record.linked_user_id IS NOT NULL THEN
    DELETE FROM public.doctor_profiles 
    WHERE user_id = team_member_record.linked_user_id
    RETURNING id INTO deleted_doctor_profile_id;
    
    -- Log the deletion
    RAISE NOTICE 'Deleted doctor profile: %', deleted_doctor_profile_id;
  END IF;
  
  -- Step 2: Delete the team member record
  DELETE FROM public.team_members 
  WHERE id = p_team_member_id
  RETURNING id INTO deleted_team_member_id;
  
  -- Log the deletion
  RAISE NOTICE 'Deleted team member: %', deleted_team_member_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Team member removed successfully',
    'deleted_team_member_id', deleted_team_member_id,
    'deleted_doctor_profile_id', deleted_doctor_profile_id,
    'linked_user_id', team_member_record.linked_user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION remove_team_member(UUID, UUID) TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION remove_team_member(UUID, UUID) IS 'Safely removes a team member and their associated doctor profile. Runs with SECURITY DEFINER to bypass RLS policies for proper cleanup.';
