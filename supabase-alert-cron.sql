-- Job Maze: Supabase Daily Email Alerts Cron Job
-- INSTRUCTIONS: Run this in your Supabase SQL Editor

-- 1. Ensure the pg_net and pg_cron extensions are enabled
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- 2. Schedule the API call to run once a day at 8:00 AM UTC
-- NOTE: Replace 'https://your-production-url.com' with your actual domain
-- NOTE: Replace 'YOUR_SUPER_SECRET_CRON_TOKEN' with the value you set in your .env file for CRON_SECRET

select cron.schedule(
  'daily-job-alerts', -- The unique name of the cron job
  '0 8 * * *',        -- Cron schedule: Run at 8:00 AM UTC every day
  $$
    select net.http_post(
      url:='https://your-production-url.com/api/cron/send-alerts',
      headers:='{"Authorization": "Bearer YOUR_SUPER_SECRET_CRON_TOKEN", "Content-Type": "application/json"}'::jsonb
    );
  $$
);

-- ==========================================
-- Helpful Utilities (Do not run these unless you need to)
-- ==========================================

-- To see all your scheduled cron jobs:
-- select * from cron.job;

-- To unschedule/delete this job if you need to stop it or change the URL:
-- select cron.unschedule('daily-job-alerts');

-- To view logs of successful/failed cron executions:
-- select * from cron.job_run_details order by start_time desc limit 10;
