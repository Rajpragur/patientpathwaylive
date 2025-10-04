-- Debug script to check team member profile update issues
-- Run this in your Supabase SQL editor to diagnose the problem

-- 1. Check if the team member has a doctor_profiles record
SELECT 
    dp.id,
    dp.user_id,
    dp.first_name,
    dp.last_name,
    dp.is_staff,
    dp.is_manager,
    dp.doctor_id_clinic,
    dp.access_control,
    dp.created_at,
    dp.updated_at
FROM doctor_profiles dp
WHERE dp.user_id = 'YOUR_USER_ID_HERE' -- Replace with actual user ID
ORDER BY dp.created_at DESC;

-- 2. Check RLS policies on doctor_profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'doctor_profiles'
ORDER BY policyname;

-- 2b. Check if RLS is enabled on doctor_profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrls
FROM pg_tables 
WHERE tablename = 'doctor_profiles';

-- 3. Check if the user exists in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
WHERE id = 'YOUR_USER_ID_HERE'; -- Replace with actual user ID

-- 4. Check team_members table for this user
SELECT 
    tm.id,
    tm.email,
    tm.first_name,
    tm.last_name,
    tm.role,
    tm.status,
    tm.linked_user_id,
    tm.doctor_id,
    tm.created_at
FROM team_members tm
WHERE tm.linked_user_id = 'YOUR_USER_ID_HERE' -- Replace with actual user ID
ORDER BY tm.created_at DESC;

-- 5. Test update manually (replace YOUR_USER_ID_HERE with actual user ID)
-- UPDATE doctor_profiles 
-- SET 
--     first_name = 'Test First Name',
--     last_name = 'Test Last Name',
--     updated_at = NOW()
-- WHERE user_id = 'YOUR_USER_ID_HERE';

-- 6. Check for any constraints or triggers
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'doctor_profiles'
ORDER BY tc.constraint_type, tc.constraint_name;
