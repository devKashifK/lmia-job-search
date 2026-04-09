-- Update the agency-resumes bucket to be public
-- This allows the public URLs generated during upload to be accessible by consultants
-- while still keeping the namespaced folder structure for organization.

UPDATE storage.buckets 
SET public = true 
WHERE id = 'agency-resumes';

-- Ensure it exists just in case the previous migration didn't run or failed
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-resumes', 'agency-resumes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Update RLS to allow public read but restricted write
-- Allow anyone to read (SELECT) since it's now a public bucket
DROP POLICY IF EXISTS "Public View Resumes" ON storage.objects;
CREATE POLICY "Public View Resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'agency-resumes');

-- Maintain strict ownership for uploads/updates/deletes
DROP POLICY IF EXISTS "Agencies can upload their own resumes" ON storage.objects;
CREATE POLICY "Agencies can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'agency-resumes' AND 
    (name LIKE (auth.uid()::text || '/%'))
);

DROP POLICY IF EXISTS "Agencies can delete their own resumes" ON storage.objects;
CREATE POLICY "Agencies can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'agency-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
