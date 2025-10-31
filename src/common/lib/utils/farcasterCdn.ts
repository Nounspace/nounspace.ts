export const toFarcasterCdnUrl = (
  url: string,
  params = 'anim=false,fit=contain,f=auto,w=576',
): string => {
  if (!url) return url;
  try {
    const u = new URL(url);
    const alreadyProxied =
      u.hostname.includes('wrpcd.net') && u.pathname.startsWith('/cdn-cgi/image/');
    if (alreadyProxied) return url;

    const isHttp = u.protocol === 'http:' || u.protocol === 'https:';
    if (!isHttp) return url; // don't touch data:, blob:, etc.

    return `https://wrpcd.net/cdn-cgi/image/${params}/${encodeURIComponent(url)}`;
  } catch (_err) {
    return url;
  }
};

export default toFarcasterCdnUrl;

