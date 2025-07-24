import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/database.d.ts';

export async function POST(): Promise<Response> {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    console.log('🧪 Testing scheduled job functionality...');

    // Test the manual trigger function
    const { data, error } = await supabase.rpc('trigger_mini_app_discovery');

    if (error) {
      console.error('❌ Failed to trigger discovery:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Check the scheduled jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('scheduled_discovery_jobs')
      .select('*');

    if (jobsError) {
      console.error('❌ Failed to fetch scheduled jobs:', jobsError);
    }

    // Check recent discovery runs
    const { data: runs, error: runsError } = await supabase
      .from('discovery_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);

    if (runsError) {
      console.error('❌ Failed to fetch discovery runs:', runsError);
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled job test completed',
      data: {
        triggerResult: data,
        scheduledJobs: jobs || [],
        recentRuns: runs || []
      }
    });

  } catch (error) {
    console.error('❌ Schedule test error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<Response> {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get scheduled jobs info
    const { data: jobs, error: jobsError } = await supabase
      .from('scheduled_discovery_jobs')
      .select('*');

    // Get recent discovery runs
    const { data: runs, error: runsError } = await supabase
      .from('discovery_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      scheduledJobs: jobs || [],
      recentRuns: runs || [],
      errors: {
        jobs: jobsError?.message,
        runs: runsError?.message
      }
    });

  } catch (error) {
    console.error('❌ Schedule info error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 