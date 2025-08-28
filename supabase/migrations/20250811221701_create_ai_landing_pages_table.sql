-- Create table for storing AI-generated landing page content
CREATE TABLE public.ai_landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  chatbot_colors JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.ai_landing_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for AI landing pages
CREATE POLICY "Allow public read access to AI landing pages" 
  ON public.ai_landing_pages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Doctors can manage their own AI landing pages" 
  ON public.ai_landing_pages 
  FOR ALL 
  USING (
    doctor_id IN (
      SELECT dp.id::text 
      FROM doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow creation of AI landing pages" 
  ON public.ai_landing_pages 
  FOR INSERT 
  WITH CHECK (
    doctor_id IN (
      SELECT dp.id::text 
      FROM doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    ) OR doctor_id = 'demo'
  );

-- Create unique constraint on doctor_id
CREATE UNIQUE INDEX ai_landing_pages_doctor_id_idx ON public.ai_landing_pages (doctor_id);
