import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN_MAX_AGE = 60 * 60;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

async function refreshAccessToken(refreshToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as { access_token?: string; refresh_token?: string };
  } catch {
    return null;
  }
}

function setSessionCookies(response: NextResponse, session: { access_token: string; refresh_token?: string }) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  response.cookies.set("grillr_access_token", session.access_token, { ...cookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE });
  if (session.refresh_token) {
    response.cookies.set("grillr_refresh_token", session.refresh_token, { ...cookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE });
  }
}

function isAccessTokenExpired(token: string) {
  if (token.startsWith("dev:")) return false;
  try {
    const payload = token.split(".")[1];
    if (!payload) return false;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof decoded.exp === "number" && decoded.exp <= Math.floor(Date.now() / 1000) + 30;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  let token = request.cookies.get("grillr_access_token")?.value;
  const refreshToken = request.cookies.get("grillr_refresh_token")?.value;
  const pathname = request.nextUrl.pathname;
  const protectedPaths = ["/dashboard", "/history", "/interview"];
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const response = NextResponse.next();
  if ((!token || isAccessTokenExpired(token)) && refreshToken) {
    const session = await refreshAccessToken(refreshToken);
    if (session?.access_token) {
      token = session.access_token;
      setSessionCookies(response, { ...session, access_token: session.access_token });
    }
  }

  if (isProtected && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (token && (pathname === "/login" || pathname === "/signup")) {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*", "/interview/:path*", "/login", "/signup"],
};
