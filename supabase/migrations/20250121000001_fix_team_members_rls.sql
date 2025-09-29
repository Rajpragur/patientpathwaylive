-- Fix RLS policies for team_members table to allow invitation token access
-- This allows team members to read their own invitation record using the token

-- Drop existing policies
DROP POLICY IF EXISTS "Doctors can view team members of their office" ON public.team_members;
DROP POLICY IF EXISTS "Doctors can invite team members to their office" ON public.team_members;
DROP POLICY IF EXISTS "Doctors can update team members of their office" ON public.team_members;
DROP POLICY IF EXISTS "Doctors can delete team members from their office" ON public.team_members;

-- Create new policies
-- Allow doctors to view their own team members
CREATE POLICY "Doctors can view team members of their office" 
  ON public.team_members 
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow anyone to read team member records by invitation token (for signup process)
CREATE POLICY "Allow reading team members by invitation token" 
  ON public.team_members 
  FOR SELECT 
  USING (
    invitation_token IS NOT NULL 
    AND token_expires_at > NOW()
    AND status = 'pending'
  );

-- Allow doctors to invite team members to their office
CREATE POLICY "Doctors can invite team members to their office" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow doctors to update team members of their office
CREATE POLICY "Doctors can update team members of their office" 
  ON public.team_members 
  FOR UPDATE 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow doctors to delete team members from their office
CREATE POLICY "Doctors can delete team members from their office" 
  ON public.team_members 
  FOR DELETE 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );
