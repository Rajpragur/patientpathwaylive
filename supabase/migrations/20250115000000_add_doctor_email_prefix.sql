-- Add doctor email prefix field for Resend integration
ALTER TABLE public.doctor_profiles 
ADD COLUMN IF NOT EXISTS email_prefix text;

-- Add comment to explain the field
COMMENT ON COLUMN public.doctor_profiles.email_prefix IS 'Email prefix for doctor email addresses (e.g., "john.smith" for dr.john.smith@patientpathway.ai)';

-- Create index for email prefix lookups
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_email_prefix ON public.doctor_profiles(email_prefix);

-- Update existing records to generate email prefixes from first_name and last_name
UPDATE public.doctor_profiles 
SET email_prefix = LOWER(REPLACE(CONCAT(first_name, '.', last_name), ' ', '.'))
WHERE email_prefix IS NULL 
  AND first_name IS NOT NULL 
  AND last_name IS NOT NULL;
