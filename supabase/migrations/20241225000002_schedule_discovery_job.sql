-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Add comment about required environment variables
COMMENT ON SCHEMA public IS 'Required environment variables for Mini App discovery:
- NEYNAR_API_KEY: For fetching Farcaster casts
- OPENRANK_API_KEY: For fetching top-ranked users (optional, has fallback)';

-- Schedule the Mini App discovery job to run every 24 hours at 2 AM UTC
-- This will call our Supabase Edge Function
SELECT cron.schedule(
  'mini-app-discovery-job',
  '0 2 * * *', -- Every day at 2 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/discovery-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'
  );
  $$
);

-- Also create a function to manually trigger the job
CREATE OR REPLACE FUNCTION trigger_mini_app_discovery()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/discovery-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION trigger_mini_app_discovery() TO authenticated; 