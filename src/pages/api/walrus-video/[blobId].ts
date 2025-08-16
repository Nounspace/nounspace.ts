import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint to serve Walrus videos with .mp4 extension
 * This endpoint handles URLs like /api/walrus-video/[blobId].mp4
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET, HEAD and OPTIONS methods
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    return res.status(204).end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { blobId: rawBlobId } = req.query;

  if (!rawBlobId || typeof rawBlobId !== 'string') {
    return res.status(400).json({ error: 'Invalid blob ID' });
  }

  // Remove file extension if present (supports .mp4, .webm, .mov etc.)
  const blobId = rawBlobId.replace(/\.(mp4|webm|mov|ogg|ogv|mkv)$/, '');

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
    const range = req.headers.range as string | undefined;

    for (const aggregator of aggregators) {
      try {
        const walrusUrl = `${aggregator}/v1/blobs/${blobId}`;
        const upstreamHeaders: HeadersInit = {};
        
        // Forward Range header for seeking support
        if (range) upstreamHeaders['Range'] = range;
        
        // Forward cache-related headers
        if (req.headers['if-none-match']) upstreamHeaders['If-None-Match'] = String(req.headers['if-none-match']);
        if (req.headers['if-modified-since']) upstreamHeaders['If-Modified-Since'] = String(req.headers['if-modified-since']);
        
        const response = await fetch(walrusUrl, {
          method: req.method, // GET or HEAD
          headers: upstreamHeaders,
        });
        
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

    // Forward relevant headers from upstream response
    const passThroughHeaders = [
      'content-type',
      'content-length',
      'accept-ranges',
      'content-range',
      'cache-control',
      'etag',
      'last-modified',
      'content-disposition',
    ];
    
    const upstreamContentType = videoResponse.headers.get('content-type');
    
    // Set content type - prefer upstream, fallback to video/mp4
    res.setHeader('Content-Type', upstreamContentType || 'video/mp4');
    
    // Forward other relevant headers
    for (const headerName of passThroughHeaders) {
      const headerValue = videoResponse.headers.get(headerName);
      if (headerValue && headerName !== 'content-type') {
        res.setHeader(headerName, headerValue);
      }
    }
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    
    // Set cache control if not provided by upstream
    if (!videoResponse.headers.get('cache-control')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Support HEAD requests - return headers only
    if (req.method === 'HEAD') {
      return res.status(videoResponse.status).end();
    }

    // Stream the response body
    if (videoResponse.body) {
      res.status(videoResponse.status);
      const reader = videoResponse.body.getReader();
      
      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).end();
      } finally {
        reader.releaseLock();
      }
    } else {
      // Fallback: buffer the entire response
      const videoBuffer = await videoResponse.arrayBuffer();
      res.status(videoResponse.status).send(Buffer.from(videoBuffer));
    }

  } catch (error) {
    console.error('Error serving Walrus video:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
