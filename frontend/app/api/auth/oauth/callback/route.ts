import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/oauth";

function failure(request: Request, code: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("oauth_error", code);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieMap = new Map(cookieHeader.split(";").map((item) => item.trim().split("=", 2) as [string, string]));
  const verifier = cookieMap.get("grillr_oauth_verifier");
  const next = safeNextPath(cookieMap.get("grillr_oauth_next"));

  if (requestUrl.searchParams.get("error")) return failure(request, "cancelled");
  if (!code || !verifier) return failure(request, "invalid_callback");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiUrl = process.env.GRILLR_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  if (!supabaseUrl || !anonKey) return failure(request, "provider_unavailable");

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=pkce`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
      cache: "no-store",
    });
    const session = (await response.json().catch(() => null)) as { access_token?: string; refresh_token?: string } | null;
    if (!response.ok || !session?.access_token) return failure(request, "exchange_failed");

    const synced = await fetch(`${apiUrl}/api/v1/users/me`, { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
    if (!synced.ok) return failure(request, "account_sync_failed");

    const redirect = NextResponse.redirect(new URL(next, request.url));
    const secure = process.env.NODE_ENV === "production";
    const accessOptions = { httpOnly: true, sameSite: "lax" as const, secure, path: "/", maxAge: 60 * 60 };
    redirect.cookies.set("grillr_access_token", session.access_token, accessOptions);
    if (session.refresh_token) redirect.cookies.set("grillr_refresh_token", session.refresh_token, { ...accessOptions, maxAge: 60 * 60 * 24 * 30 });
    for (const name of ["grillr_oauth_verifier", "grillr_oauth_state", "grillr_oauth_next"]) redirect.cookies.set(name, "", { ...accessOptions, maxAge: 0 });
    return redirect;
  } catch {
    return failure(request, "provider_unavailable");
  }
}
