-- Create team_members table for doctor office team management
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE, -- Ensure one email can only be linked to one doctor office
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'team_member', -- Future: admin, team_member, etc.
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team members
CREATE POLICY "Doctors can view team members of their office" 
  ON public.team_members 
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can invite team members to their office" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update team members of their office" 
  ON public.team_members 
  FOR UPDATE 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete team members from their office" 
  ON public.team_members 
  FOR DELETE 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_doctor_id ON public.team_members(doctor_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_invited_by ON public.team_members(invited_by);

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
