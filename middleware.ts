import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /sermon-mgmt routes except /sermon-mgmt/login
  if (pathname.startsWith("/sermon-mgmt") && !pathname.startsWith("/sermon-mgmt/login")) {
    const token = req.cookies.get("admin_token")?.value;
    if (token !== process.env.ADMIN_PASSWORD) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/sermon-mgmt/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sermon-mgmt/:path*"],
};
