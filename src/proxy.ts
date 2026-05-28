import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/donations/:path*",
    "/meal-plan/:path*",
    "/settings/:path*",
  ],
};

// Note: /login/verify is intentionally NOT in the matcher
// so unauthenticated users with twoFactorPending can access it