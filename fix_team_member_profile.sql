-- Fix the team member profile that was created
-- Update the role flags and clinic information

-- Step 1: Get the main doctor's information for this team member
SELECT 
  tm.id as team_member_id,
  tm.role,
  tm.doctor_id,
  dp_main.id as main_doctor_profile_id,
  dp_main.clinic_name,
  dp_main.first_name as main_doctor_first_name,
  dp_main.last_name as main_doctor_last_name
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp_main ON dp_main.id = tm.doctor_id
WHERE tm.id = 'ef26ca58-862b-4504-8fe0-79e1e00c3230';

-- Step 2: Update the team member's doctor profile with correct role and clinic info
UPDATE public.doctor_profiles 
SET 
  is_staff = CASE 
    WHEN tm.role = 'staff' THEN true 
    ELSE false 
  END,
  is_manager = CASE 
    WHEN tm.role = 'manager' THEN true 
    ELSE false 
  END,
  doctor_id_clinic = dp_main.id,
  clinic_name = dp_main.clinic_name,
  location = dp_main.location,
  phone = dp_main.phone,
  mobile = dp_main.mobile,
  logo_url = dp_main.logo_url,
  providers = dp_main.providers,
  updated_at = NOW()
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp_main ON dp_main.id = tm.doctor_id
WHERE public.doctor_profiles.id = '428c6bca-41ea-4b5a-87a1-b30525a92c4b'
AND tm.id = 'ef26ca58-862b-4504-8fe0-79e1e00c3230';

-- Step 3: Verify the fix worked
SELECT 
  tm.id as team_member_id,
  tm.email,
  tm.first_name,
  tm.last_name,
  tm.role,
  tm.status,
  tm.linked_user_id,
  dp.id as doctor_profile_id,
  dp.is_staff,
  dp.is_manager,
  dp.access_control,
  dp.doctor_id_clinic,
  dp.clinic_name,
  dp_main.first_name as main_doctor_first_name,
  dp_main.last_name as main_doctor_last_name
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
LEFT JOIN public.doctor_profiles dp_main ON dp_main.id = dp.doctor_id_clinic
WHERE tm.id = 'ef26ca58-862b-4504-8fe0-79e1e00c3230';
