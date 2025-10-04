-- Create clinic_profiles table (replaces the concept of individual doctor offices)
CREATE TABLE IF NOT EXISTS public.clinic_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name TEXT NOT NULL,
  clinic_slug TEXT UNIQUE, -- URL-friendly identifier
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#FF6B35',
  secondary_color TEXT DEFAULT '#0E7C9D',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create clinic_locations table for multi-location support
CREATE TABLE IF NOT EXISTS public.clinic_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinic_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Main Office", "Downtown Branch"
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinic_members table (replaces team_members with enhanced role system)
CREATE TABLE IF NOT EXISTS public.clinic_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinic_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for pending invitations
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  permissions JSONB DEFAULT '{"leads": true, "content": true, "payments": false, "team": false}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'declined')),
  invited_by UUID REFERENCES auth.users(id),
  invitation_token TEXT UNIQUE,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure only one active member per email per clinic
  UNIQUE(clinic_id, email)
);

-- Create clinic_member_locations junction table for location-based access
CREATE TABLE IF NOT EXISTS public.clinic_member_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_member_id UUID NOT NULL REFERENCES public.clinic_members(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.clinic_locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_member_id, location_id)
);

-- Add clinic_id to existing tables (we'll migrate data later)
-- First, add the column as nullable
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);
ALTER TABLE public.quiz_leads ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);
ALTER TABLE public.custom_quizzes ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);
ALTER TABLE public.social_accounts ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);
ALTER TABLE public.doctor_notifications ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);
ALTER TABLE public.automation_webhooks ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);
ALTER TABLE public.email_domains ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);
ALTER TABLE public.nose_landing_pages ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);
ALTER TABLE public.quiz_incidents ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);
ALTER TABLE public.ai_landing_pages ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic_profiles(id);

-- Add location_id to relevant tables
ALTER TABLE public.quiz_leads ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.clinic_locations(id);
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.clinic_locations(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinic_profiles_created_by ON public.clinic_profiles(created_by);
CREATE INDEX IF NOT EXISTS idx_clinic_profiles_slug ON public.clinic_profiles(clinic_slug);
CREATE INDEX IF NOT EXISTS idx_clinic_locations_clinic_id ON public.clinic_locations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_locations_primary ON public.clinic_locations(clinic_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON public.clinic_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON public.clinic_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_email ON public.clinic_members(email);
CREATE INDEX IF NOT EXISTS idx_clinic_members_role ON public.clinic_members(clinic_id, role);
CREATE INDEX IF NOT EXISTS idx_clinic_members_status ON public.clinic_members(status);
CREATE INDEX IF NOT EXISTS idx_clinic_members_invitation_token ON public.clinic_members(invitation_token);
CREATE INDEX IF NOT EXISTS idx_clinic_member_locations_member ON public.clinic_member_locations(clinic_member_id);
CREATE INDEX IF NOT EXISTS idx_clinic_member_locations_location ON public.clinic_member_locations(location_id);

-- Create partial unique index to ensure only one owner per clinic
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinic_members_one_owner_per_clinic 
ON public.clinic_members(clinic_id) 
WHERE role = 'owner';

-- Add clinic_id indexes to existing tables
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_clinic_id ON public.doctor_profiles(clinic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_clinic_id ON public.quiz_leads(clinic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_location_id ON public.quiz_leads(location_id);
CREATE INDEX IF NOT EXISTS idx_custom_quizzes_clinic_id ON public.custom_quizzes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_contacts_clinic_id ON public.contacts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_contacts_location_id ON public.contacts(location_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_clinic_id ON public.social_accounts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notifications_clinic_id ON public.doctor_notifications(clinic_id);
CREATE INDEX IF NOT EXISTS idx_automation_webhooks_clinic_id ON public.automation_webhooks(clinic_id);
CREATE INDEX IF NOT EXISTS idx_email_domains_clinic_id ON public.email_domains(clinic_id);
CREATE INDEX IF NOT EXISTS idx_nose_landing_pages_clinic_id ON public.nose_landing_pages(clinic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_incidents_clinic_id ON public.quiz_incidents(clinic_id);
CREATE INDEX IF NOT EXISTS idx_ai_landing_pages_clinic_id ON public.ai_landing_pages(clinic_id);

-- Enable Row Level Security
ALTER TABLE public.clinic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_member_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clinic_profiles
CREATE POLICY "Users can view clinics they are members of" 
  ON public.clinic_profiles 
  FOR SELECT 
  USING (
    id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update clinics they own or manage" 
  ON public.clinic_profiles 
  FOR UPDATE 
  USING (
    id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Users can create clinics" 
  ON public.clinic_profiles 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- Create RLS policies for clinic_locations
CREATE POLICY "Users can view locations of their clinics" 
  ON public.clinic_locations 
  FOR SELECT 
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage locations of clinics they own or manage" 
  ON public.clinic_locations 
  FOR ALL 
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'manager')
    )
  );

-- Create RLS policies for clinic_members
CREATE POLICY "Users can view members of their clinics" 
  ON public.clinic_members 
  FOR SELECT 
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Owners and managers can invite members" 
  ON public.clinic_members 
  FOR INSERT 
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Owners and managers can update member roles and permissions" 
  ON public.clinic_members 
  FOR UPDATE 
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Users can update their own member record" 
  ON public.clinic_members 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Owners can remove members" 
  ON public.clinic_members 
  FOR DELETE 
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role = 'owner'
    )
  );

-- Create RLS policies for clinic_member_locations
CREATE POLICY "Users can view location assignments for their clinics" 
  ON public.clinic_member_locations 
  FOR SELECT 
  USING (
    clinic_member_id IN (
      SELECT cm.id FROM public.clinic_members cm
      WHERE cm.clinic_id IN (
        SELECT clinic_id FROM public.clinic_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Owners and managers can assign locations to members" 
  ON public.clinic_member_locations 
  FOR ALL 
  USING (
    clinic_member_id IN (
      SELECT cm.id FROM public.clinic_members cm
      WHERE cm.clinic_id IN (
        SELECT clinic_id FROM public.clinic_members 
        WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'manager')
      )
    )
  );

-- Add triggers to automatically update updated_at
CREATE TRIGGER update_clinic_profiles_updated_at
  BEFORE UPDATE ON public.clinic_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_locations_updated_at
  BEFORE UPDATE ON public.clinic_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_members_updated_at
  BEFORE UPDATE ON public.clinic_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate clinic slug
CREATE OR REPLACE FUNCTION generate_clinic_slug(clinic_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  base_slug := lower(regexp_replace(clinic_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check if slug exists and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.clinic_profiles WHERE clinic_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-create primary location when clinic is created
CREATE OR REPLACE FUNCTION create_primary_location()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clinic_locations (clinic_id, name, is_primary)
  VALUES (NEW.id, 'Main Office', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_primary_location_trigger
  AFTER INSERT ON public.clinic_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_primary_location();

-- Create function to set clinic_slug automatically
CREATE OR REPLACE FUNCTION set_clinic_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clinic_slug IS NULL THEN
    NEW.clinic_slug := generate_clinic_slug(NEW.clinic_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_clinic_slug_trigger
  BEFORE INSERT ON public.clinic_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_clinic_slug();
