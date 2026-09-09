import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const apiUrl = process.env.GRILLR_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://grillr-acev.onrender.com";
  const cookie = request.headers.get("cookie") ?? "";
  const accessToken = cookie.match(/(?:^|;\s*)grillr_access_token=([^;]+)/)?.[1];
  try {
    const response = await fetch(`${apiUrl}/api/v1/questions/${path.join("/")}`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${decodeURIComponent(accessToken)}` } : {}),
      },
      cache: "no-store",
    });
    return new NextResponse(await response.arrayBuffer(), { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/octet-stream" } });
  } catch {
    return NextResponse.json({ error: { code: "provider_unavailable", message: "Question audio is unavailable." } }, { status: 503 });
  }
}
