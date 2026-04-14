-- Create agency-logos bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for agency-logos
-- 1. Allow public read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'agency-logos');

-- 2. Allow agencies to upload their own logos
CREATE POLICY "Agencies can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'agency-logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow agencies to update their own logos
CREATE POLICY "Agencies can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'agency-logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow agencies to delete their own logos
CREATE POLICY "Agencies can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'agency-logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
