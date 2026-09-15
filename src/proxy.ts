import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/timeline",
  "/tracks",
  "/help",
  "/memories",
  "/test-dashboard",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const hasSession =
      request.cookies.has("authjs.session-token") ||
      request.cookies.has("__Secure-authjs.session-token") ||
      request.cookies.has("next-auth.session-token") ||
      request.cookies.has("__Secure-next-auth.session-token") ||
      request.cookies.has("test_session");

    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/profile/:path*",
    "/timeline/:path*",
    "/tracks/:path*",
    "/help/:path*",
    "/memories/:path*",
    "/test-dashboard/:path*",
  ],
};
