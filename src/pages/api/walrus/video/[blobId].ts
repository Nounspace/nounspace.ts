import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint to proxy Walrus videos with proper Content-Type headers
 * This helps Farcaster and other platforms recognize the content as video
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { blobId: rawBlobId } = req.query;

  if (!rawBlobId || typeof rawBlobId !== 'string') {
    return res.status(400).json({ error: 'Invalid blob ID' });
  }

  // Remove .mp4 extension if present (for Farcaster compatibility)
  const blobId = rawBlobId.replace(/\.mp4$/, '');

  // Validate blob ID format (should be alphanumeric with possible hyphens/underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(blobId)) {
    return res.status(400).json({ error: 'Invalid blob ID format' });
  }

  try {
    // Try multiple Walrus aggregators
    const aggregators = [
      'https://aggregator.walrus-testnet.walrus.space',
      'https://walrus-testnet-aggregator.nodes.guru',
      process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL
    ].filter(Boolean) as string[];

    let videoResponse: Response | null = null;
    let lastError: Error | null = null;

    for (const aggregator of aggregators) {
      try {
        const walrusUrl = `${aggregator}/v1/blobs/${blobId}`;
        const response = await fetch(walrusUrl);
        
        if (response.ok) {
          videoResponse = response;
          break; // Success, exit loop
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue; // Try next aggregator
      }
    }

    if (!videoResponse || !videoResponse.ok) {
      return res.status(404).json({ 
        error: 'Video not found',
        details: lastError?.message || 'All aggregators failed'
      });
    }

    // Get the video data
    const videoBuffer = await videoResponse.arrayBuffer();
    
    // Set proper headers for video content
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', videoBuffer.byteLength);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    
    // Add headers to help with video detection by social platforms
    res.setHeader('Content-Disposition', 'inline; filename="video.mp4"');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Add Open Graph type header (some crawlers check this)
    res.setHeader('X-OG-Type', 'video');
    
    // Send the video data
    res.status(200).send(Buffer.from(videoBuffer));

  } catch (error) {
    console.error('Error proxying Walrus video:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
