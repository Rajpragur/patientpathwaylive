-- Manual fix for team members who don't have proper clinic data
-- Run this if the automatic linking is not working

-- Step 1: Show current status of all team members
SELECT 
  'Current Team Member Status' as status,
  dp_team.id as team_profile_id,
  dp_team.user_id,
  dp_team.first_name,
  dp_team.last_name,
  dp_team.email,
  dp_team.doctor_id,
  dp_team.clinic_name,
  dp_team.is_staff,
  dp_team.is_manager,
  dp_team.doctor_id_clinic,
  tm.role as team_role,
  tm.status as invitation_status,
  tm.linked_user_id,
  dp_main.id as main_doctor_profile_id,
  dp_main.doctor_id as main_doctor_id,
  dp_main.clinic_name as main_clinic_name
FROM public.doctor_profiles dp_team
LEFT JOIN public.team_members tm ON tm.linked_user_id = dp_team.user_id
LEFT JOIN public.doctor_profiles dp_main ON dp_main.id = tm.doctor_id
WHERE (dp_team.is_staff = true OR dp_team.is_manager = true)
ORDER BY dp_team.created_at DESC;

-- Step 2: Fix team members missing clinic data
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
  doctor_id_clinic = dp_main.id::text,
  is_staff = (tm.role = 'staff'),
  is_manager = (tm.role = 'manager')
FROM public.team_members tm
INNER JOIN public.doctor_profiles dp_main ON dp_main.id = tm.doctor_id
WHERE dp_team.user_id = tm.linked_user_id
  AND tm.status = 'accepted'
  AND (dp_team.is_staff = true OR dp_team.is_manager = true)
  AND (
    dp_team.doctor_id_clinic IS NULL 
    OR dp_team.clinic_name IS NULL 
    OR dp_team.doctor_id IS NULL
    OR dp_team.doctor_id != dp_main.doctor_id
  );

-- Step 3: Verify the fixes
SELECT 
  'After Fix Status' as status,
  dp_team.id as team_profile_id,
  dp_team.user_id,
  dp_team.first_name,
  dp_team.last_name,
  dp_team.email,
  dp_team.doctor_id,
  dp_team.clinic_name,
  dp_team.is_staff,
  dp_team.is_manager,
  dp_team.doctor_id_clinic,
  tm.role as team_role,
  tm.status as invitation_status,
  dp_main.id as main_doctor_profile_id,
  dp_main.doctor_id as main_doctor_id,
  dp_main.clinic_name as main_clinic_name,
  CASE 
    WHEN dp_team.doctor_id_clinic IS NOT NULL 
      AND dp_team.clinic_name IS NOT NULL 
      AND dp_team.doctor_id IS NOT NULL
      AND dp_team.doctor_id = dp_main.doctor_id
    THEN '✅ FIXED'
    ELSE '❌ STILL NEEDS FIX'
  END as fix_status
FROM public.doctor_profiles dp_team
LEFT JOIN public.team_members tm ON tm.linked_user_id = dp_team.user_id
LEFT JOIN public.doctor_profiles dp_main ON dp_main.id = tm.doctor_id
WHERE (dp_team.is_staff = true OR dp_team.is_manager = true)
ORDER BY dp_team.created_at DESC;
