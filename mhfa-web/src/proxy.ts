import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionCookie = 
    request.cookies.get("__Secure-sufa.session_token") || 
    request.cookies.get("sufa.session_token") || 
    request.cookies.get("better-auth.session_token");
  const { pathname } = request.nextUrl;

  // Proteksi halaman terautentikasi — redirect ke login jika tidak ada session
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
