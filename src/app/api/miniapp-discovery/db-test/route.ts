import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/database.d.ts';

export async function GET(): Promise<Response> {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Test inserting a simple record
    const { data: insertData, error: insertError } = await supabase
      .from('discovery_runs')
      .insert({
        status: 'test',
        total_casts_processed: 0,
        total_domains_found: 0,
        new_apps_discovered: 0,
        existing_apps_updated: 0,
        validation_errors: 0
      })
      .select();

    // Test reading the record
    const { data: readData, error: readError } = await supabase
      .from('discovery_runs')
      .select('*')
      .eq('status', 'test')
      .limit(1);

    return NextResponse.json({
      success: true,
      insert: {
        data: insertData,
        error: insertError
      },
      read: {
        data: readData,
        error: readError
      }
    });
  } catch (error) {
    console.error('DB test error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 