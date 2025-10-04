-- Simple fix for team members - avoid complex joins that cause type issues
-- Run this step by step

-- Step 1: Check column types first
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('doctor_profiles', 'team_members')
AND column_name IN ('id', 'doctor_id', 'user_id', 'doctor_id_clinic')
ORDER BY table_name, column_name;

-- Step 2: Check all team members
SELECT 
  tm.id as team_member_id,
  tm.email,
  tm.first_name,
  tm.last_name,
  tm.role,
  tm.status,
  tm.linked_user_id,
  tm.doctor_id,
  dp.id as doctor_profile_exists
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
WHERE tm.status = 'accepted'
ORDER BY tm.created_at DESC;

-- Step 3: Update team members who have NULL linked_user_id but have auth users
UPDATE public.team_members 
SET 
  linked_user_id = auth_users.id,
  accepted_at = NOW()
FROM auth.users
WHERE team_members.email = auth.users.email
AND team_members.linked_user_id IS NULL
AND team_members.status = 'accepted';

-- Step 4: Create doctor profiles for team members who don't have one
-- This uses a simple approach without complex joins
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
SELECT DISTINCT
  tm.linked_user_id,
  COALESCE(tm.first_name, 'Team'),
  COALESCE(tm.last_name, 'Member'),
  tm.email,
  tm.doctor_id,
  'Clinic', -- Default clinic name
  '', -- Default location
  '', -- Default phone
  '', -- Default mobile
  '', -- Default logo
  '[]', -- Default providers
  true, -- access_control
  tm.role = 'staff', -- is_staff
  tm.role = 'manager', -- is_manager
  tm.doctor_id, -- Use doctor_id as clinic reference
  NOW(),
  NOW()
FROM public.team_members tm
WHERE tm.status = 'accepted'
AND NOT EXISTS (
  SELECT 1 FROM public.doctor_profiles dp 
  WHERE dp.email = tm.email
)
ON CONFLICT (email) DO NOTHING;

-- Step 5: Update existing doctor profiles with team flags
UPDATE public.doctor_profiles 
SET 
  is_staff = tm.role = 'staff',
  is_manager = tm.role = 'manager',
  access_control = true,
  updated_at = NOW()
FROM public.team_members tm
WHERE doctor_profiles.email = tm.email
AND tm.status = 'accepted';

-- Step 6: Final check
SELECT 
  tm.id as team_member_id,
  tm.email,
  tm.first_name,
  tm.last_name,
  tm.role,
  tm.status,
  tm.linked_user_id,
  dp.id as doctor_profile_exists,
  dp.is_staff,
  dp.is_manager,
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
