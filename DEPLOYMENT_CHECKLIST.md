# Mini App Discovery System - Deployment Checklist

## 🚀 Staging Deployment

### ✅ Prerequisites
- [ ] Supabase CLI installed and configured
- [ ] Access to staging environment (`undbyaytxgmhhbuxjbty`)
- [ ] Neynar API key ready
- [ ] OpenRank API key ready (optional)

### ✅ Environment Setup
- [ ] Link to staging: `supabase link --project-ref undbyaytxgmhhbuxjbty`
- [ ] Set `NEYNAR_API_KEY` in Supabase dashboard
- [ ] Set `OPENRANK_API_KEY` in Supabase dashboard (optional)

### ✅ Database Deployment
- [ ] Run: `supabase db push`
- [ ] Verify pg_cron extension enabled
- [ ] Verify scheduled job created
- [ ] Verify manual trigger function created

### ✅ Edge Function Deployment
- [ ] Run: `supabase functions deploy discovery-scheduler`
- [ ] Verify function deployed successfully
- [ ] Check function logs for errors

### ✅ URL Configuration
- [ ] Update migration file with correct staging URL
- [ ] Replace: `your-project-ref` → `undbyaytxgmhhbuxjbty`
- [ ] Run: `supabase db push` (again)

### ✅ Testing
- [ ] Test manual trigger: `SELECT trigger_mini_app_discovery();`
- [ ] Check Edge Function logs
- [ ] Verify Mini Apps table populated
- [ ] Test frontend API endpoints

## 🔍 Verification Commands

```bash
# Check deployment status
supabase status

# List functions
supabase functions list

# Check function logs
supabase functions logs discovery-scheduler

# Test manual trigger
psql -h db.undbyaytxgmhhbuxjbty.supabase.co -U postgres -d postgres -c "SELECT trigger_mini_app_discovery();"
```

## 📊 Success Indicators

- [ ] Scheduled job appears in `cron.job` table
- [ ] Edge Function responds without errors
- [ ] Mini Apps table contains data
- [ ] Frontend can load Mini Apps
- [ ] Job runs automatically at 2 AM UTC

## 🆘 Troubleshooting

### Job Not Running
```sql
-- Check if job exists
SELECT * FROM cron.job WHERE jobname = 'mini-app-discovery-job';

-- Check job history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

### Function Errors
```bash
# Check function logs
supabase functions logs discovery-scheduler --follow

# Test function manually
curl -X POST "https://undbyaytxgmhhbuxjbty.supabase.co/functions/v1/discovery-scheduler" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### No Data Found
```sql
-- Check Mini Apps table
SELECT COUNT(*) FROM mini_apps;
SELECT discovery_source, COUNT(*) FROM mini_apps GROUP BY discovery_source;
```

---

**Status**: Ready for deployment  
**Last updated**: December 2024 