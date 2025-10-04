-- Fix the team member record by linking the user and creating doctor profile
-- Replace the values below with the actual data

-- First, let's get the team member record and the doctor's info
SELECT 
  tm.id as team_member_id,
  tm.email,
  tm.first_name,
  tm.last_name,
  tm.role,
  tm.doctor_id,
  dp.clinic_name,
  dp.first_name as doctor_first_name,
  dp.last_name as doctor_last_name,
  dp.location,
  dp.phone,
  dp.mobile,
  dp.logo_url,
  dp.providers,
  dp.id as doctor_profile_id
FROM public.team_members tm
JOIN public.doctor_profiles dp ON dp.doctor_id = tm.doctor_id
WHERE tm.email = 'rajpragur1@gmail.com'
AND tm.status = 'accepted';

-- Step 1: Update the team member record with the linked_user_id
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users table
UPDATE public.team_members 
SET 
  linked_user_id = 'USER_ID_HERE', -- Get this from auth.users table
  accepted_at = NOW()
WHERE id = 'ef26ca58-862b-4504-8fe0-79e1e00c3230';

-- Step 2: Create the doctor profile for the team member
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users table
INSERT INTO public.doctor_profiles (
  user_id,
  first_name,
  last_name,
  email,
  doctor_id,
  clinic_name,
  location,
  phone,
  mobile,
  logo_url,
  providers,
  access_control,
  is_staff,
  is_manager,
  doctor_id_clinic
) VALUES (
  'USER_ID_HERE', -- The user ID from auth.users
  'Raj',
  'Pratap', 
  'rajpragur1@gmail.com',
  'DOCTOR_ID_HERE', -- The doctor_id from the team_members record
  'CLINIC_NAME_HERE', -- From the doctor's profile
  'LOCATION_HERE', -- From the doctor's profile
  'PHONE_HERE', -- From the doctor's profile
  'MOBILE_HERE', -- From the doctor's profile
  'LOGO_URL_HERE', -- From the doctor's profile
  'PROVIDERS_HERE', -- From the doctor's profile
  true, -- access_control
  true, -- is_staff (since role is 'staff')
  false, -- is_manager
  'DOCTOR_PROFILE_ID_HERE' -- The doctor's profile ID
);

-- Step 3: Send verification email (this will be handled by the frontend)
-- The user can request a new verification email from the login page
