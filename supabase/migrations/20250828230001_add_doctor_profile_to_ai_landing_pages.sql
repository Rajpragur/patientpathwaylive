-- Add doctor_profile column to ai_landing_pages table
-- This will store complete doctor information for each landing page

-- Add the doctor_profile column as JSONB to store structured doctor data
ALTER TABLE public.ai_landing_pages 
ADD COLUMN IF NOT EXISTS doctor_profile JSONB;

-- Add a comment to document the purpose of this column
COMMENT ON COLUMN public.ai_landing_pages.doctor_profile IS 'Stores complete doctor profile information including name, credentials, locations, testimonials, website, and avatar_url';

-- Create an index on the doctor_profile column for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_landing_pages_doctor_profile 
ON public.ai_landing_pages USING GIN (doctor_profile);

-- Update existing rows to have an empty doctor_profile object if they don't have one
UPDATE public.ai_landing_pages 
SET doctor_profile = '{}'::jsonb 
WHERE doctor_profile IS NULL;
