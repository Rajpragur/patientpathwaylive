-- Quick fix for doctor_profiles RLS policy to allow team member updates
-- Run this in your Supabase SQL editor

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.doctor_profiles;

-- Create a new update policy with proper WITH CHECK clause
CREATE POLICY "Users can update their own profile" 
  ON public.doctor_profiles 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Verify the policy was created correctly
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'doctor_profiles' 
  AND policyname = 'Users can update their own profile';
