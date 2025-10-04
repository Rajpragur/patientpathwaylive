-- Create social media management tables for doctors
-- This migration creates tables for managing social media accounts and posts

-- Create social_accounts table for storing connected social media accounts
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinic_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'youtube')),
  username TEXT,
  page_id TEXT, -- Facebook Page ID or Instagram Business Account ID
  access_token TEXT, -- Encrypted access token
  refresh_token TEXT, -- Encrypted refresh token
  connected BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}', -- Store platform-specific permissions
  expires_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(doctor_id, platform),
  UNIQUE(clinic_id, platform)
);

-- Create social_posts table for managing posts across platforms
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinic_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'youtube')),
  content TEXT NOT NULL,
  image_url TEXT,
  image_alt_text TEXT,
  hashtags TEXT[],
  mentions TEXT[],
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')),
  external_post_id TEXT, -- ID from Facebook/Instagram API
  external_url TEXT, -- URL of the published post
  error_message TEXT,
  engagement_stats JSONB DEFAULT '{}', -- Store likes, comments, shares, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social_post_platforms junction table for cross-platform posting
CREATE TABLE IF NOT EXISTS public.social_post_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'youtube')),
  external_post_id TEXT, -- Platform-specific post ID
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, platform)
);

-- Create social_media_templates table for reusable content templates
CREATE TABLE IF NOT EXISTS public.social_media_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinic_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('nose', 'snot', 'tnss', 'general', 'educational', 'promotional')),
  content TEXT NOT NULL,
  image_url TEXT,
  hashtags TEXT[],
  platforms TEXT[] DEFAULT '{"facebook", "instagram", "twitter", "linkedin", "youtube"}',
  is_public BOOLEAN DEFAULT false, -- Allow sharing templates across clinics
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_doctor_id ON public.social_accounts(doctor_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_clinic_id ON public.social_accounts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_connected ON public.social_accounts(connected);

CREATE INDEX IF NOT EXISTS idx_social_posts_doctor_id ON public.social_posts(doctor_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_clinic_id ON public.social_posts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON public.social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON public.social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_at ON public.social_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_published_at ON public.social_posts(published_at);

CREATE INDEX IF NOT EXISTS idx_social_post_platforms_post_id ON public.social_post_platforms(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_platforms_platform ON public.social_post_platforms(platform);
CREATE INDEX IF NOT EXISTS idx_social_post_platforms_status ON public.social_post_platforms(status);

CREATE INDEX IF NOT EXISTS idx_social_media_templates_doctor_id ON public.social_media_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_social_media_templates_clinic_id ON public.social_media_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_social_media_templates_category ON public.social_media_templates(category);
CREATE INDEX IF NOT EXISTS idx_social_media_templates_is_public ON public.social_media_templates(is_public);

-- Enable Row Level Security
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for social_accounts
CREATE POLICY "Users can view their own social accounts" 
  ON public.social_accounts 
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    ) OR clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage their own social accounts" 
  ON public.social_accounts 
  FOR ALL 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    ) OR clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Create RLS policies for social_posts
CREATE POLICY "Users can view their own social posts" 
  ON public.social_posts 
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    ) OR clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage their own social posts" 
  ON public.social_posts 
  FOR ALL 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    ) OR clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Create RLS policies for social_post_platforms
CREATE POLICY "Users can view their own post platforms" 
  ON public.social_post_platforms 
  FOR SELECT 
  USING (
    post_id IN (
      SELECT id FROM public.social_posts 
      WHERE doctor_id IN (
        SELECT id FROM public.doctor_profiles 
        WHERE user_id = auth.uid()
      ) OR clinic_id IN (
        SELECT clinic_id FROM public.clinic_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can manage their own post platforms" 
  ON public.social_post_platforms 
  FOR ALL 
  USING (
    post_id IN (
      SELECT id FROM public.social_posts 
      WHERE doctor_id IN (
        SELECT id FROM public.doctor_profiles 
        WHERE user_id = auth.uid()
      ) OR clinic_id IN (
        SELECT clinic_id FROM public.clinic_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Create RLS policies for social_media_templates
CREATE POLICY "Users can view their own templates and public templates" 
  ON public.social_media_templates 
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    ) OR clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_public = true
  );

CREATE POLICY "Users can manage their own templates" 
  ON public.social_media_templates 
  FOR ALL 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    ) OR clinic_id IN (
      SELECT clinic_id FROM public.clinic_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Add triggers to automatically update updated_at
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_templates_updated_at
  BEFORE UPDATE ON public.social_media_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.social_media_templates 
  SET usage_count = usage_count + 1 
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get platform-specific character limits
CREATE OR REPLACE FUNCTION get_platform_character_limit(platform_name TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE platform_name
    WHEN 'twitter' THEN RETURN 280;
    WHEN 'instagram' THEN RETURN 2200;
    WHEN 'facebook' THEN RETURN 63206;
    WHEN 'linkedin' THEN RETURN 3000;
    WHEN 'youtube' THEN RETURN 5000;
    ELSE RETURN 2200;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Insert some default templates for ENT practices
INSERT INTO public.social_media_templates (doctor_id, clinic_id, name, description, category, content, hashtags, is_public) 
SELECT 
  NULL as doctor_id,
  NULL as clinic_id,
  'NOSE Assessment Awareness' as name,
  'Template for promoting NOSE assessment quiz' as description,
  'nose' as category,
  'Struggling to breathe through your nose? Take our quick NOSE assessment to see if you may have nasal airway obstruction. It''s free and takes just 2 minutes! #NOSEQuiz #BreatheBetter #ENTHealth' as content,
  ARRAY['#NOSEQuiz', '#BreatheBetter', '#ENTHealth', '#NasalObstruction'] as hashtags,
  true as is_public
WHERE NOT EXISTS (SELECT 1 FROM public.social_media_templates WHERE name = 'NOSE Assessment Awareness');

INSERT INTO public.social_media_templates (doctor_id, clinic_id, name, description, category, content, hashtags, is_public) 
SELECT 
  NULL as doctor_id,
  NULL as clinic_id,
  'SNOT-22 Quiz Promotion' as name,
  'Template for promoting SNOT-22 sinus assessment' as description,
  'snot' as category,
  'Chronic sinus issues affecting your quality of life? Our SNOT-22 assessment helps evaluate how sinus problems impact your daily activities. Take the quiz to better understand your symptoms. #SNOT22 #SinusHealth #ChronicRhinosinusitis' as content,
  ARRAY['#SNOT22', '#SinusHealth', '#ChronicRhinosinusitis', '#ENTCare'] as hashtags,
  true as is_public
WHERE NOT EXISTS (SELECT 1 FROM public.social_media_templates WHERE name = 'SNOT-22 Quiz Promotion');

INSERT INTO public.social_media_templates (doctor_id, clinic_id, name, description, category, content, hashtags, is_public) 
SELECT 
  NULL as doctor_id,
  NULL as clinic_id,
  'General ENT Health Tip' as name,
  'Template for general ENT health education' as description,
  'educational' as category,
  'Did you know that proper nasal breathing is essential for good sleep quality? If you''re a mouth breather, you may be missing out on the benefits of nasal breathing. Contact us to learn about treatment options. #ENTHealth #SleepBetter #NasalBreathing' as content,
  ARRAY['#ENTHealth', '#SleepBetter', '#NasalBreathing', '#HealthTips'] as hashtags,
  true as is_public
WHERE NOT EXISTS (SELECT 1 FROM public.social_media_templates WHERE name = 'General ENT Health Tip');
