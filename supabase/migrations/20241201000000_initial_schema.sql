-- Create basic auth tables and doctor profiles
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  doctor_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for doctor profiles
CREATE POLICY "Users can view their own profile" 
  ON public.doctor_profiles 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
  ON public.doctor_profiles 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON public.doctor_profiles 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON public.doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_doctor_id ON public.doctor_profiles(doctor_id);
