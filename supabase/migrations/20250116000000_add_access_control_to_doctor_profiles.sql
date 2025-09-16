-- Add access_control column to doctor_profiles table
ALTER TABLE doctor_profiles 
ADD COLUMN access_control BOOLEAN DEFAULT true;

-- Update existing doctors to have access by default
UPDATE doctor_profiles 
SET access_control = true 
WHERE access_control IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN doctor_profiles.access_control IS 'Controls whether doctor has access to the portal. true = has access, false = no access';

-- Create index for better performance on access control queries
CREATE INDEX idx_doctor_profiles_access_control ON doctor_profiles(access_control);
