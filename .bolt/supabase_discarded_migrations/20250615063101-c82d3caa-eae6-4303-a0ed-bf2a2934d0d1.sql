
-- Add missing columns to doctor_profiles table
ALTER TABLE public.doctor_profiles 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS mobile text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS providers text;
