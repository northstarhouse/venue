-- Schedules process-venue-pipeline to run every 15 minutes, same pattern as
-- the existing send-scheduled-volunteer-emails cron job.
--
-- NOTE: replace <SERVICE_ROLE_KEY> below with the project's actual service_role
-- key from Supabase Settings > API before running. Never commit the real key —
-- this repo is public. (Already applied to the live database as job id 2;
-- this file exists for reference/reruns only.)

select cron.schedule(
  'process-venue-pipeline',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://uvzwhhwzelaelfhfkvdb.supabase.co/functions/v1/process-venue-pipeline',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);
