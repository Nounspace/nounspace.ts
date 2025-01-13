import { NextResponse } from "next/server";
import { NextRequest, userAgent } from "next/server";
import MOBILE_REDIRECT_URL from "@/constants/mobileRedirectUrl";

export async function middleware(request: NextRequest) {
  const { device } = userAgent(request);
  const url = request.nextUrl;

  if (device.type === "mobile") {
    if (url.pathname === "/s/spacetoken") {
      return NextResponse.redirect(new URL("https://space.nounspace.com"));
    }

    // url.searchParams.set("viewport", "mobile");
    // return NextResponse.rewrite(url);

    // return NextResponse.redirect(new URL(`${MOBILE_REDIRECT_URL}`));
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
