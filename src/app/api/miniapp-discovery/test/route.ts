import { NextResponse } from 'next/server';

export async function GET(): Promise<Response> {
  try {
    // Test basic functionality
    return NextResponse.json({
      success: true,
      message: 'Mini App Discovery API is working',
      timestamp: new Date().toISOString(),
      env: {
        hasNeynarKey: !!process.env.NEYNAR_API_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed', details: error },
      { status: 500 }
    );
  }
} 