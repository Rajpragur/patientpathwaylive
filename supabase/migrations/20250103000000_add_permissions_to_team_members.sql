-- Add permissions system to existing team_members table
-- This allows role-based access control without migrating to clinic structure yet

-- Add role and permissions columns to team_members
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"leads": false, "content": false, "payments": false, "team": false}';

-- Update existing team members to have appropriate permissions based on their role
-- Staff members get no permissions by default
-- We'll update owners and managers separately

-- Create function to set permissions based on role
CREATE OR REPLACE FUNCTION set_team_member_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default permissions based on role
  IF NEW.role = 'owner' THEN
    NEW.permissions = '{"leads": true, "content": true, "payments": true, "team": true}';
  ELSIF NEW.role = 'manager' THEN
    NEW.permissions = '{"leads": true, "content": true, "payments": false, "team": false}';
  ELSIF NEW.role = 'staff' THEN
    NEW.permissions = '{"leads": false, "content": false, "payments": false, "team": false}';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set permissions based on role
DROP TRIGGER IF EXISTS trigger_set_team_member_permissions ON public.team_members;
CREATE TRIGGER trigger_set_team_member_permissions
  BEFORE INSERT OR UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION set_team_member_permissions();

-- Update existing records to have proper roles and permissions
-- Find the doctor (owner) for each team
UPDATE public.team_members 
SET role = 'owner', permissions = '{"leads": true, "content": true, "payments": true, "team": true}'
WHERE doctor_id IN (
  SELECT id FROM public.doctor_profiles WHERE user_id IS NOT NULL
);

-- Set all other team members to 'staff' role with no permissions by default
UPDATE public.team_members 
SET role = 'staff', permissions = '{"leads": false, "content": false, "payments": false, "team": false}'
WHERE role IS NULL OR role = 'team_member';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_permissions ON public.team_members USING GIN(permissions);

-- Add comment explaining the permissions system
COMMENT ON COLUMN public.team_members.role IS 'Role of the team member: owner (full access), manager (leads+content), staff (customizable)';
COMMENT ON COLUMN public.team_members.permissions IS 'JSON object defining what the team member can access: {"leads": boolean, "content": boolean, "payments": boolean, "team": boolean}';
