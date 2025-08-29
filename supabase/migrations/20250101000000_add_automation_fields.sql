-- Add automation-related fields to lead_communications table
ALTER TABLE lead_communications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for better performance on metadata queries
CREATE INDEX IF NOT EXISTS idx_lead_communications_metadata ON lead_communications USING GIN (metadata);

-- Add index for communication type and status
CREATE INDEX IF NOT EXISTS idx_lead_communications_type_status ON lead_communications(communication_type, status);

-- Update existing records to have created_at and updated_at
UPDATE lead_communications 
SET created_at = COALESCE(sent_at, NOW()), 
    updated_at = COALESCE(sent_at, NOW())
WHERE created_at IS NULL;

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_lead_communications_updated_at ON lead_communications;
CREATE TRIGGER update_lead_communications_updated_at
    BEFORE UPDATE ON lead_communications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
