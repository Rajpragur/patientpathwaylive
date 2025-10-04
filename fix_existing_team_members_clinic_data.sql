-- Fix existing team members who don't have proper clinic data copied
-- This script ensures all team members have the same clinic information as their main doctor

-- Step 1: Update team member profiles to copy clinic data from main doctor
UPDATE public.doctor_profiles dp_team
SET 
  doctor_id = dp_main.doctor_id,
  clinic_name = dp_main.clinic_name,
  location = dp_main.location,
  phone = dp_main.phone,
  mobile = dp_main.mobile,
  logo_url = dp_main.logo_url,
  providers = dp_main.providers,
  access_control = true,
  doctor_id_clinic = dp_main.id::text
FROM public.doctor_profiles dp_main
INNER JOIN public.team_members tm ON tm.doctor_id = dp_main.id
WHERE dp_team.user_id = tm.linked_user_id
  AND tm.status = 'accepted'
  AND (dp_team.is_staff = true OR dp_team.is_manager = true)
  AND dp_team.doctor_id_clinic IS NULL; -- Only update if not already linked

-- Step 2: Set correct role flags based on team_members.role
UPDATE public.doctor_profiles dp_team
SET 
  is_staff = (tm.role = 'staff'),
  is_manager = (tm.role = 'manager')
FROM public.team_members tm
WHERE dp_team.user_id = tm.linked_user_id
  AND tm.status = 'accepted'
  AND (dp_team.is_staff = true OR dp_team.is_manager = true);

-- Step 3: Verify the updates
SELECT 
  dp_team.id as team_member_profile_id,
  dp_team.user_id,
  dp_team.first_name,
  dp_team.last_name,
  dp_team.email,
  dp_team.is_staff,
  dp_team.is_manager,
  dp_team.doctor_id_clinic,
  dp_team.clinic_name,
  dp_team.location,
  dp_main.id as main_doctor_profile_id,
  dp_main.doctor_id as main_doctor_id,
  dp_main.clinic_name as main_clinic_name,
  tm.role as team_role,
  tm.status as invitation_status
FROM public.doctor_profiles dp_team
INNER JOIN public.team_members tm ON tm.linked_user_id = dp_team.user_id
INNER JOIN public.doctor_profiles dp_main ON dp_main.id = tm.doctor_id
WHERE tm.status = 'accepted'
  AND (dp_team.is_staff = true OR dp_team.is_manager = true)
ORDER BY dp_team.created_at DESC;

-- Step 4: Show any team members that still need fixing
SELECT 
  dp_team.id as team_member_profile_id,
  dp_team.user_id,
  dp_team.first_name,
  dp_team.last_name,
  dp_team.email,
  dp_team.doctor_id_clinic,
  dp_team.clinic_name,
  tm.role as team_role,
  tm.status as invitation_status,
  CASE 
    WHEN dp_team.doctor_id_clinic IS NULL THEN 'Missing clinic link'
    WHEN dp_team.clinic_name IS NULL THEN 'Missing clinic name'
    WHEN dp_team.doctor_id IS NULL THEN 'Missing doctor_id'
    ELSE 'OK'
  END as issue
FROM public.doctor_profiles dp_team
INNER JOIN public.team_members tm ON tm.linked_user_id = dp_team.user_id
WHERE tm.status = 'accepted'
  AND (dp_team.is_staff = true OR dp_team.is_manager = true)
  AND (
    dp_team.doctor_id_clinic IS NULL 
    OR dp_team.clinic_name IS NULL 
    OR dp_team.doctor_id IS NULL
  )
ORDER BY dp_team.created_at DESC;
