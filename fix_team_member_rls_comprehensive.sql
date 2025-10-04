-- Comprehensive fix for team member RLS policies
-- This will fix the API key error and allow team members to update their profiles

-- 1. First, check what policies currently exist
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

-- 2. Drop ALL existing policies on doctor_profiles to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can manage their own doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can insert their own doctor profiles" ON public.doctor_profiles;

-- 3. Create a single, comprehensive policy for doctor_profiles
CREATE POLICY "Users can manage their own doctor profiles" ON public.doctor_profiles
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Verify the new policy
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'doctor_profiles' 
  AND policyname = 'Users can manage their own doctor profiles';

-- 5. Test that team members can update their profiles
-- (This will be tested when the user tries to save their name)

-- 6. Optional: Check if there are any team member specific constraints
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'doctor_profiles'
  AND tc.constraint_type IN ('CHECK', 'FOREIGN KEY')
ORDER BY tc.constraint_type, tc.constraint_name;
