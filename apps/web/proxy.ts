import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/home", "/spaces"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    !PROTECTED.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("session_id");
  if (!cookie?.value) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/home/:path*", "/spaces", "/spaces/:path*"],
};
