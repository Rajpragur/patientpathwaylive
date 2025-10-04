-- Create dummy doctor profiles for all team members who don't have one
-- This ensures every team member can log in and access the portal

-- Step 1: Check all team members and their current status
SELECT 
  tm.id as team_member_id,
  tm.email,
  tm.first_name,
  tm.last_name,
  tm.role,
  tm.status,
  tm.linked_user_id,
  tm.doctor_id,
  dp_main.clinic_name,
  dp_main.location,
  dp_main.phone,
  dp_main.mobile,
  dp_main.logo_url,
  dp_main.providers,
  dp_main.id as main_doctor_profile_id,
  dp_team.id as team_member_profile_exists
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp_main ON dp_main.id = tm.doctor_id
LEFT JOIN public.doctor_profiles dp_team ON dp_team.user_id = tm.linked_user_id
WHERE tm.status = 'accepted'
ORDER BY tm.created_at DESC;

-- Step 2: Create doctor profiles for team members who don't have one
-- This will create a profile for EVERY team member, even if they don't have a linked_user_id yet
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
  doctor_id_clinic,
  created_at,
  updated_at
)
SELECT 
  tm.linked_user_id, -- This will be NULL for some, but we'll update it later
  COALESCE(tm.first_name, 'Team'),
  COALESCE(tm.last_name, 'Member'),
  tm.email,
  dp_main.doctor_id,
  COALESCE(dp_main.clinic_name, 'Clinic'),
  COALESCE(dp_main.location, ''),
  COALESCE(dp_main.phone, ''),
  COALESCE(dp_main.mobile, ''),
  COALESCE(dp_main.logo_url, ''),
  COALESCE(dp_main.providers, '[]'),
  true, -- access_control - all team members get portal access
  tm.role = 'staff', -- is_staff
  tm.role = 'manager', -- is_manager
  dp_main.id, -- doctor_id_clinic - link to main doctor's profile
  NOW(),
  NOW()
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp_main ON dp_main.id = tm.doctor_id
LEFT JOIN public.doctor_profiles dp_team ON dp_team.email = tm.email
WHERE tm.status = 'accepted'
AND dp_team.id IS NULL; -- Only create profiles for team members who don't have one

-- Step 3: Update team members who have NULL linked_user_id but have auth users
-- This will link existing auth users to their team member records
UPDATE public.team_members 
SET 
  linked_user_id = auth.users.id,
  accepted_at = NOW()
FROM auth.users
WHERE public.team_members.email = auth.users.email
AND public.team_members.linked_user_id IS NULL
AND public.team_members.status = 'accepted';

-- Step 4: Update doctor profiles with the correct user_id for team members who now have linked_user_id
UPDATE public.doctor_profiles 
SET 
  user_id = tm.linked_user_id,
  updated_at = NOW()
FROM public.team_members tm
WHERE doctor_profiles.email = tm.email
AND tm.linked_user_id IS NOT NULL
AND doctor_profiles.user_id IS NULL;

-- Step 5: Final verification - check all team members and their profiles
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
  dp.doctor_id_clinic,
  dp.access_control,
  CASE 
    WHEN tm.linked_user_id IS NOT NULL AND dp.id IS NOT NULL THEN '✅ FULLY LINKED'
    WHEN tm.linked_user_id IS NOT NULL AND dp.id IS NULL THEN '⚠️ MISSING PROFILE'
    WHEN tm.linked_user_id IS NULL AND dp.id IS NOT NULL THEN '⚠️ MISSING USER LINK'
    ELSE '❌ NOT LINKED'
  END as status_check
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
WHERE tm.status = 'accepted'
ORDER BY tm.created_at DESC;

-- Step 6: Create a simple view for easy access to team member data
CREATE OR REPLACE VIEW team_member_access AS
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
  dp_main.clinic_name,
  dp_main.first_name as main_doctor_first_name,
  dp_main.last_name as main_doctor_last_name
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
LEFT JOIN public.doctor_profiles dp_main ON dp_main.id = dp.doctor_id_clinic
WHERE tm.status = 'accepted';

-- Step 7: Test the view
SELECT * FROM team_member_access ORDER BY team_member_id;
