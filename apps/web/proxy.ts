import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/home", "/spaces"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!PROTECTED.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("session_id");
  if (!cookie?.value) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        Cookie: `session_id=${cookie.value}`,
      },
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/spaces/:path*"],
};
