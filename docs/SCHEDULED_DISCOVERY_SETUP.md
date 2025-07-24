# Scheduled Mini App Discovery Setup

This guide explains how to set up automated Mini App discovery that runs every 24 hours using Supabase's built-in scheduling capabilities.

## 🎯 Overview

The Mini App discovery system can be configured to run automatically using:
1. **pg_cron** - PostgreSQL's built-in job scheduler
2. **Supabase Edge Functions** - For more complex discovery logic
3. **Database Functions** - For simple logging and coordination

## 📋 Current Setup

### ✅ What's Working

- **pg_cron Extension**: Enabled and configured
- **Scheduled Jobs**: 2 jobs configured:
  - Daily job: Runs every 24 hours at 2 AM UTC (`0 2 * * *`)
  - Test job: Runs every 6 hours (`0 */6 * * *`)
- **Database Functions**: `run_mini_app_discovery()` and `trigger_mini_app_discovery()`
- **Monitoring Views**: `scheduled_discovery_jobs` view for job monitoring

### 🔧 Current Jobs

```sql
-- Daily discovery job (production)
SELECT cron.schedule(
  'mini-app-discovery-daily',
  '0 2 * * *', -- Every day at 2 AM UTC
  'SELECT run_mini_app_discovery();'
);

-- Test job (remove in production)
SELECT cron.schedule(
  'mini-app-discovery-test',
  '0 */6 * * *', -- Every 6 hours
  'SELECT run_mini_app_discovery();'
);
```

## 🚀 Production Setup

### 1. Deploy to Production

```bash
# Link your Supabase project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Deploy Edge Functions (optional)
supabase functions deploy discovery-scheduler
```

### 2. Configure Environment Variables

In your Supabase project dashboard, set these environment variables:

```bash
# For Edge Functions
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For HTTP calls (if using http extension)
DISCOVERY_WEBHOOK_URL=https://your-app.com/api/miniapp-discovery
```

### 3. Enable HTTP Extension (Optional)

To enable HTTP calls from database functions:

```sql
-- Enable http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Update the run_mini_app_discovery function to make HTTP calls
CREATE OR REPLACE FUNCTION run_mini_app_discovery()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response text;
  url text;
BEGIN
  -- Get the webhook URL from environment
  url := current_setting('app.discovery_webhook_url', true);
  
  IF url IS NOT NULL THEN
    -- Make HTTP request to trigger discovery
    SELECT content INTO response
    FROM http((
      'POST',
      url,
      ARRAY[http_header('Content-Type', 'application/json')],
      'application/json',
      '{"scheduled": true}'
    ));
    
    RAISE NOTICE 'Discovery webhook called: %', response;
  END IF;
  
  -- Always log the scheduled run
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
    '{"scheduled": true, "source": "pg_cron", "webhook_called": true}'
  );
END;
$$;
```

## 📊 Monitoring

### Check Scheduled Jobs

```sql
-- View all scheduled jobs
SELECT * FROM scheduled_discovery_jobs;

-- View recent discovery runs
SELECT * FROM discovery_runs 
ORDER BY started_at DESC 
LIMIT 10;
```

### API Endpoints

```bash
# Check scheduled jobs status
curl http://localhost:3000/api/miniapp-discovery/schedule-test

# Manually trigger discovery
curl -X POST http://localhost:3000/api/miniapp-discovery/schedule-test

# View discovery runs
curl http://localhost:3000/api/miniapp-discovery/sources
```

## 🔄 Alternative Approaches

### Option 1: Edge Function + pg_cron

1. **pg_cron** triggers a database function
2. **Database function** calls Edge Function via HTTP
3. **Edge Function** runs the actual discovery logic

### Option 2: External Scheduler

1. Use **Vercel Cron Jobs** or **GitHub Actions**
2. Call your discovery API directly
3. More control over scheduling and error handling

### Option 3: Message Queue

1. Use **Redis/BullMQ** or **Supabase Realtime**
2. Queue discovery jobs
3. Process with background workers

## 🛠️ Customization

### Change Schedule

```sql
-- Update daily job to run at 3 AM UTC
SELECT cron.unschedule('mini-app-discovery-daily');
SELECT cron.schedule(
  'mini-app-discovery-daily',
  '0 3 * * *', -- Every day at 3 AM UTC
  'SELECT run_mini_app_discovery();'
);
```

### Add More Jobs

```sql
-- Weekly deep scan
SELECT cron.schedule(
  'mini-app-discovery-weekly',
  '0 4 * * 0', -- Every Sunday at 4 AM UTC
  'SELECT run_mini_app_discovery();'
);

-- Hourly quick scan
SELECT cron.schedule(
  'mini-app-discovery-hourly',
  '0 * * * *', -- Every hour
  'SELECT run_mini_app_discovery();'
);
```

### Custom Discovery Logic

```sql
-- Create a custom discovery function
CREATE OR REPLACE FUNCTION run_custom_discovery()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Your custom discovery logic here
  -- e.g., only scan specific domains, different validation rules, etc.
  
  INSERT INTO discovery_runs (
    status,
    started_at,
    config
  ) VALUES (
    'custom',
    NOW(),
    '{"custom": true, "rules": "specific"}'
  );
END;
$$;
```

## 🚨 Troubleshooting

### Common Issues

1. **Jobs not running**: Check if pg_cron is enabled
2. **Permission errors**: Ensure functions have SECURITY DEFINER
3. **HTTP calls failing**: Verify http extension is enabled
4. **Edge Functions not found**: Deploy functions to production

### Debug Commands

```sql
-- Check if pg_cron is working
SELECT cron.schedule('test', '*/1 * * * *', 'SELECT 1;');

-- View cron logs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Check function permissions
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%discovery%';
```

## 📈 Performance Considerations

### Database Impact

- **Discovery runs**: ~1-5 minutes per run
- **Storage**: ~1MB per 1000 discovered apps
- **Concurrent jobs**: Limit to 1-2 simultaneous runs

### Optimization Tips

1. **Batch processing**: Process domains in chunks
2. **Caching**: Cache manifest data to avoid re-fetching
3. **Rate limiting**: Respect API rate limits
4. **Error handling**: Retry failed requests with exponential backoff

## 🔐 Security

### Best Practices

1. **Service Role Key**: Use for database operations only
2. **HTTP Calls**: Validate webhook URLs
3. **Function Security**: Use SECURITY DEFINER appropriately
4. **Environment Variables**: Store sensitive data securely

### Access Control

```sql
-- Grant minimal permissions
GRANT EXECUTE ON FUNCTION run_mini_app_discovery() TO authenticated;
GRANT SELECT ON discovery_runs TO authenticated;
GRANT SELECT ON scheduled_discovery_jobs TO authenticated;
```

## 📝 Next Steps

1. **Deploy to production** with your actual project
2. **Configure webhook URLs** for HTTP integration
3. **Set up monitoring** and alerting
4. **Optimize schedules** based on usage patterns
5. **Add error handling** and retry logic

---

**Note**: This setup provides a solid foundation for automated Mini App discovery. You can extend it based on your specific needs and scale requirements. 