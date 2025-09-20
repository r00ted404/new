import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session")?.value;
    const isLogin = pathname === "/admin/login";

    if (!session && !isLogin) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (session && isLogin) {
      const url = new URL("/admin/crm", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
