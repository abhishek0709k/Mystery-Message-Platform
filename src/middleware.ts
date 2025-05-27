import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/verify", "/home"];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.JWT_SECRET });
  const url = request.nextUrl.clone();

  if (token) {
    if (PUBLIC_PATHS.some(path => url.pathname.startsWith(path))) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  if (PUBLIC_PATHS.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  url.pathname = "/home";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"], 
};
