import { NextResponse } from 'next/server';
import { FidgetOptionsService } from '@/common/data/services/fidgetOptionsService';

export async function GET(): Promise<Response> {
  try {
    console.log('📱 Testing FidgetOptionsService integration...');
    
    const fidgetService = FidgetOptionsService.getInstance();
    const miniApps = await fidgetService.getFidgetOptions({ type: 'miniapp' });
    
    return NextResponse.json({
      success: true,
      totalMiniApps: miniApps.options.length,
      miniApps: miniApps.options.slice(0, 5).map(app => ({
        id: app.id,
        name: app.name,
        description: app.description,
        category: app.category,
        tags: app.tags,
        domain: (app as any).domain,
        popularity: (app as any).popularity
      }))
    });
    
  } catch (error) {
    console.error('Fidget test error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed', details: error },
      { status: 500 }
    );
  }
} 