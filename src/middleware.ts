import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const referer = req.headers.get('referer') || '';
  const cookieCtx = req.cookies.get('__ns_pxy_ctx')?.value;

  const fromProxyByRef =
    referer.includes('/api/proxy?url=') ||
    referer.includes('/api/proxy/http/') ||
    referer.includes('/api/proxy/https/');

  const isFromProxy = fromProxyByRef || !!cookieCtx;

  if (pathname.startsWith('/api/proxy')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next') && !isFromProxy) {
    return NextResponse.next();
  }

  const internal = [
    '/favicon',
    '/robots.txt',
    '/sitemap',
    '/apple-touch-icon',
    '/static',
    '/public',
  ];
  if (internal.some((p) => pathname.startsWith(p)) && !isFromProxy) {
    return NextResponse.next();
  }

  if (isFromProxy) {
    const dest = req.nextUrl.clone();
    dest.pathname = '/api/proxy';
    dest.searchParams.set('__rel', pathname + search);
    if (cookieCtx) dest.searchParams.set('__ctx', cookieCtx);
    return NextResponse.rewrite(dest);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/proxy/).*)'],
};
