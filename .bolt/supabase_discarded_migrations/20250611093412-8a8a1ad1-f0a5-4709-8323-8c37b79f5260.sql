
-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true);

-- Create policy to allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow everyone to view profile pictures (public bucket)
CREATE POLICY "Profile pictures are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

-- Create policy to allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
