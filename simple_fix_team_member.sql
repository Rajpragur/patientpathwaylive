-- Simple fix for the team member with null linked_user_id
-- Run these queries one by one

-- Step 1: Get the user ID from auth.users table
SELECT id, email FROM auth.users WHERE email = 'rajpragur1@gmail.com';

-- Step 2: Get the doctor's information for the team member
SELECT 
  tm.doctor_id,
  dp.clinic_name,
  dp.location,
  dp.phone,
  dp.mobile,
  dp.logo_url,
  dp.providers,
  dp.id as doctor_profile_id
FROM public.team_members tm
JOIN public.doctor_profiles dp ON dp.doctor_id = tm.doctor_id
WHERE tm.id = 'ef26ca58-862b-4504-8fe0-79e1e00c3230';

-- Step 3: Update the team member record (replace USER_ID_HERE with actual user ID from Step 1)
UPDATE public.team_members 
SET 
  linked_user_id = 'USER_ID_HERE', -- Replace with actual user ID
  accepted_at = NOW()
WHERE id = 'ef26ca58-862b-4504-8fe0-79e1e00c3230';

-- Step 4: Create doctor profile for team member (replace all HERE values with actual data from Steps 1 & 2)
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
  'USER_ID_HERE', -- From Step 1
  'Raj',
  'Pratap', 
  'rajpragur1@gmail.com',
  'DOCTOR_ID_HERE', -- From Step 2
  'CLINIC_NAME_HERE', -- From Step 2
  'LOCATION_HERE', -- From Step 2
  'PHONE_HERE', -- From Step 2
  'MOBILE_HERE', -- From Step 2
  'LOGO_URL_HERE', -- From Step 2
  'PROVIDERS_HERE', -- From Step 2
  true, -- access_control
  true, -- is_staff (since role is 'staff')
  false, -- is_manager
  'DOCTOR_PROFILE_ID_HERE' -- From Step 2
);

-- Step 5: Verify the fix worked
SELECT 
  tm.id,
  tm.email,
  tm.first_name,
  tm.last_name,
  tm.role,
  tm.status,
  tm.linked_user_id,
  dp.id as doctor_profile_exists,
  dp.is_staff,
  dp.is_manager
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.user_id = tm.linked_user_id
WHERE tm.id = 'ef26ca58-862b-4504-8fe0-79e1e00c3230';
