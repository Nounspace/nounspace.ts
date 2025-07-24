import { NextRequest, NextResponse } from 'next/server';
import { MiniAppDiscoveryService } from '@/common/data/services/miniAppDiscoveryService';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const discoveryService = MiniAppDiscoveryService.getInstance();
    const stats = discoveryService.getStats();
    const validApps = await discoveryService.getValidMiniApps();
    
    return NextResponse.json({
      success: true,
      stats,
      validApps: validApps.length,
      apps: validApps.map(app => ({
        domain: app.domain,
        name: app.manifest.name,
        description: app.manifest.description,
        lastCrawled: app.lastCrawled,
        engagementScore: app.engagementScore,
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
    const { action, domains } = body;
    
    const discoveryService = MiniAppDiscoveryService.getInstance();
    
    switch (action) {
      case 'discover':
        // Start discovery from seed sources
        await discoveryService.discoverFromSeeds();
        return NextResponse.json({ 
          success: true, 
          message: 'Discovery started from seed sources' 
        });
        
      case 'add-domains':
        // Add specific domains to crawl
        if (!domains || !Array.isArray(domains)) {
          return NextResponse.json(
            { success: false, error: 'domains array is required' },
            { status: 400 }
          );
        }
        
        await discoveryService.addDomainsToQueue(domains);
        return NextResponse.json({ 
          success: true, 
          message: `Added ${domains.length} domains to crawl queue` 
        });
        
      case 'reindex':
        // Re-index all discovered apps
        const validApps = await discoveryService.getValidMiniApps();
        const allDomains = validApps.map(app => app.domain);
        await discoveryService.addDomainsToQueue(allDomains);
        return NextResponse.json({ 
          success: true, 
          message: `Re-indexing ${allDomains.length} domains` 
        });
        
      case 'clear-cache':
        // Clear cache and force re-discovery
        discoveryService.clearCache();
        return NextResponse.json({ 
          success: true, 
          message: 'Cache cleared' 
        });
        
      case 'test-domain':
        // Test a specific domain
        if (!domains || domains.length === 0) {
          return NextResponse.json(
            { success: false, error: 'domains array is required for test-domain action' },
            { status: 400 }
          );
        }
        
        const testResults = await Promise.all(
          domains.map(domain => discoveryService.testDomain(domain))
        );
        
        return NextResponse.json({ 
          success: true, 
          message: `Tested ${domains.length} domains`,
          results: testResults
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in discovery API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 