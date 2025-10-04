-- Create oauth_states table for OAuth flow state management
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT UNIQUE NOT NULL,
  doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'youtube')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON public.oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_doctor_id ON public.oauth_states(doctor_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON public.oauth_states(expires_at);

-- Enable Row Level Security
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for oauth_states
CREATE POLICY "System can manage oauth states" 
  ON public.oauth_states 
  FOR ALL 
  USING (true);

-- Create function to clean up expired states (call this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.oauth_states 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
