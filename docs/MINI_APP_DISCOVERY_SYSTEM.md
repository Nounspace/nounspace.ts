# Mini App Discovery System

A comprehensive, server-side Mini App discovery and indexing system for Farcaster that automatically crawls thousands of casts daily to find and validate Mini Apps.

## 🎯 Overview

This system provides:
- **Automated discovery** of Mini Apps from Farcaster casts
- **Server-side processing** via Supabase Edge Functions
- **Scheduled execution** every 24 hours
- **OpenRank integration** for intelligent user selection
- **Database persistence** for frontend consumption
- **Robust validation** of Mini App manifests

## 🏗️ Architecture

### Core Components

1. **Supabase Edge Function** (`discovery-scheduler`)
   - Runs the massive crawl job
   - Integrates with OpenRank for user selection
   - Processes 50k+ casts from top-ranked users

2. **Database Schema** (`mini_apps` table)
   - Stores discovered Mini Apps
   - Tracks validation status and metadata
   - Enables fast frontend queries

3. **Frontend Services**
   - `MiniAppDiscoveryService` - Reads from database
   - `MiniAppCrawlerService` - Handles domain crawling
   - API endpoints for data access

4. **Scheduled Job** (pg_cron)
   - Runs every 24 hours at 2 AM UTC
   - Triggers the Edge Function automatically

## 📁 File Structure

```
├── supabase/
│   ├── functions/
│   │   └── discovery-scheduler/
│   │       └── index.ts                 # Edge Function
│   └── migrations/
│       └── 20241225000002_schedule_discovery_job.sql  # Database setup
├── src/
│   └── common/data/services/
│       ├── miniAppDiscoveryService.ts   # Frontend service
│       └── miniAppCrawlerService.ts     # Crawler service
└── docs/
    └── MINI_APP_DISCOVERY_SYSTEM.md     # This file
```

## 🚀 Deployment to Staging

### Prerequisites

1. **Supabase CLI** installed and configured
2. **Access to staging environment**
3. **Environment variables** set up

### Step 1: Link to Staging

```bash
# Link to the staging project
supabase link --project-ref undbyaytxgmhhbuxjbty
```

### Step 2: Set Environment Variables

In your Supabase dashboard, set these environment variables:

```bash
# Required
NEYNAR_API_KEY=your_neynar_api_key_here

# Optional (for OpenRank integration)
OPENRANK_API_KEY=your_openrank_api_key_here
```

### Step 3: Deploy Database Schema

```bash
# Apply the migration
supabase db push
```

This will:
- Enable pg_cron extension
- Create the scheduled job
- Set up the manual trigger function

### Step 4: Deploy Edge Function

```bash
# Deploy the discovery scheduler
supabase functions deploy discovery-scheduler
```

### Step 5: Update Migration URL

Edit `supabase/migrations/20241225000002_schedule_discovery_job.sql` and replace:
```sql
'https://your-project-ref.supabase.co/functions/v1/discovery-scheduler'
```
with your actual staging URL:
```sql
'https://undbyaytxgmhhbuxjbty.supabase.co/functions/v1/discovery-scheduler'
```

### Step 6: Apply Updated Migration

```bash
supabase db push
```

## 🔧 Configuration

### Scheduled Job Settings

The job runs every 24 hours at 2 AM UTC:
```sql
'0 2 * * *'  -- Cron expression
```

### Crawl Parameters

```typescript
{
  targetCasts: 50000,        // Maximum casts to process
  fids: [],                  // Empty = use OpenRank
  feedTypes: ['for_you', 'following'],
  maxPagesPerFid: 1000,      // Pages per FID/feed
  limitPerRequest: 50,       // Casts per API request
  useOpenRank: true          // Enable OpenRank integration
}
```

### OpenRank Integration

- **With API key**: Uses top 15 users by engagement ranking
- **Without API key**: Falls back to default FIDs
- **Updates dynamically**: Fresh rankings every 24 hours

## 📊 Monitoring

### Check Job Status

```sql
-- View scheduled jobs
SELECT * FROM cron.job;

-- Check job history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'mini-app-discovery-job')
ORDER BY start_time DESC;
```

### Monitor Edge Function

- Check Supabase dashboard → Edge Functions → Logs
- Look for `discovery-scheduler` function logs

### Check Results

```sql
-- View discovered Mini Apps
SELECT * FROM mini_apps 
WHERE is_valid = true 
ORDER BY created_at DESC;

-- Check discovery sources
SELECT discovery_source, COUNT(*) 
FROM mini_apps 
GROUP BY discovery_source;
```

## 🧪 Testing

### Manual Trigger

```sql
-- Manually trigger the discovery job
SELECT trigger_mini_app_discovery();
```

### Local Testing

```bash
# Test the API endpoint
curl -X POST "http://localhost:3000/api/miniapp-discovery" \
  -H "Content-Type: application/json" \
  -d '{"action": "crawl-domains", "domains": ["example.com"]}'
```

## 🔍 How It Works

### 1. Scheduled Execution
Every 24 hours at 2 AM UTC, pg_cron triggers the Edge Function.

### 2. User Selection
- Fetches top 15 users from OpenRank (engagement-based)
- Falls back to default FIDs if OpenRank unavailable

### 3. Cast Collection
For each user:
- Fetches `for_you` and `following` feeds
- Collects up to 1,000 pages per feed
- Deduplicates casts by hash

### 4. Domain Extraction
- Extracts domains from cast text, embeds, and frames
- Filters out development domains (ngrok, replit, etc.)
- Validates domain format

### 5. Manifest Crawling
- Crawls `/.well-known/farcaster.json` for each domain
- Validates manifest structure
- Stores valid Mini Apps in database

### 6. Frontend Access
- Frontend services read from database
- No client-side crawling required
- Fast, cached access to Mini App data

## 🛠️ Troubleshooting

### Common Issues

1. **Job not running**
   - Check pg_cron extension is enabled
   - Verify cron job exists in database
   - Check Edge Function logs

2. **No Mini Apps found**
   - Verify Neynar API key is valid
   - Check OpenRank API key (optional)
   - Review domain validation logic

3. **Edge Function errors**
   - Check environment variables
   - Review function logs
   - Verify API endpoints

### Debug Commands

```bash
# Check Edge Function status
supabase functions list

# View function logs
supabase functions logs discovery-scheduler

# Test function locally
supabase functions serve discovery-scheduler
```

## 📈 Performance

### Expected Results

- **Processing time**: ~10-30 minutes per run
- **Casts processed**: 50,000 per day
- **Domains crawled**: 1,000-5,000 per day
- **Mini Apps found**: Varies (quality over quantity)

### Optimization

- **Concurrent crawling**: 5 domains at a time
- **Rate limiting**: 100ms delay between requests
- **Timeout handling**: 10s per domain
- **Error recovery**: Graceful fallbacks

## 🔄 Maintenance

### Regular Tasks

1. **Monitor job execution** - Check logs weekly
2. **Review discovered apps** - Validate quality
3. **Update FID list** - If not using OpenRank
4. **Check API limits** - Monitor Neynar usage

### Updates

1. **Deploy function changes**:
   ```bash
   supabase functions deploy discovery-scheduler
   ```

2. **Update database schema**:
   ```bash
   supabase db push
   ```

## 📚 API Reference

### Frontend API

```typescript
// Get all valid Mini Apps
GET /api/miniapp-discovery

// Crawl specific domains
POST /api/miniapp-discovery
{
  "action": "crawl-domains",
  "domains": ["example.com"]
}

// Crawl domains from casts
POST /api/miniapp-discovery
{
  "action": "crawl-casts",
  "casts": [...]
}
```

### Database Schema

```sql
CREATE TABLE mini_apps (
  id SERIAL PRIMARY KEY,
  domain TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT NOT NULL,
  home_url TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT false,
  error_message TEXT,
  engagement_score INTEGER DEFAULT 0,
  discovery_source TEXT DEFAULT 'cast_crawling',
  last_crawled TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎉 Success Metrics

The system is working correctly when:

- ✅ **Job runs daily** without errors
- ✅ **Casts are processed** (check logs)
- ✅ **Domains are crawled** (check crawl stats)
- ✅ **Valid Mini Apps are found** (quality over quantity)
- ✅ **Frontend loads quickly** (database queries)

## 🤝 Contributing

To modify the system:

1. **Update Edge Function** - Modify crawling logic
2. **Update database schema** - Add new fields
3. **Update frontend services** - Modify data access
4. **Test thoroughly** - Use manual triggers
5. **Deploy incrementally** - Function → Database → Frontend

---

**Last updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready 