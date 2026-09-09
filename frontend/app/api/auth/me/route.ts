import { NextResponse } from "next/server";

type AuthSession = {
  access_token?: string;
  refresh_token?: string;
};

const ACCESS_TOKEN_MAX_AGE = 60 * 60;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

function clearSession(response: NextResponse) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
  response.cookies.set("grillr_access_token", "", cookieOptions);
  response.cookies.set("grillr_refresh_token", "", cookieOptions);
}

function setSession(response: NextResponse, session: AuthSession) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  if (session.access_token) {
    response.cookies.set("grillr_access_token", session.access_token, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
  }
  if (session.refresh_token) {
    response.cookies.set("grillr_refresh_token", session.refresh_token, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
}

export async function GET(request: Request) {
  const apiUrl = process.env.GRILLR_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://grillr-acev.onrender.com";
  const cookieHeader = request.headers.get("cookie") ?? "";
  try {
    let response = await fetch(`${apiUrl}/api/v1/users/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (response.status === 401) {
      const refreshToken = cookieHeader.match(/(?:^|;\s*)grillr_refresh_token=([^;]+)/)?.[1];
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (refreshToken && supabaseUrl && anonKey) {
        const refreshResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=refresh_token`, {
          method: "POST",
          headers: { apikey: anonKey, "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: decodeURIComponent(refreshToken) }),
          cache: "no-store",
        });
        const session = (await refreshResponse.json().catch(() => null)) as AuthSession | null;

        if (refreshResponse.ok && session?.access_token) {
          response = await fetch(`${apiUrl}/api/v1/users/me`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
            cache: "no-store",
          });
          const data = await response.json().catch(() => null);
          const nextResponse = NextResponse.json(data ?? {}, { status: response.status });
          if (response.ok) setSession(nextResponse, session);
          else clearSession(nextResponse);
          return nextResponse;
        }
      }
    }

    const data = await response.json().catch(() => null);
    const nextResponse = NextResponse.json(
      data ?? {
        error: { code: "invalid_session", message: "Session unavailable." },
      },
      { status: response.status },
    );
    if (response.status === 401) clearSession(nextResponse);
    return nextResponse;
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "network_error",
          message: "We could not validate your session.",
        },
      },
      { status: 503 },
    );
  }
}
