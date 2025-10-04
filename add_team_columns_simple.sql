-- Simple script to add team columns to doctor_profiles
-- Run this directly in your SQL editor

-- Add team-related columns to doctor_profiles table
ALTER TABLE public.doctor_profiles
ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_manager BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS doctor_id_clinic TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_is_staff ON public.doctor_profiles(is_staff);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_is_manager ON public.doctor_profiles(is_manager);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_doctor_id_clinic ON public.doctor_profiles(doctor_id_clinic);

-- Add constraint to ensure only one role is set
ALTER TABLE public.doctor_profiles
ADD CONSTRAINT IF NOT EXISTS check_team_role CHECK (
  (is_staff = FALSE AND is_manager = FALSE) OR 
  (is_staff = TRUE AND is_manager = FALSE) OR 
  (is_staff = FALSE AND is_manager = TRUE)
);

-- Add comments for clarity
COMMENT ON COLUMN public.doctor_profiles.is_staff IS 'True if this user is a staff member of another doctor';
COMMENT ON COLUMN public.doctor_profiles.is_manager IS 'True if this user is a manager of another doctor';
COMMENT ON COLUMN public.doctor_profiles.doctor_id_clinic IS 'ID of the main doctor who owns this clinic/team';

-- Fix RLS policies to allow team members to create doctor profiles during invitation linking
DROP POLICY IF EXISTS "Users can insert their own doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can manage their own doctor profiles" ON public.doctor_profiles;

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
