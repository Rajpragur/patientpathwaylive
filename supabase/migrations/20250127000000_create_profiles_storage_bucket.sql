-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to profiles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to profiles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update profiles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from profiles bucket" ON storage.objects;

-- Create very permissive policies for authenticated users
CREATE POLICY "Authenticated users can upload to profiles bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public read access to profiles bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Authenticated users can update profiles bucket" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete from profiles bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);
