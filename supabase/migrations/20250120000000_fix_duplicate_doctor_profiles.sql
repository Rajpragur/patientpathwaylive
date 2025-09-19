-- Fix duplicate doctor profiles by adding unique constraint on user_id
-- First, clean up existing duplicates by keeping only the first profile per user

-- Create a temporary table with the first profile for each user
CREATE TEMP TABLE temp_first_profiles AS
SELECT DISTINCT ON (user_id) 
  id,
  user_id,
  first_name,
  last_name,
  email,
  doctor_id,
  created_at,
  updated_at,
  location,
  specialty,
  phone,
  logo_url,
  avatar_url,
  website,
  email_prefix,
  access_control
FROM doctor_profiles
ORDER BY user_id, created_at ASC;

-- Delete all existing profiles
DELETE FROM doctor_profiles;

-- Insert the cleaned profiles back
INSERT INTO doctor_profiles (
  id,
  user_id,
  first_name,
  last_name,
  email,
  doctor_id,
  created_at,
  updated_at,
  location,
  specialty,
  phone,
  logo_url,
  avatar_url,
  website,
  email_prefix,
  access_control
)
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  email,
  doctor_id,
  created_at,
  updated_at,
  location,
  specialty,
  phone,
  logo_url,
  avatar_url,
  website,
  email_prefix,
  access_control
FROM temp_first_profiles;

-- Add unique constraint on user_id to prevent future duplicates
ALTER TABLE doctor_profiles 
ADD CONSTRAINT unique_doctor_profile_per_user UNIQUE (user_id);

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT unique_doctor_profile_per_user ON doctor_profiles 
IS 'Ensures each user can only have one doctor profile';
