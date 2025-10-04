-- Migration to convert existing doctor-centric data to clinic-centric structure
-- Run this AFTER applying the clinic structure SQL

-- Step 1: Create clinic profiles for existing doctors (only those with valid user_id)
INSERT INTO public.clinic_profiles (
  clinic_name,
  clinic_slug,
  phone,
  email,
  address,
  city,
  state,
  zip_code,
  logo_url,
  created_by
)
SELECT 
  COALESCE(dp.clinic_name, CONCAT(dp.first_name, ' ', dp.last_name, '''s Practice')),
  generate_clinic_slug(COALESCE(dp.clinic_name, CONCAT(dp.first_name, ' ', dp.last_name, '''s Practice'))),
  dp.phone,
  dp.email,
  dp.location,
  dp.location, -- Assuming location contains city info
  '', -- State not available in current structure
  '', -- Zip code not available in current structure
  dp.logo_url,
  dp.user_id
FROM public.doctor_profiles dp
WHERE dp.clinic_id IS NULL 
  AND dp.user_id IS NOT NULL; -- Only migrate records with valid user_id

-- Step 2: Update doctor_profiles to reference their clinic (only those with valid user_id)
UPDATE public.doctor_profiles 
SET clinic_id = cp.id
FROM public.clinic_profiles cp
WHERE public.doctor_profiles.clinic_id IS NULL 
  AND public.doctor_profiles.user_id IS NOT NULL
  AND cp.created_by = public.doctor_profiles.user_id
  AND cp.clinic_name = COALESCE(public.doctor_profiles.clinic_name, CONCAT(public.doctor_profiles.first_name, ' ', public.doctor_profiles.last_name, '''s Practice'));

-- Step 3: Create clinic members for existing doctors (as owners) - only those with valid user_id
INSERT INTO public.clinic_members (
  clinic_id,
  user_id,
  email,
  first_name,
  last_name,
  role,
  permissions,
  status,
  accepted_at
)
SELECT 
  dp.clinic_id,
  dp.user_id,
  dp.email,
  dp.first_name,
  dp.last_name,
  'owner',
  '{"leads": true, "content": true, "payments": true, "team": true}'::jsonb,
  'active',
  dp.created_at
FROM public.doctor_profiles dp
WHERE dp.clinic_id IS NOT NULL
  AND dp.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.clinic_members cm 
    WHERE cm.clinic_id = dp.clinic_id AND cm.user_id = dp.user_id
  );

-- Step 4: Migrate existing team members to new clinic_members structure
-- Note: team_members table doesn't have user_id, only email - user_id gets linked when they accept invitation
INSERT INTO public.clinic_members (
  clinic_id,
  user_id,
  email,
  first_name,
  last_name,
  role,
  permissions,
  status,
  invited_by,
  invitation_token,
  token_expires_at,
  accepted_at
)
SELECT 
  dp.clinic_id,
  NULL, -- user_id is NULL for pending invitations, gets set when they accept
  tm.email,
  tm.first_name,
  tm.last_name,
  CASE 
    WHEN tm.role = 'admin' THEN 'manager'
    ELSE 'staff'
  END,
  CASE 
    WHEN tm.role = 'admin' THEN '{"leads": true, "content": true, "payments": false, "team": true}'::jsonb
    ELSE '{"leads": true, "content": true, "payments": false, "team": false}'::jsonb
  END,
  CASE 
    WHEN tm.status = 'accepted' THEN 'active'
    ELSE tm.status
  END,
  tm.invited_by,
  NULL, -- invitation_token not in original team_members table
  NULL, -- token_expires_at not in original team_members table
  tm.accepted_at
FROM public.team_members tm
JOIN public.doctor_profiles dp ON dp.id = tm.doctor_id
WHERE dp.clinic_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.clinic_members cm 
    WHERE cm.clinic_id = dp.clinic_id AND cm.email = tm.email
  );

-- Step 5: Update all existing tables to reference clinic_id instead of doctor_id
-- Update quiz_leads
UPDATE public.quiz_leads 
SET clinic_id = dp.clinic_id
FROM public.doctor_profiles dp
WHERE public.quiz_leads.clinic_id IS NULL 
  AND public.quiz_leads.doctor_id = dp.id;

-- Update custom_quizzes
UPDATE public.custom_quizzes 
SET clinic_id = dp.clinic_id
FROM public.doctor_profiles dp
WHERE public.custom_quizzes.clinic_id IS NULL 
  AND public.custom_quizzes.doctor_id = dp.id;

-- Update contacts
UPDATE public.contacts 
SET clinic_id = dp.clinic_id
FROM public.doctor_profiles dp
WHERE public.contacts.clinic_id IS NULL 
  AND public.contacts.doctor_id = dp.id;

-- Update social_accounts
UPDATE public.social_accounts 
SET clinic_id = dp.clinic_id
FROM public.doctor_profiles dp
WHERE public.social_accounts.clinic_id IS NULL 
  AND public.social_accounts.doctor_id = dp.id;

-- Update doctor_notifications
UPDATE public.doctor_notifications 
SET clinic_id = dp.clinic_id
FROM public.doctor_profiles dp
WHERE public.doctor_notifications.clinic_id IS NULL 
  AND public.doctor_notifications.doctor_id = dp.id;

-- Update automation_webhooks
UPDATE public.automation_webhooks 
SET clinic_id = dp.clinic_id
FROM public.doctor_profiles dp
WHERE public.automation_webhooks.clinic_id IS NULL 
  AND public.automation_webhooks.doctor_id = dp.id;

-- Update email_domains (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_domains') THEN
        UPDATE public.email_domains 
        SET clinic_id = dp.clinic_id
        FROM public.doctor_profiles dp
        WHERE public.email_domains.clinic_id IS NULL 
          AND public.email_domains.doctor_id = dp.id;
        RAISE NOTICE 'Updated email_domains table';
    ELSE
        RAISE NOTICE 'email_domains table does not exist, skipping';
    END IF;
END $$;

-- Update nose_landing_pages
UPDATE public.nose_landing_pages 
SET clinic_id = dp.clinic_id
FROM public.doctor_profiles dp
WHERE public.nose_landing_pages.clinic_id IS NULL
  AND public.nose_landing_pages.doctor_id = dp.id::text;

-- Update quiz_incidents
UPDATE public.quiz_incidents 
SET clinic_id = dp.clinic_id
FROM public.doctor_profiles dp
WHERE public.quiz_incidents.clinic_id IS NULL 
  AND public.quiz_incidents.doctor_id = dp.id;

-- Update ai_landing_pages
UPDATE public.ai_landing_pages 
SET clinic_id = dp.clinic_id
FROM public.doctor_profiles dp
WHERE public.ai_landing_pages.clinic_id IS NULL
  AND public.ai_landing_pages.doctor_id = dp.id::text;

-- Step 6: Create default location for each clinic if none exists
INSERT INTO public.clinic_locations (clinic_id, name, is_primary)
SELECT 
  cp.id,
  'Main Office',
  true
FROM public.clinic_profiles cp
WHERE NOT EXISTS (
  SELECT 1 FROM public.clinic_locations cl 
  WHERE cl.clinic_id = cp.id
);

-- Step 7: Assign all members to the primary location of their clinic
INSERT INTO public.clinic_member_locations (clinic_member_id, location_id)
SELECT 
  cm.id,
  cl.id
FROM public.clinic_members cm
JOIN public.clinic_locations cl ON cl.clinic_id = cm.clinic_id AND cl.is_primary = true
WHERE NOT EXISTS (
  SELECT 1 FROM public.clinic_member_locations cml 
  WHERE cml.clinic_member_id = cm.id
);

-- Step 8: Update quiz_leads and contacts to reference the primary location
UPDATE public.quiz_leads 
SET location_id = cl.id
FROM public.clinic_locations cl
WHERE public.quiz_leads.location_id IS NULL 
  AND public.quiz_leads.clinic_id = cl.clinic_id 
  AND cl.is_primary = true;

UPDATE public.contacts 
SET location_id = cl.id
FROM public.clinic_locations cl
WHERE public.contacts.location_id IS NULL 
  AND public.contacts.clinic_id = cl.clinic_id 
  AND cl.is_primary = true;
