-- Create table for storing email connections
CREATE TABLE public.email_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  email_provider TEXT NOT NULL, -- 'gmail', 'outlook', 'smtp'
  email_address TEXT NOT NULL,
  display_name TEXT,
  access_token TEXT, -- Encrypted OAuth access token
  refresh_token TEXT, -- Encrypted OAuth refresh token
  expires_at TIMESTAMP WITH TIME ZONE,
  smtp_config JSONB, -- For SMTP connections: host, port, username, password
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one active connection per doctor per email
  CONSTRAINT unique_active_email_per_doctor 
    UNIQUE (doctor_id, email_address)
);

-- Add Row Level Security
ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for email connections
CREATE POLICY "Doctors can manage their own email connections" 
  ON public.email_connections 
  FOR ALL 
  USING (
    doctor_id IN (
      SELECT dp.id::text 
      FROM doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

-- Create table for email templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type TEXT NOT NULL DEFAULT 'quiz_invitation', -- 'quiz_invitation', 'follow_up', 'reminder'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for email templates
CREATE POLICY "Doctors can manage their own email templates" 
  ON public.email_templates 
  FOR ALL 
  USING (
    doctor_id IN (
      SELECT dp.id::text 
      FROM doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

-- Create table for email campaigns
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  quiz_id TEXT,
  template_id UUID REFERENCES public.email_templates(id),
  recipient_list JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of email addresses
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sending', 'sent', 'failed'
  sent_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for email campaigns
CREATE POLICY "Doctors can manage their own email campaigns" 
  ON public.email_campaigns 
  FOR ALL 
  USING (
    doctor_id IN (
      SELECT dp.id::text 
      FROM doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

-- Create table for email logs
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  campaign_id UUID REFERENCES public.email_campaigns(id),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Add Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email logs
CREATE POLICY "Doctors can view their own email logs" 
  ON public.email_logs 
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT dp.id::text 
      FROM doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_email_connections_doctor_id ON public.email_connections(doctor_id);
CREATE INDEX idx_email_connections_email_address ON public.email_connections(email_address);
CREATE INDEX idx_email_templates_doctor_id ON public.email_templates(doctor_id);
CREATE INDEX idx_email_campaigns_doctor_id ON public.email_campaigns(doctor_id);
CREATE INDEX idx_email_logs_doctor_id ON public.email_logs(doctor_id);
CREATE INDEX idx_email_logs_campaign_id ON public.email_logs(campaign_id);
CREATE INDEX idx_email_logs_recipient_email ON public.email_logs(recipient_email);

-- Create partial unique index to ensure one active connection per doctor per email
CREATE UNIQUE INDEX idx_email_connections_unique_active 
  ON public.email_connections(doctor_id, email_address) 
  WHERE is_active = true;
