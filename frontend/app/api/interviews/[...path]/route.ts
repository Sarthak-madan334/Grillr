import { NextResponse } from "next/server";

export const maxDuration = 60;

type RouteContext = { params: Promise<{ path: string[] }> };

const RENDER_WAKE_UP_RETRIES = 5;
const RENDER_WAKE_UP_DELAY_MS = 8_000;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function forwardRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const suffix = `/${path.join("/")}`;
  const apiUrl = process.env.GRILLR_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://grillr-acev.onrender.com";
  const incoming = new URL(request.url);
  const cookie = request.headers.get("cookie") ?? "";
  const accessToken = cookie.match(/(?:^|;\s*)grillr_access_token=([^;]+)/)?.[1];
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
  const target = `${apiUrl}/api/v1/interviews${suffix}${incoming.search}`;

  for (let attempt = 0; attempt <= RENDER_WAKE_UP_RETRIES; attempt += 1) {
    try {
      const response = await fetch(target, {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${decodeURIComponent(accessToken)}` } : {}),
        },
        body,
        cache: "no-store",
      });

      if (!RETRYABLE_STATUSES.has(response.status) || attempt === RENDER_WAKE_UP_RETRIES) {
        const responseBody = await response.json().catch(() => ({
          error: { code: "provider_unavailable", message: "Interview service is unavailable." },
        }));
        return NextResponse.json(responseBody, { status: response.status });
      }
    } catch {
      if (attempt === RENDER_WAKE_UP_RETRIES) {
        return NextResponse.json(
          { error: { code: "provider_unavailable", message: "Interview service is unavailable." } },
          { status: 503 },
        );
      }
    }

    await delay(RENDER_WAKE_UP_DELAY_MS);
  }

  return NextResponse.json(
    { error: { code: "provider_unavailable", message: "Interview service is unavailable." } },
    { status: 503 },
  );
}

export const GET = forwardRequest;
export const POST = forwardRequest;
