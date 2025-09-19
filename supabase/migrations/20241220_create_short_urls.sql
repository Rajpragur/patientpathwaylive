-- Create short_urls table for custom URL shortening
CREATE TABLE IF NOT EXISTS short_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code TEXT UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  click_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_short_urls_short_code ON short_urls(short_code);
CREATE INDEX IF NOT EXISTS idx_short_urls_long_url ON short_urls(long_url);

-- Enable RLS
ALTER TABLE short_urls ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for redirects)
CREATE POLICY "Allow public read access for redirects" ON short_urls
  FOR SELECT USING (true);

-- Create policy for authenticated users to create short URLs
CREATE POLICY "Allow authenticated users to create short URLs" ON short_urls
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for users to manage their own short URLs
CREATE POLICY "Users can manage their own short URLs" ON short_urls
  FOR ALL USING (auth.uid() = created_by);

-- Create function to increment click count
CREATE OR REPLACE FUNCTION increment(x INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN x + 1;
END;
$$ LANGUAGE plpgsql;
