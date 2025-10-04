-- Add a DELETE policy for doctor_profiles to allow doctors to remove team member profiles
-- This policy allows doctors to delete doctor profiles of team members in their clinic

-- First, drop the existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own doctor profiles" ON public.doctor_profiles;

-- Create a new comprehensive policy that allows:
-- 1. Users to manage their own profiles (SELECT, INSERT, UPDATE, DELETE)
-- 2. Doctors to delete team member profiles in their clinic
CREATE POLICY "Users can manage their own doctor profiles" ON public.doctor_profiles
FOR ALL USING (
  auth.uid() = user_id OR
  -- Allow doctors to delete team member profiles in their clinic
  (auth.uid() IN (
    SELECT dp.user_id 
    FROM public.doctor_profiles dp
    JOIN public.team_members tm ON dp.id = tm.doctor_id
    WHERE tm.linked_user_id = doctor_profiles.user_id
    AND tm.status = 'accepted'
  ))
)
WITH CHECK (
  auth.uid() = user_id OR
  -- Allow insertion when user is being linked through team invitation
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.linked_user_id = auth.uid() 
    AND team_members.status = 'accepted'
  )
);

-- Add a comment explaining the policy
COMMENT ON POLICY "Users can manage their own doctor profiles" ON public.doctor_profiles 
IS 'Allows users to manage their own profiles and doctors to delete team member profiles in their clinic';
