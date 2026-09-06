import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

async function forwardRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const suffix = `/${path.join("/")}`;
  try {
    const apiUrl = process.env.GRILLR_API_URL ?? "http://localhost:8000";
    const incoming = new URL(request.url);
    const cookie = request.headers.get("cookie") ?? "";
    const accessToken = cookie.match(/(?:^|;\s*)grillr_access_token=([^;]+)/)?.[1];
    const response = await fetch(`${apiUrl}/api/v1/interviews${suffix}${incoming.search}`, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${decodeURIComponent(accessToken)}` } : {}),
      },
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json(
      { error: { code: "provider_unavailable", message: "Interview service is unavailable." } },
      { status: 503 },
    );
  }
}

export const GET = forwardRequest;
export const POST = forwardRequest;
