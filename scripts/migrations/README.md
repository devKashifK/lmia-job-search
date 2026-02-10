# Database Migrations

This directory contains SQL migration files for the Job Recommendation System.

## Running Migrations

### Option 1: Supabase CLI (if using local Supabase)
```bash
# If you have Supabase CLI setup
npx supabase migration new create_recommendation_tables

# Or run directly via psql
psql $DATABASE_URL < scripts/migrations/001_create_user_preferences.sql
psql $DATABASE_URL < scripts/migrations/002_create_job_recommendations.sql
psql $DATABASE_URL < scripts/migrations/003_enhance_searches_table.sql
```

### Option 2: Supabase Dashboard (recommended for hosted Supabase)
1. Go to https://app.supabase.com
2. Select your project
3. Go to "SQL Editor"
4. Create a new query
5. Copy and paste the SQL from each migration file
6. Execute the queries in order:
   - `001_create_user_preferences.sql` (required)
   - `002_create_job_recommendations.sql` (required)
   - `003_enhance_searches_table.sql` (optional but recommended)

### Option 3: Direct Database Connection
```bash
# Using your database credentials
psql -h <host> -U <user> -d <database> -f scripts/migrations/001_create_user_preferences.sql
psql -h <host> -U <user> -d <database> -f scripts/migrations/002_create_job_recommendations.sql
psql -h <host> -U <user> -d <database> -f scripts/migrations/003_enhance_searches_table.sql
```

## Migration Files

### 001_create_user_preferences.sql (REQUIRED)
Creates the `user_preferences` table to store user job preferences including:
- Preferred job titles
- Preferred locations
- Industries
- Salary range
- Work authorization
- Remote preference
- Experience level
- Company size preferences

### 002_create_job_recommendations.sql (REQUIRED)
Creates the `job_recommendations` table to cache generated recommendations with:
- Recommendation scores (0-1)
- Reasons for recommendation
- Job source tracking
- Automatic cleanup function for old recommendations

### 003_enhance_searches_table.sql (OPTIONAL)
Enhances the existing `searches` table with:
- `filters` column (JSONB) - tracks applied search filters
- `results_count` column - tracks number of results
- Additional indexes for performance

## Verification

After running migrations, verify with:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_preferences', 'job_recommendations');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_preferences', 'job_recommendations');

-- Check columns were added to searches (if you ran migration 003)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'searches';
```

## Rollback

If you need to rollback these migrations:

```sql
-- Drop tables (in reverse order)
DROP TABLE IF EXISTS job_recommendations CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Remove columns from searches (if added)
ALTER TABLE searches DROP COLUMN IF EXISTS filters;
ALTER TABLE searches DROP COLUMN IF EXISTS results_count;
```
