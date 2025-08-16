import { validateVideoFile } from './files';

/**
 * Upload a video file to Walrus decentralized storage
 */
export async function uploadVideoToWalrus(file: File): Promise<string> {
  // Validate the video file
  const validation = validateVideoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid video file');
  }

  // Publisher URLs for upload
  const publisherUrls = [
    process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL,
    'https://publisher.walrus-testnet.walrus.space',
    'https://walrus-testnet-publisher.nodes.guru'
  ].filter(Boolean);

  // Aggregator URLs for download (must match publisher)
  const getAggregatorUrl = (publisherUrl: string): string => {
    if (publisherUrl.includes('nodes.guru')) {
      return 'https://walrus-testnet-aggregator.nodes.guru';
    } else if (publisherUrl.includes('walrus-testnet.walrus.space')) {
      return 'https://aggregator.walrus-testnet.walrus.space';
    } else {
      // Default fallback
      return process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';
    }
  };

  let lastError: Error | null = null;
  
  for (const publisherUrl of publisherUrls) {
    if (!publisherUrl) continue; // Skip undefined URLs
    
    try {
      const response = await fetch(`${publisherUrl}/v1/blobs`, {
        method: 'PUT',
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Extract blob ID from the response
      let blobId: string;
      if (result.newlyCreated?.blobObject?.blobId) {
        blobId = result.newlyCreated.blobObject.blobId;
      } else if (result.alreadyCertified?.blobId) {
        blobId = result.alreadyCertified.blobId;
      } else {
        throw new Error('Failed to get blob ID from response');
      }

      // Get the correct aggregator URL for this publisher
      const aggregatorUrl = getAggregatorUrl(publisherUrl);
      
      // Return URL to video page (with proper Open Graph tags) for better Farcaster integration
      if (typeof window !== 'undefined') {
        return `${window.location.origin}/video/walrus/${blobId}`;
      } else {
        const isDev = process.env.NODE_ENV === 'development';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       process.env.NEXT_PUBLIC_URL ||
                       (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                       (isDev ? 'http://localhost:3000' : null);
        
        if (baseUrl) {
          return `${baseUrl}/video/walrus/${blobId}`;
        }
        
        return `${aggregatorUrl}/v1/blobs/${blobId}`;
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue; // Try next endpoint
    }
  }
  
  // If all endpoints failed
  throw new Error(`Failed to upload video to any Walrus endpoint: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Check if a URL is a Walrus URL
 */
export function isWalrusUrl(url: string): boolean {
  // Check for /v1/blobs/ pattern (standard Walrus API)
  const hasV1Blobs = url.includes('/v1/blobs/');
  
  // Check for known Walrus domains
  const hasWalrusDomain = url.includes('walrus') || 
    url.includes('aggregator') ||
    url.includes('.nodes.guru');
  
  // Check for blob ID pattern (with or without file extension)
  const hasBlobPattern = /\/v1\/blobs\/[a-zA-Z0-9_-]+(\.[a-z0-9]+)?(\?.*)?$/i.test(url);
  
  // Check for Walrus video page URLs (e.g., /video/walrus/[blobId])
  const isWalrusVideoPage = /\/video\/walrus\/[a-zA-Z0-9_-]+/.test(url);
  
  return (hasV1Blobs && (hasWalrusDomain || hasBlobPattern)) || isWalrusVideoPage;
}

/**
 * Get the blob ID from a Walrus URL
 */
export function extractBlobIdFromWalrusUrl(url: string): string | null {
  // Check for video page URLs first (e.g., /video/walrus/[blobId])
  const pageMatch = url.match(/\/video\/walrus\/([a-zA-Z0-9_-]+)/i);
  if (pageMatch) {
    return pageMatch[1];
  }
  
  // Match blob ID with optional file extension and query parameters
  const apiMatch = url.match(/\/v1\/blobs\/([a-zA-Z0-9_-]+)(?:\.[a-z0-9]+)?(?:\?.*)?$/i);
  return apiMatch ? apiMatch[1] : null;
}

/**
 * Convert a publisher URL to an aggregator URL for video playback
 */
export function convertToAggregatorUrl(url: string): string {
  if (!isWalrusUrl(url)) {
    return url;
  }

  const blobId = extractBlobIdFromWalrusUrl(url);
  if (!blobId) {
    return url;
  }

  // If it's already an aggregator URL, return as is but clean up extension/params
  if (url.includes('aggregator')) {
    // Get base aggregator URL and reconstruct with clean blob ID
    const baseAggregatorUrl = url.split('/v1/blobs/')[0];
    return `${baseAggregatorUrl}/v1/blobs/${blobId}`;
  }

  // Convert publisher URL to aggregator URL using the same mapping
  let aggregatorUrl: string;
  if (url.includes('nodes.guru')) {
    aggregatorUrl = 'https://walrus-testnet-aggregator.nodes.guru';
  } else if (url.includes('walrus-testnet.walrus.space')) {
    aggregatorUrl = 'https://aggregator.walrus-testnet.walrus.space';
  } else {
    // Default fallback
    aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';
  }
  
  return `${aggregatorUrl}/v1/blobs/${blobId}`;
}

/**
 * Get a Walrus video page URL for sharing (with proper Open Graph tags)
 * This returns a URL to the video page which has proper meta tags for Farcaster
 */
export function getWalrusVideoPageUrl(url: string): string {
  if (!isWalrusUrl(url)) {
    return url;
  }

  const blobId = extractBlobIdFromWalrusUrl(url);
  if (!blobId) {
    return url;
  }

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || 
      process.env.NEXT_PUBLIC_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3000';
  
  return `${baseUrl}/video/walrus/${blobId}`;
}

/**
 * Get a Walrus video URL that works well with Farcaster and other platforms
 * This function decides whether to use the direct URL or proxy based on the context
 */
export function getWalrusVideoUrl(url: string, useProxy: boolean = false): string {
  if (!isWalrusUrl(url)) {
    return url;
  }

  const blobId = extractBlobIdFromWalrusUrl(url);
  if (!blobId) {
    return url;
  }

  if (useProxy) {
    // Use our proxy endpoint that serves with proper Content-Type headers
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/walrus/video/${blobId}`;
  }

  // For posts and embeds, use direct URL with .mp4 extension for better recognition
  const aggregatorUrl = convertToAggregatorUrl(url);
  return `${aggregatorUrl}.mp4`;
}

/**
 * Get the direct video URL for playback (not for sharing)
 * This returns the actual video file URL for use in video players
 */
export function getWalrusDirectVideoUrl(url: string): string {
  if (!isWalrusUrl(url)) {
    return url;
  }

  const blobId = extractBlobIdFromWalrusUrl(url);
  if (!blobId) {
    return url;
  }

  // Use our proxy endpoint that serves with proper Content-Type headers
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || 
      process.env.NEXT_PUBLIC_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3000';
  
  return `${baseUrl}/api/walrus/video/${blobId}`;
}