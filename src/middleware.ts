import { NextResponse } from "next/server";
import { NextRequest, userAgent } from "next/server";
import MOBILE_REDIRECT_URL from "@/constants/mobileRedirectUrl";

export async function middleware(request: NextRequest) {
  const { device } = userAgent(request);
  const path = request.nextUrl.pathname;

  if (device.type === "mobile") {
    if (path === "/s/spacetoken") {
      return NextResponse.redirect(new URL("https://space.nounspace.com"));
    }

    if (!path.startsWith('/t')){
      return NextResponse.redirect(new URL(`${MOBILE_REDIRECT_URL}`));
    }
  }

  if (path === "/home") {
    return NextResponse.redirect(new URL("/home/Welcome", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
