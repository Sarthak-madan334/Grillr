import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.GRILLR_API_URL ?? "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/v1/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    const data = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
      [key: string]: unknown;
    };

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const result = { ...data };
    delete result.access_token;
    delete result.refresh_token;
    const nextResponse = NextResponse.json(result, { status: response.status });
    const secure = process.env.NODE_ENV === "production";

    if (data.access_token) {
      nextResponse.cookies.set("grillr_access_token", data.access_token, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 60 * 60,
      });
    }
    if (data.refresh_token) {
      nextResponse.cookies.set("grillr_refresh_token", data.refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      { detail: { code: "provider_unavailable", message: "Authentication provider is unavailable." } },
      { status: 503 },
    );
  }
}
