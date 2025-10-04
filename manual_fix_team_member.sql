-- Manual fix for the team member who just signed up
-- Replace the values below with the actual data from your team_members table

-- First, check what team member records exist
SELECT 
  tm.*,
  dp.clinic_name,
  dp.first_name as doctor_first_name,
  dp.last_name as doctor_last_name
FROM public.team_members tm
JOIN public.doctor_profiles dp ON dp.id = tm.doctor_id
WHERE tm.status = 'accepted'
ORDER BY tm.created_at DESC
LIMIT 5;

-- If you see a team member without a doctor profile, create one manually
-- Replace the values below with the actual data from the query above
/*
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
  'USER_ID_HERE', -- The linked_user_id from team_members
  'FIRST_NAME_HERE', -- From team_members
  'LAST_NAME_HERE', -- From team_members
  'EMAIL_HERE', -- From team_members
  'DOCTOR_ID_HERE', -- The doctor_id from team_members
  'CLINIC_NAME_HERE', -- From doctor_profiles
  'LOCATION_HERE', -- From doctor_profiles
  'PHONE_HERE', -- From doctor_profiles
  'MOBILE_HERE', -- From doctor_profiles
  'LOGO_URL_HERE', -- From doctor_profiles
  'PROVIDERS_HERE', -- From doctor_profiles
  true, -- access_control
  true, -- is_staff (set to true if role is 'staff')
  false, -- is_manager (set to true if role is 'manager')
  'DOCTOR_PROFILE_ID_HERE' -- The id of the main doctor's profile
);
*/
