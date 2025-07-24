import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/database.d.ts';

export async function GET(): Promise<Response> {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Check discovered_mini_apps table
    const { data: apps, error: appsError } = await supabase
      .from('discovered_mini_apps')
      .select('*')
      .limit(5);

    // Check discovery_runs table
    const { data: runs, error: runsError } = await supabase
      .from('discovery_runs')
      .select('*')
      .limit(5);

    return NextResponse.json({
      success: true,
      apps: {
        count: apps?.length || 0,
        data: apps || [],
        error: appsError
      },
      runs: {
        count: runs?.length || 0,
        data: runs || [],
        error: runsError
      }
    });
  } catch (error) {
    console.error('Sources endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 