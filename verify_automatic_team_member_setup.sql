-- Verification Script: Ensure Automatic Team Member Setup Works
-- This script verifies that the automatic process correctly assigns user_id and role flags

-- Step 1: Create a test team member invitation (if needed)
-- This simulates what happens when a doctor invites a team member via ConfigurationPage.tsx
INSERT INTO public.team_members (
  doctor_id,
  email,
  first_name,
  last_name,
  role,
  permissions,
  status,
  invited_by,
  invitation_token,
  token_expires_at,
  created_at
) 
SELECT 
  dp.id as doctor_id,
  'test-team-member@example.com' as email,
  'Test' as first_name,
  'Member' as last_name,
  'staff' as role,
  '{"leads": false, "content": false, "payments": false, "team": false}'::jsonb as permissions,
  'pending' as status,
  dp.user_id as invited_by,
  gen_random_uuid() as invitation_token,
  (NOW() + INTERVAL '7 days')::timestamp as token_expires_at,
  NOW() as created_at
FROM public.doctor_profiles dp
WHERE dp.user_id IS NOT NULL
LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- Step 2: Simulate the team member signup process
-- This simulates what happens when the team member signs up via TeamSignupPage.tsx

-- First, create a test auth user (simulating signup)
-- Note: This is just for testing - in real flow, this happens via supabase.auth.signUp()
-- We'll simulate by updating the team_members record as if the user signed up

-- Update the team member record to simulate successful signup and linking
UPDATE public.team_members 
SET 
  linked_user_id = gen_random_uuid(), -- Simulate user_id from auth
  status = 'accepted',
  accepted_at = NOW()
WHERE email = 'test-team-member@example.com'
AND status = 'pending';

-- Step 3: The trigger should automatically create a doctor profile
-- Let's check if the trigger worked
SELECT 
  'Trigger Test Result' as step,
  tm.id as team_member_id,
  tm.email,
  tm.role,
  tm.linked_user_id,
  dp.id as doctor_profile_id,
  dp.user_id as profile_user_id,
  dp.is_staff,
  dp.is_manager,
  dp.access_control,
  dp.doctor_id_clinic,
  CASE 
    WHEN dp.id IS NULL THEN '❌ Trigger failed - no profile created'
    WHEN dp.user_id != tm.linked_user_id THEN '❌ Trigger failed - wrong user_id'
    WHEN tm.role = 'staff' AND dp.is_staff = false THEN '❌ Trigger failed - staff flag not set'
    WHEN tm.role = 'manager' AND dp.is_manager = false THEN '❌ Trigger failed - manager flag not set'
    WHEN dp.access_control = false THEN '❌ Trigger failed - no access control'
    ELSE '✅ Trigger worked correctly'
  END as trigger_result
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
WHERE tm.email = 'test-team-member@example.com';

-- Step 4: Test with a manager role as well
INSERT INTO public.team_members (
  doctor_id,
  email,
  first_name,
  last_name,
  role,
  permissions,
  status,
  invited_by,
  invitation_token,
  token_expires_at,
  created_at
) 
SELECT 
  dp.id as doctor_id,
  'test-manager@example.com' as email,
  'Test' as first_name,
  'Manager' as last_name,
  'manager' as role,
  '{"leads": true, "content": true, "payments": false, "team": false}'::jsonb as permissions,
  'pending' as status,
  dp.user_id as invited_by,
  gen_random_uuid() as invitation_token,
  (NOW() + INTERVAL '7 days')::timestamp as token_expires_at,
  NOW() as created_at
FROM public.doctor_profiles dp
WHERE dp.user_id IS NOT NULL
LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- Update manager to simulate signup
UPDATE public.team_members 
SET 
  linked_user_id = gen_random_uuid(),
  status = 'accepted',
  accepted_at = NOW()
WHERE email = 'test-manager@example.com'
AND status = 'pending';

-- Check manager trigger result
SELECT 
  'Manager Trigger Test Result' as step,
  tm.id as team_member_id,
  tm.email,
  tm.role,
  tm.linked_user_id,
  dp.id as doctor_profile_id,
  dp.user_id as profile_user_id,
  dp.is_staff,
  dp.is_manager,
  dp.access_control,
  dp.doctor_id_clinic,
  CASE 
    WHEN dp.id IS NULL THEN '❌ Manager trigger failed - no profile created'
    WHEN dp.user_id != tm.linked_user_id THEN '❌ Manager trigger failed - wrong user_id'
    WHEN tm.role = 'staff' AND dp.is_staff = false THEN '❌ Manager trigger failed - staff flag not set'
    WHEN tm.role = 'manager' AND dp.is_manager = false THEN '❌ Manager trigger failed - manager flag not set'
    WHEN dp.access_control = false THEN '❌ Manager trigger failed - no access control'
    ELSE '✅ Manager trigger worked correctly'
  END as trigger_result
FROM public.team_members tm
LEFT JOIN public.doctor_profiles dp ON dp.email = tm.email
WHERE tm.email = 'test-manager@example.com';

-- Step 5: Clean up test data
DELETE FROM public.doctor_profiles WHERE email IN ('test-team-member@example.com', 'test-manager@example.com');
DELETE FROM public.team_members WHERE email IN ('test-team-member@example.com', 'test-manager@example.com');

-- Step 6: Final verification summary
SELECT 
  'Final Verification Summary' as step,
  'If you see this message, the test completed successfully' as result,
  'The automatic team member setup process should work for new registrations' as note,
  'Run this script after setting up the trigger to verify it works' as instruction;
