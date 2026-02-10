JobMaze Database Workflow (Self-Hosted Supabase on VPS)

This document explains how we manage database migrations, RPC/function backups, and weekly full backups (schema + data) for the JobMaze self-hosted Supabase instance.

VPS + DB Info (current)

VPS: root@66.116.206.132

Postgres container: supabase-db

Database: postgres

User: postgres

Folder Structure
db/
  jobmaze/
    migrations/     # incremental DB changes (SQL) that we apply to VPS
    snapshots/      # RPC/function backups (exported definitions)
    backups/        # FULL backups (schema + data) as .dump files
scripts/
  remote-apply-jobmaze.sh
  remote-backup-jobmaze.sh
  remote-weekly-full-backup-jobmaze.sh

1) Apply DB migrations to VPS (tables, columns, indexes, policies, RPCs, etc.)
Rules

✅ Always create a new migration file for changes
❌ Do not edit an already-applied migration file

Create a new migration

Example:

touch db/jobmaze/migrations/002_add_new_rpc.sql


Put your SQL inside (example):

CREATE TABLE / ALTER TABLE

CREATE OR REPLACE FUNCTION ...

GRANT EXECUTE ON FUNCTION ... TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

Apply migrations to VPS

From repo root on your Mac:

VPS="root@66.116.206.132" ./scripts/remote-apply-jobmaze.sh

What happens internally

Ensures public.schema_migrations table exists

Runs each db/jobmaze/migrations/*.sql file only once

Marks each applied migration in public.schema_migrations

Commit migration to GitHub
git add db/jobmaze/migrations
git commit -m "Add migration 002: ..."
git push

2) Backup RPC / Function definitions (export existing RPCs to local repo)

This is a definitions snapshot (easy to store and diff). It exports all functions in public schema.

Run RPC backup
VPS="root@66.116.206.132" ./scripts/remote-backup-jobmaze.sh

Output

Creates a file like:

db/jobmaze/snapshots/functions_YYYYMMDD_HHMMSS.sql

Commit snapshot (optional but recommended)
git add db/jobmaze/snapshots
git commit -m "Backup JobMaze RPC functions snapshot"
git push


Note: snapshots/ is for backup/reference. Don’t apply snapshots as migrations unless you intentionally want to restore definitions.

3) Weekly FULL Backup (schema + data) with auto-deletion of old backups

This creates a full Postgres dump (schema + data) using:

pg_dump -Fc (custom format)

saved locally to db/jobmaze/backups

automatically keeps only latest KEEP backups and deletes older ones (local machine only)

Run manual full backup
VPS="root@66.116.206.132" KEEP=6 ./scripts/remote-weekly-full-backup-jobmaze.sh

Output

Creates a file like:

db/jobmaze/backups/jobmaze_full_2026-02-10_10-54-31.dump

Retention

KEEP=6 means keep the last 6 backups

Old backups are deleted from your Mac only after backups exceed KEEP

To quickly test deletion works

Run twice with KEEP=1:

VPS="root@66.116.206.132" KEEP=1 ./scripts/remote-weekly-full-backup-jobmaze.sh
VPS="root@66.116.206.132" KEEP=1 ./scripts/remote-weekly-full-backup-jobmaze.sh


After the 2nd run, only the newest file remains.

4) Schedule Weekly Backup (cron on Mac)
Find your repo path
pwd

Edit crontab
crontab -e

Add a weekly schedule (example: Sunday 3:30 AM)

Replace /ABSOLUTE/PATH/TO/lmia-job-search with your repo path:

30 3 * * 0 cd /ABSOLUTE/PATH/TO/lmia-job-search && VPS="root@66.116.206.132" KEEP=6 ./scripts/remote-weekly-full-backup-jobmaze.sh >> db/jobmaze/backups/backup.log 2>&1

5) Restore from FULL Backup (schema + data)

⚠️ Restoring into your main DB can overwrite current data. Always test restore first.

A) Safe restore test (recommended)
1) Create a test DB
ssh root@66.116.206.132 "docker exec -i supabase-db psql -U postgres -d postgres -c 'drop database if exists jobmaze_restore_test; create database jobmaze_restore_test;'"

2) Restore dump into test DB
cat db/jobmaze/backups/jobmaze_full_YYYY-MM-DD_HH-MM-SS.dump | \
ssh root@66.116.206.132 "docker exec -i supabase-db pg_restore -U postgres -d jobmaze_restore_test --clean --if-exists"

3) Verify key tables

(Replace table names if needed)

ssh root@66.116.206.132 "docker exec -i supabase-db psql -U postgres -d jobmaze_restore_test -c \"
select
  (select count(*) from public.trending_job) as trending_job,
  (select count(*) from public.lmia) as lmia;
\""

B) Restore into main DB (use with care)
cat db/jobmaze/backups/jobmaze_full_YYYY-MM-DD_HH-MM-SS.dump | \
ssh root@66.116.206.132 "docker exec -i supabase-db pg_restore -U postgres -d postgres --clean --if-exists"

6) Quick Troubleshooting
“No migrations found…”

Check:

ls -la db/jobmaze/migrations


You must have *.sql files there.

RPC not found / 404 from frontend

Ensure your migration includes:

GRANT EXECUTE ON FUNCTION public.your_function_name(args...) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';

Backup file looks wrong

Check it’s a real Postgres dump:

file db/jobmaze/backups/jobmaze_full_*.dump


Should say: PostgreSQL custom database dump

7) Recommended Git strategy

✅ Always commit:

db/jobmaze/migrations/

scripts/

⚠️ Be careful committing:

db/jobmaze/backups/*.dump (can get big fast)

Best practice:

keep .dump files locally + optionally upload to Drive/S3

commit only small reference snapshots if needed

If you want, I can also paste the final versions of your three scripts (remote-apply-jobmaze.sh, remote-backup-jobmaze.sh, remote-weekly-full-backup-jobmaze.sh) into one place so the doc is fully self-contained.