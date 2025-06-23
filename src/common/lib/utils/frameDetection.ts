// Utility to detect if a URL has Frame v2 metadata
export async function isFrameV2Url(url: string): Promise<boolean> {
  try {
    // Use your existing frames API to check for frame metadata
    const response = await fetch(`/api/frames?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      return false;
    }
    
    const frameData = await response.json();
    
    // If we get back frame data (image, title, buttons, etc.), it's a frame
    return !!(frameData.image || frameData.title || frameData.buttons?.length > 0);
  } catch (error) {
    console.warn('Frame detection failed:', error);
    return false;
  }
}

// Synchronous heuristic check for likely frame URLs (for performance)
export function isLikelyFrameUrl(url: string): boolean {
  const framePatterns = [
    /frames?\.js\.org/,
    /frame\./,
    /\.frame$/,
    /\/frame$/,
    /\/frames\//,
    // Add more patterns based on common frame domains
  ];
  
  return framePatterns.some(pattern => pattern.test(url));
}
