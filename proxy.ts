import { NextRequest, NextResponse } from "next/server";

import { verifyAccessToken } from "@/lib/auth/jwt";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const pathname = request.nextUrl.pathname;

  const isOwnerRoute = pathname.startsWith("/owner");
  const isCashierRoute = pathname.startsWith("/cashier");
  const isProfileRoute = pathname.startsWith("/profile");

  const isProtectedRoute =
    isOwnerRoute || isCashierRoute || isProfileRoute;

  // Public route
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Belum login
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  try {
    const payload = verifyAccessToken(token);

    // Owner hanya super_admin
    if (isOwnerRoute && payload.role !== "super_admin") {
      return NextResponse.redirect(
        new URL("/", request.url),
      );
    }

    // Cashier hanya admin
    if (isCashierRoute && payload.role !== "admin") {
      return NextResponse.redirect(
        new URL("/", request.url),
      );
    }

    return NextResponse.next();
  } catch {
    // Token invalid / expired
    const response = NextResponse.redirect(
      new URL("/login", request.url),
    );

    // Bersihkan access token yang invalid
    response.cookies.delete("access_token");

    return response;
  }
}

export const config = {
  matcher: [
    "/owner/:path*",
    "/cashier/:path*",
    "/profile/:path*",
  ],
};