-- Fix RLS policies to allow team members to create doctor profiles during invitation linking

-- Drop existing RLS policy on doctor_profiles if it exists
DROP POLICY IF EXISTS "Users can insert their own doctor profiles" ON public.doctor_profiles;

-- Create a more permissive RLS policy for doctor_profiles
CREATE POLICY "Users can manage their own doctor profiles" ON public.doctor_profiles
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id OR
  -- Allow insertion when user is being linked through team invitation
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.linked_user_id = auth.uid() 
    AND team_members.status = 'accepted'
  )
);

-- Also ensure team_members table allows the operations we need
DROP POLICY IF EXISTS "Users can view their own team member records" ON public.team_members;
DROP POLICY IF EXISTS "Users can update their own team member records" ON public.team_members;

CREATE POLICY "Users can view their own team member records" ON public.team_members
FOR SELECT USING (
  auth.uid() = linked_user_id OR
  EXISTS (
    SELECT 1 FROM public.doctor_profiles dp
    WHERE dp.user_id = auth.uid() 
    AND dp.doctor_id = team_members.doctor_id
  )
);

CREATE POLICY "Users can update their own team member records" ON public.team_members
FOR UPDATE USING (
  auth.uid() = linked_user_id OR
  EXISTS (
    SELECT 1 FROM public.doctor_profiles dp
    WHERE dp.user_id = auth.uid() 
    AND dp.doctor_id = team_members.doctor_id
  )
);

-- Allow insertion of team member records by doctors
CREATE POLICY "Doctors can create team member invitations" ON public.team_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctor_profiles dp
    WHERE dp.user_id = auth.uid() 
    AND dp.doctor_id = team_members.doctor_id
  )
);
