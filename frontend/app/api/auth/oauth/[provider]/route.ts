import { NextResponse } from "next/server";
import { createCodeChallenge, isOAuthProvider, randomToken, safeNextPath } from "@/lib/oauth";

type RouteContext = { params: Promise<{ provider: string }> };

function failure(request: Request, code: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("oauth_error", code);
  return NextResponse.redirect(url);
}

export async function GET(request: Request, context: RouteContext) {
  const { provider } = await context.params;
  if (!isOAuthProvider(provider)) return failure(request, "unsupported_provider");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return failure(request, "provider_unavailable");

  const requestUrl = new URL(request.url);
  const verifier = randomToken();
  const challenge = await createCodeChallenge(verifier);
  const callback = new URL("/api/auth/oauth/callback", request.url);
  const authorize = new URL(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/authorize`);
  authorize.searchParams.set("provider", provider);
  authorize.searchParams.set("redirect_to", callback.toString());
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorize);
  const secure = process.env.NODE_ENV === "production";
  const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure, path: "/", maxAge: 600 };
  response.cookies.set("grillr_oauth_verifier", verifier, cookieOptions);
  response.cookies.set("grillr_oauth_next", safeNextPath(requestUrl.searchParams.get("next")), cookieOptions);
  return response;
}
