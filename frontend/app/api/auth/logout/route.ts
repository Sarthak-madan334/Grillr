import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.GRILLR_API_URL ?? "http://localhost:8000";
    
    await fetch(`${apiUrl}/api/v1/users/logout`, {
      method: "POST",
      headers: Object.fromEntries(request.headers),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Failed to call backend logout:", error);
  }

  const response = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === "production";
  
  response.cookies.set("grillr_access_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("grillr_refresh_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });

  return response;
}
