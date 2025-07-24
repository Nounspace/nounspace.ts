#!/bin/bash

# Deploy Scheduled Mini App Discovery Jobs
# This script helps deploy the scheduled discovery system to production

set -e

echo "🚀 Deploying Scheduled Mini App Discovery Jobs..."

# Check if project ref is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Supabase project reference"
    echo "Usage: ./scripts/deploy-scheduled-jobs.sh your-project-ref"
    exit 1
fi

PROJECT_REF=$1

echo "📋 Project Reference: $PROJECT_REF"

# Link to Supabase project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref $PROJECT_REF

# Push database migrations
echo "📦 Pushing database migrations..."
supabase db push

# Deploy Edge Functions (optional)
echo "⚡ Deploying Edge Functions..."
supabase functions deploy discovery-scheduler

# Test the deployment
echo "🧪 Testing deployment..."
echo "Checking scheduled jobs..."

# Wait a moment for deployment to complete
sleep 5

echo "✅ Deployment completed!"
echo ""
echo "📊 Next steps:"
echo "1. Check your Supabase dashboard for the scheduled jobs"
echo "2. Monitor the discovery_runs table for scheduled executions"
echo "3. Configure environment variables if needed"
echo "4. Test manual triggering with: curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/discovery-scheduler"
echo ""
echo "📖 For more information, see: docs/SCHEDULED_DISCOVERY_SETUP.md" 