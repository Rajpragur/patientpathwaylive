-- Fix duplicate Google OAuth accounts and link them to existing invitations
-- This script helps resolve the issue where Google OAuth creates new accounts instead of linking to existing invitations

-- 1. Find duplicate accounts (same email, different user_ids)
SELECT 
    au.email,
    au.id as auth_user_id,
    au.created_at as auth_created_at,
    au.email_confirmed_at,
    dp.id as profile_id,
    dp.user_id as profile_user_id,
    dp.first_name,
    dp.last_name,
    dp.is_staff,
    dp.is_manager,
    tm.id as team_member_id,
    tm.status as team_member_status,
    tm.invitation_token
FROM auth.users au
LEFT JOIN doctor_profiles dp ON au.id = dp.user_id
LEFT JOIN team_members tm ON au.email = tm.email
WHERE au.email IN (
    SELECT email 
    FROM auth.users 
    GROUP BY email 
    HAVING COUNT(*) > 1
)
ORDER BY au.email, au.created_at;

-- 2. Find team members who have Google OAuth accounts but aren't linked
SELECT 
    tm.email,
    tm.first_name,
    tm.last_name,
    tm.status,
    tm.invitation_token,
    au.id as google_auth_user_id,
    au.created_at as google_created_at,
    dp.id as profile_id,
    dp.user_id as profile_user_id
FROM team_members tm
LEFT JOIN auth.users au ON tm.email = au.email
LEFT JOIN doctor_profiles dp ON au.id = dp.user_id
WHERE tm.status = 'pending'
  AND au.id IS NOT NULL
  AND dp.id IS NULL
ORDER BY tm.created_at;

-- 3. Find team members with multiple auth accounts
SELECT 
    tm.email,
    tm.first_name,
    tm.last_name,
    tm.status,
    tm.invitation_token,
    COUNT(au.id) as auth_account_count,
    STRING_AGG(au.id::text, ', ') as auth_user_ids,
    STRING_AGG(au.created_at::text, ', ') as auth_created_dates
FROM team_members tm
LEFT JOIN auth.users au ON tm.email = au.email
WHERE tm.status = 'pending'
GROUP BY tm.email, tm.first_name, tm.last_name, tm.status, tm.invitation_token
HAVING COUNT(au.id) > 1
ORDER BY tm.created_at;

-- 4. Manual fix for a specific team member (replace EMAIL_HERE with actual email)
-- This will link the team member to their Google OAuth account
/*
DO $$
DECLARE
    team_member_record RECORD;
    google_user_id UUID;
    profile_id UUID;
BEGIN
    -- Get the team member record
    SELECT * INTO team_member_record
    FROM team_members
    WHERE email = 'EMAIL_HERE'
      AND status = 'pending'
    LIMIT 1;

    -- Get the Google OAuth user ID
    SELECT id INTO google_user_id
    FROM auth.users
    WHERE email = 'EMAIL_HERE'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Update the team member record to link to the Google user
    UPDATE team_members
    SET linked_user_id = google_user_id,
        status = 'accepted'
    WHERE id = team_member_record.id;

    -- Create or update doctor profile for the Google user
    INSERT INTO doctor_profiles (
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
    )
    SELECT 
        google_user_id,
        team_member_record.first_name,
        team_member_record.last_name,
        team_member_record.email,
        dp_main.doctor_id,
        dp_main.clinic_name,
        dp_main.location,
        dp_main.phone,
        dp_main.mobile,
        dp_main.logo_url,
        dp_main.providers,
        true,
        CASE WHEN team_member_record.role = 'staff' THEN true ELSE false END,
        CASE WHEN team_member_record.role = 'manager' THEN true ELSE false END,
        dp_main.id::text
    FROM doctor_profiles dp_main
    WHERE dp_main.id = team_member_record.doctor_id
    ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        is_staff = EXCLUDED.is_staff,
        is_manager = EXCLUDED.is_manager,
        doctor_id_clinic = EXCLUDED.doctor_id_clinic,
        updated_at = NOW();

    RAISE NOTICE 'Successfully linked team member % to Google user %', team_member_record.email, google_user_id;
END $$;
*/

-- 5. Check for orphaned auth users (users without profiles)
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    CASE WHEN dp.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN doctor_profiles dp ON au.id = dp.user_id
WHERE dp.id IS NULL
ORDER BY au.created_at DESC;

-- 6. Check for team members without auth accounts
SELECT 
    tm.email,
    tm.first_name,
    tm.last_name,
    tm.status,
    tm.invitation_token,
    CASE WHEN au.id IS NULL THEN 'NO AUTH ACCOUNT' ELSE 'HAS AUTH ACCOUNT' END as auth_status
FROM team_members tm
LEFT JOIN auth.users au ON tm.email = au.email
WHERE tm.status = 'pending'
ORDER BY tm.created_at DESC;
