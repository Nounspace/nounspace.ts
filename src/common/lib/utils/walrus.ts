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
      
      // Add media parameter to help Farcaster recognize as video
      return `${aggregatorUrl}/v1/blobs/${blobId}?media=video`;
      
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
  const hasBlobPattern = /\/v1\/blobs\/[a-zA-Z0-9_-]+(\.[a-z0-9]+)?$/i.test(url);
  
  return hasV1Blobs && (hasWalrusDomain || hasBlobPattern);
}

/**
 * Get the blob ID from a Walrus URL
 */
export function extractBlobIdFromWalrusUrl(url: string): string | null {
  // Match blob ID with optional file extension
  const match = url.match(/\/v1\/blobs\/([a-zA-Z0-9_-]+)(?:\.[a-z0-9]+)?$/i);
  return match ? match[1] : null;
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

  // If it's already an aggregator URL, return as is but remove extension
  if (url.includes('aggregator')) {
    // Remove extension if present - Walrus needs clean blob ID
    const baseAggregatorUrl = url.replace(/\.(mp4|webm|avi|mov)$/i, '');
    return baseAggregatorUrl; // Return without extension for actual video playback
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