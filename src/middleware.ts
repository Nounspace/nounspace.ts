import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOW_PREFIXES = [
  '/api/proxy',
  '/_next',
  '/favicon',
  '/robots.txt',
  '/sitemap',
  '/apple-touch-icon',
  '/static',
  '/public',
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (ALLOW_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const referer = req.headers.get('referer') || '';
  const isFromProxy =
    referer.includes('/api/proxy?url=') ||
    referer.includes('/api/proxy/http/') ||
    referer.includes('/api/proxy/https/');

  if (!isFromProxy) {
    return NextResponse.next();
  }

  const dest = req.nextUrl.clone();
  dest.pathname = '/api/proxy';
  dest.searchParams.set('__rel', pathname + search);
  return NextResponse.rewrite(dest);
}

export const config = {
  matcher: [
    '/((?!_next/|api/proxy/|favicon|robots\\.txt|sitemap|apple-touch-icon|static|public).*)',
  ],
};
