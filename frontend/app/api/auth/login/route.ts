import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiUrl = process.env.GRILLR_API_URL ?? "http://localhost:8000";
  try {
    const response = await fetch(`${apiUrl}/api/v1/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as {
      access_token?: string;
      refresh_token?: string;
      [key: string]: unknown;
    } | null;
    if (!response.ok || !data)
      return NextResponse.json(
        data ?? { error: { message: "Unable to sign in." } },
        { status: response.status },
      );
    const result = { ...data };
    delete result.access_token;
    delete result.refresh_token;
    const nextResponse = NextResponse.json(result, { status: response.status });
    const secure = process.env.NODE_ENV === "production";
    if (data.access_token)
      nextResponse.cookies.set("grillr_access_token", data.access_token, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 60 * 60,
      });
    if (data.refresh_token)
      nextResponse.cookies.set("grillr_refresh_token", data.refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    return nextResponse;
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "network_error",
          message: "We could not reach the authentication service.",
        },
      },
      { status: 503 },
    );
  }
}
