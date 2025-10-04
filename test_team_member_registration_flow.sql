-- Test and Verification Script for Team Member Registration Flow
-- This script verifies that the automatic team member registration process works correctly

-- Step 1: Check current team members and their profiles
SELECT 
  'Current Team Members Status' as step,
  COUNT(*) as total_team_members,
  COUNT(tm.linked_user_id) as linked_members,
  COUNT(dp.id) as members_with_profiles,
  COUNT(CASE WHEN dp.is_staff = true THEN 1 END) as staff_members,
  COUNT(CASE WHEN dp.is_manager = true THEN 1 END) as manager_members
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
WHERE tm.status = 'accepted';

-- Step 2: Show detailed status of all team members
SELECT 
  'Detailed Team Member Status' as step,
  tm.id as team_member_id,
  tm.email,
  tm.first_name,
  tm.last_name,
  tm.role,
  tm.status,
  tm.linked_user_id,
  dp.id as doctor_profile_id,
  dp.user_id as profile_user_id,
  dp.is_staff,
  dp.is_manager,
  dp.access_control,
  dp.doctor_id_clinic,
  CASE 
    WHEN tm.linked_user_id IS NULL THEN '❌ No user_id'
    WHEN dp.id IS NULL THEN '❌ No doctor_profile'
    WHEN dp.is_staff = false AND tm.role = 'staff' THEN '❌ Staff flag not set'
    WHEN dp.is_manager = false AND tm.role = 'manager' THEN '❌ Manager flag not set'
    WHEN dp.access_control = false THEN '❌ No portal access'
    ELSE '✅ All good'
  END as status_check
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
WHERE tm.status = 'accepted'
ORDER BY tm.created_at DESC;

-- Step 3: Check for any team members missing profiles
SELECT 
  'Team Members Missing Profiles' as step,
  tm.id as team_member_id,
  tm.email,
  tm.first_name,
  tm.last_name,
  tm.role,
  tm.status,
  tm.linked_user_id
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
WHERE tm.status = 'accepted'
AND dp.id IS NULL;

-- Step 4: Check for any team members with wrong role flags
SELECT 
  'Team Members with Wrong Role Flags' as step,
  tm.id as team_member_id,
  tm.email,
  tm.role as team_role,
  dp.is_staff,
  dp.is_manager,
  CASE 
    WHEN tm.role = 'staff' AND dp.is_staff = false THEN 'Staff role but is_staff=false'
    WHEN tm.role = 'manager' AND dp.is_manager = false THEN 'Manager role but is_manager=false'
    WHEN tm.role = 'staff' AND dp.is_manager = true THEN 'Staff role but is_manager=true'
    WHEN tm.role = 'manager' AND dp.is_staff = true THEN 'Manager role but is_staff=true'
    ELSE 'Role flags are correct'
  END as issue
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
WHERE tm.status = 'accepted'
AND dp.id IS NOT NULL
AND (
  (tm.role = 'staff' AND (dp.is_staff = false OR dp.is_manager = true))
  OR (tm.role = 'manager' AND (dp.is_manager = false OR dp.is_staff = true))
);

-- Step 5: Check if trigger function exists
SELECT 
  'Trigger Function Status' as step,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_auto_create_team_member_profile';

-- Step 6: Show the link-team-member edge function status
-- (This would need to be checked manually in the Supabase dashboard)
SELECT 
  'Edge Function Status' as step,
  'link-team-member function should exist in supabase/functions/link-team-member/index.ts' as note,
  'Check Supabase dashboard > Edge Functions to verify deployment' as instruction;

-- Step 7: Test data for new team member (simulation)
-- This shows what should happen when a new team member registers
SELECT 
  'Expected Flow for New Team Member' as step,
  '1. User signs up via TeamSignupPage.tsx' as step_1,
  '2. Gets user_id from Supabase Auth' as step_2,
  '3. linkTeamMember() calls link-team-member edge function' as step_3,
  '4. Edge function updates team_members.linked_user_id' as step_4,
  '5. Edge function creates doctor_profiles with correct role flags' as step_5,
  '6. User can now log in and access portal' as step_6;

-- Step 8: Summary and recommendations
SELECT 
  'Summary' as step,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.team_members WHERE status = 'accepted' AND linked_user_id IS NULL) > 0 
    THEN '⚠️ Some team members need user_id linking'
    ELSE '✅ All team members have user_id'
  END as user_id_status,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.team_members tm LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email WHERE tm.status = 'accepted' AND dp.id IS NULL) > 0 
    THEN '⚠️ Some team members missing doctor_profiles'
    ELSE '✅ All team members have doctor_profiles'
  END as profile_status,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'trigger_auto_create_team_member_profile') > 0 
    THEN '✅ Auto-creation trigger exists'
    ELSE '❌ Auto-creation trigger missing'
  END as trigger_status;
