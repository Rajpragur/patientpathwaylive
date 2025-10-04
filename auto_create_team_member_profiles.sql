-- Create a trigger function to automatically create doctor profiles for team members
-- This ensures that whenever a team member is linked, they get a proper doctor profile

-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION auto_create_team_member_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when linked_user_id is set and status is 'accepted'
  IF NEW.linked_user_id IS NOT NULL AND NEW.status = 'accepted' THEN
    
    -- Check if doctor profile already exists for this email
    IF NOT EXISTS (
      SELECT 1 FROM public.doctor_profiles 
      WHERE email = NEW.email
    ) THEN
      
      -- Get the main doctor's profile information
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
        NEW.linked_user_id,
        COALESCE(NEW.first_name, 'Team') as first_name,
        COALESCE(NEW.last_name, 'Member') as last_name,
        NEW.email,
        dp_main.doctor_id,
        dp_main.clinic_name,
        dp_main.location,
        dp_main.phone,
        dp_main.mobile,
        dp_main.logo_url,
        dp_main.providers,
        true as access_control,
        CASE WHEN NEW.role = 'staff' THEN true ELSE false END as is_staff,
        CASE WHEN NEW.role = 'manager' THEN true ELSE false END as is_manager,
        dp_main.id as doctor_id_clinic,
        NOW() as created_at,
        NOW() as updated_at
      FROM public.doctor_profiles dp_main
      WHERE dp_main.id = NEW.doctor_id;
      
      RAISE NOTICE 'Created doctor profile for team member: %', NEW.email;
      
    ELSE
      -- Update existing profile with correct role flags
      UPDATE public.doctor_profiles 
      SET 
        is_staff = CASE WHEN NEW.role = 'staff' THEN true ELSE false END,
        is_manager = CASE WHEN NEW.role = 'manager' THEN true ELSE false END,
        doctor_id_clinic = (SELECT id FROM public.doctor_profiles WHERE id = NEW.doctor_id),
        access_control = true,
        updated_at = NOW()
      WHERE email = NEW.email;
      
      RAISE NOTICE 'Updated doctor profile for team member: %', NEW.email;
      
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_create_team_member_profile ON public.team_members;
CREATE TRIGGER trigger_auto_create_team_member_profile
  AFTER UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_team_member_profile();

-- Step 3: Test the trigger by updating an existing team member
-- (This is just for testing - you can remove this section)
/*
-- Example test (uncomment to test):
UPDATE public.team_members 
SET linked_user_id = 'test-user-id', status = 'accepted'
WHERE email = 'test@example.com';
*/

-- Step 4: Show current trigger status
SELECT 
  'Trigger Status' as info,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_auto_create_team_member_profile';
