// Common domains that are definitely NOT Frame v2 compatible
const NON_FRAME_DOMAINS = [
  // Social Media
  'x.com',
  'twitter.com', 
  'instagram.com',
  'facebook.com',
  'linkedin.com',
  'tiktok.com',
  'snapchat.com',
  'discord.com',
  'telegram.org',
  'whatsapp.com',
  
  // Video Platforms
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'twitch.tv',
  'dailymotion.com',
  'netflix.com',
  'hulu.com',
  'primevideo.com',
  
  // Image/Media Hosting
  'imgur.com',
  'giphy.com',
  'tenor.com',
  'pinterest.com',
  'flickr.com',
  'unsplash.com',
  
  // News/Content Sites
  'cnn.com',
  'bbc.com',
  'nytimes.com',
  'washingtonpost.com',
  'reuters.com',
  'bloomberg.com',
  'techcrunch.com',
  'verge.com',
  'ycombinator.com',
  'reddit.com',
  
  // E-commerce
  'amazon.com',
  'ebay.com',
  'shopify.com',
  'etsy.com',
  'alibaba.com',
  
  // Developer/Tech
  'github.com',
  'gitlab.com',
  'stackoverflow.com',
  'npmjs.com',
  'pypi.org',
  
  // Documentation/Reference
  'wikipedia.org',
  'mdn.mozilla.org',
  'docs.google.com',
  'notion.so',
  'confluence.atlassian.com',
  
  // Google Services
  'google.com',
  'gmail.com',
  'drive.google.com',
  'maps.google.com',
  
  // Microsoft Services
  'microsoft.com',
  'office.com',
  'outlook.com',
  'teams.microsoft.com',
  
  // File Hosting
  'dropbox.com',
  'box.com',
  'onedrive.live.com',
  
  // Crypto/Finance (most are not frames)
  'coinbase.com',
  'binance.com',
  'kraken.com',
  'uniswap.org',
  'opensea.io',
];

// Check if URL domain is in the non-frame blacklist
function isDomainBlacklisted(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return NON_FRAME_DOMAINS.some(domain => 
      hostname === domain || hostname.startsWith(`www.${domain}`)
    );
  } catch {
    return false;
  }
}

// Utility to detect if a URL has Frame v2 metadata
export async function isFrameV2Url(url: string): Promise<boolean> {
  try {
    // Quick check - if domain is blacklisted, skip frame detection
    if (isDomainBlacklisted(url)) {
      return false;
    }
    
    // Use your existing frames API to check for frame metadata
    const response = await fetch(`/api/frames?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      return false;
    }
    
    const frameData = await response.json();
    
    // If we get back frame data (image, title, buttons, etc.), it's a frame
    return !!(frameData.image || frameData.title || frameData.buttons?.length > 0);
  } catch (error) {
    // Removed console.warn to clean up logs
    return false;
  }
}

// Synchronous heuristic check for likely frame URLs (for performance)
export function isLikelyFrameUrl(url: string): boolean {
  // Quick check - if domain is blacklisted, it's definitely not a frame
  if (isDomainBlacklisted(url)) {
    return false;
  }
  
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
