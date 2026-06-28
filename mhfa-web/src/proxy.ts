import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const { pathname } = request.nextUrl;

  // For development/mock simulation, check cookie. If no cookie and matches protected path, redirect to login
  if (!sessionCookie) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/konselor") || pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/konselor/:path*", "/dashboard/:path*"],
};
