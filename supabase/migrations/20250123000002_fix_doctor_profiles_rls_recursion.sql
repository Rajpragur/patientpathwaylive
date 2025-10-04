-- Fix infinite recursion in doctor_profiles RLS policy
-- The issue is caused by the policy referencing doctor_profiles within itself

-- First, drop ALL existing policies on doctor_profiles to clean up completely
DROP POLICY IF EXISTS "Users can view their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can manage their own doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can view their own doctor profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can insert their own doctor profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can update their own doctor profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can delete their own doctor profile" ON public.doctor_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own doctor profile" 
  ON public.doctor_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own doctor profile" 
  ON public.doctor_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doctor profile" 
  ON public.doctor_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- For team member management, we'll handle deletion through a separate function
-- This avoids the infinite recursion issue
CREATE POLICY "Users can delete their own doctor profile" 
  ON public.doctor_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON POLICY "Users can view their own doctor profile" ON public.doctor_profiles 
IS 'Allows users to view their own doctor profile';

COMMENT ON POLICY "Users can insert their own doctor profile" ON public.doctor_profiles 
IS 'Allows users to create their own doctor profile';

COMMENT ON POLICY "Users can update their own doctor profile" ON public.doctor_profiles 
IS 'Allows users to update their own doctor profile';

COMMENT ON POLICY "Users can delete their own doctor profile" ON public.doctor_profiles 
IS 'Allows users to delete their own doctor profile';

-- Create a function to handle team member profile deletion
-- This function can be called by doctors to delete team member profiles
CREATE OR REPLACE FUNCTION delete_team_member_profile(
  target_user_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  is_authorized BOOLEAN := FALSE;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if the current user is a doctor who has the target user as a team member
  SELECT EXISTS (
    SELECT 1 
    FROM public.doctor_profiles dp
    JOIN public.team_members tm ON dp.id = tm.doctor_id
    WHERE dp.user_id = current_user_id
    AND tm.linked_user_id = target_user_id
    AND tm.status = 'accepted'
  ) INTO is_authorized;
  
  -- If authorized, delete the profile
  IF is_authorized THEN
    DELETE FROM public.doctor_profiles 
    WHERE user_id = target_user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Add comment for the function
COMMENT ON FUNCTION delete_team_member_profile(UUID) 
IS 'Allows doctors to delete team member profiles in their clinic';
