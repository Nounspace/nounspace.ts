import { NextRequest, NextResponse } from 'next/server';
import { MiniAppDiscoveryService } from '@/common/data/services/miniAppDiscoveryService';

export async function GET(): Promise<Response> {
  try {
    const discoveryService = MiniAppDiscoveryService.getInstance();
    const stats = discoveryService.getStats();
    const validApps = await discoveryService.getValidMiniApps();

    return NextResponse.json({
      success: true,
      stats,
      validApps: validApps.length,
      apps: validApps.slice(0, 10).map(app => ({
        domain: app.domain,
        name: app.manifest.name,
        description: app.manifest.description,
        lastCrawled: app.lastCrawled,
        engagementScore: app.engagementScore,
        discoverySource: app.discoverySource,
      })),
    });
  } catch (error) {
    console.error('Error getting discovery stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get discovery stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { action } = body;
    
    const discoveryService = MiniAppDiscoveryService.getInstance();
    
    if (action === 'discover') {
      await discoveryService.discover();
      return NextResponse.json({ 
        success: true, 
        message: 'Discovery loaded from database' 
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in discovery API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 