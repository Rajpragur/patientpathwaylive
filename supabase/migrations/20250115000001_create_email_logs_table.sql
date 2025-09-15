-- Create email_logs table to track sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- sent, failed, pending
  resend_id TEXT, -- Resend email ID for tracking
  error_message TEXT, -- Error message if failed
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email logs
CREATE POLICY "Doctors can view their own email logs" 
  ON public.email_logs 
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert email logs" 
  ON public.email_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_doctor_id ON public.email_logs(doctor_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id ON public.email_logs(resend_id);
