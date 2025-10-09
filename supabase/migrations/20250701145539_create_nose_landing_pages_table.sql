
-- Create table for storing NOSE landing page content
CREATE TABLE public.nose_landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Struggling to Breathe Through Your Nose?',
  subtitle TEXT NOT NULL DEFAULT 'Take Our Quick "Nose Test" to See If You Have Nasal Airway Obstruction',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  chatbot_enabled BOOLEAN NOT NULL DEFAULT true,
  quiz_embedded BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.nose_landing_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for NOSE landing pages
CREATE POLICY "Allow public read access to landing pages" 
  ON public.nose_landing_pages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Doctors can manage their own landing pages" 
  ON public.nose_landing_pages 
  FOR ALL 
  USING (
    doctor_id IN (
      SELECT dp.id::text 
      FROM doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow creation of landing pages" 
  ON public.nose_landing_pages 
  FOR INSERT 
  WITH CHECK (
    doctor_id IN (
      SELECT dp.id::text 
      FROM doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    ) OR doctor_id = 'demo'
  );

