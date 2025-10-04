-- Fix RLS policies for doctor_profiles to allow team members to update their own profiles
-- This ensures team members can update their personal information (first_name, last_name)

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.doctor_profiles;

-- Create a new update policy that allows users to update their own profile
-- This includes both the USING clause (to select the row) and WITH CHECK clause (to validate the update)
CREATE POLICY "Users can update their own profile" 
  ON public.doctor_profiles 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Also ensure the insert policy has proper WITH CHECK clause
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.doctor_profiles;

CREATE POLICY "Users can insert their own profile" 
  ON public.doctor_profiles 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Add a comment explaining the policy
COMMENT ON POLICY "Users can update their own profile" ON public.doctor_profiles 
IS 'Allows authenticated users to update their own doctor profile, including team members updating their personal information';

-- Test the policy by checking if it exists
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'doctor_profiles' 
  AND policyname = 'Users can update their own profile';
