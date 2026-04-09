-- Refined RLS policies for Agency Resumes bucket
-- This ensures Agencies can upload and manage their own client resumes

-- 1. Ensure bucket is public = false (already set, but good to be sure)
UPDATE storage.buckets SET public = false WHERE id = 'agency-resumes';

-- 2. Drop all potential variations of the policies to avoid conflicts
DROP POLICY IF EXISTS "Agencies can only access their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Agencies can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Agencies can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Agencies can delete their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Agencies can update their own resumes" ON storage.objects;

-- 3. Create granular policies for better control
-- ALLOW INSERT: Agencies can upload to their own folder
CREATE POLICY "Agencies can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'agency-resumes' AND 
    (name LIKE (auth.uid()::text || '/%'))
);

-- ALLOW SELECT: Agencies can view their own resumes
CREATE POLICY "Agencies can view their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'agency-resumes' AND 
    (name LIKE (auth.uid()::text || '/%'))
);

-- ALLOW DELETE: Agencies can remove their own resumes
CREATE POLICY "Agencies can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'agency-resumes' AND 
    (name LIKE (auth.uid()::text || '/%'))
);

-- ALLOW UPDATE: Agencies can replace their own resumes
CREATE POLICY "Agencies can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'agency-resumes' AND 
    (name LIKE (auth.uid()::text || '/%'))
);
