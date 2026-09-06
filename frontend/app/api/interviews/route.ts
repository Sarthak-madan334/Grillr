import { NextResponse } from "next/server";

export const GET = (request: Request) => forwardRequest(request, "");
export const POST = (request: Request) => forwardRequest(request, "");

async function forwardRequest(request: Request, path: string) {
  try {
    const apiUrl = process.env.GRILLR_API_URL ?? "http://localhost:8000";
    const incoming = new URL(request.url);
    const target = `${apiUrl}/api/v1/interviews${path}${incoming.search}`;
    const cookie = request.headers.get("cookie") ?? "";
    const accessToken = cookie.match(/(?:^|;\s*)grillr_access_token=([^;]+)/)?.[1];
    const response = await fetch(target, {
      method: request.method,
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
