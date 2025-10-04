-- Add team-related columns to doctor_profiles table
ALTER TABLE public.doctor_profiles
ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_manager BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS doctor_id_clinic TEXT REFERENCES public.doctor_profiles(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_is_staff ON public.doctor_profiles(is_staff);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_is_manager ON public.doctor_profiles(is_manager);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_doctor_id_clinic ON public.doctor_profiles(doctor_id_clinic);

-- Add constraint to ensure only one role is set
ALTER TABLE public.doctor_profiles
ADD CONSTRAINT check_team_role CHECK (
  (is_staff = FALSE AND is_manager = FALSE) OR 
  (is_staff = TRUE AND is_manager = FALSE) OR 
  (is_staff = FALSE AND is_manager = TRUE)
);

-- Add comment for clarity
COMMENT ON COLUMN public.doctor_profiles.is_staff IS 'True if this user is a staff member of another doctor';
COMMENT ON COLUMN public.doctor_profiles.is_manager IS 'True if this user is a manager of another doctor';
COMMENT ON COLUMN public.doctor_profiles.doctor_id_clinic IS 'ID of the main doctor who owns this clinic/team';
