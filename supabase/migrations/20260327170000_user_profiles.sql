-- Migrate large profile fields from auth.users.raw_user_meta_data to public.user_profiles
create table if not exists public.user_profiles (
  user_id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  location text,
  website text,
  linkedin text,
  position text,
  company text,
  bio text,
  experience text,
  skills text,
  education text,
  work_history text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Policies
do $$
begin
    if not exists (
        select 1 from pg_policies where tablename = 'user_profiles' and policyname = 'Users can see their own profile'
    ) then
        create policy "Users can see their own profile"
          on public.user_profiles for select
          using ( auth.uid() = user_id );
    end if;

    if not exists (
        select 1 from pg_policies where tablename = 'user_profiles' and policyname = 'Users can insert their own profile'
    ) then
        create policy "Users can insert their own profile"
          on public.user_profiles for insert
          with check ( auth.uid() = user_id );
    end if;

    if not exists (
        select 1 from pg_policies where tablename = 'user_profiles' and policyname = 'Users can update their own profile'
    ) then
        create policy "Users can update their own profile"
          on public.user_profiles for update
          using ( auth.uid() = user_id );
    end if;
end $$;

-- Function to handle updated_at
create or replace function public.handle_profile_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
drop trigger if exists set_profile_updated_at on public.user_profiles;
create trigger set_profile_updated_at
  before update on public.user_profiles
  for each row
  execute procedure public.handle_profile_updated_at();
