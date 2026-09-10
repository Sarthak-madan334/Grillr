import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json({ authenticated: Boolean(cookieStore.get("grillr_access_token")?.value) });
}
