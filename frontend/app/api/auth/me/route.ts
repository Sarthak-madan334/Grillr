import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiUrl = process.env.GRILLR_API_URL ?? "http://localhost:8000";
  try {
    const response = await fetch(`${apiUrl}/api/v1/users/me`, {
      headers: { Cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    return NextResponse.json(
      data ?? {
        error: { code: "invalid_session", message: "Session unavailable." },
      },
      { status: response.status },
    );
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
