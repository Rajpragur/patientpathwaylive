-- Comprehensive script to ensure ALL team members have proper doctor_profiles
-- This should be run to fix any existing team members who don't have profiles

-- Step 1: Check current status of team members
SELECT 
  'Current Team Members Status' as step,
  COUNT(*) as total_team_members,
  COUNT(tm.linked_user_id) as linked_members,
  COUNT(dp.id) as members_with_profiles
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email;

-- Step 2: Show team members without doctor profiles
SELECT 
  'Team Members Missing Profiles' as step,
  tm.id as team_member_id,
  tm.email,
  tm.first_name,
  tm.last_name,
  tm.role,
  tm.status,
  tm.linked_user_id,
  dp.id as doctor_profile_id
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
WHERE tm.status = 'accepted'
AND dp.id IS NULL;

-- Step 3: Create missing doctor profiles for ALL accepted team members
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
  tm.linked_user_id,
  COALESCE(tm.first_name, 'Team') as first_name,
  COALESCE(tm.last_name, 'Member') as last_name,
  tm.email,
  dp_main.doctor_id,
  dp_main.clinic_name,
  dp_main.location,
  dp_main.phone,
  dp_main.mobile,
  dp_main.logo_url,
  dp_main.providers,
  true as access_control,
  CASE WHEN tm.role = 'staff' THEN true ELSE false END as is_staff,
  CASE WHEN tm.role = 'manager' THEN true ELSE false END as is_manager,
  dp_main.id as doctor_id_clinic,
  NOW() as created_at,
  NOW() as updated_at
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp_main ON dp_main.id = tm.doctor_id
LEFT JOIN public.doctor_profiles dp_existing ON dp_existing.email = tm.email
WHERE tm.status = 'accepted'
AND tm.linked_user_id IS NOT NULL
AND dp_existing.id IS NULL; -- Only create if profile doesn't exist

-- Step 4: Update existing team member profiles with correct role flags and clinic info
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
  access_control = true,
  updated_at = NOW()
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp_main ON dp_main.id = tm.doctor_id
WHERE public.doctor_profiles.email = tm.email
AND tm.status = 'accepted'
AND tm.linked_user_id IS NOT NULL;

-- Step 5: Link team members who have auth users but aren't linked
UPDATE public.team_members 
SET 
  linked_user_id = auth.users.id,
  status = 'accepted',
  accepted_at = NOW()
FROM auth.users
WHERE public.team_members.email = auth.users.email
AND public.team_members.linked_user_id IS NULL;

-- Step 6: Final verification - show all team members with their profiles
SELECT 
  'Final Verification' as step,
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
WHERE tm.status = 'accepted'
ORDER BY tm.created_at DESC;
