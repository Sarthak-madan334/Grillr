import { NextResponse } from "next/server";

export async function POST() {
  const apiUrl = process.env.GRILLR_API_URL ?? "http://localhost:8000";
  try {
    await fetch(`${apiUrl}/api/v1/users/logout`, {
      method: "POST",
      cache: "no-store",
    });
  } catch {
    // Clearing the local session remains safe when the stateless provider is unavailable.
  }
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete("grillr_access_token");
  response.cookies.delete("grillr_refresh_token");
  return response;
}
