-- Create a new storage bucket for resumes if it doesn't exist
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Policy: Allow authenticated users to upload their own resume
create policy "Authenticated users can upload resumes"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resumes' and
  auth.uid() = owner
);

-- Policy: Authenticated users can select (view) resumes
create policy "Authenticated users can view resumes"
on storage.objects for select
to authenticated
using ( bucket_id = 'resumes' );

-- Policy: Users can update their own resume
create policy "Users can update own resume"
on storage.objects for update
to authenticated
using ( bucket_id = 'resumes' and auth.uid() = owner );

-- Policy: Users can delete their own resume
create policy "Users can delete own resume"
on storage.objects for delete
to authenticated
using ( bucket_id = 'resumes' and auth.uid() = owner );
