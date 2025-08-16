import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint to serve Walrus videos with .mp4 extension
 * This endpoint handles URLs like /api/walrus-video/[blobId].mp4
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { blobId: rawBlobId } = req.query;

  if (!rawBlobId || typeof rawBlobId !== 'string') {
    return res.status(400).json({ error: 'Invalid blob ID' });
  }

  // Remove .mp4 extension if present
  const blobId = rawBlobId.replace(/\.mp4$/, '');

  // Validate blob ID format
  if (!/^[a-zA-Z0-9_-]+$/.test(blobId)) {
    return res.status(400).json({ error: 'Invalid blob ID format' });
  }

  try {
    // Try multiple Walrus aggregators
    const aggregators = [
      'https://aggregator.walrus-testnet.walrus.space',
      'https://walrus-testnet-aggregator.nodes.guru'
    ];

    let videoResponse: Response | null = null;
    let lastError: Error | null = null;

    for (const aggregator of aggregators) {
      try {
        const walrusUrl = `${aggregator}/v1/blobs/${blobId}`;
        const response = await fetch(walrusUrl);
        
        if (response.ok) {
          videoResponse = response;
          break;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.setHeader('Content-Disposition', 'inline; filename="video.mp4"');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Send the video data
    res.status(200).send(Buffer.from(videoBuffer));

  } catch (error) {
    console.error('Error serving Walrus video:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
