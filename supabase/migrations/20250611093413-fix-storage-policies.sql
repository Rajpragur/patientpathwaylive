
-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Profile pictures are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Create new, simpler policies that work with the current auth system
CREATE POLICY "Allow authenticated users to upload profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Allow users to update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);
