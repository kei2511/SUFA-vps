import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const { pathname } = request.nextUrl;

  // UNTUK DEMO LOKAL: Redirection dinonaktifkan agar Anda bisa melihat halaman terproteksi menggunakan email demo.
  // Jika Anda ingin mengaktifkan proteksi ketat (auth) kembali, silakan hilangkan komentar di bawah ini:
  /*
  if (!sessionCookie) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/konselor") || pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/konselor/:path*", "/dashboard/:path*"],
};
