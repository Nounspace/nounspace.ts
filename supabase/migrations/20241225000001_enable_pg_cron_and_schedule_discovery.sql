-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to run the Mini App discovery
CREATE OR REPLACE FUNCTION run_mini_app_discovery()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response text;
  url text;
BEGIN
  -- Get the Supabase URL from environment or use a default
  -- In production, you'd want to get this from environment variables
  url := 'https://your-project-ref.supabase.co/functions/v1/discovery-scheduler';
  
  -- Make HTTP request to trigger the Edge Function
  -- Note: This requires the http extension to be enabled
  -- SELECT http_post(
  --   url,
  --   '{"scheduled": true}',
  --   'application/json'
  -- );
  
  -- For now, we'll just log that the job was triggered
  -- In production, you'd enable the http extension and uncomment the above
  INSERT INTO discovery_runs (
    status,
    started_at,
    total_casts_processed,
    total_domains_found,
    new_apps_discovered,
    existing_apps_updated,
    validation_errors,
    config
  ) VALUES (
    'scheduled',
    NOW(),
    0,
    0,
    0,
    0,
    0,
    '{"scheduled": true, "source": "pg_cron", "note": "HTTP call disabled - enable http extension for full functionality"}'
  );
  
  RAISE NOTICE 'Mini App discovery scheduled job triggered';
END;
$$;

-- Schedule the job to run every 24 hours at 2 AM UTC
SELECT cron.schedule(
  'mini-app-discovery-daily',
  '0 2 * * *', -- Every day at 2 AM UTC
  'SELECT run_mini_app_discovery();'
);

-- Also schedule a more frequent job for testing (every 6 hours)
-- You can remove this in production
SELECT cron.schedule(
  'mini-app-discovery-test',
  '0 */6 * * *', -- Every 6 hours
  'SELECT run_mini_app_discovery();'
);

-- Create a view to monitor scheduled jobs
CREATE OR REPLACE VIEW scheduled_discovery_jobs AS
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
WHERE command LIKE '%run_mini_app_discovery%';

-- Create a function to manually trigger discovery (for testing)
CREATE OR REPLACE FUNCTION trigger_mini_app_discovery()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM run_mini_app_discovery();
  RAISE NOTICE 'Mini App discovery triggered manually';
END;
$$; 