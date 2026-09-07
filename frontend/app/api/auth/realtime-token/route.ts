import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("grillr_access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: { code: "unauthenticated", message: "Sign in to use voice transcription." } }, { status: 401 });
  }
  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}
