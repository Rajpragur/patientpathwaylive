
-- Create social_accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    username TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    connected BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_domains table
CREATE TABLE IF NOT EXISTS email_domains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    landing_page_url TEXT,
    verification_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create automation_webhooks table
CREATE TABLE IF NOT EXISTS automation_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    webhook_url TEXT NOT NULL,
    webhook_type TEXT NOT NULL DEFAULT 'zapier',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_social_accounts_doctor_id ON social_accounts(doctor_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_email_domains_doctor_id ON email_domains(doctor_id);
CREATE INDEX idx_automation_webhooks_doctor_id ON automation_webhooks(doctor_id);

-- Enable RLS
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_webhooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own social accounts" ON social_accounts
    FOR ALL USING (auth.uid() = doctor_id);

CREATE POLICY "Users can manage their own email domains" ON email_domains
    FOR ALL USING (auth.uid() = doctor_id);

CREATE POLICY "Users can manage their own webhooks" ON automation_webhooks
    FOR ALL USING (auth.uid() = doctor_id);
