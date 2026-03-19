import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value;
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (sessionId && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!sessionId && protectedPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
