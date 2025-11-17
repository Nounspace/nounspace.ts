// Utility for detecting and extracting YouTube IDs
export function getYouTubeId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // youtube.com/watch?v=ID
    if (urlObj.hostname.includes('youtube.com')) {
      const v = urlObj.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;
      // /embed/ID ou /v/ID
      const pathMatch = urlObj.pathname.match(/\/(?:embed|v)\/([\w-]+)/);
      if (pathMatch && /^[\w-]{11}$/.test(pathMatch[1])) return pathMatch[1];
      // /shorts/ID
      const shortsMatch = urlObj.pathname.match(/\/shorts\/([\w-]+)/);
      if (shortsMatch && /^[\w-]{11}$/.test(shortsMatch[1])) return shortsMatch[1];
    }
    // youtu.be/ID
    if (urlObj.hostname === 'youtu.be') {
      const id = urlObj.pathname.split('/')[1]?.split('?')[0];
      if (id && /^[\w-]{11}$/.test(id)) return id;
    }
  } catch {
    // Invalid URL
  }
  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return getYouTubeId(url) !== null;
}
