import { NextResponse } from 'next/server';

export async function GET(): Promise<Response> {
  try {
    console.log('📡 Testing Farcaster API integration...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://client.farcaster.xyz/v1/top-frameapps?limit=10', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Farcaster API Response:', responseData);
    
    // Handle different response structures
    let frameApps: any[] = [];
    
    if (Array.isArray(responseData)) {
      frameApps = responseData;
    } else if (Array.isArray(responseData?.result?.frames)) {
      frameApps = responseData.result.frames;
    } else if (Array.isArray(responseData?.data)) {
      frameApps = responseData.data;
    } else if (Array.isArray(responseData?.apps)) {
      frameApps = responseData.apps;
    } else {
      console.error('Unexpected Farcaster API response structure:', responseData);
      return NextResponse.json({ success: false, error: 'Unexpected response structure' });
    }
    
    // Process the apps
    const processedApps = frameApps.slice(0, 5).map((app, index) => ({
      domain: app.domain,
      name: app.name,
      description: app.description || app.tagline || app.ogDescription || `${app.name} frame app`,
      iconUrl: app.iconUrl || app.splashImageUrl || '🔗',
      homeUrl: app.homeUrl,
      engagementScore: Math.max(50 - index, 0) + (
        app.author?.followerCount 
          ? Math.min(Math.floor(app.author.followerCount / 1000), 50) 
          : 0
      ),
      discoverySource: 'farcaster_api'
    }));
    
    return NextResponse.json({
      success: true,
      totalApps: frameApps.length,
      processedApps: processedApps.length,
      apps: processedApps
    });
    
  } catch (error) {
    console.error('Farcaster API test error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed', details: error },
      { status: 500 }
    );
  }
} 